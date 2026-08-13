import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import ResultRelease from '../../../../models/ResultRelease';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await User.findById(session.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const studentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    const releaseConfig = await ResultRelease.findOne({
      level: studentLevel,
      academicSession: activeSession,
    });

    if (!releaseConfig) {
      return NextResponse.json({
        success: true,
        hasCountdown: false,
        studentLevel,
        activeSession,
      });
    }

    const now = new Date();
    const isUnlocked = now >= releaseConfig.releaseDate || releaseConfig.isReleased;

    return NextResponse.json({
      success: true,
      hasCountdown: true,
      isUnlocked,
      releaseDate: releaseConfig.releaseDate,
      studentLevel,
      activeSession,
    });
  } catch (err: any) {
    console.error('[Student Result Release GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
