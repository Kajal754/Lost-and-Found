const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role || "USER",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

async function register(req, res) {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Name, password and email or phone are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email?.trim().toLowerCase() || null;
    const normalizedPhone = phone?.replace(/[^0-9+]/g, "") || null;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
          ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailNotifications: user.emailNotifications,
        messageEmailNotifications: user.messageEmailNotifications,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
}

async function login(req, res) {
  try {
    const { identifier, email, phone, password } = req.body;
    const loginIdentifier = identifier || email || phone;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or phone and password are required",
      });
    }

    const normalizedIdentifier = loginIdentifier.trim();
    const normalizedEmail = normalizedIdentifier.toLowerCase();
    const normalizedPhone = normalizedIdentifier.replace(/[^0-9+]/g, "");
    const phoneDigits = normalizedPhone.replace(/\D/g, "");

    const phoneCandidates = new Set();
    if (phoneDigits) {
      phoneCandidates.add(phoneDigits);
      phoneCandidates.add(`+${phoneDigits}`);

      if (phoneDigits.length === 10) {
        phoneCandidates.add(`+91${phoneDigits}`);
        phoneCandidates.add(`91${phoneDigits}`);
      }

      if (phoneDigits.length === 12 && phoneDigits.startsWith("91")) {
        phoneCandidates.add(phoneDigits.slice(2));
        phoneCandidates.add(`+91${phoneDigits.slice(2)}`);
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedEmail, mode: "insensitive" } },
          ...Array.from(phoneCandidates, (candidate) => ({
            phone: candidate,
          })),
        ],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailNotifications: user.emailNotifications,
        messageEmailNotifications: user.messageEmailNotifications,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        role: true,
        emailNotifications: true,
        messageEmailNotifications: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
}

async function updateProfileImage(req, res) {
  try {
    const { profileImage } = req.body;

    if (profileImage !== null && typeof profileImage !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile image",
      });
    }

    if (profileImage && profileImage.length > 7 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Profile image must be smaller than 5 MB",
      });
    }

    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        profileImage: profileImage || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        role: true,
        emailNotifications: true,
        messageEmailNotifications: true,
      },
    });

    return res.json({
      success: true,
      message: "Profile photo updated",
      user,
    });
  } catch (error) {
    console.error("Update profile image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile photo",
    });
  }
}

async function updateNotificationPreferences(req, res) {
  try {
    const { emailNotifications, messageEmailNotifications } = req.body;
    if (
      typeof emailNotifications !== "boolean" ||
      typeof messageEmailNotifications !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Both notification preferences must be boolean values",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { emailNotifications, messageEmailNotifications },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        createdAt: true,
        role: true,
        emailNotifications: true,
        messageEmailNotifications: true,
      },
    });

    return res.json({
      success: true,
      message: "Notification preferences updated",
      user,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfileImage,
  updateNotificationPreferences,
};
