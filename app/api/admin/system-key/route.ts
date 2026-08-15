import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import connectToDatabase from '../../../../lib/db';
import SystemConfig from '../../../../models/SystemConfig';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { sendAdminAccessKeyRotatedEmail } from '../../../../lib/brevo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    let config: any = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        adminAccessKey: process.env.ADMIN_ACCESS_KEY || 'son-uch-2026-admin-access-key',
        superAdminEmail: process.env.SUPER_ADMIN_EMAIL || session.email || 'workwithdan6@gmail.com',
      });
    }

    const isSuperAdmin = session.email.toLowerCase() === config.superAdminEmail.toLowerCase();

    return NextResponse.json({
      success: true,
      superAdminEmail: config.superAdminEmail,
      isSuperAdmin,
      keyLastRotatedAt: config.keyLastRotatedAt || config.updatedAt,
      rotatedBy: config.rotatedBy || 'Primary Administrator',
      // Only disclose full active key to the Super Admin
      activeKey: isSuperAdmin ? config.adminAccessKey : '••••••••••••••••••••••••••••••••',
    });
  } catch (err: any) {
    console.error('[System Key GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    let config: any = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({
        adminAccessKey: process.env.ADMIN_ACCESS_KEY || 'son-uch-2026-admin-access-key',
        superAdminEmail: process.env.SUPER_ADMIN_EMAIL || session.email || 'workwithdan6@gmail.com',
      });
    }

    // Strictly enforce Super Admin permission
    const isSuperAdmin = session.email.toLowerCase() === config.superAdminEmail.toLowerCase();
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          error:
            'Permission Denied: Only the Master Super Admin (' +
            config.superAdminEmail +
            ') is authorized to rotate the Institutional Access Key.',
        },
        { status: 403 }
      );
    }

    // Generate new secure UUID key
    const newUUIDKey = `son-uch-${crypto.randomUUID()}`;

    config.adminAccessKey = newUUIDKey;
    config.keyLastRotatedAt = new Date();
    config.rotatedBy = session.email;
    await config.save();

    // Dispatch email alert to the Super Admin's Gmail
    await sendAdminAccessKeyRotatedEmail(config.superAdminEmail, newUUIDKey, session.email);

    return NextResponse.json({
      success: true,
      message: 'New Master Admin Access Key generated and dispatched to your email.',
      newAccessKey: newUUIDKey,
      superAdminEmail: config.superAdminEmail,
      rotatedAt: config.keyLastRotatedAt,
    });
  } catch (err: any) {
    console.error('[System Key POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
