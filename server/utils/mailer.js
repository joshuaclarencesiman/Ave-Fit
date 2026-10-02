const nodemailer = require("nodemailer");

require("dotenv").config();

const BRAND_COLOR = "#f97316";

/**
 * Verification mail is optional infrastructure.
 * When SMTP credentials are absent, the code is written
 * to the server console for local development.
 */
function smtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT || 465),

    // Force IPv4 because some hosted environments
    // may have unreliable IPv6 connectivity.
    family: 4,

    // Implicit TLS for port 465.
    secure:
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true",

    auth: {
      user,
      pass,
    },
  };
}

let transporter = null;
let transportResolved = false;

function getTransporter() {
  if (transportResolved) return transporter;

  const config = smtpConfig();

  if (config) {
    transporter = nodemailer.createTransport(config);
  }

  transportResolved = true;

  if (!transporter) {
    console.warn(
      "⚠️ SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS). Verification codes will be printed to this console instead of being emailed."
    );
  }

  return transporter;
}

function isMailConfigured() {
  return Boolean(smtpConfig());
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

async function sendMail({ to, subject, text, html }) {
  const transport = getTransporter();

  if (!transport) {
    console.log(
      "\n──────────── AveFit email (SMTP not configured) ────────────"
    );

    console.log("To:      " + to);
    console.log("Subject: " + subject);
    console.log(text);

    console.log(
      "─────────────────────────────────────────────────────────────\n"
    );

    return {
      delivered: false,
      preview: true,
    };
  }

  const info = await transport.sendMail({
    from: fromAddress(),
    to,
    subject,
    text,
    html,
  });

  console.log(
    "📧 Verification email sent to " +
      to +
      " (" +
      info.messageId +
      ")"
  );

  return {
    delivered: true,
    messageId: info.messageId,
  };
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function verificationEmail({ firstName, code }) {
  const name = escapeHtml(firstName || "there");
  const safeCode = escapeHtml(code);

  const text = [
    "Hi " + (firstName || "there") + ",",
    "",
    "Thanks for creating an AveFit account. Enter this code in AveFit to confirm your email address:",
    "",
    code,
    "",
    "This code expires in " +
      (process.env.VERIFICATION_CODE_TTL_MINUTES || 10) +
      " minutes and can only be used once.",
    "If you did not sign up for AveFit you can safely ignore this email.",
    "",
    "Avenue Power & Fitness Gym",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
      <tr>
        <td style="background:${BRAND_COLOR};padding:22px 28px;">
          <span style="font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">AveFit</span>
          <span style="display:block;font-size:12px;color:#ffedd5;margin-top:2px;">Avenue Power &amp; Fitness Gym</span>
        </td>
      </tr>

      <tr>
        <td style="padding:28px;">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">
            Your AveFit verification code
          </h1>

          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">
            Hi ${name},
          </p>

          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">
            Enter this code in AveFit to confirm your email address and submit your registration
            to the gym administrator for approval.
          </p>

          <p style="margin:0 0 24px;text-align:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px;font-size:28px;font-weight:800;letter-spacing:6px;color:${BRAND_COLOR};">
            ${safeCode}
          </p>

          <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
            This code expires in ${
              process.env.VERIFICATION_CODE_TTL_MINUTES || 10
            } minutes and can only be used once. If you did not sign up for AveFit, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    text,
    html,
  };
}

async function sendVerificationEmail({ to, firstName, code }) {
  const content = verificationEmail({
    firstName,
    code,
  });

  return sendMail({
    to,
    subject: "Verify your AveFit email address",
    text: content.text,
    html: content.html,
  });
}

module.exports = {
  isMailConfigured,
  sendMail,
  sendVerificationEmail,
};