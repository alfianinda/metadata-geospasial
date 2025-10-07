import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import formidable from 'formidable'
import * as yauzl from 'yauzl'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

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
        transferOptions: metadataFields.transferOptions ? { description: metadataFields.transferOptions } : undefined,

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
        attributeInfo: metadataFields.attributeDescription ? { description: metadataFields.attributeDescription } : undefined,

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

      // Cleanup extracted temporary files
      files.forEach(file => {
        if (file.cleanup) {
          file.cleanup()
        }
      })
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

    form.parse(req, async (err: any, fields: any, files: any) => {
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

      // Check for compressed files and extract them
      const processedFiles: any[] = []
      for (const file of filesArray) {
        const fileName = file.originalFilename || file.name || ''
        console.log(`Processing file: ${fileName}, filepath: ${file.filepath}`)
        const isZip = fileName.toLowerCase().endsWith('.zip')
        const isRar = fileName.toLowerCase().endsWith('.rar')

        if (isZip) {
          try {
            console.log(`Detected ZIP file: ${fileName}, attempting extraction...`)
            const extractedFiles = await extractZip(file.filepath)
            console.log(`Successfully extracted ${extractedFiles.length} files from ZIP:`, extractedFiles.map(f => f.originalFilename))
            processedFiles.push(...extractedFiles)
          } catch (error) {
            console.error(`Failed to extract ZIP ${fileName}:`, error)
            // If extraction fails, keep the original file
            processedFiles.push(file)
          }
        } else if (isRar) {
          console.log(`RAR file detected: ${fileName} - RAR extraction not supported in serverless environment`)
          console.log(`Storing RAR file as-is. For automatic metadata extraction, please use ZIP format.`)
          // Keep the original RAR file - no extraction
          processedFiles.push(file)
        } else {
          console.log(`Regular file: ${fileName}`)
          processedFiles.push(file)
        }
      }

      resolve({
        fields: flattenedFields,
        files: processedFiles
      })
    })
  })
}

// Define interface for extracted file
interface ExtractedFile {
  filepath: string
  originalFilename: string
  mimetype: string
  size: number
  cleanup: () => void
}

// Helper function to extract ZIP files
async function extractZip(zipPath: string): Promise<ExtractedFile[]> {
  return new Promise((resolve, reject) => {
    console.log(`Opening ZIP file: ${zipPath}`)

    // Check if file exists
    if (!fs.existsSync(zipPath)) {
      reject(new Error(`ZIP file does not exist: ${zipPath}`))
      return
    }

    const extractedFiles: ExtractedFile[] = []

    yauzl.open(zipPath, { lazyEntries: true }, (err: any, zipfile: any) => {
      if (err) {
        console.error('Error opening ZIP file:', err)
        reject(err)
        return
      }

      console.log('ZIP file opened successfully')

      zipfile.readEntry()
      zipfile.on('entry', (entry: any) => {
        console.log(`Processing ZIP entry: ${entry.fileName}`)

        // Skip directories and macOS metadata
        if (entry.fileName.endsWith('/') || entry.fileName.startsWith('__MACOSX/') || entry.fileName.includes('.DS_Store')) {
          console.log(`Skipping entry: ${entry.fileName}`)
          zipfile.readEntry()
          return
        }

        // Only extract geospatial files
        const fileName = entry.fileName.toLowerCase()
        const isGeospatialFile = fileName.endsWith('.shp') ||
                                fileName.endsWith('.shx') ||
                                fileName.endsWith('.dbf') ||
                                fileName.endsWith('.prj') ||
                                fileName.endsWith('.cpg') ||
                                fileName.endsWith('.geojson') ||
                                fileName.endsWith('.json')

        if (!isGeospatialFile) {
          console.log(`Skipping non-geospatial file: ${entry.fileName}`)
          zipfile.readEntry()
          return
        }

        console.log(`Extracting geospatial file: ${entry.fileName}`)

        zipfile.openReadStream(entry, (err: any, readStream: any) => {
          if (err) {
            console.warn(`Error opening read stream for ${entry.fileName}:`, err)
            zipfile.readEntry()
            return
          }

          // Create temporary file
          const tempDir = os.tmpdir()
          const tempFileName = `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${path.basename(entry.fileName)}`
          const tempFilePath = path.join(tempDir, tempFileName)

          console.log(`Creating temp file: ${tempFilePath}`)

          const writeStream = fs.createWriteStream(tempFilePath)
          readStream.pipe(writeStream)

          writeStream.on('finish', () => {
            console.log(`Successfully extracted: ${entry.fileName} to ${tempFilePath}`)

            // Create file object similar to formidable's format
            const extractedFile: ExtractedFile = {
              filepath: tempFilePath,
              originalFilename: entry.fileName,
              mimetype: getMimeType(entry.fileName),
              size: entry.uncompressedSize,
              // Add cleanup method
              cleanup: () => {
                try {
                  if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath)
                    console.log(`Cleaned up temp file: ${tempFilePath}`)
                  }
                } catch (e) {
                  console.warn(`Failed to cleanup temp file ${tempFilePath}:`, e)
                }
              }
            }

            extractedFiles.push(extractedFile)
            zipfile.readEntry()
          })

          writeStream.on('error', (error: any) => {
            console.error(`Error writing extracted file ${entry.fileName}:`, error)
            zipfile.readEntry()
          })
        })
      })

      zipfile.on('end', () => {
        console.log(`ZIP extraction completed. Total extracted files: ${extractedFiles.length}`)
        resolve(extractedFiles)
      })

      zipfile.on('error', (error: any) => {
        console.error('ZIP file error:', error)
        reject(error)
      })
    })
  })
}


// Helper function to get MIME type
function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'shp': 'application/octet-stream',
    'shx': 'application/octet-stream',
    'dbf': 'application/octet-stream',
    'prj': 'application/octet-stream',
    'cpg': 'application/octet-stream',
    'geojson': 'application/json',
    'json': 'application/json'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

export default withAuth(handler)

// Disable Next.js body parser for FormData
export const config = {
  api: {
    bodyParser: false,
  },
}