import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { sessionConfigSchema } from '../../../../lib/validations/academic';

export async function GET() {
  try {
    await connectToDatabase();
    let sessionRecord = await AcademicSession.findOne();

    if (!sessionRecord) {
      sessionRecord = await AcademicSession.create({
        activeSession: '2026/2027',
      });
    }

    return NextResponse.json({
      success: true,
      activeSession: sessionRecord.activeSession,
      updatedAt: sessionRecord.updatedAt,
    });
  } catch (err: any) {
    console.error('[Admin Session GET Exception]:', err);
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
    const parsed = sessionConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { activeSession } = parsed.data;
    await connectToDatabase();

    let sessionRecord = await AcademicSession.findOne();
    if (!sessionRecord) {
      sessionRecord = new AcademicSession({ activeSession });
    } else {
      sessionRecord.activeSession = activeSession;
    }

    sessionRecord.updatedBy = session.email;
    await sessionRecord.save();

    return NextResponse.json({
      success: true,
      message: `Active Academic Session updated to "${activeSession}". Institution-wide student levels promoted reactively.`,
      activeSession: sessionRecord.activeSession,
    });
  } catch (err: any) {
    console.error('[Admin Session POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
