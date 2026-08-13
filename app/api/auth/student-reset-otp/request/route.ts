import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '../../../../../lib/db';
import User from '../../../../../models/User';
import Otp from '../../../../../models/Otp';
import { sendTransactionalEmail } from '../../../../../lib/brevo';
import { resetPasswordRequestSchema } from '../../../../../lib/validations/academic';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Rate Limiting (max 5 requests per 10 minutes)
    const rateLimit = checkRateLimit(`pwd-reset:${email}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await connectToDatabase();
    const student = await User.findOne({ email: email.toLowerCase(), role: 'student' });

    if (!student) {
      // Return generic success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If the email is registered, a 6-digit verification code has been dispatched.',
      });
    }

    // Generate cryptographically random 6-digit OTP
    const randomBuffer = crypto.randomBytes(3);
    const numericValue = parseInt(randomBuffer.toString('hex'), 16) % 1000000;
    const otpCode = numericValue.toString().padStart(6, '0');

    // 10-minute expiry
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({
      email: email.toLowerCase(),
      otp: otpCode,
      expiresAt,
      used: false,
    });

    // Send email via Brevo
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">School of Nursing, UCH — Password Reset</h2>
        <p style="color: #334155; font-size: 15px;">Dear ${student.fullName},</p>
        <p style="color: #334155; font-size: 15px;">You have requested to reset your student portal password. Use the 6-digit verification code below:</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #059669; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #047857;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">This code will automatically expire in <strong>10 minutes</strong> and can only be used once.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `;

    await sendTransactionalEmail({
      to: [{ email: student.email, name: student.fullName }],
      subject: `🔑 SONUCH Password Reset Code: ${otpCode}`,
      htmlContent,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset verification code dispatched to your email address.',
    });
  } catch (err: any) {
    console.error('[Password Reset Request Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
