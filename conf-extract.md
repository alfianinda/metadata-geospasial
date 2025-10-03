Berdasarkan kode yang saya analisis, berikut adalah penjelasan lengkap tentang ekstraksi data geospasial otomatis:

## 🔍 **Teknologi Ekstraksi Data Geospasial**

### **1. Tools yang Digunakan:**
- **GDAL/ogrinfo**: Tool utama untuk ekstraksi metadata dari file Shapefile (.shp)
- **Fallback Parser**: Untuk file GeoJSON (.geojson/.json) menggunakan parser JavaScript native
- **File Support**: GeoJSON, Shapefile (.shp+.shx+.dbf), dan format terkompresi (ZIP/RAR)

### **2. Data yang Diekstrak:**
```javascript
interface GeospatialInfo {
  // Basic extracted info
  featureCount: number           // Jumlah fitur dalam dataset
  geometryType: string          // Tipe geometri (Point, LineString, Polygon)
  boundingBox: {                // Kotak pembatas (extent)
    minX, minY, maxX, maxY
  }
  coordinateSystem: string      // Sistem koordinat (EPSG:4326, dll)
  attributes: Array<{           // Schema atribut
    name: string, type: string
  }>
  layerName: string            // Nama layer
  
  // File info
  fileSize: number
  originalFileName: string
  dataFormat: string
}
```

## 📝 **Field Metadata yang Diisi Otomatis**

### **Field yang Terisi Saat Upload:**

1. **Title** (`inferredTitle`)
   - Diambil dari nama layer atau nama file
   - Format: "NamaFile" → "Nama File" (dengan kapitalisasi proper)

2. **Abstract** (`inferredAbstract`) 
   - Template otomatis berdasarkan tipe geometri dan jumlah fitur
   - Contoh: "Dataset poligon geospasial yang berisi 1,250 fitur poligon dalam sistem koordinat EPSG:4326"

3. **Purpose** (`purpose`)
   - Format: "Dataset berisi [jumlah] fitur geospasial"
   - Contoh: "Dataset berisi 1,250 fitur geospasial"

4. **Reference System Identifier** (`referenceSystemIdentifier`)
   - Sistem koordinat yang terdeteksi (EPSG:4326, dll)

5. **Extent** (`inferredExtent`)
   - Bounding box dalam format: "minX°BT, maxX°BT, minY°LS, maxY°LU"
   - Contoh: "95.0°BT, 141.0°BT, -11.0°LS, 6.0°LU"

6. **Topic Category** (`inferredTopicCategory`)
   - Klasifikasi otomatis berdasarkan nama atribut:
     - `boundaries` → jika ada atribut prov/kab/kec/admin
     - `transportation` → jika ada atribut jalan/road/highway
     - `inlandWaters` → jika ada atribut sungai/river/lake
     - `elevation` → jika ada atribut elevasi/ketinggian
     - dll.

7. **Descriptive Keywords** (`inferredDescriptiveKeywords`)
   - Kata kunci otomatis dari nama atribut dan layer
   - Ditambah keyword standar: "geospasial", "spatial", "gis"

8. **Attribute Description** (`inferredAttributeDescription`)
   - Deskripsi detail setiap atribut dengan penjelasan semantik
   - Contoh: "provinsi: String - nama provinsi, luas_km2: Real - luas wilayah dalam satuan luas"

9. **Spatial Resolution** (`inferredSpatialResolution`)
   - Estimasi skala berdasarkan kepadatan fitur
   - Range: 1:1.000 hingga 1:100.000

10. **Resource Format** (`inferredResourceFormat`)
    - Format file yang terdeteksi (GeoJSON, Shapefile, dll)

11. **Spatial Representation Type** (`spatialRepresentationType`)
    - Otomatis set ke "vector" untuk semua data vektor

## 🎯 **Proses Inferensi Metadata**

### **Inferensi Topic Category:**
```javascript
// Contoh logika inferensi
if (attributes.some(attr => attr.name.includes('prov') || attr.name.includes('kab'))) {
  return 'boundaries'
} else if (attributes.some(attr => attr.name.includes('jalan') || attr.name.includes('road'))) {
  return 'transportation'
}
// ... dst
```

### **Inferensi Abstract:**
```javascript
const geomType = geometryType.toLowerCase()
const count = featureCount.toLocaleString()

if (geomType.includes('point')) {
  return `Dataset titik geospasial yang berisi ${count} fitur titik`
} else if (geomType.includes('polygon')) {
  return `Dataset poligon geospasial yang berisi ${count} fitur poligon`
}
```

## ✅ **Keuntungan Implementasi Saat Ini**

1. **Otomatis**: Tidak perlu input manual untuk field-field dasar
2. **Akurat**: Menggunakan data langsung dari file geospasial
3. **Standar**: Mengikuti spesifikasi ISO 19115
4. **Fleksibel**: Mendukung berbagai format file
5. **User-Friendly**: Field yang sudah terisi dapat diedit jika perlu

## 📋 **Ringkasan Field yang Diisi Otomatis:**

**11 field metadata** diisi otomatis saat upload file geospasial, sehingga user hanya perlu melengkapi field tambahan seperti contact information, purpose detail, dan constraints jika diperlukan.

----------------

