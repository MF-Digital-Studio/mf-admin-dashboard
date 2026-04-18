-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."NotificationEventType" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'DUE_SOON', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."NotificationEntityType" AS ENUM ('CLIENT', 'PROJECT', 'TASK', 'PROPOSAL', 'PAYMENT', 'NOTE', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "eventType" "public"."NotificationEventType" NOT NULL,
    "entityType" "public"."NotificationEntityType" NOT NULL,
    "entityId" TEXT,
    "dedupeKey" TEXT,
    "hiddenFromBell" BOOLEAN NOT NULL DEFAULT false,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."Settings" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "agencyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "defaultCurrency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "dedupeKey" TEXT;
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "hiddenFromBell" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "read" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."Notification" ADD COLUMN IF NOT EXISTS "entityId" TEXT;

ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "agencyName" TEXT NOT NULL DEFAULT 'MF Digital Studio';
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT 'info@mfdigital.com';
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '+90 555 000 0000';
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "website" TEXT NOT NULL DEFAULT 'https://mfdigital.com';
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "defaultCurrency" TEXT NOT NULL DEFAULT 'TRY';
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."Settings" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Notification_dedupeKey_key" ON "public"."Notification"("dedupeKey");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "public"."Notification"("createdAt");
CREATE INDEX IF NOT EXISTS "Notification_read_idx" ON "public"."Notification"("read");
CREATE INDEX IF NOT EXISTS "Notification_eventType_idx" ON "public"."Notification"("eventType");
CREATE INDEX IF NOT EXISTS "Notification_entityType_idx" ON "public"."Notification"("entityType");
