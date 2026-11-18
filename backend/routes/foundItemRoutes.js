const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  closeItemHandler,
  getMyItemsHandler,
  reopenItemHandler,
} = require("../controllers/itemLifecycleController");

const {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
} = require("../controllers/foundItemController");

const router = express.Router();

router.get("/", getFoundItems);
router.get("/mine", authMiddleware, getMyItemsHandler("found"));
router.get("/:id", getFoundItemById);

router.post("/", authMiddleware, createFoundItem);
router.post("/:id/close", authMiddleware, closeItemHandler("found"));
router.post("/:id/reopen", authMiddleware, reopenItemHandler("found"));
router.put("/:id", authMiddleware, updateFoundItem);
router.delete("/:id", authMiddleware, deleteFoundItem);

module.exports = router;