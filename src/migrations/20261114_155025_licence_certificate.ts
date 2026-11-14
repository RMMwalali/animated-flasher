import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_trust" ADD COLUMN "certificate_id" integer;
  ALTER TABLE "site_settings_trust" ADD CONSTRAINT "site_settings_trust_certificate_id_media_id_fk" FOREIGN KEY ("certificate_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_trust_certificate_idx" ON "site_settings_trust" USING btree ("certificate_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_trust" DROP CONSTRAINT "site_settings_trust_certificate_id_media_id_fk";
  
  DROP INDEX "site_settings_trust_certificate_idx";
  ALTER TABLE "site_settings_trust" DROP COLUMN "certificate_id";`)
}
