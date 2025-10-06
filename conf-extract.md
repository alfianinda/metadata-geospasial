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
## 📊 **Tabel Field Metadata Auto-Fill Lengkap**

| **Field Metadata** | **Sumber Data** | **Logika Inference** | **Wajib/Optional** | **Kategori** |
|-------------------|----------------|---------------------|-------------------|-------------|
| **featureCount** | ✅ Diextract dari parsing geometri Shapefile/GeoJSON | Jumlah fitur yang berhasil diparsing | - | File Info |
| **geometryType** | ✅ Diextract dari parsing geometri | Tipe geometri utama (Point, LineString, Polygon) | - | File Info |
| **boundingBox** | ✅ Diextract dari koordinat geometri | Min/max koordinat X,Y dari semua fitur | - | File Info |
| **coordinateSystem** | ✅ Diextract dari .prj file atau header | EPSG code atau nama sistem koordinat | - | File Info |
| **attributeInfo** | ✅ Diextract dari .dbf file Shapefile | Daftar nama field dan tipe data atribut | - | File Info |
| **layerName** | ✅ Diextract dari nama file atau metadata | Nama layer dari file atau nama file | - | File Info |
| **fileSize** | ✅ Diextract dari File API browser | Ukuran file dalam bytes | - | File Info |
| **originalFileName** | ✅ Diextract dari File API browser | Nama file asli yang diupload | - | File Info |
| **dataFormat** | ✅ Diextract dari ekstensi file | "Shapefile" atau "GeoJSON" | - | File Info |
| **title** | 🔄 Diinferensikan dari layerName + geometryType | `"Dataset [LayerName] - [GeometryType]"` | ✅ Wajib | Identification |
| **abstract** | 🔄 Diinferensikan dari semua data | Deskripsi lengkap dataset dengan statistik | ✅ Wajib | Identification |
| **purpose** | 🔄 Diinferensikan dari geometryType + topicCategory | Deskripsi penggunaan berdasarkan tipe data | ❌ Optional | Identification |
| **topicCategory** | 🔄 Diinferensikan dari geometryType + attributes | "boundaries", "planning", dll berdasarkan analisis | ❌ Optional | Identification |
| **descriptiveKeywords** | 🔄 Diinferensikan dari attribute names | Kata kunci dari nama atribut + tipe geometri | ❌ Optional | Identification |
| **extent** | 🔄 Diinferensikan dari boundingBox | Format bounding box untuk ISO 19115 | ✅ Wajib | Identification |
| **spatialResolution** | 🔄 Diinferensikan dari boundingBox + geometryType | Estimasi skala berdasarkan densitas data | ❌ Optional | Identification |
| **resourceFormat** | 🔄 Diinferensikan dari dataFormat | Format file lengkap (Shapefile, GeoJSON) | ❌ Optional | Identification |
| **spatialRepresentationType** | 🔄 Diinferensikan dari geometryType | "vector" untuk semua data vektor | ✅ Wajib | Spatial Representation |
| **referenceSystemIdentifier** | 🔄 Diinferensikan dari coordinateSystem | EPSG code lengkap | ✅ Wajib | Reference System |
| **referenceSystemType** | 🔄 Diinferensikan dari coordinateSystem | "geodetic" atau "projected" berdasarkan EPSG | ❌ Optional | Reference System |
| **attributeDescription** | 🔄 Diinferensikan dari attributeInfo | Deskripsi detail semua atribut | ❌ Optional | Content |
| **contentType** | 🔄 Diinferensikan dari attribute analysis | "thematicClassification" atau "physicalMeasurement" | ❌ Optional | Content |
| **processingLevel** | 🔄 Diinferensikan dari dataFormat + geometryType | "processed" untuk dataset siap pakai | ❌ Optional | Identification |
| **hierarchyLevelName** | 🔄 Diinferensikan dari geometryType + topicCategory | Nama deskriptif level hierarki | ❌ Optional | Root |
| **lineage** | 🔄 Diinferensikan dari semua info teknis | Riwayat lengkap pengumpulan dan pemrosesan | ❌ Optional | Data Quality |
| **accuracy** | 🔄 Diinferensikan dari coordinateSystem + dataFormat | Deskripsi akurasi posisional dan atribut | ❌ Optional | Data Quality |
| **completeness** | 🔄 Diinferensikan dari featureCount + geometryType | Tingkat kelengkapan berdasarkan jumlah fitur | ❌ Optional | Data Quality |
| **consistency** | 🔄 Diinferensikan dari data validation | Tingkat konsistensi struktur data | ❌ Optional | Data Quality |
| **accessConstraints** | 🔄 Default value | "public" untuk dataset yang diupload | ❌ Optional | Constraints |
| **useConstraints** | 🔄 Default value | Lisensi Creative Commons 4.0 lengkap | ❌ Optional | Constraints |
| **dateStamp** | 🔄 Default value | Tanggal hari ini (YYYY-MM-DD) | ❌ Optional | Root |
| **language** | 🔄 Default value | "ind" (Bahasa Indonesia) | ✅ Wajib | Root |
| **characterSet** | 🔄 Default value | "utf8" | ❌ Optional | Root |
| **hierarchyLevel** | 🔄 Default value | "dataset" | ✅ Wajib | Root |
| **metadataStandardName** | 🔄 Default value | "ISO 19115" | ❌ Optional | Root |
| **metadataStandardVersion** | 🔄 Default value | "2003/Cor.1:2006" | ❌ Optional | Root |
| **locale** | 🔄 Default value | "id" | ❌ Optional | Root |
| **status** | 🔄 Default value | "completed" | ✅ Wajib | Identification |
| **scope** | 🔄 Default value | "dataset" | ✅ Wajib | Data Quality |
| **georectified** | 🔄 Default value | true (untuk data dengan koordinat) | ❌ Optional | Spatial Representation |
| **georeferenceable** | 🔄 Default value | true (untuk data dengan koordinat) | ❌ Optional | Spatial Representation |

