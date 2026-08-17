import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import Course from '../../../../models/Course';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { courseSchema } from '../../../../lib/validations/academic';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const semester = searchParams.get('semester');

    await connectToDatabase();
    const query: any = {};
    if (level) query.level = level;
    if (semester) query.semester = Number(semester);

    const courses = await Course.find(query).sort({ code: 1 }).lean();

    return NextResponse.json({
      success: true,
      courses: courses.map((c: any) => ({
        id: (c._id as any).toString(),
        code: c.code,
        title: c.title,
        unit: c.unit,
        level: c.level,
        semester: c.semester,
        session: c.session,
      })),
    });
  } catch (err: any) {
    console.error('[Admin Courses GET Exception]:', err);
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
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const { code, title, unit, level, semester, session: sessionStr } = parsed.data;

    const existingCourse = await Course.findOne({ code: code.toUpperCase(), session: sessionStr }).lean();
    if (existingCourse) {
      return NextResponse.json(
        { error: `Course code "${code}" already exists in session ${sessionStr}` },
        { status: 409 }
      );
    }

    const newCourse = await Course.create({
      code: code.toUpperCase(),
      title: title.trim(),
      unit,
      level,
      semester,
      session: sessionStr,
    });

    return NextResponse.json({
      success: true,
      message: `Course ${newCourse.code} created successfully.`,
      course: {
        id: (newCourse._id as any).toString(),
        code: newCourse.code,
        title: newCourse.title,
        unit: newCourse.unit,
        level: newCourse.level,
        semester: newCourse.semester,
      },
    });
  } catch (err: any) {
    console.error('[Admin Courses POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
