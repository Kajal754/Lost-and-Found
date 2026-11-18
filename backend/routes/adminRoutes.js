const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getOverview, listUsers, setUserRole, updateItemStatus, deleteItem } = require("../controllers/adminController");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);
router.get("/overview", getOverview);
router.get("/users", listUsers);
router.patch("/users/:id/role", setUserRole);
router.patch("/items/:type/:id/status", updateItemStatus);
router.delete("/items/:type/:id", deleteItem);
module.exports = router;
