import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "chat_status" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"team_seen_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "conversations" ADD COLUMN "visitor_seen_at" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "live_chat" boolean DEFAULT true;
  ALTER TABLE "site_settings" ADD COLUMN "chat_greeting" varchar DEFAULT 'Jambo! Ask us anything about safaris, the coast or your dates.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "chat_status" CASCADE;
  ALTER TABLE "conversations" DROP COLUMN "visitor_seen_at";
  ALTER TABLE "site_settings" DROP COLUMN "live_chat";
  ALTER TABLE "site_settings" DROP COLUMN "chat_greeting";`)
}
