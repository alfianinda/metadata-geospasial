import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/middleware'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get total count
      const totalCount = await prisma.metadata.count()

      // Get count by status
      const publishedCount = await prisma.metadata.count({
        where: { isPublished: true }
      })
      const draftCount = await prisma.metadata.count({
        where: { isPublished: false }
      })

      // Get count by data type (from dataFormat field)
      const vectorCount = await prisma.metadata.count({
        where: { dataFormat: { in: ['GeoJSON', 'Shapefile'] } }
      })
      const rasterCount = await prisma.metadata.count({
        where: { dataFormat: { in: ['GeoTIFF', 'TIFF'] } }
      })

      // Get count by format
      const shapefileCount = await prisma.metadata.count({
        where: { dataFormat: 'Shapefile' }
      })
      const geopackageCount = await prisma.metadata.count({
        where: { dataFormat: 'GeoPackage' }
      })
      const geotiffCount = await prisma.metadata.count({
        where: { dataFormat: 'GeoTIFF' }
      })
      const geojsonCount = await prisma.metadata.count({
        where: { dataFormat: 'GeoJSON' }
      })

      // Get count by source (we'll use a placeholder for now since the schema doesn't have this field)
      // In a real implementation, you might want to add a source field to the schema
      const internalCount = Math.floor(totalCount * 0.7) // Placeholder
      const externalCount = totalCount - internalCount // Placeholder

      // Get count by topic category
      const topicCategories = await prisma.metadata.groupBy({
        by: ['topicCategory'],
        _count: {
          topicCategory: true
        },
        where: {
          topicCategory: { not: null }
        }
      })

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
        byCategory: topicCategories.reduce((acc, item) => {
          acc[item.topicCategory || 'unknown'] = item._count.topicCategory
          return acc
        }, {} as Record<string, number>)
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

// Require authentication for stats
export default withAuth(handler)