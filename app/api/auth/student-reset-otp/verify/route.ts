import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../../lib/db';
import User from '../../../../../models/User';
import Otp from '../../../../../models/Otp';
import { resetPasswordVerifySchema } from '../../../../../lib/validations/academic';
import { checkRateLimit } from '../../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parsed.data;

    // Rate Limiting
    const rateLimit = checkRateLimit(`pwd-ver:${email}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many invalid verification attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp: otp.trim(),
      used: false,
    });

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired 6-digit verification code' }, { status: 401 });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 401 });
    }

    // Single-Use Burn Logic
    await Otp.deleteOne({ _id: otpRecord._id });

    // Update Student Password
    const student = await User.findOne({ email: email.toLowerCase(), role: 'student' });
    if (!student) {
      return NextResponse.json({ error: 'Student account not found' }, { status: 404 });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('[Password Reset Verify Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
