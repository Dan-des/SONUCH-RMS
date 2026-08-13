import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import Grade from '../../../../models/Grade';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { gradeInputSchema } from '../../../../lib/validations/academic';

function calculateGradePoint(totalScore: number): { letterGrade: string; gradePoint: number } {
  if (totalScore >= 70) return { letterGrade: 'A', gradePoint: 5.0 };
  if (totalScore >= 60) return { letterGrade: 'B', gradePoint: 4.0 };
  if (totalScore >= 50) return { letterGrade: 'C', gradePoint: 3.0 };
  if (totalScore >= 45) return { letterGrade: 'D', gradePoint: 2.0 };
  return { letterGrade: 'F', gradePoint: 0.0 };
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
    const { letterGrade, gradePoint } = calculateGradePoint(totalScore);

    await connectToDatabase();

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
      message: `Grade saved: Total ${totalScore} (${letterGrade})`,
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
