import { NextApiRequest, NextApiResponse } from 'next'
import multer from 'multer'
import { extractGeospatialInfo } from '../../lib/ogrExtractor'
import path from 'path'
import fs from 'fs'

const upload = multer({
  dest: './uploads/temp/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.geojson', '.json', '.shp', '.shx', '.dbf', '.prj', '.cpg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Format file tidak didukung'))
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
    // Handle file upload
    await new Promise((resolve, reject) => {
      upload.single('file')(req as any, res as any, (err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(null)
        }
      })
    })

    const file = (req as any).file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const filePath = file.path

    // Extract geospatial information
    const result = await extractGeospatialInfo(filePath)

    // Clean up temp file
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      console.error('Error cleaning up temp file:', error)
    }

    if (result.success) {
      res.status(200).json(result.data)
    } else {
      res.status(400).json({ error: result.error })
    }

  } catch (error) {
    console.error('Error extracting geospatial info:', error)
    res.status(500).json({
      error: 'Terjadi kesalahan saat mengekstrak informasi geospasial'
    })
  }
}