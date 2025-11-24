-- AlterTable
ALTER TABLE "users" ADD COLUMN "gmailConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "gmailEmail" TEXT,
ADD COLUMN "gmailAccessToken" TEXT,
ADD COLUMN "gmailRefreshToken" TEXT,
ADD COLUMN "gmailTokenExpiry" TIMESTAMP(3);
