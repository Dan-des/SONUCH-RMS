import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import UnlockRequest from '../../../../models/UnlockRequest';
import AcademicSession from '../../../../models/AcademicSession';
import Policy from '../../../../models/Policy';
import ResultRelease from '../../../../models/ResultRelease';
import Notification from '../../../../models/Notification';
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

    const [
      totalStudents,
      pendingVerifications,
      pendingRequests,
      academicSessionRecord,
      publishedPolicies,
      activeReleases,
      dispatchedAnnouncements,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'pending_verification' }),
      UnlockRequest.countDocuments({ status: 'pending' }),
      AcademicSession.findOne().lean(),
      Policy.countDocuments({ isArchived: false }),
      ResultRelease.countDocuments(),
      Notification.countDocuments(),
    ]);

    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        pendingVerifications,
        pendingRequests,
        activeSession,
        publishedPolicies,
        activeReleases,
        dispatchedAnnouncements,
      },
    });
  } catch (err: any) {
    console.error('[Admin Stats GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
