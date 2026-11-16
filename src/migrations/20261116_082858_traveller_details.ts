import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings" ADD COLUMN "arrival_flight" varchar;
  ALTER TABLE "bookings" ADD COLUMN "arrival_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "pickup" varchar;
  ALTER TABLE "bookings" ADD COLUMN "departure_flight" varchar;
  ALTER TABLE "bookings" ADD COLUMN "departure_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "dropoff" varchar;
  ALTER TABLE "bookings" ADD COLUMN "guest_notes" varchar;
  ALTER TABLE "bookings" ADD COLUMN "details_submitted_at" timestamp(3) with time zone;
  ALTER TABLE "bookings" ADD COLUMN "emails_details_reminder_sent_at" timestamp(3) with time zone;
  ALTER TABLE "travellers" ADD COLUMN "date_of_birth" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings" DROP COLUMN "arrival_flight";
  ALTER TABLE "bookings" DROP COLUMN "arrival_at";
  ALTER TABLE "bookings" DROP COLUMN "pickup";
  ALTER TABLE "bookings" DROP COLUMN "departure_flight";
  ALTER TABLE "bookings" DROP COLUMN "departure_at";
  ALTER TABLE "bookings" DROP COLUMN "dropoff";
  ALTER TABLE "bookings" DROP COLUMN "guest_notes";
  ALTER TABLE "bookings" DROP COLUMN "details_submitted_at";
  ALTER TABLE "bookings" DROP COLUMN "emails_details_reminder_sent_at";
  ALTER TABLE "travellers" DROP COLUMN "date_of_birth";`)
}
