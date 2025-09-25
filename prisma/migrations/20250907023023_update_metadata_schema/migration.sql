-- AlterTable
ALTER TABLE "metadata" ADD COLUMN "accessConstraints" TEXT;
ALTER TABLE "metadata" ADD COLUMN "approvalDate" DATETIME;
ALTER TABLE "metadata" ADD COLUMN "attributeInfo" JSONB;
ALTER TABLE "metadata" ADD COLUMN "bahasa" TEXT DEFAULT 'id';
ALTER TABLE "metadata" ADD COLUMN "ckanId" TEXT;
ALTER TABLE "metadata" ADD COLUMN "ckanUrl" TEXT;
ALTER TABLE "metadata" ADD COLUMN "completeness" TEXT;
ALTER TABLE "metadata" ADD COLUMN "consistency" TEXT;
ALTER TABLE "metadata" ADD COLUMN "contactAddress" TEXT;
ALTER TABLE "metadata" ADD COLUMN "contactPhone" TEXT;
ALTER TABLE "metadata" ADD COLUMN "dataFormat" TEXT;
ALTER TABLE "metadata" ADD COLUMN "dateStamp" DATETIME;
ALTER TABLE "metadata" ADD COLUMN "dateType" TEXT;
ALTER TABLE "metadata" ADD COLUMN "featureTypes" TEXT;
ALTER TABLE "metadata" ADD COLUMN "geographicExtent" TEXT;
ALTER TABLE "metadata" ADD COLUMN "geometryType" TEXT;
ALTER TABLE "metadata" ADD COLUMN "metadataContactEmail" TEXT;
ALTER TABLE "metadata" ADD COLUMN "metadataContactName" TEXT;
ALTER TABLE "metadata" ADD COLUMN "metadataContactOrganization" TEXT;
ALTER TABLE "metadata" ADD COLUMN "otherConstraints" TEXT;
ALTER TABLE "metadata" ADD COLUMN "positionalAccuracy" TEXT;
ALTER TABLE "metadata" ADD COLUMN "processingHistory" TEXT;
ALTER TABLE "metadata" ADD COLUMN "processingLevel" TEXT;
ALTER TABLE "metadata" ADD COLUMN "projection" TEXT;
ALTER TABLE "metadata" ADD COLUMN "referenceSystem" TEXT;
ALTER TABLE "metadata" ADD COLUMN "reviewStatus" TEXT DEFAULT 'draft';
ALTER TABLE "metadata" ADD COLUMN "sniStandard" TEXT;
ALTER TABLE "metadata" ADD COLUMN "themeKeywords" TEXT;
ALTER TABLE "metadata" ADD COLUMN "topicCategory" TEXT;
ALTER TABLE "metadata" ADD COLUMN "transferOptions" JSONB;
ALTER TABLE "metadata" ADD COLUMN "useConstraints" TEXT;
ALTER TABLE "metadata" ADD COLUMN "verticalExtent" JSONB;
ALTER TABLE "metadata" ADD COLUMN "xmlSchema" TEXT;

-- CreateTable
CREATE TABLE "controlled_vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ID',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "metadata_vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metadataId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    CONSTRAINT "metadata_vocabulary_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "metadata_vocabulary_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "controlled_vocabulary" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "controlled_vocabulary_category_code_language_key" ON "controlled_vocabulary"("category", "code", "language");

-- CreateIndex
CREATE UNIQUE INDEX "metadata_vocabulary_metadataId_vocabularyId_key" ON "metadata_vocabulary"("metadataId", "vocabularyId");
