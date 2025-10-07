import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check if user is authenticated
      const token = getTokenFromRequest(req)
      const decoded = token ? verifyToken(token) : null

      // Base where clause for public access (only published metadata)
      let whereClause = {}
      if (!decoded) {
        whereClause = { isPublished: true }
      }

      // Get total count
      const totalCount = await prisma.metadata.count({
        where: whereClause
      })

      // Get count by status (only for authenticated users)
      let publishedCount = 0
      let draftCount = 0
      if (decoded) {
        publishedCount = await prisma.metadata.count({
          where: { ...whereClause, isPublished: true }
        })
        draftCount = await prisma.metadata.count({
          where: { ...whereClause, isPublished: false }
        })
      }

      // Get count by data type (from dataFormat field)
      const vectorCount = await prisma.metadata.count({
        where: {
          ...whereClause,
          dataFormat: { in: ['GeoJSON', 'Shapefile'] }
        }
      })
      const rasterCount = await prisma.metadata.count({
        where: {
          ...whereClause,
          dataFormat: { in: ['GeoTIFF', 'TIFF'] }
        }
      })

      // Get count by format (only for authenticated users)
      let shapefileCount = 0
      let geopackageCount = 0
      let geotiffCount = 0
      let geojsonCount = 0
      if (decoded) {
        shapefileCount = await prisma.metadata.count({
          where: { ...whereClause, dataFormat: 'Shapefile' }
        })
        geopackageCount = await prisma.metadata.count({
          where: { ...whereClause, dataFormat: 'GeoPackage' }
        })
        geotiffCount = await prisma.metadata.count({
          where: { ...whereClause, dataFormat: 'GeoTIFF' }
        })
        geojsonCount = await prisma.metadata.count({
          where: { ...whereClause, dataFormat: 'GeoJSON' }
        })
      }

      // Get count by source (we'll use a placeholder for now since the schema doesn't have this field)
      // In a real implementation, you might want to add a source field to the schema
      const internalCount = Math.floor(totalCount * 0.7) // Placeholder
      const externalCount = totalCount - internalCount // Placeholder

      const stats = {
        total: totalCount,
        byStatus: {
          published: publishedCount,
          draft: draftCount
        },
        byDataType: {
          vector: vectorCount,
          raster: rasterCount
        },
        byFormat: {
          shapefile: shapefileCount,
          geopackage: geopackageCount,
          geotiff: geotiffCount,
          geojson: geojsonCount
        },
        bySource: {
          internal: internalCount,
          external: externalCount
        },
        byCategory: {} as Record<string, number>
      }

      res.status(200).json(stats)
    } catch (error) {
      console.error('Get metadata stats error:', error)
      res.status(500).json({ message: 'Failed to fetch metadata statistics' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

// Allow public access for stats
export default handler