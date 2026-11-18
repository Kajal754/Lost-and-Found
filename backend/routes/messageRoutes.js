const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/", authMiddleware, getConversations);
router.get("/:matchId", authMiddleware, getMessages);
router.post("/:matchId", authMiddleware, sendMessage);

module.exports = router;