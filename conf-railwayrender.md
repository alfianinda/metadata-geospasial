Ya, ada beberapa alternatif untuk ekstraksi metadata geospasial tanpa GDAL yang cocok untuk deployment gratis di Vercel. Berikut adalah opsi-opsi yang tersedia:

## 🆓 **Alternatif untuk Deployment Vercel:**

### **1. Client-Side Processing (Paling Mudah)**
**Library:** `shpjs`, `geotiff.js`, `gdal-js` (WebAssembly)

```javascript
// Contoh implementasi dengan shpjs
import shp from 'shpjs';

async function extractShapefileMetadata(file) {
  const geojson = await shp(file);
  
  return {
    featureCount: geojson.features.length,
    geometryType: geojson.features[0]?.geometry?.type || 'Unknown',
    boundingBox: calculateBoundingBox(geojson),
    attributes: extractAttributes(geojson),
    // dll
  };
}
```

**Keuntungan:**
- ✅ Tidak perlu server processing
- ✅ Bekerja di browser
- ✅ Mendukung Shapefile, GeoJSON
- ✅ Gratis untuk Vercel

### **2. Pure Node.js Libraries**
**Library:** `@mapbox/shp-write`, `shapefile`, `d3-geo`, `turf`

```javascript
// Contoh dengan shapefile library
import { open } from 'shapefile';

async function extractMetadata(filePath) {
  const source = await open(filePath);
  const features = [];
  
  // Read all features
  let feature;
  while ((feature = await source.read())) {
    features.push(feature);
  }
  
  return {
    featureCount: features.length,
    geometryType: features[0]?.geometry?.type,
    boundingBox: calculateBounds(features),
    attributes: extractProperties(features)
  };
}
```

### **3. Cloud-Based Geospatial APIs**
**Layanan:** Mapbox API, Google Maps API, Azure Maps, atau layanan geospatial lainnya

```javascript
// Contoh dengan Mapbox Dataset API
async function extractWithMapbox(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('https://api.mapbox.com/datasets/v1/{username}/features', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MAPBOX_ACCESS_TOKEN}`
    },
    body: formData
  });
  
  const data = await response.json();
  return {
    featureCount: data.features?.length || 0,
    geometryType: data.features?.[0]?.geometry?.type,
    // dll
  };
}
```

## 📋 **Rekomendasi Implementasi untuk Vercel:**

### **Opsi 1: Hybrid Client-Server (Recommended)**
```javascript
// pages/upload.tsx - Client-side extraction
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  
  // Client-side extraction untuk format sederhana
  if (file.name.endsWith('.geojson')) {
    const metadata = await extractGeoJSONMetadata(file);
    setGeospatialInfo(metadata);
  } else if (file.name.endsWith('.shp') || file.name.endsWith('.zip')) {
    // Untuk Shapefile, gunakan library JavaScript
    const metadata = await extractShapefileMetadata(file);
    setGeospatialInfo(metadata);
  }
  
  // Server-side processing untuk format kompleks jika diperlukan
  const serverResponse = await fetch('/api/extract-geospatial', {
    method: 'POST',
    body: formData
  });
};
```

### **Opsi 2: Full Client-Side Processing**
```javascript
// lib/clientExtractor.js
import shp from 'shpjs';
import * as turf from '@turf/turf';

export async function extractGeospatialMetadata(file) {
  const fileExt = file.name.split('.').pop().toLowerCase();
  
  switch (fileExt) {
    case 'geojson':
    case 'json':
      return await extractGeoJSON(file);
    
    case 'shp':
    case 'zip':
      return await extractShapefile(file);
    
    case 'tiff':
    case 'tif':
      return await extractGeoTIFF(file);
    
    default:
      return await extractBasicInfo(file);
  }
}

async function extractGeoJSON(file) {
  const text = await file.text();
  const geojson = JSON.parse(text);
  
  return {
    featureCount: geojson.features?.length || 1,
    geometryType: geojson.features?.[0]?.geometry?.type || geojson.geometry?.type,
    boundingBox: turf.bbox(geojson),
    coordinateSystem: 'EPSG:4326', // GeoJSON default
    attributes: extractAttributes(geojson),
    dataFormat: 'GeoJSON'
  };
}

