const express = require("express");

const {
  register,
  login,
  getMe,
  updateProfileImage,
  updateNotificationPreferences,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.patch("/profile-image", authMiddleware, updateProfileImage);
router.patch("/notification-preferences", authMiddleware, updateNotificationPreferences);

module.exports = router;
