const { prisma } = require("../config/database");
const { getReportExpiryDate } = require("../services/itemLifecycleRules");

const itemTypes = {
  lost: { model: prisma.lostItem, activeStatus: "lost" },
  found: { model: prisma.foundItem, activeStatus: "found" },
};

function getMyItemsHandler(type) {
  const { model } = itemTypes[type];
  return async function getMyItems(req, res) {
    try {
      const items = await model.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
      });
      return res.json({ success: true, items });
    } catch (error) {
      console.error(`Get my ${type} items error:`, error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch your items",
      });
    }
  };
}

function closeItemHandler(type) {
  const { model, activeStatus } = itemTypes[type];
  return async function closeItem(req, res) {
    try {
      const itemId = Number(req.params.id);
      if (!Number.isInteger(itemId) || itemId < 1) {
        return res.status(400).json({ success: false, message: "Invalid item" });
      }

      const item = await model.findUnique({ where: { id: itemId } });
      if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" });
      }
      if (item.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only close your own reports",
        });
      }
      if (item.status !== activeStatus) {
        return res.status(409).json({
          success: false,
          message: "Only active reports can be closed",
        });
      }

      const result = await model.updateMany({
        where: { id: itemId, userId: req.user.id, status: activeStatus },
        data: { status: "closed" },
      });
      if (result.count !== 1) {
        return res.status(409).json({
          success: false,
          message: "This report has already changed",
        });
      }

      const updatedItem = await model.findUnique({ where: { id: itemId } });
      return res.json({
        success: true,
        message: "Report closed successfully",
        item: updatedItem,
      });
    } catch (error) {
      console.error(`Close ${type} item error:`, error);
      return res.status(500).json({
        success: false,
        message: "Failed to close report",
      });
    }
  };
}

function reopenItemHandler(type) {
  const { model } = itemTypes[type];
  return async function reopenItem(req, res) {
    try {
      const itemId = Number(req.params.id);
      if (!Number.isInteger(itemId) || itemId < 1) {
        return res.status(400).json({ success: false, message: "Invalid item" });
      }

      const item = await model.findUnique({ where: { id: itemId } });
      if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" });
      }
      if (item.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can only reopen your own reports",
        });
      }
      if (item.status !== "closed" && item.status !== "archived") {
        return res.status(409).json({
          success: false,
          message: "Only closed or archived reports can be reopened",
        });
      }

      const activeStatus = type === "lost" ? "lost" : "found";
      const result = await model.updateMany({
        where: { id: itemId, userId: req.user.id, status: item.status },
        data: {
          status: activeStatus,
          expiresAt: getReportExpiryDate(),
          reminderSentAt: null,
        },
      });
      if (result.count !== 1) {
        return res.status(409).json({
          success: false,
          message: "This report has already changed",
        });
      }

      const updatedItem = await model.findUnique({ where: { id: itemId } });
      return res.json({
        success: true,
        message: "Report reopened successfully",
        item: updatedItem,
      });
    } catch (error) {
      console.error(`Reopen ${type} item error:`, error);
      return res.status(500).json({
        success: false,
        message: "Failed to reopen report",
      });
    }
  };
}

module.exports = {
  getMyItemsHandler,
  closeItemHandler,
  reopenItemHandler,
};
