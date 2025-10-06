import * as shapefile from 'shapefile';
import JSZip from 'jszip';

export interface ClientGeospatialInfo {
  // Basic extracted info
  featureCount: number;
  geometryType: string;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  coordinateSystem: string;
  attributes: Array<{
    name: string;
    type: string;
  }>;
  layerName: string;

  // Inferred metadata
  inferredTitle?: string;
  inferredAbstract?: string;
  inferredTopicCategory?: string;
  inferredDescriptiveKeywords?: string;
  inferredAttributeDescription?: string;
  inferredExtent?: string;
  inferredSpatialResolution?: string;
  inferredResourceFormat?: string;

  // File info
  fileSize?: number;
  originalFileName?: string;
  dataFormat?: string;
}

export interface ClientExtractionResult {
  success: boolean;
  data?: ClientGeospatialInfo;
  error?: string;
}

/**
 * Client-side geospatial metadata extractor
 * Replaces GDAL/ogrinfo for Vercel deployment
 */
export class ClientGeospatialExtractor {

  /**
   * Main extraction method - supports single file or multiple files for Shapefile
   */
  static async extract(fileOrFiles: File | File[]): Promise<ClientExtractionResult> {
    try {
      const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
      const firstFile = files[0];
      const fileName = firstFile.name.toLowerCase();

      let result: ClientGeospatialInfo;

      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        result = await this.extractGeoJSON(firstFile);
      } else if (fileName.endsWith('.zip')) {
        result = await this.extractZippedShapefile(firstFile);
      } else if (fileName.endsWith('.shp') && files.length > 1) {
        // Multiple files - likely Shapefile components
        result = await this.extractShapefile(files);
      } else if (fileName.endsWith('.shp')) {
        // Single .shp file - fallback to basic extraction
        result = await this.extractShapefile([firstFile]);
      } else if (fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
        result = await this.extractGeoTIFF(firstFile);
      } else {
        result = await this.extractBasic(firstFile);
      }

      // Infer additional metadata fields
      const enhancedResult = this.inferMetadataFields(result);

      return {
        success: true,
        data: enhancedResult
      };

    } catch (error) {
      console.error('Client extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown extraction error'
      };
    }
  }

  /**
   * Extract metadata from GeoJSON file
   */
  private static async extractGeoJSON(file: File): Promise<ClientGeospatialInfo> {
    const text = await file.text();
    const geojson = JSON.parse(text);

    // Handle both FeatureCollection and single Feature
    let features = [];
    if (geojson.type === 'FeatureCollection') {
      features = geojson.features || [];
    } else if (geojson.type === 'Feature') {
      features = [geojson];
    }

    // Calculate bounding box
    let bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

    if (features.length > 0) {
      bbox = this.calculateManualBoundingBox(features);
    }

    // Extract attributes from first feature
    const attributes = this.extractAttributes(features);

    // Determine geometry type
    const geometryType = features.length > 0 && features[0].geometry
      ? features[0].geometry.type
      : 'Unknown';

    return {
      featureCount: features.length,
      geometryType,
      boundingBox: bbox,
      coordinateSystem: geojson.crs?.properties?.name || 'EPSG:4326',
      attributes,
      layerName: file.name.replace(/\.(geojson|json)$/i, ''),
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'GeoJSON'
    };
  }

  /**
   * Extract metadata from zipped Shapefile
   */
  private static async extractZippedShapefile(file: File): Promise<ClientGeospatialInfo> {
    const zip = await JSZip.loadAsync(file);

    // Find Shapefile components
    const shpFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.shp'));
    const dbfFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.dbf'));
    const prjFile = Object.values(zip.files).find(f => !f.dir && f.name.toLowerCase().endsWith('.prj'));

    if (!shpFile) {
      throw new Error('ZIP file tidak berisi file .shp');
    }

    // Extract file buffers
    const shpBuffer = await shpFile.async('arraybuffer');
    let dbfBuffer: ArrayBuffer | undefined;
    if (dbfFile) {
      dbfBuffer = await dbfFile.async('arraybuffer');
    }

    // Parse with shapefile library
    const features: any[] = [];
    const attributes: Array<{ name: string; type: string }> = [];

    try {
      // Use shapefile library for ZIP parsing
      const source = await shapefile.open(shpBuffer, dbfBuffer);

      // Read all features
      let result = await source.read();
      while (!result.done) {
        features.push(result.value);
        result = await source.read();
      }

      // Extract attributes from the first feature if available
      if (features.length > 0 && features[0].properties) {
        const attrKeys = Object.keys(features[0].properties);
        attrKeys.forEach(key => {
          const value = features[0].properties[key];
          const type = this.inferAttributeType(value);
          attributes.push({ name: key, type });
        });
      }

    } catch (error) {
      console.error('Error parsing Shapefile from ZIP:', error);
      throw new Error(`Failed to parse Shapefile from ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Calculate bounding box
    let bbox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    if (features.length > 0) {
      bbox = this.calculateManualBoundingBox(features);
    }

    // Try to determine coordinate system from .prj file
    let coordinateSystem = 'EPSG:4326'; // Default
    if (prjFile) {
      try {
        const prjContent = await prjFile.async('text');
        coordinateSystem = this.parsePrjFile(prjContent);
      } catch (error) {
        console.warn('Could not parse .prj file:', error);
      }
    }

    // Determine geometry type
    let geometryType = 'Unknown';
    if (features.length > 0 && features[0].geometry) {
      geometryType = features[0].geometry.type;
    }

    return {
      featureCount: features.length,
      geometryType,
      boundingBox: bbox,
      coordinateSystem,
      attributes,
      layerName: shpFile.name.replace(/\.shp$/i, ''),
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'Shapefile (ZIP)'
    };
  }

  /**
   * Extract metadata from Shapefile components (multiple files)
   */
  private static async extractShapefile(files: File[]): Promise<ClientGeospatialInfo> {
    // Find Shapefile components
    const shpFile = files.find(f => f.name.toLowerCase().endsWith('.shp'));
    const dbfFile = files.find(f => f.name.toLowerCase().endsWith('.dbf'));
    const prjFile = files.find(f => f.name.toLowerCase().endsWith('.prj'));
    const shxFile = files.find(f => f.name.toLowerCase().endsWith('.shx'));

    // Basic validation - need at least .shp file
    if (!shpFile) {
      console.warn('No .shp file found in Shapefile components');
      return {
        featureCount: 0,
        geometryType: 'Unknown',
        boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
        coordinateSystem: 'Unknown',
        attributes: [],
        layerName: 'Unknown Shapefile',
        fileSize: 0,
        originalFileName: 'Unknown',
        dataFormat: 'Shapefile (No .shp file)'
      };
    }

    // Check which files are available
    const hasDbf = !!dbfFile;
    const hasPrj = !!prjFile;
    const hasShx = !!shxFile;

    try {
      const shpBuffer = await shpFile.arrayBuffer();

      let features: any[] = [];
      let attributes: Array<{ name: string; type: string }> = [];

      // Try to parse with shapefile library - handle both cases (with and without DBF)
      try {
        if (hasDbf) {
          // Extract both geometry and attributes
          const dbfBuffer = await dbfFile.arrayBuffer();

          // Use shapefile library to parse Shapefile with both .shp and .dbf
          const source = await shapefile.open(shpBuffer, dbfBuffer);

          // Read all features
          let result = await source.read();
          while (!result.done) {
            features.push(result.value);
            result = await source.read();
          }

          // Extract attributes from features
          attributes = this.extractAttributes(features);
        } else {
          // Extract geometry only (no attributes available)
          // Use shapefile library for geometry-only parsing
          const source = await shapefile.open(shpBuffer);

          // Read all features
          let result = await source.read();
          while (!result.done) {
            features.push(result.value);
            result = await source.read();
          }
        }
      } catch (parseError) {
        console.error('shapefile parsing failed:', parseError);
        // If parsing fails, try alternative approach or provide basic info
        throw new Error(`Shapefile parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
      }

      // Validate that we have features
      if (features.length === 0) {
        console.warn('No features found in Shapefile');
        return {
          featureCount: 0,
          geometryType: 'Unknown',
          boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
          coordinateSystem: 'EPSG:4326',
          attributes: [],
          layerName: shpFile.name.replace(/\.shp$/i, ''),
          fileSize: shpFile.size,
          originalFileName: shpFile.name,
          dataFormat: 'Shapefile (No Features)'
        };
      }

      // Calculate bounding box using turf
      let bbox: { minX: number; minY: number; maxX: number; maxY: number };
      bbox = this.calculateManualBoundingBox(features);

      // If manual calculation failed, try to get bbox from Shapefile metadata
      if (bbox.minX === 0 && bbox.minY === 0 && bbox.maxX === 0 && bbox.maxY === 0) {
        // Try to extract bbox from the first feature's geometry bounds if available
        if (features.length > 0 && features[0].geometry) {
          const geom = features[0].geometry;

          // Some Shapefile parsers include bbox in geometry
          if (geom.bbox && Array.isArray(geom.bbox) && geom.bbox.length >= 4) {
            bbox = {
              minX: geom.bbox[0],
              minY: geom.bbox[1],
              maxX: geom.bbox[2],
              maxY: geom.bbox[3]
            };
          }
        }
      }

      // Try to determine coordinate system from .prj file
      let coordinateSystem = 'EPSG:4326'; // Default WGS84
      if (prjFile) {
        try {
          const prjContent = await prjFile.text();
          coordinateSystem = this.parsePrjFile(prjContent);
        } catch (error) {
          console.warn('Could not parse .prj file:', error);
          coordinateSystem = 'EPSG:4326'; // Fallback to WGS84
        }
      }

      // Determine geometry type from first valid feature
      let geometryType = 'Unknown';
      for (const feature of features) {
        if (feature.geometry && feature.geometry.type) {
          geometryType = feature.geometry.type;
          break;
        }
      }

      return {
        featureCount: features.length,
        geometryType,
        boundingBox: bbox,
        coordinateSystem,
        attributes,
        layerName: shpFile.name.replace(/\.shp$/i, ''),
        fileSize: shpFile.size,
        originalFileName: shpFile.name,
        dataFormat: hasDbf ? 'Shapefile' : 'Shapefile (Geometry Only)'
      };

    } catch (error) {
      console.error('Error parsing Shapefile:', error);

      // More detailed error handling - but still provide basic file info
      let errorType = 'Parse Error';
      if (error instanceof Error) {
        if (error.message.includes('Invalid')) {
          errorType = 'Invalid Format';
        } else if (error.message.includes('Unsupported')) {
          errorType = 'Unsupported Version';
        } else if (error.message.includes('Corrupt')) {
          errorType = 'Corrupted File';
        }
      }

      // Return basic file info even on parsing error - allows upload to continue
      return {
        featureCount: 0, // Will be filled from server-side if available
        geometryType: 'Unknown', // Will be filled from server-side if available
        boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, // Will be filled from server-side if available
        coordinateSystem: 'EPSG:4326', // Default assumption
        attributes: [], // Will be filled from server-side if available
        layerName: shpFile.name.replace(/\.shp$/i, ''),
        fileSize: shpFile.size,
        originalFileName: shpFile.name,
        dataFormat: `Shapefile (${errorType})`
      };
    }
  }

  /**
   * Extract metadata from GeoTIFF file
   */
  private static async extractGeoTIFF(file: File): Promise<ClientGeospatialInfo> {
    // Basic GeoTIFF info - could be enhanced with geotiff library
    return {
      featureCount: 1, // Single raster
      geometryType: 'Raster',
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 }, // Would need to parse actual bounds
      coordinateSystem: 'Unknown', // Would need to parse from GeoTIFF metadata
      attributes: [],
      layerName: file.name.replace(/\.(tiff|tif)$/i, ''),
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'GeoTIFF'
    };
  }

  /**
   * Extract basic file information for unsupported formats
   */
  private static async extractBasic(file: File): Promise<ClientGeospatialInfo> {
    return {
      featureCount: 0,
      geometryType: 'Unknown',
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      coordinateSystem: 'Unknown',
      attributes: [],
      layerName: file.name.split('.')[0],
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'Unknown'
    };
  }

  /**
   * Extract attributes from GeoJSON features
   */
  private static extractAttributes(features: any[]): Array<{ name: string; type: string }> {
    if (!features || features.length === 0) return [];

    const sampleFeature = features[0];
    if (!sampleFeature.properties) return [];

    return Object.keys(sampleFeature.properties).map(key => ({
      name: key,
      type: this.inferAttributeType(sampleFeature.properties[key])
    }));
  }

  /**
   * Infer attribute type from value
   */
  private static inferAttributeType(value: any): string {
    if (value === null || value === undefined) return 'String';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Real';
    if (typeof value === 'boolean') return 'String'; // GeoJSON doesn't have boolean type
    if (value instanceof Date) return 'Date';
    return 'String';
  }

  /**
   * Parse coordinate system from .prj file content
   */
  private static parsePrjFile(prjContent: string): string {
    // Simple parsing for common EPSG codes
    if (prjContent.includes('WGS_1984') || prjContent.includes('WGS84') || prjContent.includes('WGS 1984')) {
      return 'EPSG:4326';
    }
    if (prjContent.includes('EPSG') || prjContent.includes('AUTHORITY')) {
      const epsgMatch = prjContent.match(/EPSG["\s:,]+(\d+)/i);
      if (epsgMatch) {
        return `EPSG:${epsgMatch[1]}`;
      }
    }

    // Try to identify UTM zones
    if (prjContent.includes('UTM')) {
      const utmMatch = prjContent.match(/UTM["\s:,]+(\d+)/i);
      if (utmMatch) {
        const zone = parseInt(utmMatch[1]);
        // Northern hemisphere UTM
        return `EPSG:326${zone.toString().padStart(2, '0')}`;
      }
    }

    // Try to identify common Indonesian coordinate systems
    if (prjContent.includes('DGN95') || prjContent.includes('Datum Geodesi Nasional 1995')) {
      return 'EPSG:4755'; // DGN95
    }

    // Default to WGS84 if we can't parse it
    return 'EPSG:4326';
  }

  /**
   * Infer additional metadata fields from extracted data
   */
  private static inferMetadataFields(extractedInfo: ClientGeospatialInfo): ClientGeospatialInfo {
    const result = { ...extractedInfo };

    // Infer title from layer name or filename
    if (extractedInfo.layerName) {
      result.inferredTitle = extractedInfo.layerName
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    } else {
      const fileName = extractedInfo.originalFileName?.split('.')[0] || 'Dataset';
      result.inferredTitle = fileName
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Infer abstract based on geometry type and feature count
    const geomType = extractedInfo.geometryType.toLowerCase();
    const count = extractedInfo.featureCount;
    let abstractTemplate = '';

    if (geomType.includes('point')) {
      abstractTemplate = `Dataset titik geospasial yang berisi ${count.toLocaleString()} fitur titik`;
    } else if (geomType.includes('linestring') || geomType.includes('line')) {
      abstractTemplate = `Dataset garis geospasial yang berisi ${count.toLocaleString()} fitur garis`;
    } else if (geomType.includes('polygon')) {
      abstractTemplate = `Dataset poligon geospasial yang berisi ${count.toLocaleString()} fitur poligon`;
    } else if (geomType.includes('raster')) {
      abstractTemplate = `Dataset raster geospasial`;
    } else {
      abstractTemplate = `Dataset geospasial yang berisi ${count.toLocaleString()} fitur`;
    }

    if (extractedInfo.coordinateSystem && extractedInfo.coordinateSystem !== 'Unknown') {
      abstractTemplate += ` dalam sistem koordinat ${extractedInfo.coordinateSystem}`;
    }

    result.inferredAbstract = abstractTemplate + '. Data dapat digunakan untuk analisis spasial dan pemetaan.';

    // Infer topic category based on attribute names
    result.inferredTopicCategory = this.inferTopicCategory(extractedInfo.attributes);

    // Infer descriptive keywords
    result.inferredDescriptiveKeywords = this.extractDescriptiveKeywords(extractedInfo.attributes, extractedInfo.layerName);

    // Infer attribute description
    result.inferredAttributeDescription = this.generateAttributeDescription(extractedInfo.attributes);

    // Format bounding box as extent
    if (extractedInfo.boundingBox &&
        extractedInfo.boundingBox.minX !== Infinity &&
        extractedInfo.boundingBox.maxX !== -Infinity) {
      const bbox = extractedInfo.boundingBox;
      result.inferredExtent = `${bbox.minX.toFixed(4)}°BT, ${bbox.maxX.toFixed(4)}°BT, ${bbox.minY.toFixed(4)}°LS, ${bbox.maxY.toFixed(4)}°LU`;
    }

    // Infer spatial resolution
    result.inferredSpatialResolution = this.estimateSpatialResolution(extractedInfo);

    // Infer resource format
    result.inferredResourceFormat = extractedInfo.dataFormat || 'Unknown';

    return result;
  }

  /**
   * Infer topic category based on attribute names
   */
  private static inferTopicCategory(attributes: Array<{ name: string; type: string }>): string {
    const attrNames = attributes.map(attr => attr.name.toLowerCase());

    // Check for administrative boundaries
    if (attrNames.some(name => name.includes('prov') || name.includes('kab') || name.includes('kec') ||
        name.includes('desa') || name.includes('admin') || name.includes('boundary'))) {
      return 'boundaries';
    }

    // Check for transportation
    if (attrNames.some(name => name.includes('jalan') || name.includes('road') || name.includes('street') ||
        name.includes('highway') || name.includes('rail') || name.includes('transport'))) {
      return 'transportation';
    }

    // Check for water bodies
    if (attrNames.some(name => name.includes('sungai') || name.includes('river') || name.includes('danau') ||
        name.includes('lake') || name.includes('laut') || name.includes('sea') || name.includes('water'))) {
      return 'inlandWaters';
    }

    // Check for elevation/terrain
    if (attrNames.some(name => name.includes('elevasi') || name.includes('ketinggian') || name.includes('altitude') ||
        name.includes('dem') || name.includes('terrain') || name.includes('topo'))) {
      return 'elevation';
    }

    // Check for climate/weather
    if (attrNames.some(name => name.includes('suhu') || name.includes('temperature') || name.includes('curah') ||
        name.includes('hujan') || name.includes('rainfall') || name.includes('iklim') || name.includes('climate'))) {
      return 'climatology';
    }

    // Check for vegetation/biota
    if (attrNames.some(name => name.includes('vegetasi') || name.includes('tanaman') || name.includes('forest') ||
        name.includes('hutan') || name.includes('biota') || name.includes('habitat'))) {
      return 'biota';
    }

    // Check for population/society
    if (attrNames.some(name => name.includes('penduduk') || name.includes('population') || name.includes('demografi') ||
        name.includes('society') || name.includes('social'))) {
      return 'society';
    }

    // Check for economy
    if (attrNames.some(name => name.includes('ekonomi') || name.includes('economy') || name.includes('pdrb') ||
        name.includes('gdp') || name.includes('industri') || name.includes('industry'))) {
      return 'economy';
    }

    // Check for health
    if (attrNames.some(name => name.includes('kesehatan') || name.includes('health') || name.includes('rumah sakit') ||
        name.includes('hospital') || name.includes('medis'))) {
      return 'health';
    }

    // Check for utilities
    if (attrNames.some(name => name.includes('utilitas') || name.includes('utility') || name.includes('listrik') ||
        name.includes('electric') || name.includes('air') || name.includes('water'))) {
      return 'utilities';
    }

    // Default to planning if no specific category matches
    return 'planning';
  }

  /**
   * Extract descriptive keywords from attributes and layer name
   */
  private static extractDescriptiveKeywords(attributes: Array<{ name: string; type: string }>, layerName?: string): string {
    const keywords = new Set<string>();

    // Add keywords from layer name
    if (layerName) {
      const nameWords = layerName.toLowerCase().split(/[\s_-]+/);
      nameWords.forEach(word => {
        if (word.length > 2) keywords.add(word);
      });
    }

    // Add keywords from attribute names
    attributes.forEach(attr => {
      const attrWords = attr.name.toLowerCase().split(/[\s_-]+/);
      attrWords.forEach(word => {
        if (word.length > 2 && !['id', 'no', 'num', 'code'].includes(word)) {
          keywords.add(word);
        }
      });
    });

    // Add common geospatial keywords
    keywords.add('geospasial');
    keywords.add('spatial');
    keywords.add('gis');

    return Array.from(keywords).slice(0, 10).join(', ');
  }

  /**
   * Generate attribute description from attributes array
   */
  private static generateAttributeDescription(attributes: Array<{ name: string; type: string }>): string {
    if (attributes.length === 0) return '';

    const descriptions = attributes.map(attr => {
      const name = attr.name.toLowerCase();
      let description = `${attr.name}: ${attr.type}`;

      // Add semantic descriptions for common attributes
      if (name.includes('id') || name === 'fid' || name === 'gid') {
        description += ' - identifier unik untuk fitur';
      } else if (name.includes('nama') || name.includes('name')) {
        description += ' - nama atau label fitur';
      } else if (name.includes('prov') || name.includes('province')) {
        description += ' - nama provinsi';
      } else if (name.includes('kab') || name.includes('regency')) {
        description += ' - nama kabupaten';
      } else if (name.includes('kec') || name.includes('district')) {
        description += ' - nama kecamatan';
      } else if (name.includes('desa') || name.includes('village')) {
        description += ' - nama desa';
      } else if (name.includes('luas') || name.includes('area')) {
        description += ' - luas wilayah dalam satuan luas';
      } else if (name.includes('panjang') || name.includes('length')) {
        description += ' - panjang dalam satuan panjang';
      } else if (name.includes('koordinat') || name.includes('coord')) {
        description += ' - koordinat geografis';
      } else {
        description += ' - atribut data';
      }

      return description;
    });

    return descriptions.join('\n');
  }

  /**
   * Calculate bounding box manually from GeoJSON features
   */
  private static calculateManualBoundingBox(features: any[]): { minX: number; minY: number; maxX: number; maxY: number } {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const bbox = { minX, minY, maxX, maxY };

    console.log('Starting bbox calculation for', features.length, 'features');

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      if (feature.geometry && feature.geometry.coordinates) {
        console.log(`Processing feature ${i}, geometry type:`, feature.geometry.type);
        this.updateBoundingBoxFromCoordinates(feature.geometry.coordinates, bbox);
        console.log(`After processing feature ${i}, bbox state:`, { ...bbox });
      } else {
        console.log(`Feature ${i} has no valid geometry`);
      }
    }

    // If no valid coordinates found, return default bbox
    if (bbox.minX === Infinity || bbox.maxX === -Infinity) {
      console.log('No valid coordinates found, returning zero bbox');
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    console.log('Final bbox result:', { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY });
    return { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY };
  }


  /**
   * Update bounding box from geometry coordinates recursively
   */
  private static updateBoundingBoxFromCoordinates(coordinates: any, bbox: any) {
    if (Array.isArray(coordinates)) {
      if (coordinates.length >= 2 && typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
        // Point coordinates [lng, lat] or [x, y]
        const [x, y] = coordinates;
        console.log(`✓ Polygon point [${x}, ${y}] -> bbox: [${bbox.minX}, ${bbox.minY}, ${bbox.maxX}, ${bbox.maxY}]`);
        if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
          bbox.minX = Math.min(bbox.minX, x);
          bbox.minY = Math.min(bbox.minY, y);
          bbox.maxX = Math.max(bbox.maxX, x);
          bbox.maxY = Math.max(bbox.maxY, y);
          console.log(`  Updated bbox: [${bbox.minX}, ${bbox.minY}, ${bbox.maxX}, ${bbox.maxY}]`);
        } else {
          console.log(`  Invalid coordinates: [${x}, ${y}]`);
        }
      } else {
        // Nested coordinates (LineString, Polygon, MultiGeometry, etc.)
        coordinates.forEach((coord: any) => {
          this.updateBoundingBoxFromCoordinates(coord, bbox);
        });
      }
    }
  }

  /**
   * Estimate spatial resolution based on data characteristics
   */
  private static estimateSpatialResolution(info: ClientGeospatialInfo): string {
    const bbox = info.boundingBox;
    const width = Math.abs(bbox.maxX - bbox.minX);
    const height = Math.abs(bbox.maxY - bbox.minY);

    // Estimate based on bounding box size and feature count
    const area = width * height;
    const avgFeatureDensity = info.featureCount / area;

    if (avgFeatureDensity > 100) {
      return '1:1.000'; // High density, detailed data
    } else if (avgFeatureDensity > 10) {
      return '1:10.000'; // Medium density
    } else if (avgFeatureDensity > 1) {
      return '1:25.000'; // Lower density
    } else {
      return '1:100.000'; // Regional scale
    }
  }
}