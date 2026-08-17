import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME, setSessionCookie } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Parallel fetch: Student User Document + Active Session
    const [student, academicSessionRecord] = await Promise.all([
      User.findById(session.userId).select('-password').lean(),
      AcademicSession.findOne().lean(),
    ]);

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    // Check if 24-hour unlock has expired
    let canEdit = student.canEditRegistration;
    if (student.unlockExpiresAt && new Date() > new Date(student.unlockExpiresAt)) {
      canEdit = false;
      User.findByIdAndUpdate(student._id, {
        canEditRegistration: false,
        $unset: { unlockExpiresAt: 1 },
      }).catch(console.error);
    }

    // If admin verified the student in DB, re-issue updated session cookie immediately
    if (student.status !== session.status || canEdit !== session.canEditRegistration) {
      await setSessionCookie({
        userId: (student._id as any).toString(),
        email: student.email,
        role: student.role,
        status: student.status,
        matricNo: student.matricNo,
        fullName: student.fullName,
        canEditRegistration: canEdit,
      });
    }

    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const currentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    const editsCount = student.profileEditsCount || 0;
    const remainingEdits = Math.max(0, 2 - editsCount);
    const isDemographicsLocked = editsCount >= 2 && !canEdit;

    return NextResponse.json({
      success: true,
      student: {
        id: (student._id as any).toString(),
        email: student.email,
        fullName: student.fullName,
        matricNo: student.matricNo,
        admissionYear: student.admissionYear,
        role: student.role,
        status: student.status,
        canEditRegistration: canEdit,
        unlockExpiresAt: student.unlockExpiresAt,
        stateOfOrigin: student.stateOfOrigin || '',
        lga: student.lga || '',
        dateOfBirth: student.dateOfBirth || '',
        nationality: student.nationality || 'Nigerian',
        religion: student.religion || '',
        phone: student.phone || '',
        avatarUrl: student.avatarUrl || '',
        profileEditsCount: editsCount,
        remainingEdits,
        isDemographicsLocked,
        currentLevel,
        activeSession,
      },
    });
  } catch (err: any) {
    console.error('[Student Profile GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    const student = await User.findById(session.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const isUnlocked =
      student.canEditRegistration &&
      (!student.unlockExpiresAt || new Date() <= student.unlockExpiresAt);

    const editsCount = student.profileEditsCount || 0;

    // Check if edits limit reached and admin has not explicitly unlocked
    if (editsCount >= 2 && !isUnlocked) {
      return NextResponse.json(
        {
          error:
            'Profile edit limit reached (2/2 edits used). Please submit a correction request if further changes are required.',
        },
        { status: 403 }
      );
    }

    // Always allowed if edit limit not reached or unlocked by admin: Demographic setup fields
    if (body.stateOfOrigin !== undefined) student.stateOfOrigin = body.stateOfOrigin;
    if (body.lga !== undefined) student.lga = body.lga;
    if (body.dateOfBirth !== undefined) student.dateOfBirth = body.dateOfBirth;
    if (body.nationality !== undefined) student.nationality = body.nationality;
    if (body.religion !== undefined) student.religion = body.religion;
    if (body.phone !== undefined) student.phone = body.phone;
    if (body.avatarUrl !== undefined) student.avatarUrl = body.avatarUrl;

    // Locked Core Fields: Can only be edited if canEditRegistration is true and not expired
    if (isUnlocked) {
      if (body.fullName) student.fullName = body.fullName.trim();
      if (body.matricNo) student.matricNo = body.matricNo.trim().toUpperCase();
      if (body.email) student.email = body.email.trim().toLowerCase();
      if (body.admissionYear) student.admissionYear = Number(body.admissionYear);

      student.canEditRegistration = false;
      student.unlockExpiresAt = undefined;
    }

    student.profileEditsCount = editsCount + 1;

    const [savedStudent, academicSessionRecord] = await Promise.all([
      student.save(),
      AcademicSession.findOne().lean(),
    ]);

    await setSessionCookie({
      userId: (savedStudent._id as any).toString(),
      email: savedStudent.email,
      role: savedStudent.role,
      status: savedStudent.status,
      matricNo: savedStudent.matricNo,
      fullName: savedStudent.fullName,
      canEditRegistration: false,
    });

    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const currentLevel = calculateLevel(savedStudent.admissionYear || 2026, activeSession);

    const newEditsCount = savedStudent.profileEditsCount;
    const remainingEdits = Math.max(0, 2 - newEditsCount);

    return NextResponse.json({
      success: true,
      message: isUnlocked
        ? 'Core registration details updated and locked successfully.'
        : `Demographic profile updated successfully (${remainingEdits} edit chance${remainingEdits === 1 ? '' : 's'} remaining).`,
      student: {
        id: (savedStudent._id as any).toString(),
        email: savedStudent.email,
        fullName: savedStudent.fullName,
        matricNo: savedStudent.matricNo,
        admissionYear: savedStudent.admissionYear,
        status: savedStudent.status,
        canEditRegistration: false,
        stateOfOrigin: savedStudent.stateOfOrigin,
        lga: savedStudent.lga,
        dateOfBirth: savedStudent.dateOfBirth,
        nationality: savedStudent.nationality,
        religion: savedStudent.religion,
        phone: savedStudent.phone,
        avatarUrl: savedStudent.avatarUrl,
        profileEditsCount: newEditsCount,
        remainingEdits,
        isDemographicsLocked: newEditsCount >= 2,
        currentLevel,
      },
    });
  } catch (err: any) {
    console.error('[Student Profile PATCH Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
