import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import Session from '../../../../models/Session';
import { studentSelfRegisterSchema } from '../../../../lib/validations/student';
import { setSessionCookie } from '../../../../lib/auth';
import { checkRateLimit } from '../../../../lib/rate-limit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = studentSelfRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { fullName, matricNo, email, admissionYear, password } = parsed.data;

    // Rate Limiting (max 5 registration attempts per 10 minutes per IP/email)
    const rateLimit = checkRateLimit(`reg:${email}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Check for existing matric number or email
    const existingMatric = await User.findOne({ matricNo: matricNo.toUpperCase() });
    if (existingMatric) {
      return NextResponse.json(
        { error: `Matriculation Number "${matricNo}" is already registered.` },
        { status: 409 }
      );
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: `Email address "${email}" is already registered.` },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save student to MongoDB with pending_verification status
    const newStudent = await User.create({
      fullName: fullName.trim(),
      matricNo: matricNo.toUpperCase(),
      email: email.toLowerCase(),
      admissionYear,
      password: hashedPassword,
      role: 'student',
      status: 'pending_verification',
      canEditRegistration: false,
    });

    // Session Payload
    const sessionPayload = {
      userId: (newStudent._id as any).toString(),
      email: newStudent.email,
      role: 'student' as const,
      status: 'pending_verification' as const,
      matricNo: newStudent.matricNo,
      fullName: newStudent.fullName,
      canEditRegistration: false,
    };

    // Issue HttpOnly Secure SameSite=Lax Cookie
    const sessionToken = await setSessionCookie(sessionPayload);

    // Save Session in MongoDB
    await Session.create({
      userId: newStudent._id,
      role: 'student',
      sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully. Account is pending admin verification.',
      user: {
        id: (newStudent._id as any).toString(),
        fullName: newStudent.fullName,
        matricNo: newStudent.matricNo,
        email: newStudent.email,
        status: newStudent.status,
      },
    });
  } catch (err: any) {
    console.error('[Student Registration Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
