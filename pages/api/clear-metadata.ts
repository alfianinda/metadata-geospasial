import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Clearing all metadata records from database...')

    // TEMPORARILY DISABLED AUTH CHECK FOR TESTING
    // TODO: Re-enable after testing
    /*
    // Check if user is authenticated and is admin
    const userId = (req as any).user?.userId
    const userRole = (req as any).user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    */

    // Delete all files first (due to foreign key constraints)
    const deletedFiles = await prisma.file.deleteMany()
    console.log(`Deleted ${deletedFiles.count} file records`)

    // Delete all metadata records
    const deletedMetadata = await prisma.metadata.deleteMany()
    console.log(`Deleted ${deletedMetadata.count} metadata records`)

    res.status(200).json({
      message: 'All metadata data cleared successfully!',
      deletedFiles: deletedFiles.count,
      deletedMetadata: deletedMetadata.count
    })
  } catch (error) {
    console.error('Error clearing metadata:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    res.status(500).json({
      message: 'Failed to clear metadata',
      error: errorMessage
    })
  }
}

export default handler