import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db';
import SystemConfig from '../../../../../models/SystemConfig';
import { generateSecureAccessKey } from '../../../../../lib/crypto-key';
import { sendAdminAccessKeyRotatedEmail } from '../../../../../lib/brevo';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid Super Admin email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate Limiting (max 3 requests per 15 minutes)
    const rateLimit = checkRateLimit(`req-master-key:${cleanEmail}`, {
      intervalMs: 15 * 60 * 1000,
      maxRequests: 3,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many Master Key generation requests. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    let config: any = await SystemConfig.findOne();
    const authorizedSuperAdmin = (
      config?.superAdminEmail ||
      process.env.SUPER_ADMIN_EMAIL ||
      'workwithdan6@gmail.com'
    ).toLowerCase();

    if (cleanEmail !== authorizedSuperAdmin) {
      return NextResponse.json(
        {
          error:
            'Unauthorized: Master Access Keys can only be generated and dispatched to the designated Super Admin email (' +
            authorizedSuperAdmin +
            ').',
        },
        { status: 403 }
      );
    }

    // Generate dynamic high-entropy mixed-case alphanumeric key
    const newSecureKey = generateSecureAccessKey();

    if (!config) {
      config = await SystemConfig.create({
        adminAccessKey: newSecureKey,
        superAdminEmail: cleanEmail,
        keyLastRotatedAt: new Date(),
        rotatedBy: 'Super Admin On-Demand Request',
      });
    } else {
      config.adminAccessKey = newSecureKey;
      config.superAdminEmail = cleanEmail;
      config.keyLastRotatedAt = new Date();
      config.rotatedBy = 'Super Admin On-Demand Request';
      await config.save();
    }

    // Dispatch key to Super Admin's Gmail via Brevo
    const emailResult = await sendAdminAccessKeyRotatedEmail(
      cleanEmail,
      newSecureKey,
      'System Request Verification'
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to dispatch email with key', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A new high-security Master Access UUID Key has been generated and sent to ${cleanEmail}. Check your inbox, copy the key, and paste it into the Master Key field.`,
    });
  } catch (err: any) {
    console.error('[Request Master Key Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
