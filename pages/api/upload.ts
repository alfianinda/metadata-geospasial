import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import formidable from 'formidable'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    console.log('Starting upload process...')

    // Check if user is authenticated
    const userId = (req as any).user?.userId
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    console.log('User authenticated:', user.email)

    // Parse FormData
    const formData = await parseFormData(req)
    const metadataFields = formData.fields
    const files = formData.files

    console.log('Parsed metadata fields:', Object.keys(metadataFields))
    console.log('Number of files:', files.length)

    // Validate required fields
    const requiredFields = ['title', 'abstract', 'extent', 'contactName', 'contactEmail', 'spatialRepresentationType', 'referenceSystemIdentifier', 'scope']
    const missingFields = requiredFields.filter(field => !metadataFields[field])

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields: missingFields
      })
    }

    // Generate UUID for fileIdentifier if not provided
    const fileIdentifier = metadataFields.fileIdentifier || `uuid:${crypto.randomUUID()}`

    // Create metadata record with parsed fields
    const metadata = await prisma.metadata.create({
      data: {
        // MD_Metadata Root
        fileIdentifier: fileIdentifier,
        language: metadataFields.language || 'ind',
        characterSet: metadataFields.characterSet || 'utf8',
        parentIdentifier: metadataFields.parentIdentifier || null,
        hierarchyLevel: metadataFields.hierarchyLevel || 'dataset',
        hierarchyLevelName: metadataFields.hierarchyLevelName || null,
        contactName: metadataFields.contactName,
        contactEmail: metadataFields.contactEmail,
        dateStamp: metadataFields.dateStamp ? new Date(metadataFields.dateStamp) : new Date(),
        metadataStandardName: metadataFields.metadataStandardName || 'ISO 19115',
        metadataStandardVersion: metadataFields.metadataStandardVersion || '2003/Cor.1:2006',
        dataSetURI: metadataFields.dataSetURI || null,
        locale: metadataFields.locale || 'id',

        // Basic Information
        title: metadataFields.title,
        abstract: metadataFields.abstract,
        purpose: metadataFields.purpose || null,
        status: metadataFields.status || 'completed',

        // Keywords and Topics
        topicCategory: metadataFields.topicCategory || null,
        keywords: metadataFields.descriptiveKeywords || null,

        // Spatial Information
        geographicExtent: metadataFields.extent || null,
        spatialResolution: metadataFields.spatialResolution || null,
        coordinateSystem: metadataFields.referenceSystemIdentifier || null,

        // Responsible Parties
        pointOfContact: metadataFields.pointOfContact || null,

        // Distribution Information
        distributionFormat: metadataFields.distributionFormat || null,
        distributor: metadataFields.distributor || null,
        onlineResource: metadataFields.onlineResource || null,
        transferOptions: metadataFields.transferOptions ? JSON.parse(metadataFields.transferOptions) : null,

        // Data Quality
        scope: metadataFields.scope,
        lineage: metadataFields.lineage || null,
        accuracy: metadataFields.accuracy || null,
        completeness: metadataFields.completeness || null,
        consistency: metadataFields.consistency || null,

        // Constraints
        useConstraints: metadataFields.useConstraints || null,
        accessConstraints: metadataFields.accessConstraints || null,
        otherConstraints: metadataFields.otherConstraints || null,
        resourceConstraints: metadataFields.resourceConstraints || null,

        // Reference System
        referenceSystem: metadataFields.referenceSystemIdentifier || null,
        referenceSystemType: metadataFields.referenceSystemType || null,

        // Content Information
        contentType: metadataFields.contentType || null,
        attributeInfo: metadataFields.attributeDescription ? JSON.parse(metadataFields.attributeDescription) : null,

        // Spatial Representation
        spatialRepresentationType: metadataFields.spatialRepresentationType,
        axisDimensionProperties: metadataFields.axisDimensionProperties || null,
        cellGeometry: metadataFields.cellGeometry || null,
        georectified: metadataFields.georectified === 'true',
        georeferenceable: metadataFields.georeferenceable === 'true',

        // SNI Specific
        sniCompliant: metadataFields.sniCompliant === 'true',
        sniVersion: metadataFields.sniVersion || null,
        sniStandard: metadataFields.sniStandard || null,
        bahasa: metadataFields.bahasa || 'id',

        // File Information (from geospatial info if available)
        originalFileName: metadataFields.originalFileName || null,
        fileSize: metadataFields.fileSize ? BigInt(metadataFields.fileSize) : null,
        featureCount: metadataFields.featureCount ? parseInt(metadataFields.featureCount) : null,
        geometryType: metadataFields.geometryType || null,
        dataFormat: metadataFields.dataFormat || null,

        // Processing Information
        processingLevel: metadataFields.processingLevel || null,
        graphicOverview: metadataFields.graphicOverview || null,
        resourceSpecificUsage: metadataFields.resourceSpecificUsage || null,

        // User relation
        userId: userId,

        // Data Access Level
        accessLevel: metadataFields.accessLevel || 'open'
      }
    })

    console.log('Metadata created successfully:', metadata.id)

    // Handle file uploads - store file info in database
    if (files && files.length > 0) {
      const fileRecords = files.map(file => ({
        filename: file.originalFilename || file.filename || 'unknown',
        originalName: file.originalFilename || file.filename || 'unknown',
        mimetype: file.mimetype,
        size: file.size,
        path: file.filepath || file.path, // In Vercel, this might be temporary
        url: null, // For now, no URL since files aren't stored permanently
        metadataId: metadata.id
      }))

      await prisma.file.createMany({
        data: fileRecords
      })

      console.log(`Created ${fileRecords.length} file records`)
    }

    res.status(201).json({
      message: 'Upload successful',
      metadataId: metadata.id,
      user: user.email,
      filesProcessed: files?.length || 0
    })
  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    res.status(500).json({
      message: 'Upload failed',
      error: errorMessage,
      timestamp: new Date().toISOString()
    })
  }
}

// Helper function to parse FormData
async function parseFormData(req: NextApiRequest): Promise<{ fields: Record<string, string>, files: any[] }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true })

    form.parse(req, (err: any, fields: any, files: any) => {
      if (err) {
        reject(err)
        return
      }

      // Flatten fields (formidable returns arrays for fields)
      const flattenedFields: Record<string, string> = {}
      Object.keys(fields).forEach(key => {
        const value = fields[key]
        flattenedFields[key] = Array.isArray(value) ? value[0] : value
      })

      // Handle files (convert to array if single file)
      let filesArray = []
      if (files.files) {
        filesArray = Array.isArray(files.files) ? files.files : [files.files]
      } else if (files.file) {
        filesArray = Array.isArray(files.file) ? files.file : [files.file]
      }

      resolve({
        fields: flattenedFields,
        files: filesArray
      })
    })
  })
}

export default withAuth(handler)

// Disable Next.js body parser for FormData
export const config = {
  api: {
    bodyParser: false,
  },
}