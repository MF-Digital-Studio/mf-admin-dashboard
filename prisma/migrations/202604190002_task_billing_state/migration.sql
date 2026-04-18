DO $$ BEGIN
    CREATE TYPE "public"."TaskBillingState" AS ENUM ('PENDING', 'READY_TO_BILL', 'BILLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "public"."Task"
ADD COLUMN IF NOT EXISTS "billingState" "public"."TaskBillingState" NOT NULL DEFAULT 'PENDING';

