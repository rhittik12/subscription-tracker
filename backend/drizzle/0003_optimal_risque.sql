ALTER TABLE "notification_logs" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DELETE FROM "notification_logs" WHERE "type" = 'whatsapp';--> statement-breakpoint
DROP TYPE "public"."notification_type";--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('email');--> statement-breakpoint
ALTER TABLE "notification_logs" ALTER COLUMN "type" SET DATA TYPE "public"."notification_type" USING "type"::"public"."notification_type";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "whatsapp_number";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "whatsapp_notifications";
