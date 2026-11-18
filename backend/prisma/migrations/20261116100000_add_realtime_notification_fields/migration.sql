ALTER TABLE "User"
ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "messageEmailNotifications" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Notification"
ADD COLUMN "type" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN "relatedItemId" INTEGER,
ADD COLUMN "relatedItemType" TEXT,
ADD COLUMN "relatedClaimId" INTEGER,
ADD COLUMN "relatedMatchId" INTEGER,
ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "Notification_userId_dedupeKey_key"
ON "Notification"("userId", "dedupeKey");
