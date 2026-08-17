import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '../../../../../lib/db';
import User from '../../../../../models/User';
import Otp from '../../../../../models/Otp';
import SystemConfig from '../../../../../models/SystemConfig';
import { generateSecureAccessKey } from '../../../../../lib/crypto-key';
import { sendAdminOtpEmail } from '../../../../../lib/brevo';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, accessKey } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!accessKey || accessKey.trim() === '') {
      return NextResponse.json(
        { error: 'Master Admin Access UUID Key is required to request authentication OTP.' },
        { status: 401 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Rate Limiting Protection (max 5 requests per 10 minutes per IP/email)
    const rateLimit = checkRateLimit(`admin-otp-req:${cleanEmail}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Fetch or dynamically create active SystemConfig
    let config: any = await SystemConfig.findOne().lean();
    if (!config) {
      const generatedKey = generateSecureAccessKey();
      config = await SystemConfig.create({
        adminAccessKey: generatedKey,
        superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'workwithdan6@gmail.com',
      });
    }

    // Strictly validate the Admin Access UUID Key
    if (accessKey.trim() !== config.adminAccessKey.trim()) {
      return NextResponse.json(
        {
          error:
            'Invalid Master Admin Access Key. Please check the key or click "Request Key via Email" to send the active key to your Gmail.',
        },
        { status: 401 }
      );
    }

    // Generate cryptographically random 6-digit OTP
    const randomBuffer = crypto.randomBytes(3);
    const numericValue = parseInt(randomBuffer.toString('hex'), 16) % 1000000;
    const otpCode = numericValue.toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Parallelize user check, clearing stale OTPs, and saving new OTP
    await Promise.all([
      User.findOneAndUpdate(
        { email: cleanEmail },
        {
          $setOnInsert: {
            email: cleanEmail,
            fullName: 'Administrator',
            role: 'admin',
            status: 'verified',
          },
        },
        { upsert: true, new: true }
      ),
      Otp.deleteMany({ email: cleanEmail }),
    ]);

    // Save new OTP to MongoDB
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      expiresAt,
      used: false,
    });

    // Dispatch OTP via Brevo API
    const emailResult = await sendAdminOtpEmail(cleanEmail, otpCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to dispatch verification email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cryptographic 6-digit OTP dispatched successfully to your email. Please check your inbox.',
      expiresInSeconds: 300,
    });
  } catch (err: any) {
    console.error('[Admin OTP Request Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
