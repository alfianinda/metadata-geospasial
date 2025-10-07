const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearMetadata() {
  try {
    console.log('Clearing all metadata records...')

    // Delete all files first (due to foreign key constraints)
    const deletedFiles = await prisma.file.deleteMany()
    console.log(`Deleted ${deletedFiles.count} file records`)

    // Delete all metadata records
    const deletedMetadata = await prisma.metadata.deleteMany()
    console.log(`Deleted ${deletedMetadata.count} metadata records`)

    console.log('✅ All metadata data cleared successfully!')
  } catch (error) {
    console.error('Error clearing metadata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearMetadata()