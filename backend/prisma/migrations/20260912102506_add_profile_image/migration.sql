-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileImage" TEXT,
ALTER COLUMN "email" DROP NOT NULL;
