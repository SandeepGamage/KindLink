const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let resendClient = null;
let nodemailerTransporter = null;

function getNodemailerTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  if (!nodemailerTransporter) {
    nodemailerTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  return nodemailerTransporter;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Send 6-digit OTP verification code via Gmail SMTP (Nodemailer) or Resend
 * @param {Object} options
 * @param {string} options.email - Target recipient email
 * @param {string} options.code - 6-digit numeric OTP code
 * @param {string} [options.name] - User name
 */
async function sendVerificationCodeEmail({ email, code, name = 'there' }) {
  // Always log OTP in console for quick testing & dev fallback
  console.log(`\n========================================`);
  console.log(`[VERIFICATION CODE] To: ${email} | Code: ${code}`);
  console.log(`========================================\n`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KindLink Email Verification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F4F7FA;
      margin: 0;
      padding: 0;
      color: #17242E;
    }
    .container {
      max-width: 540px;
      margin: 32px auto;
      background: #FFFFFF;
      border-radius: 16px;
      border: 1px solid #DCE6EF;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(23, 36, 46, 0.05);
    }
    .header {
      background: #1F5C96;
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #17242E;
      margin-bottom: 12px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #5A6E7F;
      margin-bottom: 24px;
    }
    .code-box {
      background: #F0F6FE;
      border: 1.5px dashed #1F5C96;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #1F5C96;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .expiry {
      font-size: 13px;
      color: #E08A3C;
      font-weight: 600;
      margin-top: 10px;
    }
    .footer {
      border-top: 1px solid #DCE6EF;
      padding: 20px 32px;
      font-size: 12px;
      color: #8B9DAE;
      text-align: center;
      background: #FAFCFE;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>KindLink</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${name},</div>
      <p class="text">
        Welcome to KindLink! To verify your email address and activate your account, please enter the 6-digit verification code below:
      </p>
      <div class="code-box">
        <div class="code">${code}</div>
        <div class="expiry">Expires in 10 minutes</div>
      </div>
      <p class="text">
        If you did not create an account on KindLink, please disregard this email.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} KindLink. Empowering communities with care and connection.
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `Hello ${name},\n\nYour KindLink verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`;

  // 1. Try Gmail SMTP (Nodemailer) first if configured
  const transporter = getNodemailerTransporter();
  if (transporter) {
    try {
      const fromAddress = `"KindLink" <${process.env.EMAIL_USER}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: `Your KindLink Verification Code: ${code}`,
        html: htmlContent,
        text: textContent,
      });

      console.log('[GMAIL SMTP SUCCESS] Email sent to:', email, 'MessageId:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr) {
      console.error('[GMAIL SMTP ERROR]', smtpErr);
      // Fall through to Resend or simulated success
    }
  }

  // 2. Try Resend if configured
  const resend = getResendClient();
  if (resend) {
    const fromEmail = process.env.RESEND_FROM || 'KindLink <onboarding@resend.dev>';
    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Your KindLink Verification Code: ${code}`,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        console.error('[RESEND ERROR]', error);
        return { success: false, error: error.message };
      }

      console.log('[RESEND SUCCESS] Email sent successfully, ID:', data?.id);
      return { success: true, data };
    } catch (err) {
      console.error('[EMAIL SEND EXCEPTION]', err);
      return { success: false, error: err.message };
    }
  }

  console.warn('[EMAIL SERVICE] Neither Gmail SMTP nor Resend is configured. Code logged to console only.');
  return { success: true, simulated: true };
}

module.exports = {
  sendVerificationCodeEmail,
};
