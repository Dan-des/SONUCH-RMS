import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import Notification from '../../../../models/Notification';
import NotificationRead from '../../../../models/NotificationRead';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';
import { markNotificationReadSchema } from '../../../../lib/validations/communications';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const student = await User.findById(session.userId);
    if (!student) {
      return NextResponse.json({ error: 'Student record not found' }, { status: 404 });
    }

    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';
    const studentLevel = calculateLevel(student.admissionYear || 2026, activeSession);

    // Find notifications matching "all" or student's specific level
    const notifications = await Notification.find({
      targetAudience: { $in: ['all', studentLevel] },
    }).sort({ createdAt: -1 });

    // Find read receipts for this student
    const readRecords = await NotificationRead.find({ studentId: student._id });
    const readSet = new Set(readRecords.map((r) => r.notificationId.toString()));

    const formattedNotifications = notifications.map((n) => ({
      id: (n._id as any).toString(),
      title: n.title,
      message: n.message,
      priority: n.priority,
      targetAudience: n.targetAudience,
      createdAt: n.createdAt,
      isRead: readSet.has((n._id as any).toString()),
    }));

    const unreadCount = formattedNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      unreadCount,
      studentLevel,
      notifications: formattedNotifications,
    });
  } catch (err: any) {
    console.error('[Student Notifications GET Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = markNotificationReadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
    }

    const { notificationId } = parsed.data;
    await connectToDatabase();

    await NotificationRead.findOneAndUpdate(
      { notificationId, studentId: session.userId },
      { notificationId, studentId: session.userId, readAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (err: any) {
    console.error('[Student Notifications POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
