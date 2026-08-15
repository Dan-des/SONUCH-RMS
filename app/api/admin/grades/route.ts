import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import Grade from '../../../../models/Grade';
import User from '../../../../models/User';
import Course from '../../../../models/Course';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { gradeInputSchema } from '../../../../lib/validations/academic';
import { getDynamicGradingScale, calculateGradeAndPoint } from '../../../../lib/gpa-calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const semester = searchParams.get('semester');

    await connectToDatabase();

    const query: any = {};
    if (level && level !== 'All Levels') query.level = level;
    if (semester && semester !== 'all') query.semester = Number(semester);

    const grades = await Grade.find(query)
      .populate('studentId', 'fullName matricNo currentLevel')
      .populate('courseId', 'code title unit')
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      grades: grades.map((g: any) => ({
        id: (g._id as any).toString(),
        studentName: g.studentId?.fullName || 'Unknown Student',
        studentMatric: g.studentId?.matricNo || '—',
        studentLevel: g.studentId?.currentLevel || g.level,
        courseCode: g.courseId?.code || '—',
        courseTitle: g.courseId?.title || '—',
        courseUnit: g.courseId?.unit || 0,
        level: g.level,
        semester: g.semester,
        session: g.session,
        caScore: g.caScore,
        examScore: g.examScore,
        totalScore: g.totalScore,
        letterGrade: g.letterGrade,
        gradePoint: g.gradePoint,
        updatedAt: g.updatedAt,
      })),
    });
  } catch (err: any) {
    console.error('[Admin Grades GET Exception]:', err);
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
    const parsed = gradeInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { studentId, courseId, caScore, examScore, session: sessionStr, semester, level } = parsed.data;
    const totalScore = caScore + examScore;

    await connectToDatabase();

    // Fetch dynamic grading scale from Policy CMS
    const gradingScale = await getDynamicGradingScale();
    const { letterGrade, gradePoint } = calculateGradeAndPoint(totalScore, gradingScale);

    const gradeRecord = await Grade.findOneAndUpdate(
      { studentId, courseId, session: sessionStr },
      {
        studentId,
        courseId,
        caScore,
        examScore,
        totalScore,
        gradePoint,
        letterGrade,
        session: sessionStr,
        semester,
        level,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Grade recorded: Total ${totalScore} (${letterGrade}, ${gradePoint} GP)`,
      grade: {
        id: (gradeRecord._id as any).toString(),
        caScore: gradeRecord.caScore,
        examScore: gradeRecord.examScore,
        totalScore: gradeRecord.totalScore,
        letterGrade: gradeRecord.letterGrade,
        gradePoint: gradeRecord.gradePoint,
      },
    });
  } catch (err: any) {
    console.error('[Admin Grades POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const deleted = await Grade.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Grade record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Grade record deleted successfully.',
    });
  } catch (err: any) {
    console.error('[Admin Grades DELETE Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
