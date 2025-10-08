import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check if user is authenticated
      const token = getTokenFromRequest(req)
      const decoded = token ? verifyToken(token) : null

      // Always get total count (published + draft)
      const totalCount = await prisma.metadata.count()

      // Always get published count
      const publishedCount = await prisma.metadata.count({
        where: { isPublished: true }
      })

      // Get draft count (only for authenticated users)
      let draftCount = 0
      if (decoded) {
        draftCount = await prisma.metadata.count({
          where: { isPublished: false }
        })
      }

      // Get count by data type (from spatialRepresentationType field)
      // For dashboard (authenticated users): show all data
      // For other uses: show published data
      const dataTypeWhereClause = decoded ? {} : { isPublished: true }

      const vectorCount = await prisma.metadata.count({
        where: {
          ...dataTypeWhereClause,
          spatialRepresentationType: 'vector'
        }
      })
      const rasterCount = await prisma.metadata.count({
        where: {
          ...dataTypeWhereClause,
          spatialRepresentationType: 'grid'
        }
      })

      // Get count by format (only for authenticated users) - use contains matching
      let shapefileCount = 0
      let geopackageCount = 0
      let geotiffCount = 0
      let geojsonCount = 0
      if (decoded) {
        shapefileCount = await prisma.metadata.count({
          where: {
            dataFormat: { contains: 'Shapefile' }
          }
        })
        geopackageCount = await prisma.metadata.count({
          where: {
            dataFormat: { contains: 'GeoPackage' }
          }
        })
        geotiffCount = await prisma.metadata.count({
          where: {
            dataFormat: { contains: 'GeoTIFF' }
          }
        })
        geojsonCount = await prisma.metadata.count({
          where: {
            dataFormat: { contains: 'GeoJSON' }
          }
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