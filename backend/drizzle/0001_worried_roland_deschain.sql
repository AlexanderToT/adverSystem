CREATE TABLE "ad_statistics" (
	"id" serial PRIMARY KEY NOT NULL,
	"advertisement_id" uuid NOT NULL,
	"application_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_time" timestamp with time zone DEFAULT now() NOT NULL,
	"country_code" varchar(10),
	"user_agent" text,
	"ip_address" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"ad_type" varchar(50) NOT NULL,
	"target_url" text,
	"material_config" jsonb,
	"display_config" jsonb,
	"country_codes" text,
	"is_displayed" boolean DEFAULT true NOT NULL,
	"total_clicks" bigint DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ad_statistics" ADD CONSTRAINT "ad_statistics_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE no action ON UPDATE no action;