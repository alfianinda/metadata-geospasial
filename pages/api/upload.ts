import { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { prisma } from '@/lib/db'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'

const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/json',
      'application/octet-stream',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed'
    ]
    const allowedExtensions = ['.geojson', '.shp', '.shx', '.dbf', '.prj', '.cpg', '.zip', '.rar']

    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExtensions.includes(ext) || allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

export const config = {
  api: {
    bodyParser: false,
  },
}

interface MulterFile {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
}

interface MulterRequest extends AuthenticatedRequest {
  files: MulterFile[]
}

const execAsync = promisify(exec)

// Function to extract ZIP files using adm-zip (works on Vercel)
async function extractWithAdmZip(zipPath: string, extractPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const AdmZip = require('adm-zip')
      const zip = new AdmZip(zipPath)
      zip.extractAllTo(extractPath, true)
      resolve()
    } catch (error) {
      reject(new Error(`Failed to extract ZIP with adm-zip: ${error}`))
    }
  })
}

// Function to extract RAR files using node-unrar (works on Vercel)
async function extractWithNodeUnrar(rarPath: string, extractPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const unrar = require('node-unrar')
      const rar = new unrar(rarPath)
      rar.extract(extractPath, null, (err: any) => {
        if (err) {
          reject(new Error(`Failed to extract RAR with node-unrar: ${err}`))
        } else {
          resolve()
        }
      })
    } catch (error) {
      reject(new Error(`RAR extraction failed: ${error}`))
    }
  })
}


// Function to detect if file is compressed
function isCompressedFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return ['.zip', '.rar'].includes(ext)
}

