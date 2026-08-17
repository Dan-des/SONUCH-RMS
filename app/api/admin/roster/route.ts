import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';
    const levelFilter = searchParams.get('level') || 'all';
    const statusFilter = searchParams.get('status') || 'all';

    await connectToDatabase();

    const query: any = { role: 'student' };

    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    if (search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { matricNo: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Parallel fetch: Active Session + Students Roster
    const [academicSessionRecord, rawStudents] = await Promise.all([
      AcademicSession.findOne().lean(),
      User.find(query)
        .select('fullName matricNo email admissionYear status phone stateOfOrigin lga avatarUrl canEditRegistration createdAt')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    const stats = {
      total: 0,
      verified: 0,
      pending: 0,
      byLevel: {
        '100L': 0,
        '200L': 0,
        '300L': 0,
        '400L': 0,
        '500L': 0,
        'Graduated': 0,
      } as Record<string, number>,
    };

    const formattedStudents = rawStudents.map((s: any) => {
      const calcLevel = calculateLevel(s.admissionYear || 2026, activeSession);

      stats.total += 1;
      if (s.status === 'verified') stats.verified += 1;
      if (s.status === 'pending_verification') stats.pending += 1;

      if (stats.byLevel[calcLevel] !== undefined) {
        stats.byLevel[calcLevel] += 1;
      } else {
        stats.byLevel['100L'] += 1;
      }

      return {
        id: (s._id as any).toString(),
        fullName: s.fullName,
        matricNo: s.matricNo || 'N/A',
        email: s.email,
        admissionYear: s.admissionYear || 2026,
        status: s.status,
        calculatedLevel: calcLevel,
        phone: s.phone || '',
        stateOfOrigin: s.stateOfOrigin || '',
        lga: s.lga || '',
        avatarUrl: s.avatarUrl || '',
        canEditRegistration: s.canEditRegistration || false,
        createdAt: s.createdAt,
      };
    });

    const filtered = formattedStudents.filter((s) => {
      if (levelFilter === 'all' || levelFilter === 'All Levels') return true;
      return s.calculatedLevel === levelFilter;
    });

    return NextResponse.json({
      success: true,
      activeSession,
      totalCount: formattedStudents.length,
      filteredCount: filtered.length,
      stats,
      students: filtered,
    });
  } catch (err: any) {
    console.error('[Admin Roster GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
