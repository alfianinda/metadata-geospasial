const { PrismaClient } = require('@prisma/client');

async function deleteMetadataByIds(ids) {
  const prisma = new PrismaClient();

  try {
    console.log(`Deleting metadata records: ${ids.join(', ')}`);

    // First delete associated files
    const deletedFiles = await prisma.file.deleteMany({
      where: {
        metadataId: {
          in: ids
        }
      }
    });

    console.log(`Deleted ${deletedFiles.count} file records`);

    // Then delete metadata records
    const deletedMetadata = await prisma.metadata.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    console.log(`Deleted ${deletedMetadata.count} metadata records`);
    console.log('✅ Deletion completed successfully!');

  } catch (error) {
    console.error('❌ Error deleting metadata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage examples:
// Delete specific IDs
// deleteMetadataByIds(['cmg01iuay0000txokfdmqb6p9', 'another-id-here']);

// Delete by title pattern (uncomment to use)
// async function deleteByTitlePattern(pattern) {
//   const prisma = new PrismaClient();
//   try {
//     const records = await prisma.metadata.findMany({
//       where: { title: { contains: pattern } },
//       select: { id: true, title: true }
//     });
//
//     console.log('Found records:', records);
//     const ids = records.map(r => r.id);
//     await deleteMetadataByIds(ids);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// Export for use in other files
module.exports = { deleteMetadataByIds };

// If running directly with node
if (require.main === module) {
  // Replace with actual IDs you want to delete
  const idsToDelete = [
    // 'id1',
    // 'id2',
    // Add your metadata IDs here
  ];

  if (idsToDelete.length > 0) {
    deleteMetadataByIds(idsToDelete);
  } else {
    console.log('⚠️  No IDs specified. Edit the idsToDelete array with the metadata IDs you want to delete.');
    console.log('💡 To find IDs, run: node -e "const {PrismaClient}=require(\'@prisma/client\');const p=new PrismaClient();p.metadata.findMany({select:{id:true,title:true}}).then(r=>{console.log(r);p.\$disconnect()})"');
  }
}