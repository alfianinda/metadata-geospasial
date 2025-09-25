const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateFileSize() {
  try {
    const result = await prisma.metadata.updateMany({
      where: {
        fileSize: 10737418240n // Use BigInt literal
      },
      data: {
        fileSize: null
      }
    })
    console.log('Updated records:', result.count)
  } catch (error) {
    console.error('Error updating fileSize:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateFileSize()