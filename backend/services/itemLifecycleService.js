const { prisma } = require("../config/database");
const {
  createNotificationRecord,
  dispatchNotification,
} = require("./notificationService");
const {
  getLifecycleAction,
} = require("./itemLifecycleRules");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REMINDER_DAYS_BEFORE_EXPIRY = 7;

async function dispatchLifecycleNotification(notification, item, type, action) {
  const actionText = action === "remind" ? "expiry reminder" : "auto-archive";
  try {
    await dispatchNotification(notification);
  } catch (error) {
    console.error(
      `Item ${actionText} notification error for ${type} item #${item.id}:`,
      error
    );
  }
}

async function processItemLifecycle(now = new Date()) {
  const reminderCutoff = new Date(
    now.getTime() + REMINDER_DAYS_BEFORE_EXPIRY * DAY_IN_MS
  );
  const itemTypes = [
    { model: prisma.lostItem, type: "LOST", activeStatus: "lost" },
    { model: prisma.foundItem, type: "FOUND", activeStatus: "found" },
  ];

  for (const { model, type, activeStatus } of itemTypes) {
    const items = await model.findMany({
      where: {
        status: activeStatus,
        OR: [
          { expiresAt: { lte: now } },
          {
            expiresAt: { gt: now, lte: reminderCutoff },
            reminderSentAt: null,
          },
        ],
      },
    });

    for (const item of items) {
      const action = getLifecycleAction(item, now);
      if (!action) continue;

      try {
        const notification = await prisma.$transaction(async (transaction) => {
          const result = await transaction[
            type === "LOST" ? "lostItem" : "foundItem"
          ].updateMany({
            where: {
              id: item.id,
              status: activeStatus,
              ...(action === "archive"
                ? { expiresAt: { lte: now } }
                : { reminderSentAt: null, expiresAt: { gt: now, lte: reminderCutoff } }),
            },
            data:
              action === "archive"
                ? { status: "archived" }
                : { reminderSentAt: now },
          });
          if (result.count !== 1) return null;

          return createNotificationRecord(transaction, {
            userId: item.userId,
            type: action === "remind" ? "ITEM_EXPIRY_REMINDER" : "ITEM_ARCHIVED",
            title:
              action === "remind"
                ? "Your report expires in 7 days"
                : "Your report has been archived",
            message:
              action === "remind"
                ? `Your ${type.toLowerCase()} report "${item.title}" will be archived in 7 days. Close it if the item has been found.`
                : `Your ${type.toLowerCase()} report "${item.title}" has expired and is now archived.`,
            href: "/my-items",
            relatedItemId: item.id,
            relatedItemType: type,
            dedupeKey: `item-${action}:${type.toLowerCase()}:${item.id}:${item.expiresAt.getTime()}`,
          });
        });

        if (notification) {
          await dispatchLifecycleNotification(notification, item, type, action);
        }
      } catch (error) {
        console.error(
          `Item lifecycle ${action} error for ${type} item #${item.id}:`,
          error
        );
      }
    }
  }
}

module.exports = {
  processItemLifecycle,
};
