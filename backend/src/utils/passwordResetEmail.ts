import nodemailer from 'nodemailer';

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getMailer = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const from = process.env.SMTP_FROM?.trim();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD?.trim() ?? process.env.SMTP_PASS?.trim();
  const frontendUrl = process.env.FRONTEND_URL?.trim();
  const secureSetting = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure = secureSetting === undefined ? port === 465 : secureSetting === 'true';

  if (!host || !from || !Number.isInteger(port) || port < 1 || port > 65535 || !frontendUrl) {
    throw new Error('Password reset email is not configured');
  }
  if (Boolean(user) !== Boolean(password)) {
    throw new Error('SMTP_USER and SMTP_PASSWORD (or SMTP_PASS) must be configured together');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    ...(user && password ? { auth: { user, pass: password } } : {}),
  });

  return { transporter, from, frontendUrl };
};

export const assertPasswordResetEmailConfigured = (): void => {
  getMailer();
};

export const sendPasswordResetEmail = async ({
  email,
  firstName,
  resetToken,
}: {
  email: string;
  firstName: string;
  resetToken: string;
}): Promise<void> => {
  const { transporter, from, frontendUrl } = getMailer();
  const resetUrl = new URL('/reset-password', frontendUrl);
  resetUrl.searchParams.set('token', resetToken);
  const safeName = escapeHtml(firstName || 'there');

  const result = await transporter.sendMail({
    from,
    to: email,
    subject: 'Reset your Royal Knot password',
    text: `Hello ${firstName || 'there'},\n\nUse this secure link to reset your Royal Knot password within 15 minutes:\n${resetUrl.toString()}\n\nIf you did not request this change, you can ignore this email.`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#fff8ef;color:#17243a;font-family:Arial,sans-serif">
    <main style="max-width:560px;margin:32px auto;padding:36px 28px;background:#fff;border:1px solid #ebd9c1;border-radius:20px">
      <p style="margin:0;color:#8d693a;font-size:12px;letter-spacing:3px;font-weight:bold">THE ROYAL KNOT</p>
      <h1 style="margin:20px 0 12px;color:#071b35;font-family:Georgia,serif">Reset your password</h1>
      <p>Hello ${safeName},</p>
      <p>We received a request to reset the password for your Royal Knot account. Use the secure button below within 15 minutes.</p>
      <p style="margin:28px 0">
        <a href="${escapeHtml(resetUrl.toString())}" style="display:inline-block;padding:14px 22px;background:#071b35;color:#e8c995;text-decoration:none;border-radius:10px;font-weight:bold">Reset Password</a>
      </p>
      <p style="font-size:13px;color:#5f5b55">If the button does not work, copy and paste this link into your browser:<br><a href="${escapeHtml(resetUrl.toString())}" style="color:#6f522f;word-break:break-all">${escapeHtml(resetUrl.toString())}</a></p>
      <p style="font-size:13px;color:#5f5b55">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
    </main>
  </body>
</html>`,
  });

  const acceptedRecipients = (result.accepted || []).map((recipient) =>
    typeof recipient === 'string' ? recipient.toLowerCase() : recipient.address.toLowerCase()
  );
  if (!acceptedRecipients.includes(email.toLowerCase())) {
    throw new Error('SMTP server did not accept the password reset recipient');
  }
};
