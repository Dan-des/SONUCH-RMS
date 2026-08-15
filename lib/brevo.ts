const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface SendEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name?: string };
}

export async function sendTransactionalEmail(payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const defaultSenderEmail = process.env.SENDER_EMAIL || 'workwithdan6@gmail.com';

  const sender = payload.sender || {
    name: 'School of Nursing, UCH RMS',
    email: defaultSenderEmail,
  };

  if (!apiKey || apiKey === 'xkeysib-placeholder-brevo-api-key') {
    console.warn('[Brevo API Stub] BREVO_API_KEY is not configured. Simulating email dispatch to:', payload.to);
    return { success: true, messageId: `stub-msg-${Date.now()}` };
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Brevo API Error]:', res.status, errBody);
      return { success: false, error: `Brevo API error ${res.status}: ${errBody}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.messageId };
  } catch (err: any) {
    console.error('[Brevo Dispatch Exception]:', err);
    return { success: false, error: err.message || 'Network exception sending email' };
  }
}

export async function sendAdminOtpEmail(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #065f46; margin-top: 0;">School of Nursing, UCH — Admin Access</h2>
      <p style="color: #334155; font-size: 15px;">You have requested administrator portal access. Use the 6-digit cryptographic verification code below:</p>
      <div style="background-color: #f0fdf4; border: 1px dashed #065f46; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #065f46;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This code will automatically expire in <strong>5 minutes</strong> and can only be used once.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px;">If you did not request this OTP, please contact system administration immediately.</p>
    </div>
  `;

  return sendTransactionalEmail({
    to: [{ email }],
    subject: `🔐 Your SONUCH Admin Verification Code: ${otp}`,
    htmlContent,
  });
}

export async function sendAdminAccessKeyRotatedEmail(
  toEmail: string,
  newAccessKey: string,
  rotatedBy: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #065f46; margin-top: 0;">School of Nursing, UCH — Master Admin Access Key</h2>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        The Master Administrator Access UUID Key for SONUCH RMS has been rotated by <strong>${rotatedBy}</strong>.
      </p>
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; margin: 20px 0; border-radius: 8px;">
        <p style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin: 0 0 6px 0;">New Master Access UUID Code</p>
        <code style="font-size: 16px; font-weight: bold; color: #065f46; word-break: break-all; font-family: monospace;">${newAccessKey}</code>
      </div>
      <p style="color: #475569; font-size: 12px; line-height: 1.5;">
        Please store this key securely. Any administrator attempting to request an authentication OTP must provide this exact UUID key.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 11px;">School of Nursing, University College Hospital, Ibadan.</p>
    </div>
  `;

  return sendTransactionalEmail({
    to: [{ email: toEmail }],
    subject: `🔑 Notice: Master Admin Access Key Rotated [${new Date().toLocaleDateString()}]`,
    htmlContent,
  });
}
