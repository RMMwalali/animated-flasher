import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_social" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_site_settings_social_platform";
  CREATE TYPE "public"."enum_site_settings_social_platform" AS ENUM('google', 'tripadvisor', 'safaribookings', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'x', 'other');
  ALTER TABLE "site_settings_social" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_site_settings_social_platform" USING "platform"::"public"."enum_site_settings_social_platform";
  ALTER TABLE "site_settings" ALTER COLUMN "business_name" SET DEFAULT 'Ngina Trails and Safaris';
  ALTER TABLE "site_settings" ADD COLUMN "address_google_maps_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "address_show_map" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "search_site_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_alternate_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_default_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_site_icon_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "search_share_image_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "search_google_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_bing_verification" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "search_allow_ai_crawlers" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "search_hide_from_search" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_search_site_icon_id_media_id_fk" FOREIGN KEY ("search_site_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_search_share_image_id_media_id_fk" FOREIGN KEY ("search_share_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_search_search_site_icon_idx" ON "site_settings" USING btree ("search_site_icon_id");
  CREATE INDEX "site_settings_search_search_share_image_idx" ON "site_settings" USING btree ("search_share_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_search_site_icon_id_media_id_fk";
  
  ALTER TABLE "site_settings" DROP CONSTRAINT "site_settings_search_share_image_id_media_id_fk";
  
  ALTER TABLE "site_settings_social" ALTER COLUMN "platform" SET DATA TYPE text;
  DROP TYPE "public"."enum_site_settings_social_platform";
  CREATE TYPE "public"."enum_site_settings_social_platform" AS ENUM('instagram', 'facebook', 'tiktok', 'youtube', 'tripadvisor', 'google');
  ALTER TABLE "site_settings_social" ALTER COLUMN "platform" SET DATA TYPE "public"."enum_site_settings_social_platform" USING "platform"::"public"."enum_site_settings_social_platform";
  DROP INDEX "site_settings_search_search_site_icon_idx";
  DROP INDEX "site_settings_search_search_share_image_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "business_name" SET DEFAULT 'Ngina Trails & Safaris';
  ALTER TABLE "site_settings" DROP COLUMN "address_google_maps_url";
  ALTER TABLE "site_settings" DROP COLUMN "address_show_map";
  ALTER TABLE "site_settings" DROP COLUMN "search_site_name";
  ALTER TABLE "site_settings" DROP COLUMN "search_alternate_name";
  ALTER TABLE "site_settings" DROP COLUMN "search_default_description";
  ALTER TABLE "site_settings" DROP COLUMN "search_site_icon_id";
  ALTER TABLE "site_settings" DROP COLUMN "search_share_image_id";
  ALTER TABLE "site_settings" DROP COLUMN "search_google_verification";
  ALTER TABLE "site_settings" DROP COLUMN "search_bing_verification";
  ALTER TABLE "site_settings" DROP COLUMN "search_allow_ai_crawlers";
  ALTER TABLE "site_settings" DROP COLUMN "search_hide_from_search";`)
}
