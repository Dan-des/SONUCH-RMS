import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME, setSessionCookie } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await User.findById(session.userId).select('-password');

    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const currentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    // Check if 24-hour unlock has expired
    let canEdit = student.canEditRegistration;
    if (student.unlockExpiresAt && new Date() > student.unlockExpiresAt) {
      canEdit = false;
      student.canEditRegistration = false;
      student.unlockExpiresAt = undefined;
      await student.save();
    }

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

    // Always allowed: Demographic setup fields
    if (body.stateOfOrigin !== undefined) student.stateOfOrigin = body.stateOfOrigin;
    if (body.lga !== undefined) student.lga = body.lga;
    if (body.dateOfBirth !== undefined) student.dateOfBirth = body.dateOfBirth;
    if (body.nationality !== undefined) student.nationality = body.nationality;
    if (body.religion !== undefined) student.religion = body.religion;
    if (body.phone !== undefined) student.phone = body.phone;
    if (body.avatarUrl !== undefined) student.avatarUrl = body.avatarUrl;

    // Locked Core Fields: Can only be edited if canEditRegistration is true and not expired
    const isUnlocked =
      student.canEditRegistration &&
      (!student.unlockExpiresAt || new Date() <= student.unlockExpiresAt);

    if (isUnlocked) {
      if (body.fullName) student.fullName = body.fullName.trim();
      if (body.matricNo) student.matricNo = body.matricNo.trim().toUpperCase();
      if (body.email) student.email = body.email.trim().toLowerCase();
      if (body.admissionYear) student.admissionYear = Number(body.admissionYear);

      // Immediately revoke edit permission after submission
      student.canEditRegistration = false;
      student.unlockExpiresAt = undefined;
    }

    await student.save();

    // Re-issue updated session cookie
    await setSessionCookie({
      userId: (student._id as any).toString(),
      email: student.email,
      role: student.role,
      status: student.status,
      matricNo: student.matricNo,
      fullName: student.fullName,
      canEditRegistration: false,
    });

    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const currentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    return NextResponse.json({
      success: true,
      message: isUnlocked
        ? 'Core registration details updated and locked successfully.'
        : 'Demographic profile setup updated successfully.',
      student: {
        id: (student._id as any).toString(),
        email: student.email,
        fullName: student.fullName,
        matricNo: student.matricNo,
        admissionYear: student.admissionYear,
        status: student.status,
        canEditRegistration: false,
        stateOfOrigin: student.stateOfOrigin,
        lga: student.lga,
        dateOfBirth: student.dateOfBirth,
        nationality: student.nationality,
        religion: student.religion,
        phone: student.phone,
        avatarUrl: student.avatarUrl,
        currentLevel,
      },
    });
  } catch (err: any) {
    console.error('[Student Profile PATCH Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
