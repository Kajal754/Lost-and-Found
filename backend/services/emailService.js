const nodemailer = require("nodemailer");

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function createTransporter() {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

async function sendAppNotificationEmail({
  to,
  subject,
  title,
  message,
  href,
  type = "Notification",
}) {
  if (!to) return { sent: false, reason: "missing_recipient" };

  try {
    const transporter = createTransporter();
    if (!transporter) return { sent: false, reason: "smtp_not_configured" };

    const baseUrl = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
    const localPath = typeof href === "string" && href.startsWith("/") && !href.startsWith("//")
      ? href
      : "/dashboard";
    const safeHref = `${baseUrl}${localPath}`;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || `"Lost & Found" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: `${title}\n\n${message}\n\nOpen Lost & Found: ${safeHref}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:24px auto;color:#18392e;border:1px solid #dce8df;border-radius:16px;overflow:hidden">
          <div style="background:#175c43;padding:20px 24px;color:#fff">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.8">Lost &amp; Found · ${escapeHtml(type)}</p>
            <h1 style="margin:0;font-size:22px">${escapeHtml(title)}</h1>
          </div>
          <div style="padding:24px">
            <p style="margin:0 0 24px;line-height:1.6">${escapeHtml(message)}</p>
            <a href="${escapeHtml(safeHref)}" style="display:inline-block;background:#175c43;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Open notification</a>
          </div>
        </div>
      `,
    });
    return { sent: true };
  } catch (error) {
    console.error("Notification email error:", error);
    return { sent: false, reason: "send_failed" };
  }
}

module.exports = { sendAppNotificationEmail };
