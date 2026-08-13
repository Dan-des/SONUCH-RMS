import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '../../../../lib/db';
import Notification from '../../../../models/Notification';
import User from '../../../../models/User';
import AcademicSession from '../../../../models/AcademicSession';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { calculateLevel } from '../../../../lib/level-calculator';
import { sendTransactionalEmail } from '../../../../lib/brevo';
import { createNotificationSchema } from '../../../../lib/validations/communications';

export async function GET() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
    }

    await connectToDatabase();
    const notifications = await Notification.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      notifications: notifications.map((n) => ({
        id: (n._id as any).toString(),
        title: n.title,
        message: n.message,
        priority: n.priority,
        targetAudience: n.targetAudience,
        createdBy: n.createdBy,
        createdAt: n.createdAt,
      })),
    });
  } catch (err: any) {
    console.error('[Admin Notifications GET Exception]:', err);
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
    const parsed = createNotificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, message, priority, targetAudience } = parsed.data;

    await connectToDatabase();

    const newNotification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      priority,
      targetAudience,
      createdBy: session.email,
    });

    // Query matching student recipients
    const academicSessionRecord = await AcademicSession.findOne();
    const activeSession = academicSessionRecord?.activeSession || '2026/2027';

    const allStudents = await User.find({ role: 'student', status: 'verified' }).select('email fullName admissionYear');

    const targetedStudents = allStudents.filter((s) => {
      if (targetAudience === 'all') return true;
      const level = calculateLevel(s.admissionYear || 2026, activeSession);
      return level === targetAudience;
    });

    // Dispatch background Brevo broadcast email alerts
    if (targetedStudents.length > 0) {
      const emailRecipients = targetedStudents.map((s) => ({
        email: s.email,
        name: s.fullName,
      }));

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
          <h2 style="color: #059669; margin-top: 0;">School of Nursing, UCH — Announcement</h2>
          <div style="background-color: #f8fafc; border-left: 4px solid #059669; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px;">${title}</h3>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${message}</p>
          </div>
          <div style="margin: 24px 0; text-align: center;">
            <a href="https://portal.sonuch.edu.ng/student/login" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Open Student Portal
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 11px;">Target Audience: ${targetAudience.toUpperCase()} Students • School of Nursing, University College Hospital, Ibadan.</p>
        </div>
      `;

      // Batch dispatch via Brevo
      sendTransactionalEmail({
        to: emailRecipients,
        subject: `📢 New Announcement: ${title}`,
        htmlContent,
      }).catch((err) => console.error('[Brevo Broadcast Error]:', err));
    }

    return NextResponse.json({
      success: true,
      message: `Announcement published and email alert queued for ${targetedStudents.length} student(s).`,
      notification: {
        id: (newNotification._id as any).toString(),
        title: newNotification.title,
        priority: newNotification.priority,
        targetAudience: newNotification.targetAudience,
        recipientsCount: targetedStudents.length,
      },
    });
  } catch (err: any) {
    console.error('[Admin Notifications POST Exception]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
