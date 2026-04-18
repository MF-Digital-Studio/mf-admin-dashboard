-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "public"."SubscriptionBillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddColumn
ALTER TABLE "public"."Client" ADD COLUMN IF NOT EXISTS "instagram" TEXT;

ALTER TABLE "public"."Proposal" ADD COLUMN IF NOT EXISTS "clientCompanyName" TEXT;
ALTER TABLE "public"."Proposal" ADD COLUMN IF NOT EXISTS "clientContactPerson" TEXT;
ALTER TABLE "public"."Proposal" ADD COLUMN IF NOT EXISTS "clientEmail" TEXT;
ALTER TABLE "public"."Proposal" ADD COLUMN IF NOT EXISTS "clientPhone" TEXT;
ALTER TABLE "public"."Proposal" ADD COLUMN IF NOT EXISTS "clientInstagram" TEXT;

-- Make relation optional for proposal -> client
ALTER TABLE "public"."Proposal" ALTER COLUMN "clientId" DROP NOT NULL;

DO $$ BEGIN
    ALTER TABLE "public"."Proposal" DROP CONSTRAINT IF EXISTS "Proposal_clientId_fkey";
    ALTER TABLE "public"."Proposal"
      ADD CONSTRAINT "Proposal_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN undefined_table THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."CompanySubscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "billingCycle" "public"."SubscriptionBillingCycle" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "renewalDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanySubscription_renewalDate_idx" ON "public"."CompanySubscription"("renewalDate");
CREATE INDEX IF NOT EXISTS "CompanySubscription_isActive_idx" ON "public"."CompanySubscription"("isActive");
CREATE INDEX IF NOT EXISTS "CompanySubscription_billingCycle_idx" ON "public"."CompanySubscription"("billingCycle");
