const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// PostgreSQL client
const postgresClient = new PrismaClient();

async function migrateData() {
  let sqliteDb;
  try {
    console.log('Starting data migration from SQLite to PostgreSQL...');

    // Open SQLite database
    sqliteDb = await open({
      filename: './prisma/dev.db',
      driver: sqlite3.Database
    });

    // Migrate Users
    console.log('Migrating users...');
    const users = await sqliteDb.all('SELECT * FROM users');

    for (const user of users) {
      console.log(`Migrating user: ${user.email}`);

      try {
        // Create user in PostgreSQL
        await postgresClient.user.create({
          data: {
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
        console.log(`✅ User ${user.email} migrated`);
      } catch (error) {
        console.log(`⚠️ User ${user.email} already exists or error:`, error.message);
      }
    }

    // Migrate Metadata
    console.log('Migrating metadata...');
    const metadataRecords = await sqliteDb.all('SELECT * FROM metadata');
    console.log(`Found ${metadataRecords.length} metadata records`);

    for (const metadata of metadataRecords) {
      console.log(`Migrating metadata: ${metadata.title}`);

      try {
        await postgresClient.metadata.create({
          data: {
            id: metadata.id,
            title: metadata.title,
            abstract: metadata.abstract,
            keywords: metadata.keywords,
            boundingBox: metadata.boundingBox,
            userId: metadata.userId,
            createdAt: new Date(metadata.createdAt),
            updatedAt: new Date(metadata.updatedAt),
            // Add other essential fields
            language: metadata.language,
            status: metadata.status,
            isPublished: Boolean(metadata.isPublished),
            reviewStatus: metadata.reviewStatus || 'draft',
            sniCompliant: Boolean(metadata.sniCompliant),
            bahasa: metadata.bahasa || 'id'
          }
        });
        console.log(`✅ Metadata "${metadata.title}" migrated`);
      } catch (error) {
        console.log(`⚠️ Metadata "${metadata.title}" error:`, error.message);
      }
    }

    // Migrate Files (only for metadata that exists)
    console.log('Migrating files...');
    const files = await sqliteDb.all('SELECT * FROM files');
    console.log(`Found ${files.length} file records`);

    // Get all migrated metadata IDs
    const migratedMetadataIds = await postgresClient.metadata.findMany({
      select: { id: true }
    });
    const metadataIdSet = new Set(migratedMetadataIds.map(m => m.id));

    for (const file of files) {
      if (metadataIdSet.has(file.metadataId)) {
        try {
          await postgresClient.file.create({
            data: {
              id: file.id,
              filename: file.filename,
              originalName: file.originalName,
              mimetype: file.mimetype,
              size: Number(file.size),
              path: file.path,
              url: file.url,
              metadataId: file.metadataId,
              createdAt: new Date(file.createdAt)
            }
          });
          console.log(`✅ File "${file.filename}" migrated`);
        } catch (error) {
          console.log(`⚠️ File "${file.filename}" error:`, error.message);
        }
      } else {
        console.log(`⚠️ Skipping file "${file.filename}" - metadata ${file.metadataId} not found`);
      }
    }

    console.log('✅ Data migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (sqliteDb) {
      await sqliteDb.close();
    }
    await postgresClient.$disconnect();
  }
}

migrateData();