import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export async function GET(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const levelFilter = searchParams.get('level') || 'all';
    const statusFilter = searchParams.get('status') || 'all';

    await connectToDatabase();
    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    const query: any = { role: 'student' };
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const students = await User.find(query).sort({ fullName: 1 });

    // Filter by calculated level
    const filteredStudents = students.filter((s) => {
      if (levelFilter === 'all') return true;
      const calcLevel = calculateLevel(s.admissionYear || 2026, activeSession);
      return calcLevel === levelFilter;
    });

    // Generate CSV Content in memory
    const csvHeaders = [
      'Full Name',
      'Matriculation Number',
      'Email Address',
      'Admission Year',
      'Current Level',
      'Verification Status',
      'Phone Number',
      'State of Origin',
      'LGA',
      'Date of Birth',
      'Nationality',
      'Religion',
      'Registration Date',
    ];

    const escapeCsv = (str: string | undefined | null) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const csvRows = filteredStudents.map((s) => {
      const calcLevel = calculateLevel(s.admissionYear || 2026, activeSession);
      return [
        escapeCsv(s.fullName),
        escapeCsv(s.matricNo || 'N/A'),
        escapeCsv(s.email),
        escapeCsv(s.admissionYear?.toString() || 'N/A'),
        escapeCsv(calcLevel),
        escapeCsv(s.status),
        escapeCsv(s.phone || 'N/A'),
        escapeCsv(s.stateOfOrigin || 'N/A'),
        escapeCsv(s.lga || 'N/A'),
        escapeCsv(s.dateOfBirth || 'N/A'),
        escapeCsv(s.nationality || 'Nigerian'),
        escapeCsv(s.religion || 'N/A'),
        escapeCsv(new Date(s.createdAt).toLocaleDateString('en-NG')),
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\r\n');

    // Return streamed CSV download
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sonuch_students_${levelFilter}_${statusFilter}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('[Admin Export GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
