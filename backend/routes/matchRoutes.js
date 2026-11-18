const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMatches,
  getMatchById,
  updateMatchStatus,
} = require("../controllers/matchController");

const router = express.Router();

router.get("/", authMiddleware, getMatches);
router.get("/:id", authMiddleware, getMatchById);
router.patch("/:id/status", authMiddleware, updateMatchStatus);

module.exports = router;