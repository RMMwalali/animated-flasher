import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quotes" ADD COLUMN "accepted_name" varchar;
  ALTER TABLE "quotes" ADD COLUMN "declined_at" timestamp(3) with time zone;
  ALTER TABLE "quotes" ADD COLUMN "decline_reason" varchar;
  ALTER TABLE "bookings" ADD COLUMN "portal_token" varchar;
  ALTER TABLE "bookings" ADD COLUMN "emails_confirmation_sent_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "emails_balance_reminder_sent_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "emails_eta_reminder_sent_at" timestamp(3) with time zone;
  CREATE INDEX "bookings_portal_token_idx" ON "bookings" USING btree ("portal_token");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "bookings_portal_token_idx";
  ALTER TABLE "quotes" DROP COLUMN "accepted_name";
  ALTER TABLE "quotes" DROP COLUMN "declined_at";
  ALTER TABLE "quotes" DROP COLUMN "decline_reason";
  ALTER TABLE "bookings" DROP COLUMN "portal_token";
  ALTER TABLE "bookings" DROP COLUMN "emails_confirmation_sent_at";
  ALTER TABLE "bookings" DROP COLUMN "emails_balance_reminder_sent_at";
  ALTER TABLE "bookings" DROP COLUMN "emails_eta_reminder_sent_at";`)
}
