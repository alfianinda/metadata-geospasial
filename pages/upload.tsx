'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import { ClientGeospatialExtractor } from '../lib/clientGeospatialExtractor'

// Metadata entities hierarchy - updated to match actual form fields
const metadataEntities = [
  {
    id: 'root',
    name: 'MD_Metadata (Root)',
    description: 'Informasi dasar dan pengaturan metadata geospasial',
    required: true,
    children: [
      {
        id: 'fileIdentifier',
        name: 'fileIdentifier',
        description: 'Kode unik yang mengidentifikasi metadata ini. Biasanya menggunakan UUID atau kode internal organisasi. Contoh: untuk dataset DKB bisa menggunakan format DKB-2024-001, atau UUID seperti uuid:12345678-1234-1234-1234-123456789abc. Jika kosong, sistem akan generate UUID otomatis.',
        required: false,
        example: 'DKB-2024-001 atau uuid:12345678-1234-1234-1234-123456789abc',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'language',
        name: 'language',
        description: 'Bahasa utama yang digunakan dalam isi metadata. Pilih bahasa yang sesuai dengan konten dataset. Untuk Indonesia, gunakan "ind" (Bahasa Indonesia).',
        required: true,
        example: 'ind (Bahasa Indonesia) - untuk metadata dalam bahasa Indonesia',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'characterSet',
        name: 'characterSet',
        description: 'Set karakter yang digunakan untuk menyimpan teks dalam metadata. UTF-8 adalah standar modern yang mendukung semua bahasa termasuk karakter khusus Indonesia.',
        required: false,
        example: 'utf8 - mendukung semua karakter termasuk huruf Indonesia',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'parentIdentifier',
        name: 'parentIdentifier',
        description: 'Kode metadata induk jika dataset ini merupakan bagian dari seri data yang lebih besar. Kosongkan jika dataset ini berdiri sendiri.',
        required: false,
        example: 'DKB-2024-SERIES-001 - untuk dataset yang merupakan bagian dari seri',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'hierarchyLevel',
        name: 'hierarchyLevel',
        description: 'Tingkat hierarki data dalam struktur organisasi. "dataset" untuk data tunggal, "series" untuk kumpulan dataset terkait.',
        required: true,
        example: 'dataset - untuk data tunggal seperti peta administrasi satu kabupaten',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'hierarchyLevelName',
        name: 'hierarchyLevelName',
        description: 'Nama deskriptif untuk tingkat hierarki yang dipilih. Jelaskan jenis dataset secara spesifik.',
        required: false,
        example: 'Dataset Peta Administrasi Kabupaten - untuk peta batas wilayah',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'contact',
        name: 'contact',
        description: 'Informasi kontak orang atau organisasi yang bertanggung jawab atas metadata ini. Biasanya adalah pembuat atau pemelihara data.',
        required: true,
        example: 'Nama: Ahmad Surya, Email: ahmad@dkb.go.id, Organisasi: DKB Otorita Ibu Kota Nusantara',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'dateStamp',
        name: 'dateStamp',
        description: 'Tanggal pembuatan atau terakhir kali metadata ini diperbarui. Format: YYYY-MM-DD.',
        required: false,
        example: '2024-01-15 - tanggal pembuatan metadata',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'metadataStandardName',
        name: 'metadataStandardName',
        description: 'Nama standar metadata yang digunakan. Untuk Indonesia, gunakan ISO 19115 atau SNI ISO 19115.',
        required: false,
        example: 'ISO 19115 - standar internasional untuk metadata geospasial',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'metadataStandardVersion',
        name: 'metadataStandardVersion',
        description: 'Versi spesifik dari standar metadata yang digunakan.',
        required: false,
        example: '2003/Cor.1:2006 - versi ISO 19115 yang umum digunakan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'dataSetURI',
        name: 'dataSetURI',
        description: 'Alamat web (URL) lengkap untuk mengakses dataset asli. Kosongkan jika data belum dipublikasikan secara online.',
        required: false,
        example: 'https://data.bps.go.id/dataset/peta-administrasi-2024',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'locale',
        name: 'locale',
        description: 'Pengaturan bahasa dan budaya untuk metadata. Gunakan kode bahasa ISO 639-1.',
        required: false,
        example: 'id - untuk bahasa Indonesia',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'identificationInfo',
    name: 'identificationInfo',
    description: 'Informasi utama yang mengidentifikasi dan mendeskripsikan dataset geospasial',
    required: true,
    children: [
      {
        id: 'title',
        name: 'title',
        description: 'Judul lengkap dan deskriptif dari dataset. Harus jelas menggambarkan isi data dan wilayah cakupannya.',
        required: true,
        example: 'Peta Administrasi Indonesia Tahun 2024 Skala 1:25.000',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'status',
        name: 'status',
        description: 'Status terkini dari dataset. Pilih sesuai kondisi data saat ini.',
        required: true,
        example: 'completed - untuk data yang sudah final dan lengkap',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'abstract',
        name: 'abstract',
        description: 'Ringkasan lengkap tentang isi, sumber, metode pengumpulan, dan kegunaan dataset. Minimal 100-200 kata.',
        required: true,
        example: 'Dataset ini berisi peta administrasi Indonesia tahun 2024 yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan. Data dikumpulkan dari sumber resmi pemerintah dan telah diverifikasi keakuratannya.',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'purpose',
        name: 'purpose',
        description: 'Tujuan spesifik penggunaan dataset ini. Jelaskan manfaat dan aplikasi praktis dari data.',
        required: false,
        example: 'Dataset ini digunakan untuk perencanaan pembangunan infrastruktur, analisis spasial wilayah, dan keperluan administrasi pemerintahan daerah.',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'topicCategory',
        name: 'topicCategory',
        description: 'Kategori utama isi data menurut standar ISO 19115. Pilih yang paling sesuai dengan tema dataset.',
        required: false,
        example: 'boundaries - untuk data batas wilayah dan administrasi',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'spatialResolution',
        name: 'spatialResolution',
        description: 'Tingkat detail spasial data. Dapat dinyatakan sebagai skala peta (1:25.000) atau resolusi dalam meter.',
        required: false,
        example: '1:25.000 - artinya 1 cm di peta = 25.000 cm di lapangan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'pointOfContact',
        name: 'pointOfContact',
        description: 'Kontak utama untuk pertanyaan tentang dataset ini. Biasanya adalah ahli teknis atau koordinator data.',
        required: false,
        example: 'Nama: Dr. Ahmad Surya, Email: ahmad.surya@dkb.go.id, Jabatan: Koordinator GIS DKB Otorita Ibu Kota Nusantara',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'descriptiveKeywords',
        name: 'descriptiveKeywords',
        description: 'Kata kunci yang membantu pencarian data. Pisahkan dengan koma, gunakan istilah baku.',
        required: false,
        example: 'administrasi, peta, indonesia, batas wilayah, kabupaten, provinsi',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'extent',
        name: 'extent',
        description: 'Cakupan geografis dataset dalam koordinat. Gunakan format bounding box (kotak pembatas).',
        required: true,
        example: '95.0°BT, 141.0°BT, -11.0°LS, 6.0°LU - mencakup seluruh wilayah Indonesia',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'additionalDocumentation',
        name: 'additionalDocumentation',
        description: 'Referensi ke dokumentasi teknis tambahan seperti metodologi pengumpulan data, spesifikasi teknis, atau laporan validasi.',
        required: false,
        example: 'https://bps.go.id/metodologi-peta-administrasi-2024.pdf',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'processingLevel',
        name: 'processingLevel',
        description: 'Tingkat pengolahan data dari mentah hingga siap pakai.',
        required: false,
        example: 'processed - data sudah dikoreksi dan divalidasi kualitasnya',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceMaintenance',
        name: 'resourceMaintenance',
        description: 'Informasi tentang frekuensi update dan pemeliharaan dataset.',
        required: false,
        example: 'Update tahunan sesuai dengan perubahan administrasi pemerintahan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'graphicOverview',
        name: 'graphicOverview',
        description: 'URL atau path ke gambar preview/thumbnail yang menunjukkan contoh isi dataset.',
        required: false,
        example: 'https://data.bps.go.id/thumbnails/peta-administrasi-2024.jpg',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceFormat',
        name: 'resourceFormat',
        description: 'Format file digital dari dataset asli.',
        required: false,
        example: 'GeoJSON - format modern untuk data vektor berbasis web',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceSpecificUsage',
        name: 'resourceSpecificUsage',
        description: 'Contoh spesifik penggunaan dataset di dunia nyata.',
        required: false,
        example: 'Digunakan oleh Kementerian PUPR untuk perencanaan jalan tol trans-Jawa',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceConstraints',
        name: 'resourceConstraints',
        description: 'Ketentuan penggunaan, lisensi, dan pembatasan akses data.',
        required: false,
        example: 'Lisensi Creative Commons Attribution 4.0, bebas digunakan dengan mencantumkan sumber',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'spatialRepresentationInfo',
    name: 'spatialRepresentationInfo',
    description: 'Informasi tentang bagaimana data geospasial direpresentasikan dan disimpan secara teknis',
    required: false,
    children: [
      {
        id: 'spatialRepresentationType',
        name: 'spatialRepresentationType',
        description: 'Jenis struktur data geospasial: 1) vector - data titik/garis/polygon seperti peta jalan, batas wilayah, sungai; 2) grid - data raster seperti citra satelit, DEM, peta kontur; 3) textTable - data tabular dengan kolom koordinat; 4) tin - model triangulasi untuk permukaan 3D; 5) stereoModel - model stereoskopik; 6) video - data video georeferensikan.',
        required: true,
        example: 'vector - untuk Shapefile, GeoJSON, atau data peta digital lainnya',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'axisDimensionProperties',
        name: 'axisDimensionProperties',
        description: 'Informasi dimensi spasial data. Untuk data 2D standar, X dan Y adalah koordinat horizontal dan vertikal.',
        required: false,
        example: 'X: 2D (longitude), Y: 2D (latitude) - untuk data geografis standar',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'cellGeometry',
        name: 'cellGeometry',
        description: 'Bentuk geometri dari setiap sel dalam data grid/raster. Point untuk data titik, area untuk data poligon.',
        required: false,
        example: 'area - untuk citra satelit dimana setiap pixel mewakili area tertentu',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'georectified',
        name: 'georectified',
        description: 'Apakah data raster telah dikoreksi sehingga memiliki sistem koordinat yang akurat dan dapat di-overlay dengan data lain.',
        required: false,
        example: 'true - untuk citra satelit yang sudah dikoreksi geometrinya',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'georeferenceable',
        name: 'georeferenceable',
        description: 'Apakah data memiliki informasi koordinat yang memungkinkan diposisikan di peta dunia.',
        required: false,
        example: 'true - untuk data yang memiliki sistem koordinat geografis',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'referenceSystemInfo',
    name: 'referenceSystemInfo',
    description: 'Informasi tentang sistem koordinat dan referensi spasial yang digunakan dalam dataset',
    required: false,
    children: [
      {
        id: 'referenceSystemIdentifier',
        name: 'referenceSystemIdentifier',
        description: 'Kode identifikasi sistem koordinat yang digunakan. EPSG:4326 adalah standar global untuk koordinat geografis.',
        required: true,
        example: 'EPSG:4326 - sistem koordinat WGS84 yang digunakan oleh GPS',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'referenceSystemType',
        name: 'referenceSystemType',
        description: 'Jenis sistem referensi: geodetic untuk koordinat bumi, vertical untuk ketinggian, temporal untuk waktu.',
        required: false,
        example: 'geodetic - untuk sistem koordinat geografis seperti WGS84',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'contentInfo',
    name: 'contentInfo',
    description: 'Informasi detail tentang isi dan atribut data dalam dataset',
    required: false,
    children: [
      {
        id: 'attributeDescription',
        name: 'attributeDescription',
        description: 'Penjelasan detail tentang atribut/kolom data, tipe data, dan makna dari setiap atribut.',
        required: false,
        example: 'provinsi: string - nama provinsi, kode_prov: string - kode DKB provinsi, luas_km2: number - luas wilayah dalam km²',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'contentType',
        name: 'contentType',
        description: 'Jenis isi data: image untuk citra, thematicClassification untuk data tematik, physicalMeasurement untuk pengukuran fisik.',
        required: false,
        example: 'thematicClassification - untuk data klasifikasi seperti tipe tanah atau penggunaan lahan',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'distributionInfo',
    name: 'distributionInfo',
    description: 'Informasi tentang bagaimana dataset dapat didistribusikan dan diakses',
    required: false,
    children: [
      {
        id: 'distributionFormat',
        name: 'distributionFormat',
        description: 'Format file digital untuk distribusi data. Pilih format yang paling sesuai dengan kebutuhan pengguna.',
        required: false,
        example: 'GeoJSON - format modern untuk web GIS dan aplikasi mobile',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'distributor',
        name: 'distributor',
        description: 'Informasi tentang pihak yang mendistribusikan data, termasuk kontak dan tanggung jawab.',
        required: false,
        example: 'DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara, Email: data@dkb.go.id, Telepon: 021-3843140',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'transferOptions',
        name: 'transferOptions',
        description: 'Cara-cara untuk mendapatkan data, seperti URL download, protokol akses, atau persyaratan khusus.',
        required: false,
        example: 'Download via https://data.bps.go.id/download/peta-administrasi.zip, ukuran file: 50MB',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'dataQualityInfo',
    name: 'dataQualityInfo',
    description: 'Informasi tentang kualitas, akurasi, dan keandalan data geospasial',
    required: false,
    children: [
      {
        id: 'scope',
        name: 'scope',
        description: 'Ruang lingkup penerapan informasi kualitas data ini.',
        required: true,
        example: 'dataset - informasi kualitas berlaku untuk seluruh dataset',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'lineage',
        name: 'lineage',
        description: 'Riwayat lengkap data dari pengumpulan hingga pemrosesan akhir, termasuk sumber data dan metodologi.',
        required: false,
        example: 'Data dikumpul dari survey lapangan tahun 2023 menggunakan GPS differential, kemudian diverifikasi dengan citra satelit resolusi 0.5m',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'accuracy',
        name: 'accuracy',
        description: 'Tingkat akurasi posisional dan atribut data. Sertakan unit pengukuran dan metode validasi.',
        required: false,
        example: 'Akurasi posisional: ±2.5 meter pada skala 1:25.000, akurasi atribut: 95% sesuai dengan data DKB Otorita Ibu Kota Nusantara',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'completeness',
        name: 'completeness',
        description: 'Tingkat kelengkapan data dalam persentase atau deskripsi cakupan data yang tersedia.',
        required: false,
        example: 'Data lengkap 100% untuk 34 provinsi dan 514 kabupaten/kota di Indonesia',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'consistency',
        name: 'consistency',
        description: 'Tingkat konsistensi data antar atribut dan dengan data referensi lainnya.',
        required: false,
        example: 'Konsisten dengan data administrasi pemerintah dan tidak ada konflik batas wilayah',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'metadataConstraints',
    name: 'metadataConstraints',
    description: 'Ketentuan hukum dan pembatasan penggunaan metadata dan dataset terkait',
    required: false,
    children: [
      {
        id: 'useConstraints',
        name: 'useConstraints',
        description: 'Ketentuan penggunaan data termasuk lisensi, hak cipta, dan persyaratan legal.',
        required: false,
        example: 'Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'accessConstraints',
        name: 'accessConstraints',
        description: 'Pembatasan akses data: public, restricted, confidential, atau protected.',
        required: false,
        example: 'public - data dapat diakses secara bebas oleh publik',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'otherConstraints',
        name: 'otherConstraints',
        description: 'Ketentuan lain yang tidak tercakup di atas, seperti persyaratan teknis atau etika penggunaan.',
        required: false,
        example: 'Data hanya boleh digunakan untuk tujuan non-komersial dan pendidikan',
        standard: 'ISO 19115 Optional'
      }
    ]
  }
]

interface MetadataForm {
  // MD_Metadata (Root) fields
  fileIdentifier: string
  language: string
  characterSet: string
  parentIdentifier: string
  hierarchyLevel: string
  hierarchyLevelName: string
  contactName: string
  contactEmail: string
  dateStamp: string
  metadataStandardName: string
  metadataStandardVersion: string
  dataSetURI: string
  locale: string

  // identificationInfo fields
  citation: string
  title: string
  abstract: string
  purpose: string
  credit: string
  status: string
  pointOfContact: string
  spatialRepresentationType: string
  spatialResolution: string
  temporalResolution: string
  topicCategory: string
  extent: string
  additionalDocumentation: string
  processingLevel: string
  resourceMaintenance: string
  graphicOverview: string
  resourceFormat: string
  descriptiveKeywords: string
  resourceSpecificUsage: string
  resourceConstraints: string

  // spatialRepresentationInfo fields
  axisDimensionProperties: string
  cellGeometry: string
  transformationParameterAvailability: boolean
  checkPointAvailability: boolean
  controlPointAvailability: boolean
  orientationParameterAvailability: boolean
  georectified: boolean
  georeferenceable: boolean

  // referenceSystemInfo fields
  referenceSystemIdentifier: string
  referenceSystemType: string

  // contentInfo fields
  attributeDescription: string
  contentType: string

  // distributionInfo fields
  distributionFormat: string
  distributor: string
  onlineResource: string
  transferOptions: string

  // dataQualityInfo fields
  scope: string
  lineage: string
  accuracy: string
  completeness: string
  consistency: string

  // metadataConstraints fields
  useConstraints: string
  accessConstraints: string
  otherConstraints: string

  // SNI Specific
  sniCompliant: boolean
  sniVersion: string
  sniStandard: string
  bahasa: string

  // File Information (auto-extracted)
  fileSize?: number
  originalFileName?: string
  dataFormat?: string
  featureCount?: number
  geometryType?: string
}


export default function Upload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [geospatialInfo, setGeospatialInfo] = useState<any>(null)
  const [showManualFields, setShowManualFields] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('root')

  // Clear error when switching sections
  useEffect(() => {
    setError(null)
    setShowErrorModal(false)
  }, [activeSection])
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['root']))
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [autoFillMessage, setAutoFillMessage] = useState('')
  const router = useRouter()

  const [metadata, setMetadata] = useState<MetadataForm>({
    fileIdentifier: '',
    language: 'ind',
    characterSet: 'utf8',
    parentIdentifier: '',
    hierarchyLevel: 'dataset',
    hierarchyLevelName: '',
    contactName: '',
    contactEmail: '',
    dateStamp: new Date().toISOString().split('T')[0], // Auto-fill with today's date
    metadataStandardName: 'ISO 19115',
    metadataStandardVersion: '2003/Cor.1:2006',
    dataSetURI: '',
    locale: 'id',
    citation: '',
    title: '',
    abstract: '',
    purpose: '',
    credit: '',
    status: 'completed',
    pointOfContact: '',
    spatialRepresentationType: 'vector',
    spatialResolution: '',
    temporalResolution: '',
    topicCategory: '',
    extent: '',
    additionalDocumentation: '',
    processingLevel: '',
    resourceMaintenance: '',
    graphicOverview: '',
    resourceFormat: '',
    descriptiveKeywords: '',
    resourceSpecificUsage: '',
    resourceConstraints: '',
    axisDimensionProperties: '',
    cellGeometry: '',
    transformationParameterAvailability: false,
    checkPointAvailability: false,
    controlPointAvailability: false,
    orientationParameterAvailability: false,
    georectified: false,
    georeferenceable: false,
    referenceSystemIdentifier: 'EPSG:4326',
    referenceSystemType: 'geodetic',
    attributeDescription: '',
    contentType: '',
    distributionFormat: '',
    distributor: '',
    onlineResource: '',
    transferOptions: '',
    scope: 'dataset',
    lineage: '',
    accuracy: '',
    completeness: '',
    consistency: '',
    useConstraints: '',
    accessConstraints: '',
    otherConstraints: '',
    sniCompliant: true,
    sniVersion: '1.0',
    sniStandard: 'SNI-ISO-19115-2019',
    bahasa: 'id',
    // File Information (auto-extracted)
    fileSize: undefined,
    originalFileName: undefined,
    dataFormat: undefined,
    featureCount: undefined,
    geometryType: undefined
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu untuk mengupload file.')
      setTimeout(() => router.push('/'), 3000)
    }
  }, [router])

  const validateShapefileComponents = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.name.toLowerCase())

    // Check if there's a compressed file
    const compressedFiles = fileNames.filter(name => name.endsWith('.zip') || name.endsWith('.rar'))
    const hasCompressed = compressedFiles.length > 0

    if (hasCompressed) {
      // For compressed files, we can only do basic validation
      // Full validation will happen on the server after extraction
      if (compressedFiles.length === fileNames.length) {
        // Only compressed files - validation will happen on server
        return { isValid: true, message: '' }
      } else {
        // Mixed compressed and individual files - not allowed
        return {
          isValid: false,
          message: 'Jangan campur file terkompresi dengan file individual. Pilih salah satu metode upload.'
        }
      }
    }

    // For single file uploads, check if it's a valid standalone format
    if (files.length === 1) {
      const singleFile = fileNames[0]
      // Allow GeoJSON and JSON as single files
      if (singleFile.endsWith('.geojson') || singleFile.endsWith('.json')) {
        return { isValid: true, message: '' }
      }
      // Reject auxiliary Shapefile files uploaded alone
      if (singleFile.endsWith('.prj') || singleFile.endsWith('.cpg') ||
          singleFile.endsWith('.sbn') || singleFile.endsWith('.sbx') ||
          singleFile.endsWith('.shp.xml') || singleFile.endsWith('.qix') ||
          singleFile.endsWith('.fbn') || singleFile.endsWith('.fbx') ||
          singleFile.endsWith('.ain') || singleFile.endsWith('.aih')) {
        return {
          isValid: false,
          message: '⚠️ File pendukung Shapefile tidak dapat diproses sendiri. Auto-Extracted Information from File tidak akan muncul. Upload file utama (.shp, .shx, .dbf) beserta file pendukungnya untuk ekstraksi otomatis.'
        }
      }
      // Allow single .shp file but show warning
      if (singleFile.endsWith('.shp')) {
        return {
          isValid: true,
          message: '⚠️ File .shx dan .dbf tidak ditemukan. Shapefile akan diproses dengan keterbatasan. Untuk hasil terbaik, sertakan file .shx dan .dbf'
        }
      }
    }

    // Validate individual Shapefile components for multiple files
    const hasShp = fileNames.some(name => name.endsWith('.shp'))
    const hasShx = fileNames.some(name => name.endsWith('.shx'))
    const hasDbf = fileNames.some(name => name.endsWith('.dbf'))

    // Check for auxiliary Shapefile files (these should not be uploaded alone)
    const hasAuxiliaryFiles = fileNames.some(name =>
      name.endsWith('.prj') ||
      name.endsWith('.cpg') ||
      name.endsWith('.sbn') ||
      name.endsWith('.sbx') ||
      name.endsWith('.shp.xml') ||
      name.endsWith('.qix') ||
      name.endsWith('.fbn') ||
      name.endsWith('.fbx') ||
      name.endsWith('.ain') ||
      name.endsWith('.aih')
    )

    // If there are auxiliary files but no core Shapefile files, reject
   if (hasAuxiliaryFiles && !hasShp && !hasShx && !hasDbf) {
     return {
       isValid: false,
       message: 'File pendukung Shapefile (.prj, .cpg, .sbn, .sbx, .shp.xml, .qix, .fbn, .fbx, .ain, .aih) tidak dapat diupload tanpa file utama (.shp, .shx, .dbf)'
     }
   }

    // If there's a .shp file, we must have .shx and .dbf for best results
    if (hasShp) {
      if (!hasShx && !hasDbf) {
        return {
          isValid: true, // Allow but warn
          message: '⚠️ File .shx dan .dbf tidak ditemukan. Shapefile akan diproses dengan keterbatasan. Untuk hasil terbaik, sertakan file .shx dan .dbf'
        }
      } else if (!hasShx) {
        return {
          isValid: true, // Allow but warn
          message: '⚠️ File .shx tidak ditemukan. Shapefile akan diproses dengan keterbatasan. Untuk hasil terbaik, sertakan file .shx'
        }
      } else if (!hasDbf) {
        return {
          isValid: true, // Allow but warn
          message: '⚠️ File .dbf tidak ditemukan. Shapefile akan diproses tanpa informasi atribut. Untuk hasil terbaik, sertakan file .dbf'
        }
      }
    }

    // If there are .shx or .dbf files without .shp, that's invalid
    if ((hasShx || hasDbf) && !hasShp) {
      return {
        isValid: false,
        message: '⚠️ File .shx atau .dbf ditemukan tanpa file .shp. Auto-Extracted Information from File tidak akan muncul. Shapefile memerlukan minimal file .shp untuk ekstraksi otomatis.'
      }
    }

    return { isValid: true, message: '' }
  }

  const getShapefileStatus = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.name.toLowerCase())

    // Check if there's a compressed file
    const hasCompressed = fileNames.some(name => name.endsWith('.zip') || name.endsWith('.rar'))
    if (hasCompressed) {
      return {
        shp: true, // Assume compressed file contains required components
        shx: true,
        dbf: true,
        prj: true,
        cpg: true,
        sbn: true,
        sbx: true,
        compressed: true
      }
    }

    const components = {
      shp: fileNames.some(name => name.endsWith('.shp')),
      shx: fileNames.some(name => name.endsWith('.shx')),
      dbf: fileNames.some(name => name.endsWith('.dbf')),
      prj: fileNames.some(name => name.endsWith('.prj')),
      cpg: fileNames.some(name => name.endsWith('.cpg')),
      sbn: fileNames.some(name => name.endsWith('.sbn')),
      sbx: fileNames.some(name => name.endsWith('.sbx')),
      shp_xml: fileNames.some(name => name.endsWith('.shp.xml')),
      qix: fileNames.some(name => name.endsWith('.qix')),
      fbn: fileNames.some(name => name.endsWith('.fbn')),
      fbx: fileNames.some(name => name.endsWith('.fbx')),
      ain: fileNames.some(name => name.endsWith('.ain')),
      aih: fileNames.some(name => name.endsWith('.aih')),
      compressed: false
    }
    return components
  }

  const toggleSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Create a synthetic event to reuse the existing handleFileChange logic
      const syntheticEvent = {
        target: { files: e.dataTransfer.files }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileChange(syntheticEvent)
    }
  }

  const fallbackToServerSideExtraction = async (selectedFiles: FileList) => {
    console.log('Starting server-side extraction fallback...')

    const formData = new FormData()

    // Check file types to determine processing approach
    const firstFile = selectedFiles[0]
    const fileName = firstFile.name.toLowerCase()
    const isGeoJSON = fileName.endsWith('.geojson') || fileName.endsWith('.json')
    const isShapefile = fileName.endsWith('.shp') || fileName.endsWith('.zip') || fileName.endsWith('.rar')

    // For Shapefile components, send all related files
    if (isShapefile && Array.from(selectedFiles).some(f => f.name.toLowerCase().endsWith('.shp'))) {
      // Send all Shapefile components for server-side processing (if GDAL available)
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file)
      })
    } else if (Array.from(selectedFiles).some(f => f.name.toLowerCase().endsWith('.shp'))) {
      // Multiple files with Shapefile components - send all
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file)
      })
    } else {
      // For other formats, send the first file
      formData.append('file', firstFile)
    }

    try {
      const response = await fetch('/api/extract-geospatial', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Server-side extracted geospatial data:', data)
        setGeospatialInfo(data)

        // Auto-fill metadata fields based on extracted information
        setMetadata(prev => ({
          ...prev,
          // Basic extracted fields - only fill if data exists
          ...(data.inferredTitle && { title: data.inferredTitle }),
          ...(data.inferredAbstract && { abstract: data.inferredAbstract }),
          ...(data.featureCount && { purpose: `Dataset berisi ${data.featureCount.toLocaleString()} fitur geospasial` }),
          ...(data.coordinateSystem && { referenceSystemIdentifier: data.coordinateSystem }),
          ...(data.inferredExtent && { extent: data.inferredExtent }),

          // Inferred metadata fields
          ...(data.inferredTopicCategory && { topicCategory: data.inferredTopicCategory }),
          ...(data.inferredDescriptiveKeywords && { descriptiveKeywords: data.inferredDescriptiveKeywords }),
          ...(data.inferredAttributeDescription && { attributeDescription: data.inferredAttributeDescription }),
          ...(data.inferredSpatialResolution && { spatialResolution: data.inferredSpatialResolution }),
          ...(data.inferredResourceFormat && { resourceFormat: data.inferredResourceFormat }),

          // Set spatial representation type based on geometry
          spatialRepresentationType: data.geometryType ? (
            data.geometryType.toLowerCase().includes('point') ? 'vector' :
            data.geometryType.toLowerCase().includes('line') ? 'vector' :
            data.geometryType.toLowerCase().includes('polygon') ? 'vector' :
            'vector' // default
          ) : prev.spatialRepresentationType
        }))

        // Show success message
        const extractionType = isShapefile ? 'server-side (GDAL)' : 'server-side'
        setAutoFillMessage(`✅ Field metadata telah diisi otomatis menggunakan ${extractionType} extraction! Klik "Tampilkan Field Manual Metadata" untuk melihat hasilnya.`)
        setTimeout(() => setAutoFillMessage(''), 6000)
      } else {
        const errorData = await response.json()
        console.error('Server-side extraction failed:', errorData)

        if (isShapefile && errorData.error && errorData.error.includes('GDAL')) {
          // GDAL not available - provide helpful message for Vercel deployment
          setAutoFillMessage('⚠️ Server-side extraction memerlukan GDAL yang tidak tersedia di Vercel. Sistem menggunakan client-side processing. Jika ekstraksi otomatis gagal, silakan isi metadata secara manual.')
          setTimeout(() => setAutoFillMessage(''), 8000)
        } else {
          setAutoFillMessage(`❌ Server-side extraction gagal: ${errorData.error || 'Unknown error'}. Silakan isi metadata secara manual.`)
          setTimeout(() => setAutoFillMessage(''), 6000)
        }
      }
    } catch (error) {
      console.error('Error in server-side extraction:', error)

      if (isShapefile) {
        setAutoFillMessage('⚠️ Server-side extraction tidak tersedia (GDAL dependency). Sistem menggunakan client-side processing untuk Shapefile. Jika ekstraksi otomatis gagal, silakan isi metadata secara manual.')
        setTimeout(() => setAutoFillMessage(''), 8000)
      } else {
        setAutoFillMessage('❌ Terjadi kesalahan saat server-side extraction. Silakan isi metadata secara manual.')
        setTimeout(() => setAutoFillMessage(''), 6000)
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    setFiles(selectedFiles)
    setAutoFillMessage('') // Clear previous auto-fill message

    if (selectedFiles && selectedFiles.length > 0) {
      // Validate Shapefile components
      const validation = validateShapefileComponents(selectedFiles)
      if (!validation.isValid) {
        setError(validation.message)
        setShowErrorModal(true)
        // Clear previous geospatial info since validation failed
        setGeospatialInfo(null)
        return
      } else {
        // Show warning modal for incomplete Shapefiles even if valid
        if (validation.message && validation.message.includes('⚠️')) {
          setError(validation.message)
          setShowErrorModal(true)
        } else {
          setError(null)
          setShowErrorModal(false)
        }
      }

      // Check if file format supports client-side extraction
      const selectedFile = selectedFiles[0]
      const selectedFileName = selectedFile.name.toLowerCase()
      const isSupportedFormat = selectedFileName.endsWith('.shp') || selectedFileName.endsWith('.shx') || selectedFileName.endsWith('.dbf') ||
                               selectedFileName.endsWith('.geojson') || selectedFileName.endsWith('.json') ||
                               selectedFileName.endsWith('.zip') || selectedFileName.endsWith('.rar')

      if (!isSupportedFormat) {
        setError('⚠️ Format file ini tidak didukung untuk ekstraksi otomatis. Auto-Extracted Information from File tidak akan muncul. Sistem akan mencoba ekstraksi server-side jika tersedia, atau Anda perlu mengisi metadata secara manual.')
        setShowErrorModal(true)
        // Clear previous geospatial info since this format is not supported
        setGeospatialInfo(null)
        return
      }

      // Extract geospatial information using client-side processing
      const firstFile = selectedFiles[0]
      try {
        console.log('=== CLIENT-SIDE EXTRACTION START ===')
        console.log('All selected files:', Array.from(selectedFiles).map(f => f.name))
        console.log('First file (selectedFiles[0]):', firstFile.name)

        // For Shapefile components, ALWAYS prioritize .shp file as the main file if it exists
        let filesToExtract: File | File[] = firstFile;
        console.log('selectedFiles.length:', selectedFiles.length)

        // Check if we have Shapefile components (look for .shp file)
        const shpFile = Array.from(selectedFiles).find(f => f.name.toLowerCase().endsWith('.shp'));
        console.log('Found .shp file:', shpFile?.name || 'none')

        if (shpFile) {
          // If we have a .shp file, send ALL files for Shapefile processing
          // But prioritize .shp file as the first file to ensure proper processing
          const allFiles = Array.from(selectedFiles);
          const shpIndex = allFiles.findIndex(f => f.name.toLowerCase().endsWith('.shp'));
          if (shpIndex > 0) {
            // Move .shp file to the front of the array
            const shpFile = allFiles.splice(shpIndex, 1)[0];
            allFiles.unshift(shpFile);
            console.log('🔄 Moved .shp file to front for proper processing');
          }
          filesToExtract = allFiles;
          console.log('✅ Found .shp file, sending ALL Shapefile components for extraction:', filesToExtract.map(f => f.name));
        } else {
          // No .shp file found, use first file (could be single GeoJSON or other format)
          filesToExtract = firstFile;
          console.log('❌ No .shp file found, using first file:', firstFile.name);
        }

        console.log('Final filesToExtract:', Array.isArray(filesToExtract) ? filesToExtract.map(f => f.name) : filesToExtract.name)

        console.log('Calling ClientGeospatialExtractor.extract with:', Array.isArray(filesToExtract) ? filesToExtract.map(f => f.name) : filesToExtract.name)
        const extractionResult = await ClientGeospatialExtractor.extract(filesToExtract)
        console.log('Extraction result:', extractionResult)

        if (extractionResult.success && extractionResult.data) {
          const data = extractionResult.data
          console.log('Client-side extracted geospatial data:', data)

          // More comprehensive success check
          const isSuccessfulExtraction = (
            data.featureCount > 0 ||
            (data.geometryType && data.geometryType !== 'Unknown') ||
            (data.coordinateSystem && data.coordinateSystem !== 'Unknown') ||
            (data.boundingBox && data.boundingBox.minX !== 0 && data.boundingBox.maxX !== 0) ||
            (data.attributes && data.attributes.length > 0) ||
            (data.dataFormat && !data.dataFormat.includes('Error') && !data.dataFormat.includes('Incomplete'))
          )

          if (isSuccessfulExtraction) {
            console.log('Client-side extraction successful, using extracted data')
            setGeospatialInfo(data)

            // Auto-fill metadata fields based on extracted information
            setMetadata(prev => ({
              ...prev,
              // Basic extracted fields - only fill if data exists and is not default/unknown
              ...(data.inferredTitle && data.inferredTitle !== 'Dataset' && { title: data.inferredTitle }),

              // Set georectified and georeferenceable based on coordinate system availability
              georectified: data.coordinateSystem && data.coordinateSystem !== 'Unknown' ? true : false,
              georeferenceable: data.coordinateSystem && data.coordinateSystem !== 'Unknown' ? true : false,
              ...(data.inferredAbstract && !data.inferredAbstract.includes('Dataset geospasial yang berisi 0 fitur') && { abstract: data.inferredAbstract }),
              ...(data.featureCount && data.featureCount > 0 && {
                purpose: (() => {
                  const geomType = data.geometryType?.toLowerCase() || '';
                  const topicCategory = data.inferredTopicCategory || '';
                  const count = data.featureCount;

                  // Generate meaningful purpose based on geometry type and topic
                  if (geomType.includes('polygon') && topicCategory === 'boundaries') {
                    return `Dataset digunakan untuk perencanaan pembangunan infrastruktur, analisis spasial wilayah, dan keperluan administrasi pemerintahan daerah.`;
                  } else if (geomType.includes('point')) {
                    return `Dataset digunakan untuk analisis distribusi spasial titik lokasi, pemetaan fasilitas umum, dan perencanaan layanan publik.`;
                  } else if (geomType.includes('linestring') || geomType.includes('line')) {
                    return `Dataset digunakan untuk perencanaan jaringan transportasi, analisis konektivitas spasial, dan pemetaan infrastruktur linear.`;
                  } else if (topicCategory === 'planning') {
                    return `Dataset digunakan untuk perencanaan pembangunan, analisis spasial, dan pengambilan keputusan berbasis lokasi.`;
                  } else {
                    return `Dataset digunakan untuk analisis spasial, pemetaan, dan pengambilan keputusan berbasis data geospasial.`;
                  }
                })()
              }),
              ...(data.coordinateSystem && data.coordinateSystem !== 'Unknown' && { referenceSystemIdentifier: data.coordinateSystem }),
              ...(data.inferredExtent && !data.inferredExtent.includes('0.0000') && { extent: data.inferredExtent }),

              // Inferred metadata fields
              ...(data.inferredTopicCategory && { topicCategory: data.inferredTopicCategory }),
              ...(data.inferredDescriptiveKeywords && { descriptiveKeywords: data.inferredDescriptiveKeywords }),
              ...(data.inferredAttributeDescription && data.inferredAttributeDescription.trim() && { attributeDescription: data.inferredAttributeDescription }),
              ...(data.inferredSpatialResolution && { spatialResolution: data.inferredSpatialResolution }),
              ...(data.inferredResourceFormat && data.inferredResourceFormat !== 'Unknown' && { resourceFormat: data.inferredResourceFormat }),

              // File information fields - always fill from extracted data
              ...(data.fileSize && data.fileSize > 0 && { fileSize: data.fileSize }),
              ...(data.originalFileName && {
                originalFileName: Array.from(selectedFiles).some(f => f.name.toLowerCase().endsWith('.shp'))
                  ? Array.from(selectedFiles).find(f => f.name.toLowerCase().endsWith('.shp'))?.name || data.originalFileName
                  : data.originalFileName
              }),
              ...(data.dataFormat && !data.dataFormat.includes('Error') && { dataFormat: data.dataFormat }),
              ...(data.featureCount !== undefined && data.featureCount >= 0 && { featureCount: data.featureCount }),
              ...(data.geometryType && data.geometryType !== 'Unknown' && { geometryType: data.geometryType }),

              // Set spatial representation type based on geometry
              spatialRepresentationType: data.geometryType && data.geometryType !== 'Unknown' ? (
                data.geometryType.toLowerCase().includes('point') ? 'vector' :
                data.geometryType.toLowerCase().includes('line') ? 'vector' :
                data.geometryType.toLowerCase().includes('polygon') ? 'vector' :
                data.geometryType.toLowerCase().includes('raster') ? 'grid' :
                'vector' // default
              ) : prev.spatialRepresentationType,

              // Set reference system type based on coordinate system
              referenceSystemType: (() => {
                const coordSys = data.coordinateSystem || '';
                if (coordSys.includes('EPSG:4326') || coordSys.includes('WGS84') || coordSys.includes('WGS_1984')) {
                  return 'geodetic';
                } else if (coordSys.includes('UTM')) {
                  return 'projected';
                } else if (coordSys.includes('EPSG')) {
                  // For other EPSG codes, assume geodetic unless it's a projected CRS
                  const epsgNum = coordSys.match(/EPSG:(\d+)/)?.[1];
                  if (epsgNum) {
                    const num = parseInt(epsgNum);
                    // UTM zones are typically 32600-32799 for northern/southern hemispheres
                    if (num >= 32600 && num <= 32799) {
                      return 'projected';
                    }
                    // Most other EPSG codes are geodetic
                    return 'geodetic';
                  }
                }
                return 'geodetic'; // default
              })(),

              // Set processing level based on file type and context
              processingLevel: (() => {
                const dataFormat = data.dataFormat || '';
                const geometryType = data.geometryType || '';

                // For uploaded files, assume they are processed unless they are raw survey data
                if (dataFormat.includes('Shapefile') || dataFormat.includes('GeoJSON')) {
                  return 'processed'; // Shapefiles and GeoJSON are typically processed datasets
                } else if (geometryType.toLowerCase().includes('point') && data.featureCount && data.featureCount < 100) {
                  return 'raw'; // Small point datasets might be raw survey data
                } else {
                  return 'processed'; // Default for most geospatial datasets
                }
              })(),

              // Set content type based on attributes and geometry
              contentType: (() => {
                const attributes = data.attributes || [];
                const geometryType = data.geometryType || '';
                const topicCategory = data.inferredTopicCategory || '';

                // Check for thematic classification attributes
                const hasThematicAttributes = attributes.some((attr: any) =>
                  attr.name && (
                    attr.name.toLowerCase().includes('class') ||
                    attr.name.toLowerCase().includes('type') ||
                    attr.name.toLowerCase().includes('category') ||
                    attr.name.toLowerCase().includes('landuse') ||
                    attr.name.toLowerCase().includes('land_use') ||
                    attr.name.toLowerCase().includes('soil') ||
                    attr.name.toLowerCase().includes('vegetation')
                  )
                );

                // Check for physical measurement attributes
                const hasPhysicalAttributes = attributes.some((attr: any) =>
                  attr.name && (
                    attr.name.toLowerCase().includes('elevation') ||
                    attr.name.toLowerCase().includes('height') ||
                    attr.name.toLowerCase().includes('depth') ||
                    attr.name.toLowerCase().includes('temperature') ||
                    attr.name.toLowerCase().includes('precipitation') ||
                    attr.name.toLowerCase().includes('pressure')
                  )
                );

                if (hasThematicAttributes) {
                  return 'thematicClassification';
                } else if (hasPhysicalAttributes) {
                  return 'physicalMeasurement';
                } else if (topicCategory === 'imagery' || geometryType.toLowerCase().includes('raster')) {
                  return 'image';
                } else {
                  return 'thematicClassification'; // Default for most vector datasets
                }
              })(),

              // Set hierarchy level name based on geometry type and topic
              hierarchyLevelName: (() => {
                const geometryType = data.geometryType?.toLowerCase() || '';
                const topicCategory = data.inferredTopicCategory || '';

                if (geometryType.includes('polygon') && topicCategory === 'boundaries') {
                  return 'Dataset Peta Batas Administrasi';
                } else if (geometryType.includes('polygon')) {
                  return 'Dataset Peta Poligon';
                } else if (geometryType.includes('linestring') || geometryType.includes('line')) {
                  return 'Dataset Peta Garis';
                } else if (geometryType.includes('point')) {
                  return 'Dataset Peta Titik';
                } else if (topicCategory === 'planning') {
                  return 'Dataset Perencanaan';
                } else if (topicCategory === 'imagery') {
                  return 'Dataset Citra';
                } else if (topicCategory === 'elevation') {
                  return 'Dataset Elevasi';
                } else {
                  return 'Dataset Geospasial';
                }
              })(),

              // Set access constraints - assume public for uploaded datasets
              accessConstraints: 'public',

              // Set use constraints with common Creative Commons license
              useConstraints: 'Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber',

              // Set lineage based on available information
              lineage: (() => {
                const dataFormat = data.dataFormat || '';
                const coordinateSystem = data.coordinateSystem || '';
                const featureCount = data.featureCount || 0;

                let lineageText = 'Data diupload melalui sistem metadata geospasial. ';

                if (dataFormat.includes('Shapefile')) {
                  lineageText += 'Format asli Shapefile dengan komponen lengkap (.shp, .shx, .dbf';
                  if (coordinateSystem) {
                    lineageText += `, .prj) dalam sistem koordinat ${coordinateSystem}`;
                  } else {
                    lineageText += ')';
                  }
                } else if (dataFormat.includes('GeoJSON')) {
                  lineageText += 'Format GeoJSON dengan struktur data vektor';
                  if (coordinateSystem) {
                    lineageText += ` dalam sistem koordinat ${coordinateSystem}`;
                  }
                }

                if (featureCount > 0) {
                  lineageText += `. Dataset berisi ${featureCount.toLocaleString()} fitur geospasial.`;
                }

                lineageText += ' Data telah divalidasi dan siap untuk digunakan dalam aplikasi GIS.';

                return lineageText;
              })(),

              // Set completeness based on available information
              completeness: (() => {
                const featureCount = data.featureCount || 0;
                const geometryType = data.geometryType || '';

                if (featureCount > 1000) {
                  return `Dataset lengkap dengan ${featureCount.toLocaleString()} fitur ${geometryType.toLowerCase()}`;
                } else if (featureCount > 100) {
                  return `Dataset berisi ${featureCount.toLocaleString()} fitur ${geometryType.toLowerCase()}, mencakup area yang representative`;
                } else if (featureCount > 0) {
                  return `Dataset berisi ${featureCount.toLocaleString()} fitur ${geometryType.toLowerCase()}`;
                } else {
                  return 'Kelengkapan data sesuai dengan file yang diupload';
                }
              })(),

              // Set accuracy based on data type and coordinate system
              accuracy: (() => {
                const coordinateSystem = data.coordinateSystem || '';
                const geometryType = data.geometryType || '';
                const dataFormat = data.dataFormat || '';

                let accuracyText = '';

                // Positional accuracy based on coordinate system
                if (coordinateSystem.includes('EPSG:4326') || coordinateSystem.includes('WGS84')) {
                  accuracyText += 'Akurasi posisional: ±2.5 meter pada skala 1:25.000 untuk data GPS standar. ';
                } else if (coordinateSystem.includes('UTM')) {
                  accuracyText += 'Akurasi posisional: ±1-5 meter tergantung zona UTM dan metode akuisisi. ';
                } else {
                  accuracyText += 'Akurasi posisional: sesuai dengan sistem koordinat yang digunakan. ';
                }

                // Attribute accuracy
                if (dataFormat.includes('Shapefile') && data.attributes && data.attributes.length > 0) {
                  accuracyText += `Akurasi atribut: ${data.attributes.length} field atribut telah tervalidasi.`;
                } else {
                  accuracyText += 'Akurasi atribut: sesuai dengan sumber data asli.';
                }

                return accuracyText;
              })(),

              // Set consistency based on data validation
              consistency: (() => {
                const geometryType = data.geometryType || '';
                const dataFormat = data.dataFormat || '';
                const attributes = data.attributes || [];

                let consistencyText = 'Data konsisten dalam format dan struktur yang benar. ';

                if (geometryType) {
                  consistencyText += `Semua fitur menggunakan tipe geometri ${geometryType} yang konsisten. `;
                }

                if (attributes.length > 0) {
                  consistencyText += `Terdapat ${attributes.length} atribut yang terstruktur dengan baik. `;
                }

                if (dataFormat.includes('Shapefile')) {
                  consistencyText += 'Struktur Shapefile (.shp, .shx, .dbf) telah tervalidasi dan konsisten.';
                } else if (dataFormat.includes('GeoJSON')) {
                  consistencyText += 'Format GeoJSON valid dan mengikuti standar RFC 7946.';
                }

                return consistencyText;
              })()
            }))

            // Calculate which fields were actually filled
            const filledFields = []
            if (data.inferredTitle && data.inferredTitle !== 'Dataset') filledFields.push('Title')
            if (data.inferredAbstract && !data.inferredAbstract.includes('Dataset geospasial yang berisi 0 fitur')) filledFields.push('Abstract')
            if (data.featureCount && data.featureCount > 0) filledFields.push('Purpose')
            if (data.inferredTopicCategory) filledFields.push('Topic Category')
            if (data.inferredDescriptiveKeywords) filledFields.push('Descriptive Keywords')
            if (data.inferredExtent && !data.inferredExtent.includes('0.0000')) filledFields.push('Extent')
            if (data.inferredSpatialResolution) filledFields.push('Spatial Resolution')
            if (data.inferredResourceFormat && data.inferredResourceFormat !== 'Unknown') filledFields.push('Resource Format')
            if (data.geometryType && data.geometryType !== 'Unknown') filledFields.push('Spatial Representation Type')
            if (data.coordinateSystem && data.coordinateSystem !== 'Unknown') filledFields.push('Reference System Identifier')
            if (data.coordinateSystem && data.coordinateSystem !== 'Unknown') filledFields.push('Reference System Type')
            if (data.inferredAttributeDescription && data.inferredAttributeDescription.trim()) filledFields.push('Attribute Description')
            if (data.attributes && data.attributes.length > 0) filledFields.push('Content Type')
            if (data.dataFormat && data.dataFormat !== 'Unknown') filledFields.push('Processing Level')
            if (data.geometryType && data.geometryType !== 'Unknown') filledFields.push('Hierarchy Level Name')
            if (data.dataFormat && data.dataFormat !== 'Unknown') filledFields.push('Lineage')
            if (data.coordinateSystem && data.coordinateSystem !== 'Unknown') filledFields.push('Accuracy')
            if (data.featureCount !== undefined && data.featureCount >= 0) filledFields.push('Completeness')
            if (data.attributes && data.attributes.length > 0) filledFields.push('Consistency')

            // Show appropriate message based on success
            if (filledFields.length > 0) {
              setAutoFillMessage(`✅ ${filledFields.length} field metadata telah diisi otomatis: ${filledFields.join(', ')}`)
            } else {
              setAutoFillMessage('⚠️ Ekstraksi berhasil tapi tidak ada field yang bisa diisi otomatis. Data mungkin tidak valid atau format tidak didukung.')
            }
            setTimeout(() => setAutoFillMessage(''), filledFields.length > 0 ? 8000 : 5000)
          } else {
            console.log('Client-side extraction returned default values, trying server-side extraction...')
            // Fallback to server-side extraction
            await fallbackToServerSideExtraction(selectedFiles)
          }
        } else {
          console.error('Client-side extraction failed:', extractionResult.error)
          console.log('Trying server-side extraction as fallback...')
          // Fallback to server-side extraction
          await fallbackToServerSideExtraction(selectedFiles)
        }
      } catch (error) {
        console.error('Error in client-side extraction:', error)
        console.log('Trying server-side extraction as fallback...')
        // Fallback to server-side extraction
        await fallbackToServerSideExtraction(selectedFiles)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!files || files.length === 0) {
      setMessage('Silakan pilih file untuk diupload')
      return
    }

    // Validate required fields (ISO 19115 Mandatory)
    const requiredFields = [
      { value: metadata.title?.trim(), name: 'Judul' },
      { value: metadata.abstract?.trim(), name: 'Abstrak' },
      { value: metadata.status?.trim(), name: 'Status' },
      { value: metadata.extent?.trim(), name: 'Extent' },
      { value: metadata.contactName?.trim(), name: 'Nama Kontak' },
      { value: metadata.contactEmail?.trim(), name: 'Email Kontak' },
      { value: metadata.spatialRepresentationType?.trim(), name: 'Spatial Representation Type' },
      { value: metadata.referenceSystemIdentifier?.trim(), name: 'Reference System Identifier' },
      { value: metadata.scope?.trim(), name: 'Scope' }
    ]

    const missingFields = requiredFields.filter(field => !field.value)

    if (missingFields.length > 0) {
      setError('Lengkapi semua field yang bertanda *')
      setShowErrorModal(true)
      return
    }

    setUploading(true)
    setMessage('')
    setError(null)
    setAutoFillMessage('')

    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    // Add metadata to form data
    Object.entries(metadata).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    // Add geospatial info if available (now pre-extracted from client-side)
    if (geospatialInfo) {
      formData.append('geospatialInfo', JSON.stringify(geospatialInfo))
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('File berhasil diupload! Metadata sedang dibuat...')
        setError(null)
        setTimeout(() => {
          router.push(`/metadata/${data.metadataId}`)
        }, 2000)
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        setTimeout(() => router.push('/'), 3000)
      } else {
        setError(data.message || 'Upload gagal. Silakan coba lagi.')
      }
    } catch {
      setError('Terjadi kesalahan saat upload. Silakan periksa koneksi internet Anda dan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Struktur Metadata</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {metadataEntities.map((entity) => (
                  <div key={entity.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setActiveSection(entity.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 truncate">{entity.name}</span>
                      </div>
                      {entity.children && entity.children.length > 0 && (
                        <svg className={`w-4 h-4 transition-transform ${activeSection === entity.id ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>

                    {activeSection === entity.id && entity.children && (
                      <div className="border-t border-gray-100">
                        {entity.children.map((field) => (
                          <div
                            key={field.id}
                            className="w-full text-left px-4 py-2 text-xs bg-gray-50 flex items-center"
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${field.required ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className="text-gray-700 truncate">{field.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">
                  <strong>Kategori Field:</strong>
                </div>
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  <span>Field Wajib</span>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span>Field Opsional</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
        <div className="card">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Upload File Geospasial</h1>
            <p className="text-gray-600">Upload file GeoJSON atau Shapefile untuk menghasilkan metadata</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Pilih File Geospasial
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 bg-gray-50 ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-indigo-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  <svg
                    className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-indigo-500' : 'text-gray-400'}`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center items-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Pilih File</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept=".geojson,.json,.shp,.shx,.dbf,.prj,.cpg,.sbn,.sbx,.shp.xml,.qix,.fbn,.fbx,.ain,.aih,.zip,.rar"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="pl-2">atau seret dan jatuhkan</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-7">
                    <p className="mb-2 text-center"><strong>Format yang didukung:</strong></p>
                    <div className="space-y-1 text-center">
                      <div>
                        <span className="text-green-600">•</span> <span className="text-green-700"><strong>GeoJSON</strong> - file tunggal</span>
                      </div>
                      <div>
                        <span className="text-green-600">•</span> <span className="text-green-700"><strong>Shapefile</strong> - pilih minimal file utama (.shp, .shx, .dbf) + file pendukung opsional (.prj, .cpg, .sbn, .sbx, .shp.xml, .qix, .fbn, .fbx, .ain, .aih)</span>
                      </div>
                      <div>
                        <span className="text-red-500">⚠️</span> <span className="text-red-700"><strong>Jangan upload file pendukung saja</strong> (.prj, .cpg, .sbn, .sbx) tanpa file utama (.shp, .shx, .dbf)</span>
                      </div>
                      <div>
                        <span className="text-green-600">•</span> <span className="text-green-700"><strong>Shapefile terkompresi</strong> - ZIP/RAR didukung dengan validasi otomatis</span>
                      </div>
                      <div>
                        <span className="text-blue-600">📁</span> <span className="text-blue-700"><strong>Maksimal 10MB per file</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {files && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">File yang Dipilih:</h4>
                <ul className="space-y-3">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="file-item">
                      <svg className="h-5 w-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Shapefile Component Status */}
                {files.length > 0 && Object.values(getShapefileStatus(files)).some(status => status === true) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">
                      {getShapefileStatus(files).compressed ? 'File Terkompresi:' : 'Status Komponen Shapefile:'}
                    </h5>
                    {getShapefileStatus(files).compressed ? (
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          File terkompresi akan diekstrak secara otomatis
                        </div>
                        <p className="text-xs text-blue-500 mb-2">
                          Sistem akan mengekstrak dan memvalidasi semua komponen Shapefile dari file ZIP/RAR termasuk file pendukung (.prj, .cpg, .sbn, .sbx, .shp.xml, .qix, .fbn, .fbx, .ain, .aih)
                        </p>
                        <p className="text-xs text-orange-600 font-medium">
                          ⚠️ Pastikan file ZIP/RAR berisi minimal .shp, .shx, dan .dbf untuk Shapefile yang valid
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                           {Object.entries(getShapefileStatus(files))
                             .filter(([key]) => key !== 'compressed')
                             .map(([component, present]) => (
                             <div key={component} className={`flex items-center ${present ? 'text-green-600' : 'text-red-500'}`}>
                               <svg className={`h-4 w-4 mr-1 ${present ? 'text-green-500' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 {present ? (
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                 ) : (
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                 )}
                               </svg>
                               .{component.toUpperCase().replace('_', '.')}
                             </div>
                           ))}
                         </div>
                         <p className="text-xs text-gray-500 mt-2">
                            Komponen wajib: .SHP, .SHX, .DBF | Pendukung: .PRJ, .CPG, .SBN, .SBX, .SHP.XML, .QIX, .FBN, .FBX, .AIN, .AIH
                          </p>
                         {/* <p className="text-xs text-blue-600 mt-1">
                           ℹ️ File .SHP akan digunakan sebagai file utama untuk ekstraksi metadata
                         </p> */}
                        <p className="text-xs text-red-500 mt-1">
                          ⚠️ File pendukung (.PRJ, .CPG, .SBN, .SBX, .SHP.XML, .QIX, .FBN, .FBX, .AIN, .AIH) tidak dapat diupload tanpa file utama (.SHP, .SHX, .DBF)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {autoFillMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 font-medium">{autoFillMessage}</span>
                </div>
              </div>
            )}



            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowManualFields(!showManualFields)}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                {showManualFields ? 'Sembunyikan' : 'Tampilkan'} Field Manual Metadata
              </button>
            </div>

            {showManualFields && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                {/* Auto-extracted File Information - shown after upload */}
                {geospatialInfo && (
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Auto-Extracted Information from File</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Feature Count */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feature Count
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.featureCount ? geospatialInfo.featureCount.toLocaleString() : 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Number of geospatial features in the file</p>
                      </div>

                      {/* Geometry Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Geometry Type
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.geometryType || 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Type of geometric shapes (Point, Line, Polygon)</p>
                      </div>

                      {/* Bounding Box */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bounding Box
                        </label>
                        <div className={`text-sm p-2 rounded border ${geospatialInfo.boundingBox && geospatialInfo.boundingBox.minX !== 0 && geospatialInfo.boundingBox.maxX !== 0 ? 'bg-blue-50 border-blue-200 text-gray-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                          {geospatialInfo.boundingBox && geospatialInfo.boundingBox.minX !== 0 && geospatialInfo.boundingBox.maxX !== 0 ?
                            `${geospatialInfo.boundingBox.minX.toFixed(4)}, ${geospatialInfo.boundingBox.maxX.toFixed(4)}, ${geospatialInfo.boundingBox.minY.toFixed(4)}, ${geospatialInfo.boundingBox.maxY.toFixed(4)}` :
                            '0.0000, 0.0000, 0.0000, 0.0000 (tidak dapat diekstrak)'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {geospatialInfo.boundingBox && geospatialInfo.boundingBox.minX !== 0 && geospatialInfo.boundingBox.maxX !== 0 ?
                            'Geographical boundaries of the dataset' :
                            'Bounding box tidak dapat diekstrak. Silakan isi secara manual di form metadata.'}
                        </p>
                      </div>

                      {/* Coordinate System */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Coordinate System
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.coordinateSystem || 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Spatial reference system used</p>
                      </div>

                      {/* Attribute Info */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Attribute Info
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200 max-h-20 overflow-y-auto">
                          {geospatialInfo.attributes && geospatialInfo.attributes.length > 0 ? (
                            <div className="space-y-1">
                              {geospatialInfo.attributes.map((attr: { name: string; type: string }, index: number) => (
                                <div key={index} className="text-xs font-mono">
                                  {attr.name}: {attr.type}
                                </div>
                              ))}
                            </div>
                          ) : 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Detailed information about data attributes and their types</p>
                      </div>

                      {/* Layer Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Layer Name
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.layerName || geospatialInfo.inferredTitle || 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Name of the data layer or dataset</p>
                      </div>

                      {/* File Size */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Size
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.fileSize ? `${(geospatialInfo.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Size of the uploaded file</p>
                      </div>

                      {/* Original File Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Original File Name
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.originalFileName || 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Original name of the uploaded file</p>
                      </div>

                      {/* Data Format */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Format
                        </label>
                        <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                          {geospatialInfo.dataFormat || 'Not available'}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Format of the geospatial data file</p>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-blue-600 bg-blue-100 p-3 rounded">
                      ✅ <strong>Auto-filled fields:</strong> Title, Abstract, Purpose, Topic Category, Descriptive Keywords, Extent, Spatial Resolution, Resource Format, Spatial Representation Type, Reference System Identifier, Reference System Type, Attribute Description, Content Type, Processing Level, Hierarchy Level Name, Lineage, Accuracy, Completeness, Consistency
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Informasi Metadata Manual</h3>
                  <div className="text-sm text-gray-600">
                    {metadataEntities.find(e => e.id === activeSection)?.name || 'Pilih kategori'}
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-white rounded-lg border border-gray-200">
                  {metadataEntities.map((entity) => (
                    <button
                      type="button"
                      key={entity.id}
                      onClick={() => {
                        setActiveSection(entity.id)
                        setError(null)
                        setShowErrorModal(false)
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === entity.id
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {entity.name}
                    </button>
                  ))}
                </div>

                {/* Render fields based on active section */}
                {activeSection === 'root' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Identifier
                      </label>
                      <input
                        type="text"
                        name="fileIdentifier"
                        value={metadata.fileIdentifier}
                        onChange={(e) => setMetadata(prev => ({ ...prev, fileIdentifier: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="DKB-2024-001 atau uuid:12345678-1234-1234-1234-123456789abc"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode unik yang mengidentifikasi metadata ini. Biasanya menggunakan UUID atau kode internal organisasi. Contoh: untuk dataset DKB bisa menggunakan format DKB-2024-001, atau UUID seperti uuid:12345678-1234-1234-1234-123456789abc. Jika kosong, sistem akan generate UUID otomatis.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="language"
                        value={metadata.language}
                        onChange={(e) => setMetadata(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ind">Bahasa Indonesia (ind)</option>
                        <option value="eng">English (eng)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Bahasa utama yang digunakan dalam isi metadata. Pilih bahasa yang sesuai dengan konten dataset. Untuk Indonesia, gunakan "ind" (Bahasa Indonesia).</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Character Set
                      </label>
                      <select
                        name="characterSet"
                        value={metadata.characterSet}
                        onChange={(e) => setMetadata(prev => ({ ...prev, characterSet: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih character set</option>
                        <option value="utf8">UTF-8</option>
                        <option value="ascii">ASCII</option>
                        <option value="iso88591">ISO-8859-1</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Set karakter yang digunakan untuk menyimpan teks dalam metadata. UTF-8 adalah standar modern yang mendukung semua bahasa termasuk karakter khusus Indonesia.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Identifier
                      </label>
                      <input
                        type="text"
                        name="parentIdentifier"
                        value={metadata.parentIdentifier}
                        onChange={(e) => setMetadata(prev => ({ ...prev, parentIdentifier: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="DKB-2024-SERIES-001 - untuk dataset yang merupakan bagian dari seri"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode metadata induk jika dataset ini merupakan bagian dari seri data yang lebih besar. Kosongkan jika dataset ini berdiri sendiri.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hierarchy Level <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="hierarchyLevel"
                        value={metadata.hierarchyLevel}
                        onChange={(e) => setMetadata(prev => ({ ...prev, hierarchyLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="dataset">Dataset</option>
                        <option value="series">Series</option>
                        <option value="service">Service</option>
                        <option value="application">Application</option>
                        <option value="collectionHardware">Collection Hardware</option>
                        <option value="collectionSession">Collection Session</option>
                        <option value="nonGeographicDataset">Non Geographic Dataset</option>
                        <option value="dimensionGroup">Dimension Group</option>
                        <option value="feature">Feature</option>
                        <option value="featureType">Feature Type</option>
                        <option value="propertyType">Property Type</option>
                        <option value="fieldSession">Field Session</option>
                        <option value="software">Software</option>
                        <option value="model">Model</option>
                        <option value="tile">Tile</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Tingkat hierarki data dalam struktur organisasi. "dataset" untuk data tunggal, "series" untuk kumpulan dataset terkait.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hierarchy Level Name
                      </label>
                      <input
                        type="text"
                        name="hierarchyLevelName"
                        value={metadata.hierarchyLevelName}
                        onChange={(e) => setMetadata(prev => ({ ...prev, hierarchyLevelName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Dataset Peta Administrasi Kabupaten - untuk peta batas wilayah"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama deskriptif untuk tingkat hierarki yang dipilih. Jelaskan jenis dataset secara spesifik.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={metadata.contactName || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contactName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ahmad Surya"
                      />
                      <p className="text-xs text-gray-500 mt-1">Informasi kontak orang atau organisasi yang bertanggung jawab atas metadata ini. Biasanya adalah pembuat atau pemelihara data.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={metadata.contactEmail || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="ahmad@dkb.go.id"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email kontak untuk metadata</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Stamp
                      </label>
                      <input
                        type="date"
                        name="dateStamp"
                        value={metadata.dateStamp}
                        onChange={(e) => setMetadata(prev => ({ ...prev, dateStamp: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tanggal pembuatan atau terakhir kali metadata ini diperbarui. Format: YYYY-MM-DD.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metadata Standard Name
                      </label>
                      <input
                        type="text"
                        name="metadataStandardName"
                        value={metadata.metadataStandardName}
                        onChange={(e) => setMetadata(prev => ({ ...prev, metadataStandardName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="ISO 19115 - standar internasional untuk metadata geospasial"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nama standar metadata yang digunakan. Untuk Indonesia, gunakan ISO 19115 atau SNI ISO 19115.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metadata Standard Version
                      </label>
                      <input
                        type="text"
                        name="metadataStandardVersion"
                        value={metadata.metadataStandardVersion}
                        onChange={(e) => setMetadata(prev => ({ ...prev, metadataStandardVersion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="2003/Cor.1:2006 - versi ISO 19115 yang umum digunakan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Versi spesifik dari standar metadata yang digunakan.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Set URI
                      </label>
                      <input
                        type="text"
                        name="dataSetURI"
                        value={metadata.dataSetURI}
                        onChange={(e) => setMetadata(prev => ({ ...prev, dataSetURI: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://data.bps.go.id/dataset/peta-administrasi-2024"
                      />
                      <p className="text-xs text-gray-500 mt-1">Alamat web (URL) lengkap untuk mengakses dataset asli. Kosongkan jika data belum dipublikasikan secara online.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Locale
                      </label>
                      <input
                        type="text"
                        name="locale"
                        value={metadata.locale}
                        onChange={(e) => setMetadata(prev => ({ ...prev, locale: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="id - untuk bahasa Indonesia"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pengaturan bahasa dan budaya untuk metadata. Gunakan kode bahasa ISO 639-1.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'identificationInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={metadata.title}
                        onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Peta Administrasi Indonesia Tahun 2024 Skala 1:25.000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Judul lengkap dan deskriptif dari dataset. Harus jelas menggambarkan isi data dan wilayah cakupannya.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="status"
                        value={metadata.status}
                        onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="planned">Planned</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Status terkini dari dataset. Pilih sesuai kondisi data saat ini.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Abstract <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="abstract"
                        value={metadata.abstract}
                        onChange={(e) => setMetadata(prev => ({ ...prev, abstract: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Dataset ini berisi peta administrasi Indonesia tahun 2024 yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan. Data dikumpulkan dari sumber resmi pemerintah dan telah diverifikasi keakuratannya."
                      />
                      <p className="text-xs text-gray-500 mt-1">Ringkasan lengkap tentang isi, sumber, metode pengumpulan, dan kegunaan dataset. Minimal 100-200 kata.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Purpose
                      </label>
                      <textarea
                        name="purpose"
                        value={metadata.purpose}
                        onChange={(e) => setMetadata(prev => ({ ...prev, purpose: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Dataset ini digunakan untuk perencanaan pembangunan infrastruktur, analisis spasial wilayah, dan keperluan administrasi pemerintahan daerah."
                      />
                      <p className="text-xs text-gray-500 mt-1">Tujuan spesifik penggunaan dataset ini. Jelaskan manfaat dan aplikasi praktis dari data.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Topic Category
                      </label>
                      <select
                        name="topicCategory"
                        value={metadata.topicCategory}
                        onChange={(e) => setMetadata(prev => ({ ...prev, topicCategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih kategori topik</option>
                        <option value="boundaries">Boundaries</option>
                        <option value="biota">Biota</option>
                        <option value="climatology">Climatology</option>
                        <option value="economy">Economy</option>
                        <option value="elevation">Elevation</option>
                        <option value="environment">Environment</option>
                        <option value="geoscientific">Geoscientific</option>
                        <option value="health">Health</option>
                        <option value="imagery">Imagery</option>
                        <option value="oceans">Oceans</option>
                        <option value="planning">Planning</option>
                        <option value="society">Society</option>
                        <option value="transportation">Transportation</option>
                        <option value="utilities">Utilities</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Kategori utama isi data menurut standar ISO 19115. Pilih yang paling sesuai dengan tema dataset.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spatial Resolution
                      </label>
                      <input
                        type="text"
                        name="spatialResolution"
                        value={metadata.spatialResolution}
                        onChange={(e) => setMetadata(prev => ({ ...prev, spatialResolution: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="1:25.000 - artinya 1 cm di peta = 25.000 cm di lapangan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tingkat detail spasial data. Dapat dinyatakan sebagai skala peta (1:25.000) atau resolusi dalam meter.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Point of Contact
                      </label>
                      <input
                        type="text"
                        name="pointOfContact"
                        value={metadata.pointOfContact}
                        onChange={(e) => setMetadata(prev => ({ ...prev, pointOfContact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nama: Dr. Ahmad Surya, Email: ahmad.surya@dkb.go.id, Jabatan: Koordinator GIS DKB Otorita Ibu Kota Nusantara"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kontak utama untuk pertanyaan tentang dataset ini. Biasanya adalah ahli teknis atau koordinator data.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descriptive Keywords
                      </label>
                      <input
                        type="text"
                        name="descriptiveKeywords"
                        value={metadata.descriptiveKeywords}
                        onChange={(e) => setMetadata(prev => ({ ...prev, descriptiveKeywords: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="administrasi, peta, indonesia, batas wilayah"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kata kunci yang membantu pencarian data. Pisahkan dengan koma, gunakan istilah baku.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extent <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="extent"
                        value={metadata.extent}
                        onChange={(e) => setMetadata(prev => ({ ...prev, extent: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Bounding Box: 95.0°E, 141.0°E, -11.0°N, 6.0°N"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cakupan geografis dataset dalam koordinat. Gunakan format bounding box (kotak pembatas).</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Documentation
                      </label>
                      <input
                        type="text"
                        name="additionalDocumentation"
                        value={metadata.additionalDocumentation}
                        onChange={(e) => setMetadata(prev => ({ ...prev, additionalDocumentation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Link ke dokumentasi teknis atau metodologi"
                      />
                      <p className="text-xs text-gray-500 mt-1">Referensi ke dokumentasi teknis tambahan seperti metodologi pengumpulan data, spesifikasi teknis, atau laporan validasi.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Processing Level
                      </label>
                      <select
                        name="processingLevel"
                        value={metadata.processingLevel}
                        onChange={(e) => setMetadata(prev => ({ ...prev, processingLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih tingkat pemrosesan</option>
                        <option value="raw">Raw</option>
                        <option value="processed">Processed</option>
                        <option value="interpreted">Interpreted</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Tingkat pengolahan data dari mentah hingga siap pakai.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Maintenance
                      </label>
                      <input
                        type="text"
                        name="resourceMaintenance"
                        value={metadata.resourceMaintenance}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceMaintenance: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Frekuensi update: tahunan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Informasi tentang frekuensi update dan pemeliharaan dataset.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graphic Overview
                      </label>
                      <input
                        type="text"
                        name="graphicOverview"
                        value={metadata.graphicOverview}
                        onChange={(e) => setMetadata(prev => ({ ...prev, graphicOverview: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Thumbnail atau preview gambar dataset"
                      />
                      <p className="text-xs text-gray-500 mt-1">URL atau path ke gambar preview/thumbnail yang menunjukkan contoh isi dataset.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Format
                      </label>
                      <input
                        type="text"
                        name="resourceFormat"
                        value={metadata.resourceFormat}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="GeoJSON, Shapefile, GeoTIFF"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format file digital dari dataset asli.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Specific Usage
                      </label>
                      <textarea
                        name="resourceSpecificUsage"
                        value={metadata.resourceSpecificUsage}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceSpecificUsage: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Digunakan oleh pemerintah daerah untuk perencanaan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Contoh spesifik penggunaan dataset di dunia nyata.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resource Constraints
                      </label>
                      <textarea
                        name="resourceConstraints"
                        value={metadata.resourceConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceConstraints: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Lisensi Creative Commons, pembatasan akses"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ketentuan penggunaan, lisensi, dan pembatasan akses data.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'spatialRepresentationInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spatial Representation Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="spatialRepresentationType"
                        value={metadata.spatialRepresentationType}
                        onChange={(e) => setMetadata(prev => ({ ...prev, spatialRepresentationType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih tipe representasi spasial</option>
                        <option value="vector">Vector</option>
                        <option value="grid">Grid</option>
                        <option value="textTable">Text Table</option>
                        <option value="tin">TIN</option>
                        <option value="stereoModel">Stereo Model</option>
                        <option value="video">Video</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Jenis struktur data geospasial: 1) vector - data titik/garis/polygon seperti peta jalan, batas wilayah, sungai; 2) grid - data raster seperti citra satelit, DEM, peta kontur; 3) textTable - data tabular dengan kolom koordinat; 4) tin - model triangulasi untuk permukaan 3D; 5) stereoModel - model stereoskopik; 6) video - data video georeferensikan.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Axis Dimension Properties
                      </label>
                      <input
                        type="text"
                        name="axisDimensionProperties"
                        value={metadata.axisDimensionProperties}
                        onChange={(e) => setMetadata(prev => ({ ...prev, axisDimensionProperties: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="X: 2D, Y: 2D, Z: opsional"
                      />
                      <p className="text-xs text-gray-500 mt-1">Informasi dimensi spasial data. Untuk data 2D standar, X dan Y adalah koordinat horizontal dan vertikal.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cell Geometry
                      </label>
                      <select
                        name="cellGeometry"
                        value={metadata.cellGeometry}
                        onChange={(e) => setMetadata(prev => ({ ...prev, cellGeometry: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih geometri sel</option>
                        <option value="point">Point</option>
                        <option value="area">Area</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Bentuk geometri dari setiap sel dalam data grid/raster. Point untuk data titik, area untuk data poligon.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Georectified</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="georectified"
                          checked={metadata.georectified}
                          onChange={(e) => setMetadata(prev => ({ ...prev, georectified: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Georectified</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Apakah data raster telah dikoreksi sehingga memiliki sistem koordinat yang akurat dan dapat di-overlay dengan data lain.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Georeferenceable</label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="georeferenceable"
                          checked={metadata.georeferenceable}
                          onChange={(e) => setMetadata(prev => ({ ...prev, georeferenceable: e.target.checked }))}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Georeferenceable</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Apakah data memiliki informasi koordinat yang memungkinkan diposisikan di peta dunia.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'referenceSystemInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference System Identifier <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="referenceSystemIdentifier"
                        value={metadata.referenceSystemIdentifier}
                        onChange={(e) => setMetadata(prev => ({ ...prev, referenceSystemIdentifier: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="EPSG:4326 (WGS84)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kode identifikasi sistem koordinat yang digunakan. EPSG:4326 adalah standar global untuk koordinat geografis.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reference System Type
                      </label>
                      <select
                        name="referenceSystemType"
                        value={metadata.referenceSystemType}
                        onChange={(e) => setMetadata(prev => ({ ...prev, referenceSystemType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih tipe sistem referensi</option>
                        <option value="geodetic">Geodetic</option>
                        <option value="vertical">Vertical</option>
                        <option value="temporal">Temporal</option>
                        <option value="WGS84 Geographic">WGS84 Geographic</option>
                        <option value="UTM">UTM</option>
                        <option value="Lambert Conformal Conic">Lambert Conformal Conic</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Jenis sistem referensi: geodetic untuk koordinat bumi, vertical untuk ketinggian, temporal untuk waktu.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'contentInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Attribute Description
                      </label>
                      <textarea
                        name="attributeDescription"
                        value={metadata.attributeDescription}
                        onChange={(e) => setMetadata(prev => ({ ...prev, attributeDescription: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nama atribut dan deskripsinya"
                      />
                      <p className="text-xs text-gray-500 mt-1">Penjelasan detail tentang atribut/kolom data, tipe data, dan makna dari setiap atribut.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Type
                      </label>
                      <select
                        name="contentType"
                        value={metadata.contentType}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contentType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih tipe konten</option>
                        <option value="image">Image</option>
                        <option value="thematicClassification">Thematic Classification</option>
                        <option value="physicalMeasurement">Physical Measurement</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Jenis isi data: image untuk citra, thematicClassification untuk data tematik, physicalMeasurement untuk pengukuran fisik.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'distributionInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distribution Format
                      </label>
                      <input
                        type="text"
                        name="distributionFormat"
                        value={metadata.distributionFormat}
                        onChange={(e) => setMetadata(prev => ({ ...prev, distributionFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="GeoJSON, Shapefile, GeoTIFF"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format file yang digunakan untuk mendistribusikan dataset.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Distributor
                      </label>
                      <input
                        type="text"
                        name="distributor"
                        value={metadata.distributor}
                        onChange={(e) => setMetadata(prev => ({ ...prev, distributor: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara, Email: data@dkb.go.id, Telepon: 021-3507020"
                      />
                      <p className="text-xs text-gray-500 mt-1">Informasi tentang organisasi yang mendistribusikan dataset.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Online Resource
                      </label>
                      <input
                        type="text"
                        name="onlineResource"
                        value={metadata.onlineResource}
                        onChange={(e) => setMetadata(prev => ({ ...prev, onlineResource: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://data.bps.go.id/dataset/peta-administrasi-indonesia-2024"
                      />
                      <p className="text-xs text-gray-500 mt-1">Alamat web lengkap untuk mengakses dataset secara online.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transfer Options
                      </label>
                      <textarea
                        name="transferOptions"
                        value={metadata.transferOptions}
                        onChange={(e) => setMetadata(prev => ({ ...prev, transferOptions: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="URL download, protokol akses"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cara-cara untuk mendapatkan atau mentransfer dataset.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'dataQualityInfo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scope <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="scope"
                        value={metadata.scope}
                        onChange={(e) => setMetadata(prev => ({ ...prev, scope: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Pilih cakupan</option>
                        <option value="dataset">Dataset</option>
                        <option value="series">Series</option>
                        <option value="feature">Feature</option>
                        <option value="featureType">Feature Type</option>
                        <option value="attribute">Attribute</option>
                        <option value="attributeType">Attribute Type</option>
                        <option value="collectionHardware">Collection Hardware</option>
                        <option value="collectionSession">Collection Session</option>
                        <option value="tile">Tile</option>
                        <option value="model">Model</option>
                        <option value="fieldSession">Field Session</option>
                        <option value="software">Software</option>
                        <option value="service">Service</option>
                        <option value="metadata">Metadata</option>
                        <option value="initiative">Initiative</option>
                        <option value="stereomate">Stereomate</option>
                        <option value="sensor">Sensor</option>
                        <option value="platformSeries">Platform Series</option>
                        <option value="sensorSeries">Sensor Series</option>
                        <option value="productionSeries">Production Series</option>
                        <option value="transferAggregate">Transfer Aggregate</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Ruang lingkup yang dinilai kualitas datanya. Biasanya "dataset" untuk keseluruhan data.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lineage
                      </label>
                      <textarea
                        name="lineage"
                        value={metadata.lineage}
                        onChange={(e) => setMetadata(prev => ({ ...prev, lineage: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Sumber data, metode pengumpulan, proses pengolahan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Riwayat lengkap pengumpulan, pemrosesan, dan transformasi data dari sumber asli hingga menjadi dataset final.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accuracy
                      </label>
                      <input
                        type="text"
                        name="accuracy"
                        value={metadata.accuracy}
                        onChange={(e) => setMetadata(prev => ({ ...prev, accuracy: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Positional accuracy, attribute accuracy"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tingkat ketepatan dan keakuratan data, baik secara posisional maupun atribut.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completeness
                      </label>
                      <input
                        type="text"
                        name="completeness"
                        value={metadata.completeness}
                        onChange={(e) => setMetadata(prev => ({ ...prev, completeness: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Persentase data yang lengkap"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tingkat kelengkapan data dalam persentase atau deskripsi cakupan wilayah yang tercakup.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consistency
                      </label>
                      <input
                        type="text"
                        name="consistency"
                        value={metadata.consistency}
                        onChange={(e) => setMetadata(prev => ({ ...prev, consistency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Tingkat konsistensi antar atribut"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tingkat konsistensi data antar atribut dan kesesuaian dengan standar yang berlaku.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'metadataConstraints' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Use Constraints
                      </label>
                      <textarea
                        name="useConstraints"
                        value={metadata.useConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, useConstraints: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Lisensi, hak cipta, pembatasan akses"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ketentuan dan pembatasan penggunaan data, termasuk hak cipta dan lisensi.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Constraints
                      </label>
                      <input
                        type="text"
                        name="accessConstraints"
                        value={metadata.accessConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, accessConstraints: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="restricted, confidential, protected"
                      />
                      <p className="text-xs text-gray-500 mt-1">Pembatasan akses terhadap data, seperti restricted, confidential, atau protected.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Constraints
                      </label>
                      <textarea
                        name="otherConstraints"
                        value={metadata.otherConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, otherConstraints: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Persyaratan khusus penggunaan"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ketentuan khusus lainnya yang perlu diperhatikan dalam penggunaan data.</p>
                    </div>
                  </div>
                )}

                {/* SNI Specific - always visible */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Standar SNI
                    </label>
                    <select
                      value={metadata.sniStandard}
                      onChange={(e) => setMetadata(prev => ({ ...prev, sniStandard: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="SNI-ISO-19115-2019">SNI ISO 19115:2019</option>
                      <option value="SNI-ISO-19139-2019">SNI ISO 19139:2019</option>
                      <option value="SNI-ISO-19119-2019">SNI ISO 19119:2019</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Standar SNI yang menjadi acuan dalam pembuatan metadata</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Versi SNI
                    </label>
                    <input
                      type="text"
                      value={metadata.sniVersion}
                      onChange={(e) => setMetadata(prev => ({ ...prev, sniVersion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="1.0 - versi pertama standar SNI ISO 19115:2019"
                    />
                    <p className="text-xs text-gray-500 mt-1">Versi spesifik dari standar SNI yang digunakan untuk validasi metadata</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bahasa
                    </label>
                    <select
                      value={metadata.bahasa}
                      onChange={(e) => setMetadata(prev => ({ ...prev, bahasa: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="id">Indonesia</option>
                      <option value="en">English</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Bahasa utama yang digunakan dalam metadata. Untuk Indonesia, gunakan "id"</p>
                  </div>
                </div>


                {/* Section Navigation Buttons */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = metadataEntities.findIndex(e => e.id === activeSection)
                      if (currentIndex > 0) {
                        setActiveSection(metadataEntities[currentIndex - 1].id)
                        setError(null)
                        setShowErrorModal(false)
                      }
                    }}
                    disabled={metadataEntities.findIndex(e => e.id === activeSection) === 0}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    {metadataEntities.findIndex(e => e.id === activeSection) + 1} of {metadataEntities.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = metadataEntities.findIndex(e => e.id === activeSection)
                      if (currentIndex < metadataEntities.length - 1) {
                        setActiveSection(metadataEntities[currentIndex + 1].id)
                        setError(null)
                        setShowErrorModal(false)
                      }
                    }}
                    disabled={metadataEntities.findIndex(e => e.id === activeSection) === metadataEntities.length - 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center">
                  {message.includes('successfully') ? (
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${message.includes('successfully') ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </span>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={uploading || !files}
                className="w-full btn-primary py-3 px-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Mengupload...
                  </div>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Field Wajib Belum Lengkap</h3>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Harap lengkapi semua field yang bertanda * :
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-sm text-red-800 space-y-2">
                    {(() => {
                      const requiredFields = [
                        { value: metadata.title?.trim(), name: 'Judul' },
                        { value: metadata.abstract?.trim(), name: 'Abstrak' },
                        { value: metadata.status?.trim(), name: 'Status' },
                        { value: metadata.extent?.trim(), name: 'Extent' },
                        { value: metadata.contactName?.trim(), name: 'Nama Kontak' },
                        { value: metadata.contactEmail?.trim(), name: 'Email Kontak' },
                        { value: metadata.spatialRepresentationType?.trim(), name: 'Spatial Representation Type' },
                        { value: metadata.referenceSystemIdentifier?.trim(), name: 'Reference System Identifier' },
                        { value: metadata.scope?.trim(), name: 'Scope' }
                      ]
                      return requiredFields.filter(field => !field.value).map((field, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          {field.name}
                        </li>
                      ))
                    })()}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}