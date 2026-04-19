-- Add optional location field for clients
ALTER TABLE "public"."Client" ADD COLUMN IF NOT EXISTS "location" TEXT;
