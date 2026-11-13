import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_stage_scene" AS ENUM('coast', 'safari', 'dawn', 'night');
  CREATE TYPE "public"."enum__home_v_version_stage_scene" AS ENUM('coast', 'safari', 'dawn', 'night');
  CREATE TABLE "home_stage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" varchar,
  	"emphasis" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"scene" "enum_home_stage_scene" DEFAULT 'safari'
  );
  
  CREATE TABLE "_home_v_version_stage" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" varchar,
  	"emphasis" varchar,
  	"image_id" integer,
  	"video_id" integer,
  	"scene" "enum__home_v_version_stage_scene" DEFAULT 'safari',
  	"_uuid" varchar
  );
  
  ALTER TABLE "home" ADD COLUMN "welcome_sound_note" varchar DEFAULT 'Best with sound: the ocean and the bush';
  ALTER TABLE "home" ADD COLUMN "welcome_enter_label" varchar DEFAULT 'Karibu';
  ALTER TABLE "home" ADD COLUMN "welcome_quiet_label" varchar DEFAULT 'Enter without sound';
  ALTER TABLE "home" ADD COLUMN "welcome_ambient_audio_id" integer;
  ALTER TABLE "home" ADD COLUMN "slide_seconds" numeric DEFAULT 6;
  ALTER TABLE "home" ADD COLUMN "film_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_sound_note" varchar DEFAULT 'Best with sound: the ocean and the bush';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_enter_label" varchar DEFAULT 'Karibu';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_quiet_label" varchar DEFAULT 'Enter without sound';
  ALTER TABLE "_home_v" ADD COLUMN "version_welcome_ambient_audio_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_slide_seconds" numeric DEFAULT 6;
  ALTER TABLE "_home_v" ADD COLUMN "version_film_id" integer;
  ALTER TABLE "home_stage" ADD CONSTRAINT "home_stage_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_stage" ADD CONSTRAINT "home_stage_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_stage" ADD CONSTRAINT "home_stage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_version_stage" ADD CONSTRAINT "_home_v_version_stage_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_stage" ADD CONSTRAINT "_home_v_version_stage_video_id_media_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_version_stage" ADD CONSTRAINT "_home_v_version_stage_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_stage_order_idx" ON "home_stage" USING btree ("_order");
  CREATE INDEX "home_stage_parent_id_idx" ON "home_stage" USING btree ("_parent_id");
  CREATE INDEX "home_stage_image_idx" ON "home_stage" USING btree ("image_id");
  CREATE INDEX "home_stage_video_idx" ON "home_stage" USING btree ("video_id");
  CREATE INDEX "_home_v_version_stage_order_idx" ON "_home_v_version_stage" USING btree ("_order");
  CREATE INDEX "_home_v_version_stage_parent_id_idx" ON "_home_v_version_stage" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_stage_image_idx" ON "_home_v_version_stage" USING btree ("image_id");
  CREATE INDEX "_home_v_version_stage_video_idx" ON "_home_v_version_stage" USING btree ("video_id");
  ALTER TABLE "home" ADD CONSTRAINT "home_welcome_ambient_audio_id_media_id_fk" FOREIGN KEY ("welcome_ambient_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_film_id_media_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_welcome_ambient_audio_id_media_id_fk" FOREIGN KEY ("version_welcome_ambient_audio_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_film_id_media_id_fk" FOREIGN KEY ("version_film_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_welcome_welcome_ambient_audio_idx" ON "home" USING btree ("welcome_ambient_audio_id");
  CREATE INDEX "home_film_idx" ON "home" USING btree ("film_id");
  CREATE INDEX "_home_v_version_welcome_version_welcome_ambient_audio_idx" ON "_home_v" USING btree ("version_welcome_ambient_audio_id");
  CREATE INDEX "_home_v_version_version_film_idx" ON "_home_v" USING btree ("version_film_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_stage" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_version_stage" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_stage" CASCADE;
  DROP TABLE "_home_v_version_stage" CASCADE;
  ALTER TABLE "home" DROP CONSTRAINT "home_welcome_ambient_audio_id_media_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_film_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_welcome_ambient_audio_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_film_id_media_id_fk";
  
  DROP INDEX "home_welcome_welcome_ambient_audio_idx";
  DROP INDEX "home_film_idx";
  DROP INDEX "_home_v_version_welcome_version_welcome_ambient_audio_idx";
  DROP INDEX "_home_v_version_version_film_idx";
  ALTER TABLE "home" DROP COLUMN "welcome_sound_note";
  ALTER TABLE "home" DROP COLUMN "welcome_enter_label";
  ALTER TABLE "home" DROP COLUMN "welcome_quiet_label";
  ALTER TABLE "home" DROP COLUMN "welcome_ambient_audio_id";
  ALTER TABLE "home" DROP COLUMN "slide_seconds";
  ALTER TABLE "home" DROP COLUMN "film_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_sound_note";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_enter_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_quiet_label";
  ALTER TABLE "_home_v" DROP COLUMN "version_welcome_ambient_audio_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_slide_seconds";
  ALTER TABLE "_home_v" DROP COLUMN "version_film_id";
  DROP TYPE "public"."enum_home_stage_scene";
  DROP TYPE "public"."enum__home_v_version_stage_scene";`)
}