// Function to extract compressed files
async function extractCompressedFile(filePath: string, extractPath: string): Promise<string[]> {
  const ext = path.extname(filePath).toLowerCase()

  console.log(`🔧 Starting extraction of ${filePath}`)
  console.log(`   - Extension: ${ext}`)
  console.log(`   - Extract path: ${extractPath}`)

  try {
    // Check if extraction commands are available
    if (ext === '.zip') {
      console.log(`   - Using unzip command`)
      await execAsync(`unzip -q "${filePath}" -d "${extractPath}"`)
    } else if (ext === '.rar') {
      console.log(`   - Using unrar command`)
      await execAsync(`unrar x -y "${filePath}" "${extractPath}"`)
    } else {
      throw new Error(`Unsupported compression format: ${ext}`)
    }

    // Get list of extracted files
    const files = fs.readdirSync(extractPath)
    const fullPaths = files.map(file => path.join(extractPath, file))

    console.log(`✅ Extraction successful:`)
    console.log(`   - Total files extracted: ${files.length}`)
    console.log(`   - Files: ${files.join(', ')}`)

    // Verify that files were actually extracted
    if (files.length === 0) {
      throw new Error(`No files were extracted from ${filePath}. The archive might be empty or corrupted.`)
    }

    return fullPaths
  } catch (error) {
    console.error(`❌ Extraction failed for ${filePath}:`, error)

    // Try Node.js libraries for extraction (works on Vercel and other serverless platforms)
    let extractionSuccessful = false

    try {
      if (ext === '.zip') {
        console.log(`   - Using adm-zip library for ZIP extraction...`)
        await extractWithAdmZip(filePath, extractPath)
        extractionSuccessful = true
      } else if (ext === '.rar') {
        console.log(`   - Using node-unrar library for RAR extraction...`)
        await extractWithNodeUnrar(filePath, extractPath)
        extractionSuccessful = true
      }
    } catch (libError) {
      console.error(`❌ Node.js library extraction failed:`, libError)

      // Provide clear instructions for different environments
      const errorMessage = `Extraction failed for ${ext} files.

**For Local Development (Windows):**
1. Install 7-Zip: https://www.7-zip.org/
2. Or use Git Bash if Git is installed

**For Vercel/Serverless Deployment:**
✅ Already configured to use Node.js libraries (adm-zip, node-unrar)

**For Docker/Linux:**
- ZIP: unzip command (usually pre-installed)
- RAR: sudo apt-get install unrar

**Alternative Solution:**
Upload individual Shapefile components (.shp, .shx, .dbf, .prj, etc.) separately.
The validation will work correctly for individual files!

Error details: ${libError}`

      throw new Error(errorMessage)
    }

    if (!extractionSuccessful) {
      throw new Error(`Failed to extract ${ext} file using any available method`)
    }

    throw new Error(`Failed to extract ${ext} file: ${error}`)
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Handle file upload
    await new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      upload.array('files')(req as any, res as any, (err: unknown) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const multerReq = req as MulterRequest
    let files = multerReq.files
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    // Parse metadata from form data first
    const formData = multerReq.body
    let geospatialInfo = formData.geospatialInfo ? JSON.parse(formData.geospatialInfo) : null

    // Process compressed files
    const processedFiles: MulterFile[] = []
    const compressedFiles: MulterFile[] = []

    for (const file of files) {
      if (isCompressedFile(file.originalname)) {
        // Store the original compressed file for download
        compressedFiles.push(file)

        // Create extraction directory
        const extractDir = path.join('uploads/temp/', `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
        fs.mkdirSync(extractDir, { recursive: true })

        try {
          // Extract the compressed file
          const extractedFiles = await extractCompressedFile(file.path, extractDir)

          // Validate extracted Shapefile components
          const extractedFileNames = extractedFiles.map(f => path.basename(f).toLowerCase())
          const hasShp = extractedFileNames.some(name => name.endsWith('.shp'))
          const hasShx = extractedFileNames.some(name => name.endsWith('.shx'))
          const hasDbf = extractedFileNames.some(name => name.endsWith('.dbf'))

          // Check for auxiliary Shapefile files
          const hasAuxiliaryFiles = extractedFileNames.some(name =>
            name.endsWith('.prj') ||
            name.endsWith('.cpg') ||
            name.endsWith('.sbn') ||
            name.endsWith('.sbx')
          )

          console.log(`🔍 Validating ${file.originalname}:`)
          console.log(`   - Extracted files: ${extractedFileNames.join(', ')}`)
          console.log(`   - hasShp: ${hasShp}, hasShx: ${hasShx}, hasDbf: ${hasDbf}, hasAuxiliary: ${hasAuxiliaryFiles}`)

          // If there are auxiliary files but no core Shapefile files, reject
          if (hasAuxiliaryFiles && !hasShp && !hasShx && !hasDbf) {
            console.log(`❌ Validation FAILED for ${file.originalname} - auxiliary files without core files`)
            console.log(`   hasAuxiliaryFiles: ${hasAuxiliaryFiles}, hasShp: ${hasShp}, hasShx: ${hasShx}, hasDbf: ${hasDbf}`)
            return res.status(400).json({
              message: `File ${file.originalname} tidak valid. File pendukung Shapefile (.prj, .cpg, .sbn, .sbx) tidak dapat diupload tanpa file utama (.shp, .shx, .dbf). File yang ditemukan: ${extractedFileNames.join(', ')}`,
              errorType: 'auxiliary_without_core',
              missingFiles: ['.shp', '.shx', '.dbf']
            })
          }

          // Additional check: if we have only .shp and auxiliary files (missing .shx and .dbf), reject
          if (hasShp && hasAuxiliaryFiles && !hasShx && !hasDbf) {
            console.log(`❌ Validation FAILED for ${file.originalname} - .shp with auxiliary but missing .shx and .dbf`)
            console.log(`   This is the case the user mentioned: .shp + .cpg but no .shx/.dbf`)
            return res.status(400).json({
              message: `File ${file.originalname} tidak lengkap. Shapefile memerlukan minimal file .shp, .shx, dan .dbf. File pendukung (.prj, .cpg, .sbn, .sbx) opsional tetapi file utama wajib ada. File yang ditemukan: ${extractedFileNames.join(', ')}`,
              errorType: 'incomplete_shapefile_with_auxiliary',
              missingFiles: ['.shx', '.dbf']
            })
          }

          // If there's a .shp file, we must have both .shx and .dbf
          if (hasShp) {
            console.log(`📋 Checking Shapefile completeness for ${file.originalname}`)
            console.log(`   - hasShx: ${hasShx}, hasDbf: ${hasDbf}`)

            if (!hasShx && !hasDbf) {
              console.log(`❌ Validation FAILED for ${file.originalname} - missing both .shx and .dbf`)
              console.log(`   Returning error response...`)
              return res.status(400).json({
                message: `File ${file.originalname} tidak lengkap. Shapefile memerlukan minimal file .shp, .shx, dan .dbf. File yang ditemukan: ${extractedFileNames.join(', ')}`,
                errorType: 'incomplete_shapefile',
                missingFiles: ['.shx', '.dbf']
              })
            } else if (!hasShx) {
              console.log(`❌ Validation FAILED for ${file.originalname} - missing .shx`)
              console.log(`   Returning error response...`)
              return res.status(400).json({
                message: `File ${file.originalname} tidak lengkap. File .shx tidak ditemukan. Shapefile memerlukan file .shp, .shx, dan .dbf. File yang ditemukan: ${extractedFileNames.join(', ')}`,
                errorType: 'missing_shx',
                missingFiles: ['.shx']
              })
            } else if (!hasDbf) {
              console.log(`❌ Validation FAILED for ${file.originalname} - missing .dbf`)
              console.log(`   Returning error response...`)
              return res.status(400).json({
                message: `File ${file.originalname} tidak lengkap. File .dbf tidak ditemukan. Shapefile memerlukan file .shp, .shx, dan .dbf. File yang ditemukan: ${extractedFileNames.join(', ')}`,
                errorType: 'missing_dbf',
                missingFiles: ['.dbf']
              })
            }
            console.log(`✅ Shapefile validation passed for ${file.originalname}`)
          }

          // If there are .shx or .dbf files without .shp, that's also invalid
          if ((hasShx || hasDbf) && !hasShp) {
            console.log(`❌ Validation FAILED for ${file.originalname} - .shx/.dbf without .shp`)
            return res.status(400).json({
              message: `File ${file.originalname} tidak valid. File .shx atau .dbf ditemukan tanpa file .shp. File yang ditemukan: ${extractedFileNames.join(', ')}`
            })
          }

          // Final validation summary
          console.log(`📋 FINAL VALIDATION SUMMARY for ${file.originalname}:`)
          console.log(`   - Core files: .shp=${hasShp}, .shx=${hasShx}, .dbf=${hasDbf}`)
          console.log(`   - Auxiliary files: ${hasAuxiliaryFiles}`)
          console.log(`   - All required core files present: ${hasShp && hasShx && hasDbf}`)
          console.log(`✅ Validation PASSED for ${file.originalname}`)

          // Process extracted files
          let extractedGeospatialInfo = null
          for (const extractedFile of extractedFiles) {
            const stat = fs.statSync(extractedFile)
            if (stat.isFile()) {
              const ext = path.extname(extractedFile).toLowerCase()
              const allowedExtensions = ['.geojson', '.shp', '.shx', '.dbf', '.prj', '.cpg', '.sbn', '.sbx']

              if (allowedExtensions.includes(ext)) {
                processedFiles.push({
                  filename: path.basename(extractedFile),
                  originalname: path.basename(extractedFile),
                  mimetype: 'application/octet-stream',
                  size: stat.size,
                  path: extractedFile
                })

                // Try to extract geospatial info from .shp or .geojson files
                if (ext === '.shp' || ext === '.geojson') {
                  try {
                    const { extractGeospatialInfo } = await import('../../lib/ogrExtractor')
                    const geoResult = await extractGeospatialInfo(extractedFile)
                    if (geoResult.success) {
                      extractedGeospatialInfo = geoResult.data
                    }
                  } catch (error) {
                    console.error('Error extracting geospatial info from extracted file:', error)
                  }
                }
              }
            }
          }

          // Use extracted geospatial info if available
          if (extractedGeospatialInfo) {
            geospatialInfo = extractedGeospatialInfo
          }
        } catch (error) {
          console.error('Extraction error:', error)
          return res.status(400).json({ message: `Failed to extract ${file.originalname}: ${error}` })
        }
      } else {
        processedFiles.push(file)
      }
    }

    // Combine processed files with compressed files for storage
    const allFiles = [...processedFiles, ...compressedFiles]

    files = processedFiles

    // Find the primary file for metadata extraction (prefer .shp, then .geojson)
    const primaryFile = allFiles.find(file =>
      file.originalname.toLowerCase().endsWith('.shp') ||
      file.originalname.toLowerCase().endsWith('.geojson')
    ) || allFiles[0]

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: multerReq.user.userId }
    })

    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' })
    }

    // Create metadata record with all fields
    const metadata = await prisma.metadata.create({
      data: {
        // MD_Metadata Root (ISO 19115)
        fileIdentifier: formData.fileIdentifier || null,
        language: formData.language || 'ind',
        characterSet: formData.characterSet || 'utf8',
        parentIdentifier: formData.parentIdentifier || null,
        hierarchyLevel: formData.hierarchyLevel || 'dataset',
        hierarchyLevelName: formData.hierarchyLevelName || null,
        contactName: formData.contactName || null,
        contactEmail: formData.contactEmail || null,
        dateStamp: formData.dateStamp ? new Date(formData.dateStamp) : null,
        metadataStandardName: formData.metadataStandardName || 'ISO 19115',
        metadataStandardVersion: formData.metadataStandardVersion || '2003/Cor.1:2006',
        dataSetURI: formData.dataSetURI || null,
        locale: formData.locale || 'id',

        // Basic Information (ISO 19115 Mandatory)
        title: formData.title || 'Uploaded Dataset',
        abstract: formData.abstract || null,
        purpose: formData.purpose || null,
        status: formData.status || 'completed',
        updateFrequency: formData.resourceMaintenance || formData.updateFrequency || 'asNeeded',

        // Identification Information (ISO 19115)
        supplementalInfo: formData.additionalDocumentation || formData.supplementalInfo || null,

        // Keywords and Topics
        keywords: formData.descriptiveKeywords || formData.keywords || null,
        topicCategory: formData.topicCategory || null,
        themeKeywords: formData.themeKeywords || null,

        // Spatial Information (ISO 19115 Mandatory)
        boundingBox: geospatialInfo?.boundingBox || null,
        spatialResolution: formData.spatialResolution || null,
        coordinateSystem: formData.referenceSystemIdentifier || formData.coordinateSystem || geospatialInfo?.coordinateSystem || 'WGS84',
        geographicExtent: formData.extent || formData.geographicExtent || null,
        verticalExtent: formData.verticalExtent || null,

        // Temporal Information
        temporalStart: formData.temporalStart ? new Date(formData.temporalStart) : null,
        temporalEnd: formData.temporalEnd ? new Date(formData.temporalEnd) : null,
        dateType: formData.dateType || 'creation',

        // Responsible Parties (ISO 19115 Mandatory)
        pointOfContact: formData.pointOfContact || null,
        contactOrganization: formData.contactOrganization || null,
        contactRole: formData.contactRole || 'pointOfContact',
        contactPhone: formData.contactPhone || null,
        contactAddress: formData.contactAddress || null,

        // Metadata Contact
        metadataContactName: formData.metadataContactName || null,
        metadataContactEmail: formData.metadataContactEmail || null,
        metadataContactOrganization: formData.metadataContactOrganization || null,

        // Distribution Information
        distributionFormat: formData.distributionFormat || null,
        distributor: formData.distributor || null,
        onlineResource: formData.onlineResource || null,
        transferOptions: formData.transferOptions || null,

        // Data Quality
        scope: formData.scope || 'dataset',
        lineage: formData.lineage || null,
        accuracy: formData.accuracy || null,
        completeness: formData.completeness || null,
        consistency: formData.consistency || null,
        positionalAccuracy: formData.positionalAccuracy || null,
        conformity: formData.conformity || null,

        // Constraints
        useConstraints: formData.useConstraints || null,
        accessConstraints: formData.accessConstraints || null,
        otherConstraints: formData.otherConstraints || null,

        // Reference System
        referenceSystem: formData.referenceSystem || null,
        projection: formData.referenceSystemType || formData.projection || null,

        // Content Information
        featureTypes: formData.featureTypes || null,
        attributeInfo: formData.attributeDescription || formData.attributeInfo || null,
        contentType: formData.contentType || null,

        // Spatial Representation Information (ISO 19115)
        spatialRepresentationType: formData.spatialRepresentationType || null,
        axisDimensionProperties: formData.axisDimensionProperties || null,
        cellGeometry: formData.cellGeometry || null,
        georectified: formData.georectified === 'true' || formData.georectified === true,
        georeferenceable: formData.georeferenceable === 'true' || formData.georeferenceable === true,

        // SNI Specific Fields
        sniCompliant: formData.sniCompliant === 'true' || formData.sniCompliant === true,
        sniVersion: formData.sniVersion || '1.0',
        sniStandard: formData.sniStandard || 'SNI-ISO-19115-2019',
        bahasa: formData.bahasa || 'id',

        // File Information
        originalFileName: primaryFile?.originalname || null,
        fileSize: primaryFile?.size || null,
        featureCount: geospatialInfo?.featureCount || null,
        geometryType: geospatialInfo?.geometryType || null,
        dataFormat: geospatialInfo?.dataFormat || null,

        // Processing Information
        processingLevel: formData.processingLevel || null,
        processingHistory: formData.processingHistory || null,

        // XML Metadata
        xmlContent: formData.xmlContent || null,
        xmlSchema: formData.xmlSchema || null,

        // Status and Workflow
        isPublished: false, // Default to draft
        publishedAt: null,
        reviewStatus: 'draft',
        approvalDate: null,

        // CKAN Integration
        ckanId: formData.ckanId || null,
        ckanUrl: formData.ckanUrl || null,

        // User and status
        userId: multerReq.user.userId,

        // Files
        files: {
          create: allFiles.map((file) => ({
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            url: `/api/download/file/${file.filename}`
          }))
        }
      }
    })

    res.status(201).json({
      message: 'Files uploaded successfully',
      metadataId: metadata.id
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Upload failed' })
  }
}

export default withAuth(handler)