async function extractShapefile(file) {
  const geojson = await shp(file);
  
  return {
    featureCount: geojson.features.length,
    geometryType: geojson.features[0]?.geometry?.type,
    boundingBox: turf.bbox(geojson),
    coordinateSystem: geojson.crs?.properties?.name || 'EPSG:4326',
    attributes: extractAttributes(geojson),
    dataFormat: 'Shapefile'
  };
}
```

## 🛠 **Libraries yang Bisa Digunakan:**

### **Untuk Shapefile:**
- `shpjs` - Parse Shapefile di browser
- `shapefile` - Node.js Shapefile parser
- `@mapbox/shp-write` - Shapefile utilities

### **Untuk GeoTIFF:**
- `geotiff.js` - Parse GeoTIFF di browser
- `geotiff` - Node.js GeoTIFF parser

### **Untuk Geospatial Processing:**
- `@turf/turf` - Geospatial analysis
- `d3-geo` - Geographic projections
- `proj4` - Coordinate system transformations

### **Untuk File Processing:**
- `jszip` - Handle ZIP files
- `file-saver` - Client-side file saving

## 🚀 **Implementasi Lengkap:**

```javascript
// lib/geospatialExtractor.js
import shp from 'shpjs';
import * as turf from '@turf/turf';
import JSZip from 'jszip';

