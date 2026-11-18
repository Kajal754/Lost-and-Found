ALTER TABLE "LostItem" ADD COLUMN "qrToken" TEXT;
ALTER TABLE "FoundItem" ADD COLUMN "qrToken" TEXT;

UPDATE "LostItem" SET "qrToken" = gen_random_uuid()::text;
UPDATE "FoundItem" SET "qrToken" = gen_random_uuid()::text;

ALTER TABLE "LostItem" ALTER COLUMN "qrToken" SET NOT NULL;
ALTER TABLE "FoundItem" ALTER COLUMN "qrToken" SET NOT NULL;

CREATE UNIQUE INDEX "LostItem_qrToken_key" ON "LostItem"("qrToken");
CREATE UNIQUE INDEX "FoundItem_qrToken_key" ON "FoundItem"("qrToken");

CREATE TABLE "RecoveryClaim" (
    "id" SERIAL NOT NULL,
    "foundItemId" INTEGER NOT NULL,
    "lostItemId" INTEGER NOT NULL,
    "claimantId" INTEGER NOT NULL,
    "proof" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecoveryClaim_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RecoveryVerification" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "actorId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryVerification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecoveryClaim_foundItemId_idx" ON "RecoveryClaim"("foundItemId");
CREATE INDEX "RecoveryClaim_lostItemId_idx" ON "RecoveryClaim"("lostItemId");
CREATE INDEX "RecoveryClaim_claimantId_idx" ON "RecoveryClaim"("claimantId");
CREATE INDEX "RecoveryVerification_claimId_idx" ON "RecoveryVerification"("claimId");
CREATE INDEX "RecoveryVerification_actorId_idx" ON "RecoveryVerification"("actorId");

ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_foundItemId_fkey"
    FOREIGN KEY ("foundItemId") REFERENCES "FoundItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_lostItemId_fkey"
    FOREIGN KEY ("lostItemId") REFERENCES "LostItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecoveryClaim" ADD CONSTRAINT "RecoveryClaim_claimantId_fkey"
    FOREIGN KEY ("claimantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecoveryVerification" ADD CONSTRAINT "RecoveryVerification_claimId_fkey"
    FOREIGN KEY ("claimId") REFERENCES "RecoveryClaim"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecoveryVerification" ADD CONSTRAINT "RecoveryVerification_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
