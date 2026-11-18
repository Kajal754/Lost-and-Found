const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getQrItem,
  getMyRecoveryClaims,
  getMyLostItems,
  getRecoveryClaims,
  createRecoveryClaim,
  reviewRecoveryClaim,
  markItemReturned,
} = require("../controllers/recoveryController");

const router = express.Router();

router.get("/item/:token", getQrItem);
router.get("/claims", authMiddleware, getMyRecoveryClaims);
router.get("/lost-items", authMiddleware, getMyLostItems);
router.get("/items/:itemId/claims", authMiddleware, getRecoveryClaims);
router.post("/items/:itemId/claims", authMiddleware, createRecoveryClaim);
router.patch("/claims/:claimId/review", authMiddleware, reviewRecoveryClaim);
router.patch("/claims/:claimId/return", authMiddleware, markItemReturned);

module.exports = router;
