
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { prisma } = require("../config/database");
const {
  sendPasswordResetOtp,
} = require("../services/passwordResetEmailService");

async function requestOtp(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do not reveal whether an email is registered.
    if (!user) {
      return res.json({
        success: true,
        message: "If this email is registered, an OTP will be sent.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtpHash: otpHash,
        resetOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        resetOtpVerifiedAt: null,
        resetOtpAttempts: 0,
      },
    });

    try {
      await sendPasswordResetOtp(email, otp);
    } catch (mailError) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetOtpHash: null,
          resetOtpExpiresAt: null,
          resetOtpVerifiedAt: null,
          resetOtpAttempts: 0,
        },
      });

      throw mailError;
    }

    return res.json({
      success: true,
      message: "If this email is registered, an OTP will be sent.",
    });
  } catch (error) {
    console.error("Password reset OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP right now. Please try again.",
    });
  }
}

async function verifyOtp(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const otp = String(req.body.otp || "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "Enter your registered email and 6-digit OTP.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !user.resetOtpHash ||
      !user.resetOtpExpiresAt ||
      user.resetOtpExpiresAt <= new Date() ||
      user.resetOtpAttempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Request a new OTP.",
      });
    }

    const valid = await bcrypt.compare(otp, user.resetOtpHash);

    if (!valid) {
      const attempts = user.resetOtpAttempts + 1;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetOtpAttempts: attempts,
          ...(attempts >= 5
            ? {
                resetOtpHash: null,
                resetOtpExpiresAt: null,
                resetOtpVerifiedAt: null,
              }
            : {}),
        },
      });

      return res.status(400).json({
        success: false,
        message:
          attempts >= 5
            ? "Too many incorrect attempts. Request a new OTP."
            : `Incorrect OTP. ${5 - attempts} attempt(s) remaining.`,
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtpVerifiedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP. Please try again.",
    });
  }
}

async function resetPassword(req, res) {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = req.body.password;

  if (!email || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Email and a password of at least 6 characters are required.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const now = Date.now();

    if (
      !user ||
      !user.resetOtpVerifiedAt ||
      !user.resetOtpExpiresAt ||
      !user.resetOtpHash ||
      user.resetOtpExpiresAt.getTime() <= now ||
      now - user.resetOtpVerifiedAt.getTime() > 10 * 60 * 1000 ||
      user.resetOtpAttempts >= 5
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP verification expired. Please start again.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtpHash: null,
        resetOtpExpiresAt: null,
        resetOtpVerifiedAt: null,
        resetOtpAttempts: 0,
      },
    });

    return res.json({
      success: true,
      message: "Password reset successful. Please log in.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
}

module.exports = {
  requestOtp,
  verifyOtp,
  resetPassword,
};