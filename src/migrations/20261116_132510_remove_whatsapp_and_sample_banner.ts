import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "whatsapp_button";
  ALTER TABLE "site_settings" DROP COLUMN "whatsapp_message";
  ALTER TABLE "site_settings" DROP COLUMN "show_sample_banner";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "whatsapp_button" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "whatsapp_message" varchar DEFAULT 'Jambo! I would like to ask about a trip.';
  ALTER TABLE "site_settings" ADD COLUMN "show_sample_banner" boolean DEFAULT true;`)
}
