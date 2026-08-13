import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '../../../../../lib/db';
import User from '../../../../../models/User';
import Otp from '../../../../../models/Otp';
import { sendAdminOtpEmail } from '../../../../../lib/brevo';
import { adminCredentialsSchema } from '../../../../../lib/validations/auth';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminCredentialsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, accessKey } = parsed.data;

    // Rate Limiting Protection (max 5 requests per 10 minutes per IP/email)
    const rateLimit = checkRateLimit(`admin-otp-req:${email}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Verify Admin Access Key if provided
    if (accessKey && accessKey.trim() !== '') {
      const validAccessKey = process.env.ADMIN_ACCESS_KEY || 'UCH-ADMIN-2026-KEY';
      if (accessKey.trim() !== validAccessKey.trim()) {
        return NextResponse.json({ error: 'Invalid Admin Access Key' }, { status: 401 });
      }
    }

    // Find or seed Admin user in MongoDB
    let adminUser = await User.findOne({ email: email.toLowerCase() });
    if (!adminUser) {
      adminUser = await User.create({
        email: email.toLowerCase(),
        fullName: 'System Administrator',
        role: 'admin',
        status: 'verified',
      });
    }

    if (adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    // Generate cryptographically random 6-digit OTP
    const randomBuffer = crypto.randomBytes(3);
    const numericValue = parseInt(randomBuffer.toString('hex'), 16) % 1000000;
    const otpCode = numericValue.toString().padStart(6, '0');

    // 5-minute expiry date
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing unused OTPs for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Save new OTP to MongoDB
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt,
      used: false,
    });

    // Dispatch OTP via Brevo API
    const emailResult = await sendAdminOtpEmail(email.toLowerCase(), otpCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cryptic 6-digit OTP dispatched successfully. Please check your inbox.',
      expiresInSeconds: 300,
    });
  } catch (err: any) {
    console.error('[Admin OTP Request Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
