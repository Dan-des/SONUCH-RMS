import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import UnlockRequest from '../../../../models/UnlockRequest';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const pendingRequests = await UnlockRequest.find({ status: 'pending' }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests: pendingRequests.map((req) => ({
        id: (req._id as any).toString(),
        userId: (req.userId as any).toString(),
        studentName: req.studentName,
        matricNo: req.matricNo,
        email: req.email,
        reason: req.reason,
        status: req.status,
        createdAt: req.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('[Admin Unlock Requests GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action } = body; // action: 'approve' | 'reject'

    if (!requestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }

    await connectToDatabase();

    const unlockReq = await UnlockRequest.findById(requestId);
    if (!unlockReq) {
      return NextResponse.json({ error: 'Unlock request not found' }, { status: 404 });
    }

    const student = await User.findById(unlockReq.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    if (action === 'reject') {
      unlockReq.status = 'rejected';
      unlockReq.reviewedBy = session.email;
      unlockReq.reviewedAt = new Date();
      await unlockReq.save();

      return NextResponse.json({
        success: true,
        message: 'Unlock request rejected.',
      });
    }

    // Approve: Grant 24-hour temporary edit permission
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    student.canEditRegistration = true;
    student.unlockExpiresAt = expiresAt;
    await student.save();

    unlockReq.status = 'approved';
    unlockReq.reviewedBy = session.email;
    unlockReq.reviewedAt = new Date();
    unlockReq.expiresAt = expiresAt;
    await unlockReq.save();

    return NextResponse.json({
      success: true,
      message: 'Granted 24-hour temporary registration edit permission to student.',
      expiresAt,
    });
  } catch (err: any) {
    console.error('[Admin Unlock Requests POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
