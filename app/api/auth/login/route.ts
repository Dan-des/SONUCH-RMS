import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import { setSessionCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Matriculation Number / Email and Password are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanIdentifier = identifier.trim().toLowerCase();
    const student = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { matricNo: identifier.trim().toUpperCase() },
      ],
      role: 'student',
    });

    if (!student || !student.password) {
      return NextResponse.json(
        { error: 'Invalid credentials. Check your Matric No/Email and password.' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials. Password incorrect.' },
        { status: 401 }
      );
    }

    // Generate JWT Session Cookie
    await setSessionCookie({
      userId: (student._id as any).toString(),
      email: student.email,
      role: student.role,
      status: student.status,
      matricNo: student.matricNo,
      fullName: student.fullName,
      canEditRegistration: student.canEditRegistration,
    });

    const redirectUrl =
      student.status === 'pending_verification' ? '/pending' : '/student/dashboard';

    return NextResponse.json({
      success: true,
      message: 'Login successful.',
      redirectUrl,
      student: {
        id: (student._id as any).toString(),
        fullName: student.fullName,
        email: student.email,
        matricNo: student.matricNo,
        status: student.status,
      },
    });
  } catch (err: any) {
    console.error('[Student Login API Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
