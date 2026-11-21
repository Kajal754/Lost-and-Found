const { prisma } = require("../config/database");

async function getNotifications(req, res) {
  try {
    const where = { userId: req.user.id };
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.notification.count({
        where: { ...where, readAt: null },
      }),
    ]);

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
}

async function markNotificationRead(req, res) {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.readAt) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { readAt: new Date() },
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
}

async function markAllNotificationsRead(req, res) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return res.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
}

async function markMatchNotificationsRead(req, res) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, type: "MATCH_FOUND", readAt: null },
      data: { readAt: new Date() },
    });
    return res.json({
      success: true,
      message: "Match notifications marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Mark match notifications read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update match notifications",
    });
  }
}

async function deleteNotification(req, res) {
  try {
    const notificationId = Number(req.params.id);
    if (!Number.isInteger(notificationId) || notificationId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification",
      });
    }

    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId: req.user.id },
    });
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
}

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  markMatchNotificationsRead,
  deleteNotification,
};
