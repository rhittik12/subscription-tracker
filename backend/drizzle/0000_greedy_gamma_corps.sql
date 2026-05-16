CREATE TYPE "public"."billing_cycle" AS ENUM('weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"icon" varchar(50) DEFAULT 'folder' NOT NULL,
	"color" varchar(20) DEFAULT '#6366f1' NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"status" "notification_status" NOT NULL,
	"renewal_date" date NOT NULL,
	"message" text,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"default_currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"logo_url" varchar(500),
	"website_url" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"billing_cycle" "billing_cycle" NOT NULL,
	"next_renewal_date" date NOT NULL,
	"start_date" date,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"logo_url" varchar(500),
	"template_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"preferred_currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"email" varchar(255),
	"whatsapp_number" varchar(20),
	"email_notifications" boolean DEFAULT true NOT NULL,
	"whatsapp_notifications" boolean DEFAULT true NOT NULL,
	"reminder_days_before" integer DEFAULT 7 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_templates" ADD CONSTRAINT "subscription_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_template_id_subscription_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."subscription_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_name_lower_unique" ON "categories" USING btree (LOWER("name"));--> statement-breakpoint
CREATE INDEX "idx_notification_logs_subscription" ON "notification_logs" USING btree ("subscription_id","renewal_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_status" ON "subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_next_renewal" ON "subscriptions" USING btree ("next_renewal_date");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_category" ON "subscriptions" USING btree ("category_id");