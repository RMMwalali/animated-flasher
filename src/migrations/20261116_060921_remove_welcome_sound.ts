import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP CONSTRAINT "home_welcome_ambient_audio_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_welcome_ambient_audio_id_media_id_fk";
  
  DROP INDEX "home_welcome_welcome_ambient_audio_idx";
  DROP INDEX "_home_v_version_welcome_version_welcome_ambient_audio_idx";
  ALTER TABLE "home" DROP COLUMN "welcome_sound_note";
  ALTER TABLE "home" DROP COLUMN "welcome_enter_label";
  ALTER TABLE "home" DROP COLUMN "welcome_quiet_label";
  ALTER TABLE "home" DROP COLUMN "welcome_ambient_audio_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_sound_note";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_enter_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_quiet_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_ambient_audio_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ADD COLUMN "welcome_sound_note" varchar DEFAULT 'Best with sound: the ocean and the bush';
  ALTER TABLE "home" ADD COLUMN "welcome_enter_label" varchar DEFAULT 'Karibu';
  ALTER TABLE "home" ADD COLUMN "welcome_quiet_label" varchar DEFAULT 'Enter without sound';
  ALTER TABLE "home" ADD COLUMN "welcome_ambient_audio_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_sound_note" varchar DEFAULT 'Best with sound: the ocean and the bush';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_enter_label" varchar DEFAULT 'Karibu';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_quiet_label" varchar DEFAULT 'Enter without sound';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_ambient_audio_id" integer;
  ALTER TABLE "home" ADD CONSTRAINT "home_welcome_ambient_audio_id_media_id_fk" FOREIGN KEY ("welcome_ambient_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_welcome_ambient_audio_id_media_id_fk" FOREIGN KEY ("version_welcome_ambient_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_welcome_welcome_ambient_audio_idx" ON "home" USING btree ("welcome_ambient_audio_id");
  CREATE INDEX "_home_v_version_welcome_version_welcome_ambient_audio_idx" ON "_home_v" USING btree ("version_welcome_ambient_audio_id");`)
}
