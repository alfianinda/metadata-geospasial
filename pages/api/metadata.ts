import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check if user is authenticated
      const token = getTokenFromRequest(req)
      const decoded = token ? verifyToken(token) : null

      let whereClause = {}

      if (decoded) {
        // If authenticated as admin, show all metadata
        if (decoded.role === 'ADMIN') {
          whereClause = {} // Admin can see all metadata
        } else {
          // If authenticated as regular user, show their own metadata or published metadata
          whereClause = {
            OR: [
              { userId: decoded.userId }, // Own metadata
              { isPublished: true } // Published metadata from others
            ]
          }
        }
      } else {
        // If not authenticated, only show published metadata
        whereClause = {
          isPublished: true
        }
      }

      // Pagination parameters
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 9
      const offset = (page - 1) * limit

      // Sorting parameters
      const sortBy = req.query.sortBy as string || 'createdAt'
      const sortOrder = (req.query.sortOrder as string || 'desc') as 'asc' | 'desc'

      // Validate sort parameters
      const validSortFields = ['title', 'createdAt', 'updatedAt']
      const validSortOrders: ('asc' | 'desc')[] = ['asc', 'desc']

      let orderBy: any = { createdAt: 'desc' as const }

      if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder)) {
        if (sortBy === 'title') {
          // For title sorting, use simple ascending order (SQLite compatible)
          orderBy = { title: sortOrder }
        } else {
          orderBy = { [sortBy]: sortOrder }
        }
      }

      // Search and filter parameters
      const search = req.query.search as string || ''
      const category = req.query.category as string || ''
      const dataType = req.query.dataType as string || ''
      const format = req.query.format as string || ''
      const source = req.query.source as string || ''
      const status = req.query.status as string || ''
      const dateFrom = req.query.dateFrom as string || ''
      const dateTo = req.query.dateTo as string || ''

      // Build where clause with filters
      let filters: any

      // Handle status filter first, as it affects the base whereClause
      if (status) {
        // Filter by actual status values (completed, ongoing, planned, deprecated)
        if (decoded && decoded.role === 'ADMIN') {
          // Admin can see all metadata with the specified status
          filters = { status: status }
        } else if (decoded) {
          // Regular users can see their own metadata or published metadata with the specified status
          filters = {
            AND: [
              { status: status },
              {
                OR: [
                  { userId: decoded.userId },
                  { isPublished: true }
                ]
              }
            ]
          }
        } else {
          // Public users can only see published metadata with the specified status
          filters = {
            AND: [
              { status: status },
              { isPublished: true }
            ]
          }
        }
      } else {
        // No status filter, use the base whereClause
        filters = { ...whereClause }
      }

      // Apply search filter
      if (search) {
        const searchCondition = {
          OR: [
            { title: { contains: search } },
            { abstract: { contains: search } },
            { keywords: { contains: search } }
          ]
        }

        if (filters.AND) {
          filters.AND.push(searchCondition)
        } else if (Object.keys(filters).length > 0) {
          filters = {
            AND: [filters, searchCondition]
          }
        } else {
          filters = searchCondition
        }
      }

      // Apply other filters
      const additionalFilters: any = {}

      if (category) {
        additionalFilters.topicCategory = category
      }

      if (dataType) {
        additionalFilters.spatialRepresentationType = dataType
      }

      if (format) {
        additionalFilters.dataFormat = format
      }

      // Combine additional filters
      if (Object.keys(additionalFilters).length > 0) {
        if (filters.AND) {
          filters.AND.push(additionalFilters)
        } else if (Object.keys(filters).length > 0) {
          filters = {
            AND: [filters, additionalFilters]
          }
        } else {
          filters = additionalFilters
        }
      }

      if (dateFrom || dateTo) {
        filters.createdAt = {}
        if (dateFrom) {
          filters.createdAt.gte = new Date(dateFrom)
        }
        if (dateTo) {
          filters.createdAt.lte = new Date(dateTo)
        }
      }

      // Get total count for pagination
      const totalCount = await prisma.metadata.count({
        where: filters
      })

      const metadata = await prisma.metadata.findMany({
        where: filters,
        include: {
          files: true,
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      })

      // Serialize BigInt fields to strings for JSON response
      const serializedData = metadata.map(item => ({
        ...item,
        fileSize: item.fileSize ? item.fileSize.toString() : null,
        files: item.files.map(file => ({
          ...file,
          size: file.size.toString()
        }))
      }))

      const totalPages = Math.ceil(totalCount / limit)

      res.status(200).json({
        data: serializedData,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      })
    } catch (error) {
      console.error('Get metadata error:', error)
      res.status(500).json({ message: 'Failed to fetch metadata' })
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' })
  }
}

// Allow public access for GET requests, require auth for others
export default function metadataHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handler(req, res)
  } else {
    return withAuth(handler)(req, res)
  }
}