export class GeospatialExtractor {
  static async extract(file) {
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.geojson') || fileName.endsWith('.json')) {
        return await this.extractGeoJSON(file);
      } else if (fileName.endsWith('.zip')) {
        return await this.extractZippedShapefile(file);
      } else if (fileName.endsWith('.shp')) {
        return await this.extractShapefile(file);
      } else {
        return await this.extractBasic(file);
      }
    } catch (error) {
      console.error('Extraction error:', error);
      return await this.extractBasic(file);
    }
  }

  static async extractGeoJSON(file) {
    const text = await file.text();
    const geojson = JSON.parse(text);
    
    const bbox = turf.bbox(geojson);
    
    return {
      featureCount: geojson.features?.length || 1,
      geometryType: geojson.features?.[0]?.geometry?.type || geojson.geometry?.type || 'Unknown',
      boundingBox: {
        minX: bbox[0],
        minY: bbox[1], 
        maxX: bbox[2],
        maxY: bbox[3]
      },
      coordinateSystem: geojson.crs?.properties?.name || 'EPSG:4326',
      attributes: this.extractAttributes(geojson),
      layerName: file.name.replace(/\.(geojson|json)$/i, ''),
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'GeoJSON'
    };
  }

  static async extractZippedShapefile(file) {
    const zip = await JSZip.loadAsync(file);
    
    // Find Shapefile components in ZIP
    const shpFile = Object.values(zip.files).find(f => f.name.endsWith('.shp'));
    const dbfFile = Object.values(zip.files).find(f => f.name.endsWith('.dbf'));
    const prjFile = Object.values(zip.files).find(f => f.name.endsWith('.prj'));
    
    if (!shpFile || !dbfFile) {
      throw new Error('ZIP tidak berisi komponen Shapefile yang lengkap');
    }
    
    // Extract files
    const shpBuffer = await shpFile.async('arraybuffer');
    const dbfBuffer = await dbfFile.async('arraybuffer');
    
    // Use shpjs to parse
    const geojson = await shp({
      shp: shpBuffer,
      dbf: dbfBuffer
    });
    
    const bbox = turf.bbox(geojson);
    
    return {
      featureCount: geojson.features.length,
      geometryType: geojson.features[0]?.geometry?.type || 'Unknown',
      boundingBox: {
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2], 
        maxY: bbox[3]
      },
      coordinateSystem: prjFile ? 'EPSG:4326' : 'Unknown', // Could parse .prj file
      attributes: this.extractAttributes(geojson),
      layerName: shpFile.name.replace(/\.shp$/i, ''),
      fileSize: file.size,
      originalFileName: file.name,
      dataFormat: 'Shapefile (ZIP)'
    };
  }

  static extractAttributes(geojson) {
    if (!geojson.features || geojson.features.length === 0) return [];
    
    const sampleFeature = geojson.features[0];
    if (!sampleFeature.properties) return [];
    
    return Object.keys(sampleFeature.properties).map(key => ({
      name: key,
      type: this.inferType(sampleFeature.properties[key])
    }));
  }

  static inferType(value) {
    if (value === null || value === undefined) return 'String';
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Real';
    if (typeof value === 'boolean') return 'String';
    return 'String';
  }

  static async extractBasic(file) {
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
}
```

## 📦 **Dependencies untuk Vercel:**

```json
// package.json
{
  "dependencies": {
    "shpjs": "^4.0.4",
    "@turf/turf": "^6.5.0",
    "jszip": "^3.10.1",
    "geotiff": "^2.0.7",
    "file-saver": "^2.0.5"
  }
}
```

## 🎯 **Keuntungan Menggunakan Client-Side Processing:**

1. **✅ Gratis di Vercel** - Tidak perlu server dengan GDAL
2. **✅ Lebih Cepat** - Processing di browser user
3. **✅ Tidak Ada Limitasi Server** - Tidak terpengaruh quota serverless
4. **✅ Offline Capable** - Bisa bekerja tanpa internet (untuk format sederhana)
5. **✅ Scalable** - Load balancing otomatis oleh browser

## 🔄 **Migrasi dari GDAL:**

Untuk migrasi, Anda bisa:

1. **Ganti `extractWithOgrInfo`** dengan client-side extraction
2. **Simpan hasil ekstraksi** di state/localStorage
3. **Kirim ke server** hanya data yang sudah diekstrak
4. **Fallback ke server** jika client-side gagal

Implementasi ini akan membuat aplikasi Anda bisa di-deploy gratis di Vercel tanpa kehilangan fitur ekstraksi otomatis!
----------------------
🛠️ Solusi untuk Auto-fill Metadata:
Opsi 1: Install GDAL (Recommended)

# Untuk Windows, download dari:
# https://gdal.org/download.html
# atau install via conda:
conda install gdal

bash


Opsi 2: Gunakan GeoJSON (Immediate)

Konversi file Shapefile ke GeoJSON menggunakan tools seperti:
QGIS (Save as GeoJSON)
GDAL command: ogr2ogr -f GeoJSON output.geojson input.shp
Online converter tools
Opsi 3: Manual Entry (Fallback)

Upload file Shapefile tanpa auto-fill
Isi metadata secara manual di form

---------

Railway & Render: Free Tiers & Next.js Support
Ya, keduanya punya free tier dan support Next.js penuh!

🚂 Railway
Free Tier:

✅ $5 credit untuk new users (cukup untuk testing)
✅ 512MB RAM, 1GB disk
✅ Sleep after 30 minutes of inactivity
✅ PostgreSQL database included
❌ Tidak ada hard limit, tapi auto-sleep
Next.js Support:

✅ Full support - bisa deploy langsung dari GitHub
✅ Environment variables support
✅ Custom domains
✅ Auto-scaling
✅ Build & deploy logs
Setup GDAL di Railway:

# Di Dockerfile atau nixpacks (auto-detected)
RUN apt-get update && apt-get install -y gdal-bin
🎨 Render
Free Tier:

✅ 750 jam/bulan (~31 hari penuh)
✅ 512MB RAM
✅ 1 static site + 1 web service
✅ PostgreSQL database (7 hari trial)
❌ Sleep setelah 15 menit tidak aktif
Next.js Support:

✅ Full support - one-click deploy
✅ Environment variables
✅ Custom domains
✅ Auto-SSL
✅ Build previews
Setup GDAL di Render:

# render.yaml
services:
  - type: web
    name: geospatial-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: GDAL_AVAILABLE
        value: true
    packages:
      - gdal-bin
🏆 Perbandingan untuk Project Ini:
Feature	Railway	Render	Vercel
Free Tier	$5 credit	750 jam/bulan	100GB bandwidth
GDAL Support	✅ Full	✅ Full	❌ None
Next.js	✅ Perfect	✅ Perfect	✅ Perfect
Database	✅ Built-in	✅ Add-on	❌ Manual
Sleep Policy	30 min	15 min	Always on
Pricing	$5+/month	$7+/month	$0-20+/month
🚀 Rekomendasi untuk Anda:
Gunakan Railway karena:

Lebih mudah setup GDAL
Database built-in (cocok untuk Prisma)
Credit $5 cukup untuk development
Wake up otomatis saat ada request
Migration Steps:

# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login & init
railway login
railway init

# 3. Connect database
railway add postgresql

# 4. Deploy
railway up
Environment Variables:

# Railway akan auto-set DATABASE_URL
# Tinggal set JWT_SECRET, dll
railway variables set JWT_SECRET=your-secret
💡 Quick Start:
Railway: https://railway.app (recommended)
Render: https://render.com
Connect GitHub repo
Auto-deploy on push
GDAL akan work out-of-the-box
Kedua platform ini jauh lebih cocok untuk aplikasi geospasial dengan GDAL dibandingkan Vercel!