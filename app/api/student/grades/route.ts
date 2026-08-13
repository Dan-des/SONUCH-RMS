import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import Grade from '../../../../models/Grade';
import Course from '../../../../models/Course';
import ResultRelease from '../../../../models/ResultRelease';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    if (session.status === 'pending_verification') {
      return NextResponse.json(
        { error: '403 Forbidden: Account pending verification' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const student = await User.findById(session.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const studentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    // Optional Level-Based Result Release Countdown Check
    const releaseConfig = await ResultRelease.findOne({
      level: studentLevel,
      academicSession: activeSession,
    });

    if (releaseConfig) {
      const now = new Date();
      const isAutoUnlocked = now >= releaseConfig.releaseDate;

      if (!releaseConfig.isReleased && !isAutoUnlocked) {
        return NextResponse.json(
          {
            error: 'Results for your level are currently locked under an active release countdown.',
            locked: true,
            releaseDate: releaseConfig.releaseDate,
            studentLevel,
            activeSession,
          },
          { status: 403 }
        );
      }
    }

    // Fetch grades assigned to this student only (Zero cross-student leakage)
    const grades = await Grade.find({ studentId: student._id }).populate({
      path: 'courseId',
      model: Course,
    });

    let totalQualityPoints = 0;
    let totalCreditUnits = 0;

    const formattedGrades = grades.map((g: any) => {
      const course = g.courseId || {};
      const unit = course.unit || 3;
      const qp = g.gradePoint * unit;

      totalQualityPoints += qp;
      totalCreditUnits += unit;

      return {
        id: (g._id as any).toString(),
        courseCode: course.code || 'CRS',
        courseTitle: course.title || 'Course',
        unit,
        caScore: g.caScore,
        examScore: g.examScore,
        totalScore: g.totalScore,
        letterGrade: g.letterGrade,
        gradePoint: g.gradePoint,
        qualityPoints: qp,
        semester: g.semester,
        session: g.session,
        level: g.level,
      };
    });

    const cgpa = totalCreditUnits > 0 ? +(totalQualityPoints / totalCreditUnits).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      studentLevel,
      activeSession,
      cgpa,
      totalCreditUnits,
      grades: formattedGrades,
    });
  } catch (err: any) {
    console.error('[Student Grades GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
