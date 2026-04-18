-- Add optional contact/social fields for clients
ALTER TABLE "public"."Client" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "public"."Client" ADD COLUMN IF NOT EXISTS "website" TEXT;

-- Allow nullable email for optional client email support
ALTER TABLE "public"."Client" ALTER COLUMN "email" DROP NOT NULL;

