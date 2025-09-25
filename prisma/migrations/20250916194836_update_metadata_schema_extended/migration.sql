-- AlterTable
ALTER TABLE "metadata" ADD COLUMN "characterSet" TEXT;
ALTER TABLE "metadata" ADD COLUMN "conformity" JSONB;
ALTER TABLE "metadata" ADD COLUMN "hierarchyLevel" TEXT;
ALTER TABLE "metadata" ADD COLUMN "hierarchyLevelName" TEXT;
ALTER TABLE "metadata" ADD COLUMN "parentIdentifier" TEXT;
ALTER TABLE "metadata" ADD COLUMN "scope" TEXT;
ALTER TABLE "metadata" ADD COLUMN "supplementalInfo" TEXT;
