import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_bank_accounts_currency" AS ENUM('USD', 'KES', 'EUR', 'GBP');
  CREATE TYPE "public"."enum_integrations_realtime_provider" AS ENUM('none', 'pusher', 'ably');
  CREATE TABLE "site_settings_bank_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"currency" "enum_site_settings_bank_accounts_currency" DEFAULT 'USD' NOT NULL,
  	"bank_name" varchar NOT NULL,
  	"branch" varchar,
  	"account_name" varchar NOT NULL,
  	"account_number" varchar NOT NULL,
  	"swift" varchar,
  	"bank_code" varchar
  );
  
  CREATE TABLE "home_tiktok_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "_home_v_version_tiktok_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "integrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"paystack_secret_key" varchar,
  	"paystack_public_key" varchar,
  	"postmark_server_token" varchar,
  	"postmark_from_email" varchar,
  	"postmark_message_stream" varchar,
  	"postmark_inbound_address" varchar,
  	"postmark_inbound_user" varchar,
  	"postmark_inbound_password" varchar,
  	"realtime_provider" "enum_integrations_realtime_provider" DEFAULT 'none',
  	"realtime_pusher_app_id" varchar,
  	"realtime_pusher_key" varchar,
  	"realtime_pusher_cluster" varchar,
  	"realtime_pusher_secret" varchar,
  	"realtime_ably_api_key" varchar,
  	"analytics_vercel" boolean DEFAULT true,
  	"analytics_ga4_id" varchar,
  	"analytics_clarity_id" varchar,
  	"analytics_meta_pixel_id" varchar,
  	"analytics_tiktok_pixel_id" varchar,
  	"google_places_api_key" varchar,
  	"google_place_id" varchar,
  	"turnstile_site_key" varchar,
  	"turnstile_secret_key" varchar,
  	"index_now_key" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_button" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_message" varchar DEFAULT 'Jambo! I would like to ask about a trip.';
  ALTER TABLE "site_settings" ADD COLUMN "mpesa_paybill" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "mpesa_till" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "payment_note" varchar;
  ALTER TABLE "home" ADD COLUMN "tiktok_title" varchar DEFAULT 'Fresh from the field';
  ALTER TABLE "_home_v" ADD COLUMN "version_tiktok_title" varchar DEFAULT 'Fresh from the field';
  ALTER TABLE "site_settings_bank_accounts" ADD CONSTRAINT "site_settings_bank_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_tiktok_videos" ADD CONSTRAINT "home_tiktok_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_tiktok_videos" ADD CONSTRAINT "_home_v_version_tiktok_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_bank_accounts_order_idx" ON "site_settings_bank_accounts" USING btree ("_order");
  CREATE INDEX "site_settings_bank_accounts_parent_id_idx" ON "site_settings_bank_accounts" USING btree ("_parent_id");
  CREATE INDEX "home_tiktok_videos_order_idx" ON "home_tiktok_videos" USING btree ("_order");
  CREATE INDEX "home_tiktok_videos_parent_id_idx" ON "home_tiktok_videos" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_tiktok_videos_order_idx" ON "_home_v_version_tiktok_videos" USING btree ("_order");
  CREATE INDEX "_home_v_version_tiktok_videos_parent_id_idx" ON "_home_v_version_tiktok_videos" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_bank_accounts" CASCADE;
  DROP TABLE "home_tiktok_videos" CASCADE;
  DROP TABLE "_home_v_version_tiktok_videos" CASCADE;
  DROP TABLE "integrations" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_button";
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_message";
  ALTER TABLE "site_settings" DROP COLUMN "mpesa_paybill";
  ALTER TABLE "site_settings" DROP COLUMN "mpesa_till";
  ALTER TABLE "site_settings" DROP COLUMN "payment_note";
  ALTER TABLE "home" DROP COLUMN "tiktok_title";
  ALTER TABLE "_home_v" DROP COLUMN "version_tiktok_title";
  DROP TYPE "public"."enum_site_settings_bank_accounts_currency";
  DROP TYPE "public"."enum_integrations_realtime_provider";`)
}
