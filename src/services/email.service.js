const getResendClient = require('../config/resend');

const FROM = process.env.RESEND_FROM_EMAIL || 'SocialX Studio <onboarding@resend.dev>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Send 6-digit OTP verification email
 */
const sendVerificationEmail = async ({ to, name, otp }) => {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${otp} is your SocialX Studio verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style="margin:0;padding:0;background:#0f172a;font-family:Inter,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
          <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px;text-align:center;">
                  <span style="color:#fff;font-size:22px;font-weight:700;">SocialX <span style="color:#c4b5fd;">Studio</span></span>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:36px;">
                  <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 10px;">
                    Hey ${name}, verify your email 👋
                  </h1>
                  <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                    Enter this 6-digit code in the SocialX Studio app to verify your email address.
                  </p>

                  <!-- OTP Box -->
                  <div style="background:#0f172a;border:2px solid #4f46e5;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
                    <div style="letter-spacing:16px;font-size:40px;font-weight:800;color:#818cf8;font-family:monospace;">
                      ${otp}
                    </div>
                    <p style="color:#64748b;font-size:12px;margin:12px 0 0;">Expires in <strong style="color:#94a3b8;">15 minutes</strong></p>
                  </div>

                  <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;text-align:center;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:16px 36px;border-top:1px solid #334155;text-align:center;">
                  <p style="color:#475569;font-size:12px;margin:0;">
                    © ${new Date().getFullYear()} SocialX Studio · All rights reserved
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  if (error) throw new Error(`Email send failed: ${error.message}`);
};

module.exports = { sendVerificationEmail };
