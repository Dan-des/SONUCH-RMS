const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface SendEmailPayload {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name?: string };
}

export async function sendTransactionalEmail(payload: SendEmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const defaultSenderEmail = process.env.SENDER_EMAIL || 'noreply@sonuch.edu.ng';

  const sender = payload.sender || {
    name: 'School of Nursing, UCH',
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
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; borderRadius: 12px;">
      <h2 style="color: #059669; margin-top: 0;">School of Nursing, UCH — Admin Access</h2>
      <p style="color: #334155; font-size: 15px;">You have requested admin portal access. Use the 6-digit cryptographic verification code below:</p>
      <div style="background-color: #f0fdf4; border: 1px border-dashed #059669; padding: 16px; text-align: center; margin: 20px 0; border-radius: 8px;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #047857;">${otp}</span>
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
