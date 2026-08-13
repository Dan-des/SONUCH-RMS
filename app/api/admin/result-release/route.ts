import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import ResultRelease from '../../../../models/ResultRelease';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { resultReleaseSchema } from '../../../../lib/validations/academic';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    const releases = await ResultRelease.find({ academicSession: activeSession });

    return NextResponse.json({
      success: true,
      activeSession,
      releases: releases.map((r) => ({
        id: (r._id as any).toString(),
        level: r.level,
        releaseDate: r.releaseDate,
        isReleased: r.isReleased,
        academicSession: r.academicSession,
      })),
    });
  } catch (err: any) {
    console.error('[Admin Result Release GET Exception]:', err);
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
    const parsed = resultReleaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { level, releaseDate, academicSession } = parsed.data;
    const releaseDateTime = new Date(releaseDate);

    await connectToDatabase();

    const config = await ResultRelease.findOneAndUpdate(
      { level, academicSession },
      {
        level,
        releaseDate: releaseDateTime,
        isReleased: new Date() >= releaseDateTime,
        academicSession,
        updatedBy: session.email,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Result release countdown set for ${level} (${releaseDateTime.toLocaleString()}).`,
      release: {
        id: (config._id as any).toString(),
        level: config.level,
        releaseDate: config.releaseDate,
        isReleased: config.isReleased,
      },
    });
  } catch (err: any) {
    console.error('[Admin Result Release POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
