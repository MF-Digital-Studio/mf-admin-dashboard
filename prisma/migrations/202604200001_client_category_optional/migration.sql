-- Add optional business category field for clients
ALTER TABLE "public"."Client"
ADD COLUMN IF NOT EXISTS "category" TEXT;
