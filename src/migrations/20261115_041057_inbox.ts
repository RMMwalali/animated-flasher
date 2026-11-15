import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_conversations_channel" ADD VALUE 'whatsapp';
  ALTER TYPE "public"."enum_conversations_channel" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_messages_channel" ADD VALUE 'whatsapp';
  ALTER TYPE "public"."enum_messages_channel" ADD VALUE 'phone';
  ALTER TYPE "public"."enum_activities_type" ADD VALUE 'whatsapp' BEFORE 'status';
  ALTER TABLE "messages" ADD COLUMN "automated" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "notify_new_messages" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "conversations" ALTER COLUMN "channel" SET DATA TYPE text;
  ALTER TABLE "conversations" ALTER COLUMN "channel" SET DEFAULT 'email'::text;
  DROP TYPE "public"."enum_conversations_channel";
  CREATE TYPE "public"."enum_conversations_channel" AS ENUM('email', 'chat');
  ALTER TABLE "conversations" ALTER COLUMN "channel" SET DEFAULT 'email'::"public"."enum_conversations_channel";
  ALTER TABLE "conversations" ALTER COLUMN "channel" SET DATA TYPE "public"."enum_conversations_channel" USING "channel"::"public"."enum_conversations_channel";
  ALTER TABLE "messages" ALTER COLUMN "channel" SET DATA TYPE text;
  DROP TYPE "public"."enum_messages_channel";
  CREATE TYPE "public"."enum_messages_channel" AS ENUM('email', 'chat');
  ALTER TABLE "messages" ALTER COLUMN "channel" SET DATA TYPE "public"."enum_messages_channel" USING "channel"::"public"."enum_messages_channel";
  ALTER TABLE "activities" ALTER COLUMN "type" SET DATA TYPE text;
  DROP TYPE "public"."enum_activities_type";
  CREATE TYPE "public"."enum_activities_type" AS ENUM('note', 'email_in', 'email_out', 'chat', 'status', 'lead', 'quote', 'booking', 'payment', 'review', 'task');
  ALTER TABLE "activities" ALTER COLUMN "type" SET DATA TYPE "public"."enum_activities_type" USING "type"::"public"."enum_activities_type";
  ALTER TABLE "messages" DROP COLUMN "automated";
  ALTER TABLE "users" DROP COLUMN "notify_new_messages";`)
}
