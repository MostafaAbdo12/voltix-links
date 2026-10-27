import nodemailer from 'nodemailer';

/**
 * Sends transactional email over SMTP. Defaults to Gmail (SMTP_USER = the Gmail address,
 * SMTP_PASS = a Google "App password"); set SMTP_HOST/SMTP_PORT to use another provider.
 */

export function isMailerConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** A single-button branded email, RTL Arabic first with an English line underneath. */
function renderEmail(opts: { heading: string; body: string; button: string; url: string; footer: string; bodyEn: string }) {
  const { heading, body, button, url, footer, bodyEn } = opts;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<body style="margin:0;padding:24px;background:#0b0b10;font-family:Tahoma,Arial,sans-serif;color:#f4f4f5;">
  <div style="max-width:480px;margin:0 auto;background:#14141c;border:1px solid #3f3520;border-radius:20px;padding:32px;text-align:right;">
    <div style="font-size:22px;font-weight:bold;color:#e6b325;margin-bottom:20px;" dir="ltr">VoltiX</div>
    <h1 style="font-size:20px;margin:0 0 12px;">${escapeHtml(heading)}</h1>
    <p style="font-size:15px;line-height:1.8;color:#d4d4d8;margin:0 0 24px;">${escapeHtml(body)}</p>
    <a href="${url}" style="display:inline-block;background:#e6b325;color:#000;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:12px;">${escapeHtml(button)}</a>
    <p style="font-size:12px;line-height:1.7;color:#71717a;margin:24px 0 0;">${escapeHtml(footer)}</p>
    <p style="font-size:12px;color:#52525b;margin:16px 0 0;text-align:left;" dir="ltr">${escapeHtml(bodyEn)}</p>
    <p style="font-size:11px;color:#52525b;margin:16px 0 0;word-break:break-all;" dir="ltr">${url}</p>
  </div>
</body>
</html>`;
}

async function send(to: string, subject: string, html: string, text: string) {
  await getTransporter().sendMail({
    from: `"VoltiX" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await send(
    to,
    'استرجاع كلمة السر — VoltiX',
    renderEmail({
      heading: 'استرجاع كلمة السر',
      body: 'وصلنا طلب لتغيير كلمة السر بتاعة حسابك. اضغط الزرار علشان تختار كلمة سر جديدة.',
      button: 'اختار كلمة سر جديدة',
      url,
      footer: 'الرابط ده صالح لمدة ساعة واحدة. لو مش إنت اللي طلبت، تجاهل الإيميل ده وحسابك هيفضل زي ما هو.',
      bodyEn: 'Reset your VoltiX password using the button above. The link expires in 1 hour.',
    }),
    `استرجاع كلمة السر: ${url}\nالرابط صالح لمدة ساعة.`
  );
}

export async function sendVerificationEmail(to: string, token: string) {
  const url = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  await send(
    to,
    'تأكيد الإيميل — VoltiX',
    renderEmail({
      heading: 'أكّد إيميلك',
      body: 'أهلًا بيك في VoltiX! اضغط الزرار علشان تأكد إن الإيميل ده بتاعك.',
      button: 'تأكيد الإيميل',
      url,
      footer: 'الرابط ده صالح لمدة 24 ساعة. لو مش إنت اللي عملت الحساب، تجاهل الإيميل ده.',
      bodyEn: 'Confirm your email for VoltiX using the button above. The link expires in 24 hours.',
    }),
    `تأكيد الإيميل: ${url}\nالرابط صالح لمدة 24 ساعة.`
  );
}
