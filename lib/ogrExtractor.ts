import { exec, execSync } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'

const execAsync = promisify(exec)

// Check if ogrinfo is available
let ogrinfoAvailable = false
try {
  execSync('ogrinfo --version', { stdio: 'ignore' })
  ogrinfoAvailable = true
} catch (error) {
  console.warn('ogrinfo not available, using fallback extraction methods')
}

export interface GeospatialInfo {
  featureCount: number
  geometryType: string
  boundingBox: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  coordinateSystem: string
  attributes: Array<{
    name: string
    type: string
  }>
  layerName: string
}

export interface OgrInfoResult {
  success: boolean
  data?: GeospatialInfo
  error?: string
}

/**
 * Extract geospatial information from file using ogrinfo or fallback methods
 */
export async function extractGeospatialInfo(filePath: string): Promise<OgrInfoResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        error: 'File tidak ditemukan'
      }
    }

    const fileExt = path.extname(filePath).toLowerCase()

    // Use ogrinfo if available
    if (ogrinfoAvailable) {
      return await extractWithOgrInfo(filePath, fileExt)
    } else {
      // Use fallback methods
      return await extractWithFallback(filePath, fileExt)
    }

  } catch (error) {
    console.error('Error extracting geospatial info:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Extract geospatial information using ogrinfo
 */
async function extractWithOgrInfo(filePath: string, fileExt: string): Promise<OgrInfoResult> {
  let ogrCommand = ''

  // Build ogrinfo command based on file type
  if (fileExt === '.geojson' || fileExt === '.json') {
    ogrCommand = `ogrinfo -al -so "${filePath}"`
  } else if (fileExt === '.shp') {
    // For shapefiles, ogrinfo can read directly
    ogrCommand = `ogrinfo -al -so "${filePath}"`
  } else {
    return {
      success: false,
      error: `Format file tidak didukung: ${fileExt}`
    }
  }

  console.log('Running ogrinfo command:', ogrCommand)

  const { stdout, stderr } = await execAsync(ogrCommand, {
    timeout: 30000, // 30 second timeout
    maxBuffer: 1024 * 1024 * 10 // 10MB buffer
  })

  if (stderr && !stdout) {
    console.error('ogrinfo stderr:', stderr)
    return {
      success: false,
      error: `Error executing ogrinfo: ${stderr}`
    }
  }

  const parsedData = parseOgrInfoOutput(stdout)
  console.log('Parsed geospatial data:', parsedData)

  return {
    success: true,
    data: parsedData
  }
}

/**
 * Extract geospatial information using fallback methods
 */
async function extractWithFallback(filePath: string, fileExt: string): Promise<OgrInfoResult> {
  try {
    if (fileExt === '.geojson' || fileExt === '.json') {
      return await extractGeoJSONInfo(filePath)
    } else if (fileExt === '.shp') {
      return {
        success: false,
        error: 'Shapefile extraction memerlukan GDAL/ogrinfo. Silakan install GDAL terlebih dahulu.'
      }
    } else {
      return {
        success: false,
        error: `Format file tidak didukung: ${fileExt}`
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `Error extracting with fallback: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Extract geospatial information from GeoJSON file
 */
async function extractGeoJSONInfo(filePath: string): Promise<OgrInfoResult> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const geojson = JSON.parse(fileContent)

    if (!geojson.type || !['FeatureCollection', 'Feature'].includes(geojson.type)) {
      return {
        success: false,
        error: 'File GeoJSON tidak valid'
      }
    }

    let features = []
    let geometryType = ''
    let boundingBox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    let attributes: Array<{ name: string; type: string }> = []

    if (geojson.type === 'FeatureCollection') {
      features = geojson.features || []
    } else if (geojson.type === 'Feature') {
      features = [geojson]
    }

    // Extract geometry type and bounding box
    features.forEach((feature: any) => {
      if (feature.geometry) {
        if (!geometryType) {
          geometryType = feature.geometry.type
        }

        // Calculate bounding box
        if (feature.geometry.coordinates) {
          updateBoundingBox(feature.geometry.coordinates, boundingBox)
        }
      }

      // Extract attributes
      if (feature.properties) {
        Object.keys(feature.properties).forEach(key => {
          const value = feature.properties[key]
          const type = getPropertyType(value)
          if (!attributes.find(attr => attr.name === key)) {
            attributes.push({ name: key, type })
          }
        })
      }
    })

    // If no valid bounding box was found, use default
    if (boundingBox.minX === Infinity) {
      boundingBox = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    }

    return {
      success: true,
      data: {
        featureCount: features.length,
        geometryType,
        boundingBox,
        coordinateSystem: 'WGS84', // GeoJSON default
        attributes,
        layerName: path.basename(filePath, path.extname(filePath))
      }
    }

  } catch (error) {
    return {
      success: false,
      error: `Error parsing GeoJSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Update bounding box from geometry coordinates
 */
function updateBoundingBox(coordinates: any, bbox: any) {
  if (Array.isArray(coordinates)) {
    if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
      // Point coordinates [lng, lat]
      const [lng, lat] = coordinates
      bbox.minX = Math.min(bbox.minX, lng)
      bbox.minY = Math.min(bbox.minY, lat)
      bbox.maxX = Math.max(bbox.maxX, lng)
      bbox.maxY = Math.max(bbox.maxY, lat)
    } else {
      // Nested coordinates (LineString, Polygon, etc.)
      coordinates.forEach((coord: any) => updateBoundingBox(coord, bbox))
    }
  }
}

/**
 * Get property type from value
 */
function getPropertyType(value: any): string {
  if (value === null || value === undefined) return 'String'
  if (typeof value === 'string') return 'String'
  if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Real'
  if (typeof value === 'boolean') return 'String' // GeoJSON doesn't have boolean type
  if (value instanceof Date) return 'Date'
  return 'String'
}

/**
 * Parse ogrinfo output to extract geospatial information
 */
function parseOgrInfoOutput(output: string): GeospatialInfo {
  const lines = output.split('\n')
  let currentLayer = ''
  let featureCount = 0
  let geometryType = ''
  let boundingBox = { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  let coordinateSystem = ''
  let attributes: Array<{ name: string; type: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Extract layer name
    if (line.startsWith('Layer name:')) {
      currentLayer = line.split(':')[1].trim()
    }

    // Extract feature count
    if (line.includes('Feature Count:')) {
      const countMatch = line.match(/Feature Count:\s*(\d+)/)
      if (countMatch) {
        featureCount = parseInt(countMatch[1])
      }
    }

    // Extract geometry type
    if (line.includes('Geometry:')) {
      const geomMatch = line.match(/Geometry:\s*(\w+)/)
      if (geomMatch) {
        geometryType = geomMatch[1]
      }
    }

    // Extract bounding box
    if (line.includes('Extent:')) {
      const extentMatch = line.match(/Extent:\s*\(([^)]+)\)/)
      if (extentMatch) {
        const coords = extentMatch[1].split(',').map(c => parseFloat(c.trim()))
        if (coords.length === 4) {
          boundingBox = {
            minX: coords[0],
            minY: coords[1],
            maxX: coords[2],
            maxY: coords[3]
          }
        }
      }
    }

    // Extract coordinate system
    if (line.includes('Layer SRS WKT:')) {
      // Find the WKT definition (usually spans multiple lines)
      let wkt = ''
      let j = i + 1
      while (j < lines.length && !lines[j].trim().startsWith('Geometry Column')) {
        wkt += lines[j].trim() + ' '
        j++
      }
      coordinateSystem = wkt.trim()

      // Extract EPSG if available
      const epsgMatch = wkt.match(/AUTHORITY\["EPSG","(\d+)"\]/)
      if (epsgMatch) {
        coordinateSystem = `EPSG:${epsgMatch[1]}`
      }
    }

    // Extract attributes
    if (line.includes('String') || line.includes('Integer') || line.includes('Real') ||
        line.includes('Date') || line.includes('Time')) {
      const attrMatch = line.match(/^(\w+):\s*(\w+)/)
      if (attrMatch) {
        attributes.push({
          name: attrMatch[1],
          type: attrMatch[2]
        })
      }
    }
  }

  return {
    featureCount,
    geometryType,
    boundingBox,
    coordinateSystem: coordinateSystem || 'WGS84', // Default to WGS84
    attributes,
    layerName: currentLayer
  }
}

/**
 * Get file format from extension
 */
export function getFileFormat(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.geojson':
    case '.json':
      return 'GeoJSON'
    case '.shp':
      return 'Shapefile'
    case '.kml':
      return 'KML'
    case '.gml':
      return 'GML'
    case '.csv':
      return 'CSV'
    default:
      return 'Unknown'
  }
}

/**
 * Validate if file is a supported geospatial format
 */
export function isSupportedGeospatialFormat(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase()
  const supportedFormats = ['.geojson', '.json', '.shp', '.kml', '.gml']
  return supportedFormats.includes(ext)
}