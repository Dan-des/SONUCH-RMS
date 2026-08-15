import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import Course from '../../../../models/Course';
import Grade from '../../../../models/Grade';
import UnlockRequest from '../../../../models/UnlockRequest';
import AcademicSession from '../../../../models/AcademicSession';
import Policy from '../../../../models/Policy';
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
      totalCourses,
      totalGrades,
      academicSessionRecord,
      publishedPolicies,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'pending_verification' }),
      Course.countDocuments(),
      Grade.countDocuments(),
      AcademicSession.findOne().lean(),
      Policy.countDocuments({ isArchived: false }),
    ]);

    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        pendingVerifications,
        totalCourses,
        totalGrades,
        activeSession,
        publishedPolicies,
      },
    });
  } catch (err: any) {
    console.error('[Admin Stats GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
