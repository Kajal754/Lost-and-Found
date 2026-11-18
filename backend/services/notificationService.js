const { prisma } = require("../config/database");
const { sendAppNotificationEmail } = require("./emailService");
const { emitToUser } = require("./socketService");

async function createNotificationRecord(client, notification) {
  const data = {
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    relatedItemId: notification.relatedItemId ?? null,
    relatedItemType: notification.relatedItemType ?? null,
    relatedClaimId: notification.relatedClaimId ?? null,
    relatedMatchId: notification.relatedMatchId ?? null,
    dedupeKey: notification.dedupeKey ?? null,
  };
  return client.notification.create({ data });
}

async function dispatchNotification(notification) {
  emitToUser(notification.userId, "notification:new", notification);

  let recipient;
  try {
    recipient = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: {
        email: true,
        emailNotifications: true,
        messageEmailNotifications: true,
      },
    });
  } catch (error) {
    console.error("Notification email preference lookup error:", error);
    return { notification, emailSent: false };
  }

  const shouldEmail =
    recipient?.email &&
    recipient.emailNotifications &&
    (notification.type !== "MESSAGE" || recipient.messageEmailNotifications);
  if (!shouldEmail) return { notification, emailSent: false };

  const emailResult = await sendAppNotificationEmail({
    to: recipient.email,
    subject: `${notification.title} · Lost & Found`,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    type: notification.type.replaceAll("_", " "),
  });
  return { notification, emailSent: emailResult.sent };
}

module.exports = {
  createNotificationRecord,
  dispatchNotification,
};
