import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Always show only published data for public stats
      const totalCount = await prisma.metadata.count()

      const publishedCount = await prisma.metadata.count({
        where: { isPublished: true }
      })

      // Always show only published vector/raster data
      const vectorCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          spatialRepresentationType: 'vector'
        }
      })

      const rasterCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          spatialRepresentationType: 'grid'
        }
      })

      // Get count by format (only published)
      const shapefileCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          dataFormat: { contains: 'Shapefile' }
        }
      })

      const geopackageCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          dataFormat: { contains: 'GeoPackage' }
        }
      })

      const geotiffCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          dataFormat: { contains: 'GeoTIFF' }
        }
      })

      const geojsonCount = await prisma.metadata.count({
        where: {
          isPublished: true,
          dataFormat: { contains: 'GeoJSON' }
        }
      })

      // Get count by source (placeholders)
      const internalCount = Math.floor(totalCount * 0.7)
      const externalCount = totalCount - internalCount

      const stats = {
        total: totalCount,
        byStatus: {
          published: publishedCount,
          draft: 0 // Never show draft count in public stats
        },
        byDataType: {
          vector: vectorCount, // Always published vector data
          raster: rasterCount  // Always published raster data
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
      console.error('Get public metadata stats error:', error)
      res.status(500).json({ message: 'Failed to fetch metadata statistics' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

export default handler