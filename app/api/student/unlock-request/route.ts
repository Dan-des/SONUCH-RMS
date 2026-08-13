import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import UnlockRequest from '../../../../models/UnlockRequest';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { unlockRequestSchema } from '../../../../lib/validations/student';

export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = unlockRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const student = await User.findById(session.userId);

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Check if there is already a pending request
    const existingPending = await UnlockRequest.findOne({
      userId: student._id,
      status: 'pending',
    });

    if (existingPending) {
      return NextResponse.json(
        { error: 'You already have an active unlock request pending admin review.' },
        { status: 409 }
      );
    }

    const newRequest = await UnlockRequest.create({
      userId: student._id,
      studentName: student.fullName,
      matricNo: student.matricNo || 'N/A',
      email: student.email,
      reason: parsed.data.reason.trim(),
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Correction request submitted to admin successfully.',
      requestId: (newRequest._id as any).toString(),
    });
  } catch (err: any) {
    console.error('[Unlock Request Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