| **Field** | **Diekstrak?** | **Diinferensikan?** | **Auto-Filled?** | **Disimpan ke DB?** |
|-----------|----------------|-------------------|------------------|-------------------|
| featureCount | ✅ | - | ✅ (untuk purpose) | ✅ |
| geometryType | ✅ | - | ✅ (untuk spatialRepresentationType) | ✅ |
| boundingBox | ✅ | - | ✅ (untuk extent) | ✅ |
| coordinateSystem | ✅ | - | ✅ | ✅ |
| attributeInfo | ✅ | - | ✅ (untuk attributeDescription) | ✅ |
| layerName | ✅ | - | ✅ (untuk title) | ❌ (hanya untuk inferensi) |
| fileSize | ✅ | - | ❌ (hanya ditampilkan) | ✅ |
| originalFileName | ✅ | - | ❌ (hanya ditampilkan) | ✅ |
| dataFormat | ✅ | - | ✅ (untuk resourceFormat) | ✅ |
| title | - | ✅ | ✅ | ✅ |
| abstract | - | ✅ | ✅ | ✅ |
| Purpose | - | ✅ (dari featureCount) | ✅ | ✅ |
| Reference System Identifier | - | ✅ (dari coordinateSystem) | ✅ | ✅ |
| geographicExtent | - | ✅ (dari boundingBox) | ✅ | ✅ |
| topicCategory | - | ✅ | ✅ | ✅ |
| keywords | - | ✅ | ✅ | ✅ |
| Attribute Description | - | ✅ (dari attributeInfo) | ✅ | ✅ |
| Spatial Resolution | - | ✅ | ✅ | ✅ |
| Resource Format | - | ✅ (dari dataFormat) | ✅ | ✅ |
| Spatial Representation Type | - | ✅ (dari geometryType) | ✅ | ✅ |

--------------------

Berdasarkan analisis mendalam terhadap kode, berikut adalah status lengkap field yang Anda sebutkan - apakah mereka ditampilkan kepada user dan di halaman mana:

## 📊 **Field yang DITAMPILKAN secara Langsung ke User:**

### **1. Di Halaman Upload (`pages/upload.tsx`)**
Field raw yang diekstrak ditampilkan di bagian **"📊 Informasi Geospasial (Otomatis Extract):"** setelah upload file:

```javascript
// Lines 1191-1268 - Geospatial Info Display Section
✅ featureCount → "Jumlah Fitur: {count}"
✅ geometryType → "Tipe Geometri: {type}"  
✅ boundingBox → "🌐 Extent (Bounding Box): {coords}"
✅ coordinateSystem → "Sistem Koordinat: {system}"
✅ attributeInfo → "📋 Schema Atribut ({count}): {attributes}"
```

### **2. Di Halaman Detail Metadata (`pages/metadata/[id].tsx`)**
Field raw ditampilkan di bagian **"File Information"** (section `fileInfo`):

```javascript
// Lines 1492-1525 - File Info Section
✅ originalFileName → "Original File Name: {name}"
✅ fileSize → "File Size: {size} MB"
✅ featureCount → "Feature Count: {count}"
✅ geometryType → "Geometry Type: {type}"
✅ dataFormat → "Data Format: {format}"
```

## 🔄 **Field yang DITRANSFORMASI dan Ditampilkan:**

### **Di Halaman Detail Metadata:**
```javascript
✅ boundingBox → geographicExtent → "Extent: {formatted_coords}"
✅ coordinateSystem → referenceSystemIdentifier → "Reference System Identifier: {epsg}"
✅ attributeInfo → attributeDescription → "Attribute Description: {description}"
```

## 🚫 **Field yang TIDAK Ditampilkan secara Langsung:**

### **Hanya untuk Inferensi:**
```javascript
❌ layerName → Hanya digunakan untuk inferensi title, tidak ditampilkan langsung
```

## 📋 **Ringkasan Lengkap:**

| **Field** | **Ditampilkan?** | **Halaman** | **Lokasi Tampilan** | **Format Tampilan** |
|-----------|------------------|-------------|-------------------|-------------------|
| `featureCount` | ✅ Ya | Upload + Detail | Geospatial Info + File Info | "Jumlah Fitur: 1,234" |
| `geometryType` | ✅ Ya | Upload + Detail | Geospatial Info + File Info | "Tipe Geometri: Polygon" |
| `boundingBox` | ✅ Ya | Upload | Geospatial Info | "Extent: 95.0°BT, 141.0°BT..." |
| `boundingBox` | ✅ Ya (transformed) | Detail | Metadata Fields | "Extent: formatted_coords" |
| `coordinateSystem` | ✅ Ya | Upload | Geospatial Info | "Sistem Koordinat: EPSG:4326" |
| `coordinateSystem` | ✅ Ya (transformed) | Detail | Metadata Fields | "Reference System Identifier: EPSG:4326" |
| `attributeInfo` | ✅ Ya | Upload | Geospatial Info | "Schema Atribut (5): name:String..." |
| `attributeInfo` | ✅ Ya (transformed) | Detail | Metadata Fields | "Attribute Description: detailed text" |
| `layerName` | ❌ Tidak | - | - | Hanya untuk inferensi title |
| `fileSize` | ✅ Ya | Detail | File Info | "File Size: 10.5 MB" |
| `originalFileName` | ✅ Ya | Detail | File Info | "Original File Name: data.shp" |
| `dataFormat` | ✅ Ya | Detail | File Info | "Data Format: Shapefile" |

## 🎯 **Kesimpulan:**

**SEMUA field yang Anda sebutkan DITAMPILKAN** kepada user, namun dengan strategi yang berbeda:

1. **Field raw langsung** ditampilkan di halaman upload (saat ekstraksi) dan halaman detail (di section File Info)
2. **Field yang ditransformasi** ditampilkan sebagai field metadata final di halaman detail
3. **Hanya `layerName`** yang tidak ditampilkan langsung - hanya digunakan untuk inferensi otomatis

Sistem ini memberikan transparansi penuh kepada user tentang apa yang diekstrak dari file mereka, sambil tetap menyediakan metadata yang sudah diinferensikan secara otomatis.