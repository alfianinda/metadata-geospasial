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
  // Basic extracted info
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

  // Inferred metadata
  inferredTitle?: string
  inferredAbstract?: string
  inferredTopicCategory?: string
  inferredDescriptiveKeywords?: string
  inferredAttributeDescription?: string
  inferredExtent?: string
  inferredSpatialResolution?: string
  inferredResourceFormat?: string

  // File info
  fileSize?: number
  originalFileName?: string
  dataFormat?: string
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
    let extractedInfo: GeospatialInfo

    // Use ogrinfo if available
    if (ogrinfoAvailable) {
      const result = await extractWithOgrInfo(filePath, fileExt)
      if (!result.success || !result.data) {
        return result
      }
      extractedInfo = result.data
    } else {
      // Use fallback methods
      const result = await extractWithFallback(filePath, fileExt)
      if (!result.success || !result.data) {
        return result
      }
      extractedInfo = result.data
    }

    // Infer additional metadata fields
    const enhancedInfo = inferMetadataFields(extractedInfo, filePath)

    return {
      success: true,
      data: enhancedInfo
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

  // Infer additional metadata fields
  const enhancedData = inferMetadataFields(parsedData, filePath)

  return {
    success: true,
    data: enhancedData
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

    const basicInfo = {
      featureCount: features.length,
      geometryType,
      boundingBox,
      coordinateSystem: 'WGS84', // GeoJSON default
      attributes,
      layerName: path.basename(filePath, path.extname(filePath))
    }

    // Infer additional metadata fields
    const enhancedInfo = inferMetadataFields(basicInfo, filePath)

    return {
      success: true,
      data: enhancedInfo
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
 * Infer metadata fields from extracted geospatial information
 */
function inferMetadataFields(extractedInfo: GeospatialInfo, filePath: string): GeospatialInfo {
  const result = { ...extractedInfo }

  // Infer title from layer name or filename
  if (extractedInfo.layerName) {
    result.inferredTitle = extractedInfo.layerName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  } else {
    const fileName = path.basename(filePath, path.extname(filePath))
    result.inferredTitle = fileName
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Infer abstract based on geometry type and feature count
  const geomType = extractedInfo.geometryType.toLowerCase()
  const count = extractedInfo.featureCount
  let abstractTemplate = ''

  if (geomType.includes('point')) {
    abstractTemplate = `Dataset titik geospasial yang berisi ${count.toLocaleString()} fitur titik`
  } else if (geomType.includes('linestring') || geomType.includes('line')) {
    abstractTemplate = `Dataset garis geospasial yang berisi ${count.toLocaleString()} fitur garis`
  } else if (geomType.includes('polygon')) {
    abstractTemplate = `Dataset poligon geospasial yang berisi ${count.toLocaleString()} fitur poligon`
  } else {
    abstractTemplate = `Dataset geospasial yang berisi ${count.toLocaleString()} fitur`
  }

  if (extractedInfo.coordinateSystem) {
    abstractTemplate += ` dalam sistem koordinat ${extractedInfo.coordinateSystem}`
  }

  result.inferredAbstract = abstractTemplate + '. Data dapat digunakan untuk analisis spasial dan pemetaan.'

  // Infer topic category based on attribute names
  result.inferredTopicCategory = inferTopicCategory(extractedInfo.attributes)

  // Infer descriptive keywords from attributes
  result.inferredDescriptiveKeywords = extractDescriptiveKeywords(extractedInfo.attributes, extractedInfo.layerName)

  // Infer attribute description
  result.inferredAttributeDescription = generateAttributeDescription(extractedInfo.attributes)

  // Format bounding box as extent
  if (extractedInfo.boundingBox) {
    const bbox = extractedInfo.boundingBox
    result.inferredExtent = `${bbox.minX.toFixed(4)}°BT, ${bbox.maxX.toFixed(4)}°BT, ${bbox.minY.toFixed(4)}°LS, ${bbox.maxY.toFixed(4)}°LU`
  }

  // Infer spatial resolution (rough estimate)
  result.inferredSpatialResolution = estimateSpatialResolution(extractedInfo)

  // Infer resource format
  result.inferredResourceFormat = getFileFormat(filePath)

  // Add file information
  try {
    const stats = fs.statSync(filePath)
    result.fileSize = stats.size
    result.originalFileName = path.basename(filePath)
    result.dataFormat = getFileFormat(filePath)
  } catch (error) {
    // Ignore file stat errors
  }

  return result
}

/**
 * Infer topic category based on attribute names
 */
function inferTopicCategory(attributes: Array<{ name: string; type: string }>): string {
  const attrNames = attributes.map(attr => attr.name.toLowerCase())

  // Check for administrative boundaries
  if (attrNames.some(name => name.includes('prov') || name.includes('kab') || name.includes('kec') ||
      name.includes('desa') || name.includes('admin') || name.includes('boundary'))) {
    return 'boundaries'
  }

  // Check for transportation
  if (attrNames.some(name => name.includes('jalan') || name.includes('road') || name.includes('street') ||
      name.includes('highway') || name.includes('rail') || name.includes('transport'))) {
    return 'transportation'
  }

  // Check for water bodies
  if (attrNames.some(name => name.includes('sungai') || name.includes('river') || name.includes('danau') ||
      name.includes('lake') || name.includes('laut') || name.includes('sea') || name.includes('water'))) {
    return 'inlandWaters'
  }

  // Check for elevation/terrain
  if (attrNames.some(name => name.includes('elevasi') || name.includes('ketinggian') || name.includes('altitude') ||
      name.includes('dem') || name.includes('terrain') || name.includes('topo'))) {
    return 'elevation'
  }

  // Check for climate/weather
  if (attrNames.some(name => name.includes('suhu') || name.includes('temperature') || name.includes('curah') ||
      name.includes('hujan') || name.includes('rainfall') || name.includes('iklim') || name.includes('climate'))) {
    return 'climatology'
  }

  // Check for vegetation/biota
  if (attrNames.some(name => name.includes('vegetasi') || name.includes('tanaman') || name.includes('forest') ||
      name.includes('hutan') || name.includes('biota') || name.includes('habitat'))) {
    return 'biota'
  }

  // Check for population/society
  if (attrNames.some(name => name.includes('penduduk') || name.includes('population') || name.includes('demografi') ||
      name.includes('society') || name.includes('social'))) {
    return 'society'
  }

  // Check for economy
  if (attrNames.some(name => name.includes('ekonomi') || name.includes('economy') || name.includes('pdrb') ||
      name.includes('gdp') || name.includes('industri') || name.includes('industry'))) {
    return 'economy'
  }

  // Check for health
  if (attrNames.some(name => name.includes('kesehatan') || name.includes('health') || name.includes('rumah sakit') ||
      name.includes('hospital') || name.includes('medis'))) {
    return 'health'
  }

  // Check for utilities
  if (attrNames.some(name => name.includes('utilitas') || name.includes('utility') || name.includes('listrik') ||
      name.includes('electric') || name.includes('air') || name.includes('water'))) {
    return 'utilities'
  }

  // Default to planning if no specific category matches
  return 'planning'
}

/**
 * Extract descriptive keywords from attributes and layer name
 */
function extractDescriptiveKeywords(attributes: Array<{ name: string; type: string }>, layerName?: string): string {
  const keywords = new Set<string>()

  // Add keywords from layer name
  if (layerName) {
    const nameWords = layerName.toLowerCase().split(/[\s_-]+/)
    nameWords.forEach(word => {
      if (word.length > 2) keywords.add(word)
    })
  }

  // Add keywords from attribute names
  attributes.forEach(attr => {
    const attrWords = attr.name.toLowerCase().split(/[\s_-]+/)
    attrWords.forEach(word => {
      if (word.length > 2 && !['id', 'no', 'num', 'code'].includes(word)) {
        keywords.add(word)
      }
    })
  })

  // Add common geospatial keywords
  keywords.add('geospasial')
  keywords.add('spatial')
  keywords.add('gis')

  return Array.from(keywords).slice(0, 10).join(', ')
}

/**
 * Generate attribute description from attributes array
 */
function generateAttributeDescription(attributes: Array<{ name: string; type: string }>): string {
  if (attributes.length === 0) return ''

  const descriptions = attributes.map(attr => {
    const name = attr.name.toLowerCase()
    let description = `${attr.name}: ${attr.type}`

    // Add semantic descriptions for common attributes
    if (name.includes('id') || name === 'fid' || name === 'gid') {
      description += ' - identifier unik untuk fitur'
    } else if (name.includes('nama') || name.includes('name')) {
      description += ' - nama atau label fitur'
    } else if (name.includes('prov') || name.includes('province')) {
      description += ' - nama provinsi'
    } else if (name.includes('kab') || name.includes('regency')) {
      description += ' - nama kabupaten'
    } else if (name.includes('kec') || name.includes('district')) {
      description += ' - nama kecamatan'
    } else if (name.includes('desa') || name.includes('village')) {
      description += ' - nama desa'
    } else if (name.includes('luas') || name.includes('area')) {
      description += ' - luas wilayah dalam satuan luas'
    } else if (name.includes('panjang') || name.includes('length')) {
      description += ' - panjang dalam satuan panjang'
    } else if (name.includes('koordinat') || name.includes('coord')) {
      description += ' - koordinat geografis'
    } else {
      description += ' - atribut data'
    }

    return description
  })

  return descriptions.join(', ')
}

/**
 * Estimate spatial resolution based on data characteristics
 */
function estimateSpatialResolution(info: GeospatialInfo): string {
  // This is a rough estimation - in real scenarios, this would need more sophisticated analysis
  const bbox = info.boundingBox
  const width = Math.abs(bbox.maxX - bbox.minX)
  const height = Math.abs(bbox.maxY - bbox.minY)

  // Estimate based on bounding box size and feature count
  const area = width * height
  const avgFeatureDensity = info.featureCount / area

  if (avgFeatureDensity > 100) {
    return '1:1.000' // High density, detailed data
  } else if (avgFeatureDensity > 10) {
    return '1:10.000' // Medium density
  } else if (avgFeatureDensity > 1) {
    return '1:25.000' // Lower density
  } else {
    return '1:100.000' // Regional scale
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