const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REPORT_LIFETIME_DAYS = 30;
const REMINDER_DAYS_BEFORE_EXPIRY = 7;

function getReportExpiryDate(from = new Date()) {
  return new Date(from.getTime() + REPORT_LIFETIME_DAYS * DAY_IN_MS);
}

function getLifecycleAction(item, now) {
  if (item.status !== "lost" && item.status !== "found") return null;
  if (item.expiresAt <= now) return "archive";

  const reminderTime = new Date(
    item.expiresAt.getTime() - REMINDER_DAYS_BEFORE_EXPIRY * DAY_IN_MS
  );
  if (!item.reminderSentAt && reminderTime <= now) return "remind";
  return null;
}

module.exports = {
  getLifecycleAction,
  getReportExpiryDate,
};
