ALTER TABLE "LostItem"
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "reminderSentAt" TIMESTAMP(3);

UPDATE "LostItem"
SET "expiresAt" = "createdAt" + INTERVAL '30 days';

ALTER TABLE "LostItem"
ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX "LostItem_status_expiresAt_idx"
ON "LostItem"("status", "expiresAt");

ALTER TABLE "FoundItem"
ADD COLUMN "expiresAt" TIMESTAMP(3),
ADD COLUMN "reminderSentAt" TIMESTAMP(3);

UPDATE "FoundItem"
SET "expiresAt" = "createdAt" + INTERVAL '30 days';

ALTER TABLE "FoundItem"
ALTER COLUMN "expiresAt" SET NOT NULL;

CREATE INDEX "FoundItem_status_expiresAt_idx"
ON "FoundItem"("status", "expiresAt");
