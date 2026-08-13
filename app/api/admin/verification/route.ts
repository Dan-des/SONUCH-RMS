import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';
import { sendTransactionalEmail } from '../../../../lib/brevo';

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

    const pendingStudents = await User.find({
      role: 'student',
      status: 'pending_verification',
    })
      .select('-password')
      .sort({ createdAt: -1 });

    const grouped: Record<string, any[]> = {
      '100L': [],
      '200L': [],
      '300L': [],
      '400L': [],
      '500L': [],
      'Graduated': [],
    };

    pendingStudents.forEach((student) => {
      const level = calculateLevel(student.admissionYear || 2026, activeSession);
      const studentObj = {
        id: (student._id as any).toString(),
        fullName: student.fullName,
        matricNo: student.matricNo,
        email: student.email,
        admissionYear: student.admissionYear,
        status: student.status,
        createdAt: student.createdAt,
        calculatedLevel: level,
      };

      if (grouped[level]) {
        grouped[level].push(studentObj);
      } else {
        grouped['100L'].push(studentObj);
      }
    });

    return NextResponse.json({
      success: true,
      activeSession,
      totalPending: pendingStudents.length,
      groupedStudents: grouped,
    });
  } catch (err: any) {
    console.error('[Admin Verification GET Exception]:', err);
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
    const { studentIds } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'studentIds array is required' }, { status: 400 });
    }

    await connectToDatabase();

    const studentsToVerify = await User.find({
      _id: { $in: studentIds },
      role: 'student',
    });

    if (studentsToVerify.length === 0) {
      return NextResponse.json({ error: 'No matching pending students found' }, { status: 444 });
    }

    // Update status to verified in MongoDB
    await User.updateMany(
      { _id: { $in: studentIds }, role: 'student' },
      { $set: { status: 'verified' } }
    );

    // Send Brevo verification email dispatch for each verified student
    const emailPromises = studentsToVerify.map((student) => {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #059669; margin-top: 0;">School of Nursing, UCH — Account Verified</h2>
          <p style="color: #334155; font-size: 15px;">Dear <strong>${student.fullName}</strong>,</p>
          <p style="color: #334155; font-size: 15px;">Your SONUCH RMS account has been officially verified by the school administration.</p>
          <div style="background-color: #f0fdf4; border: 1px solid #a7f3d0; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <p style="color: #047857; margin: 0; font-size: 14px;"><strong>Matric No:</strong> ${student.matricNo}</p>
            <p style="color: #047857; margin: 4px 0 0 0; font-size: 14px;"><strong>Status:</strong> Verified & Active</p>
          </div>
          <p style="color: #334155; font-size: 14px;">You can now log in to view your academic results, registered courses, course codes, and access student support services.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">School of Nursing, University College Hospital, Ibadan.</p>
        </div>
      `;

      return sendTransactionalEmail({
        to: [{ email: student.email, name: student.fullName }],
        subject: '✅ Account Verified — School of Nursing, UCH Portal',
        htmlContent,
      });
    });

    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully verified ${studentsToVerify.length} student(s) and dispatched notification emails.`,
      verifiedCount: studentsToVerify.length,
    });
  } catch (err: any) {
    console.error('[Admin Verification POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
