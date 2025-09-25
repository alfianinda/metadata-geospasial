-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "metadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "abstract" TEXT,
    "purpose" TEXT,
    "status" TEXT,
    "updateFrequency" TEXT,
    "keywords" TEXT,
    "boundingBox" JSONB,
    "spatialResolution" TEXT,
    "coordinateSystem" TEXT,
    "temporalStart" DATETIME,
    "temporalEnd" DATETIME,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactOrganization" TEXT,
    "contactRole" TEXT,
    "distributionFormat" TEXT,
    "onlineResource" TEXT,
    "lineage" TEXT,
    "accuracy" TEXT,
    "sniCompliant" BOOLEAN NOT NULL DEFAULT false,
    "sniVersion" TEXT,
    "originalFileName" TEXT,
    "fileSize" INTEGER,
    "featureCount" INTEGER,
    "xmlContent" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "metadata_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT,
    "metadataId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "files_metadataId_fkey" FOREIGN KEY ("metadataId") REFERENCES "metadata" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
