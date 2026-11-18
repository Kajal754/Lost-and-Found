
const nodemailer = require("nodemailer");

async function sendPasswordResetOtp(email, otp) {
  if (
    !process.env.MAIL_USER ||
    !process.env.MAIL_PASS
  ) {
    throw new Error("Email service is not configured");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT || 587),
    secure: process.env.MAIL_SECURE === "true",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM
      ? `"${process.env.MAIL_FROM}" <${process.env.MAIL_USER}>`
      : process.env.MAIL_USER,
    to: email,
    subject: "Password Reset OTP - Lost & Found",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px">
        <h2>Reset your password</h2>
        <p>Use the OTP below to reset your Lost &amp; Found account password.</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:20px;background:#f1f5f9;text-align:center">
          ${otp}
        </div>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetOtp };
