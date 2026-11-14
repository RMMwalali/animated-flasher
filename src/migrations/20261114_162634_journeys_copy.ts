import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ADD COLUMN "journeys_eyebrow" varchar;
  ALTER TABLE "home" ADD COLUMN "journeys_statement" varchar;
  ALTER TABLE "home" ADD COLUMN "journeys_emphasis" varchar;
  ALTER TABLE "home" ADD COLUMN "journeys_intro" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_journeys_eyebrow" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_journeys_statement" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_journeys_emphasis" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_journeys_intro" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP COLUMN "journeys_eyebrow";
  ALTER TABLE "home" DROP COLUMN "journeys_statement";
  ALTER TABLE "home" DROP COLUMN "journeys_emphasis";
  ALTER TABLE "home" DROP COLUMN "journeys_intro";
  ALTER TABLE "_home_v" DROP COLUMN "version_journeys_eyebrow";
  ALTER TABLE "_home_v" DROP COLUMN "version_journeys_statement";
  ALTER TABLE "_home_v" DROP COLUMN "version_journeys_emphasis";
  ALTER TABLE "_home_v" DROP COLUMN "version_journeys_intro";`)
}
