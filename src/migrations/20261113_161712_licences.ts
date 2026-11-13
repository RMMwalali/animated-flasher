import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_trust_kind" AS ENUM('licence', 'membership', 'certification');
  ALTER TABLE "site_settings_trust" ADD COLUMN "kind" "enum_site_settings_trust_kind" DEFAULT 'licence';
  ALTER TABLE "site_settings_trust" ADD COLUMN "issuer" varchar;
  ALTER TABLE "site_settings_trust" ADD COLUMN "valid_until" timestamp(3) with time zone;
  ALTER TABLE "site_settings_trust" ADD COLUMN "description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_trust" DROP COLUMN "kind";
  ALTER TABLE "site_settings_trust" DROP COLUMN "issuer";
  ALTER TABLE "site_settings_trust" DROP COLUMN "valid_until";
  ALTER TABLE "site_settings_trust" DROP COLUMN "description";
  DROP TYPE "public"."enum_site_settings_trust_kind";`)
}
