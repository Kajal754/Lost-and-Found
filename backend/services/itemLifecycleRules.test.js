const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getLifecycleAction,
  getReportExpiryDate,
} = require("./itemLifecycleRules");

const DAY_IN_MS = 24 * 60 * 60 * 1000;

test("new reports expire 30 days after creation", () => {
  const createdAt = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(
    getReportExpiryDate(createdAt).toISOString(),
    "2026-01-31T12:00:00.000Z"
  );
});

test("reminds once seven days before active report expiry", () => {
  const now = new Date("2026-01-24T12:00:00.000Z");
  const item = {
    status: "lost",
    expiresAt: new Date(now.getTime() + 7 * DAY_IN_MS),
    reminderSentAt: null,
  };
  assert.equal(getLifecycleAction(item, now), "remind");
  assert.equal(
    getLifecycleAction({ ...item, reminderSentAt: now }, now),
    null
  );
});

test("archives expired active reports and ignores non-active reports", () => {
  const now = new Date("2026-01-31T12:00:00.000Z");
  const expiredItem = {
    status: "found",
    expiresAt: new Date(now.getTime() - 1),
    reminderSentAt: null,
  };
  assert.equal(getLifecycleAction(expiredItem, now), "archive");
  assert.equal(
    getLifecycleAction({ ...expiredItem, status: "closed" }, now),
    null
  );
});

test("does not remind reports more than seven days from expiry", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(
    getLifecycleAction({
      status: "lost",
      expiresAt: new Date(now.getTime() + 8 * DAY_IN_MS),
      reminderSentAt: null,
    }, now),
    null
  );
});
