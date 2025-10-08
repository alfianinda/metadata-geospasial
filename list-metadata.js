const { PrismaClient } = require('@prisma/client');

async function listMetadata(options = {}) {
  const prisma = new PrismaClient();

  try {
    const {
      limit = 20,
      showPublished = true,
      showDraft = true,
      search = '',
      format = 'table'
    } = options;

    let whereClause = {};

    // Filter by status
    if (!showPublished || !showDraft) {
      whereClause.isPublished = showPublished && !showDraft ? true : false;
    }

    // Filter by search
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } }
      ];
    }

    const records = await prisma.metadata.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        isPublished: true,
        createdAt: true,
        dataFormat: true,
        spatialRepresentationType: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    console.log(`\n📊 Found ${records.length} metadata records:\n`);

    if (format === 'table') {
      console.log('┌─────────────────────────────────────┬─────────────────────────────────────┬──────────┬─────────────────┬─────────────┐');
      console.log('│ ID                                  │ Title                               │ Status   │ Created        │ Format      │');
      console.log('├─────────────────────────────────────┼─────────────────────────────────────┼──────────┼─────────────────┼─────────────┤');

      records.forEach(record => {
        const id = record.id.substring(0, 35) + '...';
        const title = record.title.substring(0, 35) + (record.title.length > 35 ? '...' : '');
        const status = record.isPublished ? 'Published' : 'Draft';
        const created = new Date(record.createdAt).toLocaleDateString('id-ID');
        const format = record.dataFormat ? record.dataFormat.split(' ')[0] : 'Unknown';

        console.log(`│ ${id.padEnd(35)} │ ${title.padEnd(35)} │ ${status.padEnd(8)} │ ${created.padEnd(15)} │ ${format.padEnd(11)} │`);
      });

      console.log('└─────────────────────────────────────┴─────────────────────────────────────┴──────────┴─────────────────┴─────────────┘');
    } else {
      records.forEach((record, index) => {
        console.log(`${index + 1}. ${record.title}`);
        console.log(`   ID: ${record.id}`);
        console.log(`   Status: ${record.isPublished ? 'Published' : 'Draft'}`);
        console.log(`   Created: ${new Date(record.createdAt).toLocaleString('id-ID')}`);
        console.log(`   Format: ${record.dataFormat || 'Unknown'}`);
        console.log(`   User: ${record.user?.name || record.user?.email || 'Unknown'}`);
        console.log('');
      });
    }

    console.log(`\n💡 To delete specific records, use:`);
    console.log(`node delete-metadata.js`);
    console.log(`Then edit the idsToDelete array with the IDs you want to delete.`);

  } catch (error) {
    console.error('❌ Error listing metadata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Command line usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--search=')) {
      options.search = arg.split('=')[1];
    } else if (arg === '--published-only') {
      options.showPublished = true;
      options.showDraft = false;
    } else if (arg === '--draft-only') {
      options.showPublished = false;
      options.showDraft = true;
    } else if (arg === '--json') {
      options.format = 'json';
    }
  });

  listMetadata(options);
}

module.exports = { listMetadata };