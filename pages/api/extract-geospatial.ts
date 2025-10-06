import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { extractGeospatialInfo } from '../../lib/ogrExtractor'
import path from 'path'
import fs from 'fs'

const upload = multer({
  dest: './uploads/temp/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.geojson', '.json', '.shp', '.shx', '.dbf', '.prj', '.cpg', '.zip', '.rar']
    const ext = path.extname(file.originalname).toLowerCase()
    console.log('Checking file:', file.originalname, 'extension:', ext)

    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      console.log('Rejected file type:', ext, 'allowed types:', allowedTypes)
      cb(new Error(`Format file tidak didukung: ${ext}`))
    }
  }
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check if pre-extracted data is provided in the request body
    if (req.body && req.body.preExtractedData) {
      // Return the pre-extracted data directly
      const preExtractedData = JSON.parse(req.body.preExtractedData)
      return res.status(200).json(preExtractedData)
    }

    // Handle file upload for server-side processing (fallback)
    // Try multiple files first (for Shapefile), then single file
    let files: any[] = []
    let tempDir = ''
    let isMultipleFiles = false

    console.log('Starting server-side extraction...')

    // Use multer.any() to accept all files, then process based on field names
    try {
      await new Promise((resolve, reject) => {
        const uploadAny = multer({
          dest: './uploads/temp/',
          limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
          fileFilter: (req, file, cb) => {
            const allowedTypes = ['.geojson', '.json', '.shp', '.shx', '.dbf', '.prj', '.cpg', '.sbn', '.sbx', '.zip', '.rar']
            const ext = path.extname(file.originalname).toLowerCase()
            console.log('Checking file:', file.originalname, 'extension:', ext, 'field:', file.fieldname)

            if (allowedTypes.includes(ext)) {
              cb(null, true)
            } else {
              console.log('Rejected file type:', ext, 'allowed types:', allowedTypes)
              cb(new Error(`Format file tidak didukung: ${ext}`))
            }
          }
        }).any()(req as any, res as any, (err: any) => {
          if (err) {
            console.log('Upload error:', err.message)
            reject(err)
          } else {
            console.log('Upload successful')
            resolve(null)
          }
        })
      })

      // Get uploaded files
      const uploadedFiles = (req as any).files || []
      console.log('Uploaded files count:', uploadedFiles.length)

      if (uploadedFiles.length === 0) {
        console.error('No files uploaded')
        return res.status(400).json({ error: 'No files uploaded' })
      }

      // Group files by fieldname
      const filesByField: { [key: string]: any[] } = {}
      uploadedFiles.forEach((file: any) => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = []
        }
        filesByField[file.fieldname].push(file)
      })

      console.log('Files grouped by field:', Object.keys(filesByField))

      // Check if we have 'files' field (multiple files) or 'file' field (single file)
      if (filesByField.files && filesByField.files.length > 0) {
        // Multiple files uploaded (Shapefile components)
        files = filesByField.files
        isMultipleFiles = true

        // Create a unique subdirectory for Shapefile components
        const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        tempDir = path.join('./uploads/temp/', uniqueId)

        // Ensure temp directory exists
        if (!fs.existsSync('./uploads/temp/')) {
          fs.mkdirSync('./uploads/temp/', { recursive: true })
        }
        fs.mkdirSync(tempDir, { recursive: true })

        // Move all files to the unique directory
        files.forEach((file: any) => {
          const newPath = path.join(tempDir, file.originalname)
          fs.renameSync(file.path, newPath)
          file.path = newPath // Update file path
        })

        console.log('Server-side extraction with multiple Shapefile files:', files.map((f: any) => f.originalname))
      } else if (filesByField.file && filesByField.file.length > 0) {
        // Single file uploaded
        files = filesByField.file
        tempDir = path.dirname(files[0].path)
        console.log('Server-side extraction with single file:', files[0].originalname)
      } else {
        // Fallback: use all files regardless of field name
        files = uploadedFiles
        if (files.length > 1) {
          isMultipleFiles = true
          // Create a unique subdirectory for multiple files
          const uniqueId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          tempDir = path.join('./uploads/temp/', uniqueId)

          if (!fs.existsSync('./uploads/temp/')) {
            fs.mkdirSync('./uploads/temp/', { recursive: true })
          }
          fs.mkdirSync(tempDir, { recursive: true })

          // Move all files to the unique directory
          files.forEach((file: any) => {
            const newPath = path.join(tempDir, file.originalname)
            fs.renameSync(file.path, newPath)
            file.path = newPath
          })

          console.log('Server-side extraction with fallback multiple files:', files.map((f: any) => f.originalname))
        } else {
          tempDir = path.dirname(files[0].path)
          console.log('Server-side extraction with fallback single file:', files[0].originalname)
        }
      }

    } catch (uploadError) {
      console.error('Upload failed:', uploadError)
      return res.status(400).json({ error: `Upload failed: ${(uploadError as Error).message}` })
    }

    if (files.length === 0) {
      console.error('No files after processing')
      return res.status(400).json({ error: 'No files uploaded' })
    }

    console.log('Files to process:', files.length, 'isMultipleFiles:', isMultipleFiles, 'tempDir:', tempDir)

    // Extract geospatial information using server-side processing
    const result = await extractGeospatialInfo(isMultipleFiles ? tempDir : files[0].path)

    // Clean up temp files
    try {
      if (isMultipleFiles && tempDir && fs.existsSync(tempDir)) {
        // Remove entire directory for multiple files
        console.log('Cleaning up temp directory:', tempDir)
        fs.rmdirSync(tempDir, { recursive: true })
      } else {
        // Remove single file
        files.forEach((file: any) => {
          if (fs.existsSync(file.path)) {
            console.log('Cleaning up temp file:', file.path)
            fs.unlinkSync(file.path)
          }
        })
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error)
    }

    if (result.success) {
      console.log('Server-side extraction successful')
      res.status(200).json(result.data)
    } else {
      console.error('Server-side extraction failed:', result.error)
      res.status(400).json({ error: result.error })
    }

  } catch (error) {
    console.error('Error extracting geospatial info:', error)
    res.status(500).json({
      error: 'Terjadi kesalahan saat mengekstrak informasi geospasial. Sistem sekarang menggunakan ekstraksi client-side.'
    })
  }
}