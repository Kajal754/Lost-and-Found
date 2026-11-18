const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  closeItemHandler,
  getMyItemsHandler,
  reopenItemHandler,
} = require("../controllers/itemLifecycleController");

const {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
} = require("../controllers/lostItemController");

const router = express.Router();

router.get("/", getLostItems);
router.get("/mine", authMiddleware, getMyItemsHandler("lost"));
router.get("/:id", getLostItemById);

router.post("/", authMiddleware, createLostItem);
router.post("/:id/close", authMiddleware, closeItemHandler("lost"));
router.post("/:id/reopen", authMiddleware, reopenItemHandler("lost"));
router.put("/:id", authMiddleware, updateLostItem);
router.delete("/:id", authMiddleware, deleteLostItem);

module.exports = router;