import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Test database connection and get user info
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })

      const metadataCount = await prisma.metadata.count()

      res.status(200).json({
        message: 'Database test successful',
        users: users,
        metadataCount: metadataCount,
        timestamp: new Date().toISOString()
      })
    } else if (req.method === 'POST') {
      // Test metadata creation without auth
      const metadata = await prisma.metadata.create({
        data: {
          title: 'Test Upload - No Auth',
          abstract: 'Test upload without authentication',
          geographicExtent: '95.0,141.0,-11.0,6.0',
          contactName: 'Test User',
          contactEmail: 'test@example.com',
          userId: 'cmg01iuay0000txokfdmqb6p9', // admin user ID
          sniCompliant: false
        }
      })

      res.status(201).json({
        message: 'Test upload successful',
        metadataId: metadata.id,
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Test error:', error)
    res.status(500).json({
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export default handler