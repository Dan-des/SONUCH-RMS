import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../../lib/db';
import User from '../../../../../models/User';
import Otp from '../../../../../models/Otp';
import Session from '../../../../../models/Session';
import { adminOtpVerifySchema } from '../../../../../lib/validations/auth';
import { setSessionCookie } from '../../../../../lib/auth';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminOtpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Rate limiting (max 5 verification attempts per 10 minutes)
    const rateLimit = checkRateLimit(`admin-otp-ver:${cleanEmail}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many invalid verification attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Find valid OTP record
    const otpRecord = await Otp.findOne({
      email: cleanEmail,
      otp: otp.trim(),
      used: false,
    }).lean();

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired 6-digit OTP code.' }, { status: 401 });
    }

    // Check TTL expiration
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: 'OTP code has expired. Please request a new OTP.' }, { status: 401 });
    }

    // Burn OTP and Fetch Admin user record in parallel
    const [, adminUser] = await Promise.all([
      Otp.deleteOne({ _id: otpRecord._id }),
      User.findOneAndUpdate(
        { email: cleanEmail },
        {
          $set: { role: 'admin', status: 'verified' },
          $setOnInsert: { fullName: 'Administrator' },
        },
        { upsert: true, new: true }
      ).lean(),
    ]);

    // Session Payload
    const sessionPayload = {
      userId: (adminUser._id as any).toString(),
      email: adminUser.email,
      role: 'admin' as const,
      status: 'verified' as const,
      fullName: adminUser.fullName || 'Administrator',
    };

    // Issue HttpOnly Secure SameSite=Lax Cookie
    const sessionToken = await setSessionCookie(sessionPayload);

    // Save session in MongoDB in background
    Session.create({
      userId: adminUser._id,
      role: 'admin',
      sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }).catch((err) => console.error('Background session log error:', err));

    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful! Access granted.',
      redirectUrl: '/admin/dashboard',
      user: {
        id: (adminUser._id as any).toString(),
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
    });
  } catch (err: any) {
    console.error('[Admin OTP Verification Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
