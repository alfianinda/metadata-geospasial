import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { filename } = req.query

  if (typeof filename !== 'string') {
    return res.status(400).json({ message: 'Invalid filename' })
  }

  try {
    // Check if user is authenticated
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        userId = decoded.userId
      } catch (error) {
        // Invalid token, treat as unauthenticated
      }
    }

    // Find the file in the database
    const file = await prisma.file.findFirst({
      where: { filename },
      include: {
        metadata: {
          select: {
            id: true,
            isPublished: true,
            userId: true
          }
        }
      }
    })

    if (!file) {
      return res.status(404).json({ message: 'File tidak ditemukan' })
    }

    // Check if user has permission to access this file
    // Allow access if file is published OR if user is the owner
    if (!file.metadata.isPublished && (!userId || file.metadata.userId !== userId)) {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File tidak tersedia di server' })
    }

    // Set appropriate headers for file download
    const fileExtension = path.extname(file.originalName).toLowerCase()
    let contentType = 'application/octet-stream'

    // Set content type based on file extension
    switch (fileExtension) {
      case '.zip':
        contentType = 'application/zip'
        break
      case '.rar':
        contentType = 'application/x-rar-compressed'
        break
      case '.shp':
        contentType = 'application/octet-stream'
        break
      case '.shx':
        contentType = 'application/octet-stream'
        break
      case '.dbf':
        contentType = 'application/octet-stream'
        break
      case '.prj':
        contentType = 'application/octet-stream'
        break
      case '.cpg':
        contentType = 'application/octet-stream'
        break
      case '.geojson':
        contentType = 'application/geo+json'
        break
      default:
        contentType = 'application/octet-stream'
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`)
    res.setHeader('Content-Length', file.size)

    // Stream the file to the response
    const fileStream = fs.createReadStream(file.path)
    fileStream.pipe(res)

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error)
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error downloading file' })
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ message: 'Failed to download file' })
  }
}