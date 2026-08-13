import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import Grade from '../../../../models/Grade';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { gradeInputSchema } from '../../../../lib/validations/academic';
import { getDynamicGradingScale, calculateGradeAndPoint } from '../../../../lib/gpa-calculator';

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
