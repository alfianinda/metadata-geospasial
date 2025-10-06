'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../../components/Navbar'
import XmlPreview from '../../components/XmlPreview'
import jwt from 'jsonwebtoken'

interface Metadata {
  id: string
  title: string
  abstract: string
  status: string
  purpose: string
  topicCategory: string
  spatialResolution: string
  temporalResolution: string
  extent: string
  additionalDocumentation: string
  processingLevel: string
  resourceMaintenance: string
  graphicOverview: string
  resourceFormat: string
  descriptiveKeywords: string
  resourceSpecificUsage: string
  resourceConstraints: string
  spatialRepresentationType: string
  axisDimensionProperties: string
  cellGeometry: string
  transformationParameterAvailability: boolean
  checkPointAvailability: boolean
  controlPointAvailability: boolean
  orientationParameterAvailability: boolean
  georectified: boolean
  georeferenceable: boolean
  referenceSystemIdentifier: string
  referenceSystemType: string
  attributeDescription: string
  contentType: string
  distributionFormat: string
  distributor: string
  onlineResource: string
  transferOptions: string
  scope: string
  lineage: string
  accuracy: string
  completeness: string
  consistency: string
  useConstraints: string
  accessConstraints: string
  otherConstraints: string
  sniCompliant: boolean
  sniVersion: string
  sniStandard: string
  bahasa: string
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
  xmlContent: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
  }
  files: Array<{
    id: string
    originalName: string
    size: number
    mimetype: string
    url: string
    createdAt: string
  }>
}

export default function EditMetadata() {
  const router = useRouter()
  const { id } = router.query
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('metadata')
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [activeSection, setActiveSection] = useState('root')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['root']))
  const [xmlContent, setXmlContent] = useState('')
  const [xmlFormat, setXmlFormat] = useState('iso19139')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailFormat, setEmailFormat] = useState('iso19139')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [apiMissingFields, setApiMissingFields] = useState<string[]>([])

  // Metadata entities hierarchy - updated to match actual database schema
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
          description: 'Kode unik yang mengidentifikasi metadata ini. Biasanya menggunakan UUID atau kode internal organisasi. Contoh: untuk dataset BPS bisa menggunakan format BPS-2024-001, atau UUID seperti uuid:12345678-1234-1234-1234-123456789abc. Jika kosong, sistem akan generate UUID otomatis.',
          required: false,
          example: 'BPS-2024-001 atau uuid:12345678-1234-1234-1234-123456789abc',
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
          example: 'BPS-2024-SERIES-001 - untuk dataset yang merupakan bagian dari seri',
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
          example: 'Nama: Ahmad Surya, Email: ahmad@bps.go.id, Organisasi: BPS',
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
          description: 'Status terkini dari dataset. Pilih sesuai kondisi data saat ini: completed (selesai), ongoing (sedang berlangsung), planned (direncanakan).',
          required: true,
          example: 'completed - untuk data yang sudah final dan lengkap',
          standard: 'ISO 19115 Mandatory'
        },
        {
          id: 'abstract',
          name: 'abstract',
          description: 'Ringkasan lengkap tentang isi, sumber, metode pengumpulan, dan kegunaan dataset. Minimal 100-200 kata.',
          required: true,
          example: 'Dataset ini berisi peta administrasi Indonesia tahun 2024 yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan. Data dikumpul dari sumber resmi pemerintah dan telah diverifikasi keakuratannya.',
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
          example: 'Nama: Dr. Ahmad Surya, Email: ahmad.surya@bps.go.id, Jabatan: Koordinator GIS BPS',
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
          example: 'Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber',
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
          example: 'provinsi: string - nama provinsi, kode_prov: string - kode BPS provinsi, luas_km2: number - luas wilayah dalam km²',
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
          example: 'Badan Pusat Statistik (BPS), Email: data@bps.go.id, Telepon: 021-3843140',
          standard: 'ISO 19115 Optional'
        },
        {
          id: 'onlineResource',
          name: 'onlineResource',
          description: 'Sumber online',
          required: false,
          example: 'URL sumber online',
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
          example: 'Akurasi posisional: ±2.5 meter pada skala 1:25.000, akurasi atribut: 95% sesuai dengan data BPS',
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

  useEffect(() => {
    if (!id || Array.isArray(id)) return

    const token = localStorage.getItem('token')
    if (!token) {
      setError('Anda belum login. Silakan login terlebih dahulu.')
      setTimeout(() => router.push('/'), 3000)
      return
    }

    fetchMetadata()
  }, [id, router])

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/metadata/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMetadata(data)
        setXmlContent(data.xmlContent || '')
        
        // Set default values for form fields, mapping API field names to frontend field names
        setFormData({
          // MD_Metadata Root fields
          fileIdentifier: data.fileIdentifier || '',
          language: data.language || 'ind',
          characterSet: data.characterSet || 'utf8',
          parentIdentifier: data.parentIdentifier || '',
          hierarchyLevel: data.hierarchyLevel || 'dataset',
          hierarchyLevelName: data.hierarchyLevelName || '',
          contactName: data.contactName || '',
          contactEmail: data.contactEmail || '',
          dateStamp: data.dateStamp ? new Date(data.dateStamp).toISOString().split('T')[0] : '',
          metadataStandardName: data.metadataStandardName || 'ISO 19115',
          metadataStandardVersion: data.metadataStandardVersion || '2003/Cor.1:2006',
          dataSetURI: data.dataSetURI || '',
          locale: data.locale || 'id',

          // identificationInfo fields
          citation: data.citation || '',
          title: data.title || '',
          abstract: data.abstract || '',
          purpose: data.purpose || '',
          credit: data.credit || '',
          status: data.status || 'completed',
          pointOfContact: data.pointOfContact || '',
          spatialRepresentationType: data.spatialRepresentationType || 'vector',
          spatialResolution: data.spatialResolution || '',
          temporalResolution: data.temporalResolution || '',
          topicCategory: data.topicCategory || '',
          extent: data.geographicExtent || data.extent || '', // API returns geographicExtent or extent
          additionalDocumentation: data.supplementalInfo || data.additionalDocumentation || '', // API returns supplementalInfo or additionalDocumentation
          processingLevel: data.processingLevel || '',
          resourceMaintenance: data.updateFrequency || data.resourceMaintenance || '', // API returns updateFrequency or resourceMaintenance
          graphicOverview: data.graphicOverview || '',
          resourceFormat: data.dataFormat || data.resourceFormat || '',
          descriptiveKeywords: data.keywords || data.themeKeywords || data.descriptiveKeywords || '', // API returns keywords, themeKeywords, or descriptiveKeywords
          resourceSpecificUsage: data.resourceSpecificUsage || '',
          resourceConstraints: data.resourceConstraints || '',

          // spatialRepresentationInfo fields
          axisDimensionProperties: data.axisDimensionProperties || '',
          cellGeometry: data.cellGeometry || '',
          transformationParameterAvailability: data.transformationParameterAvailability || false,
          checkPointAvailability: data.checkPointAvailability || false,
          controlPointAvailability: data.controlPointAvailability || false,
          orientationParameterAvailability: data.orientationParameterAvailability || false,
          georectified: data.georectified || false,
          georeferenceable: data.georeferenceable || false,

          // referenceSystemInfo fields
          referenceSystemIdentifier: data.coordinateSystem || data.referenceSystemIdentifier || 'EPSG:4326', // API returns coordinateSystem or referenceSystemIdentifier
          referenceSystemType: data.referenceSystemType || 'geodetic',

          // contentInfo fields
          attributeDescription: (() => {
            if (data.attributeInfo) {
              if (typeof data.attributeInfo === 'string') {
                try {
                  const parsed = JSON.parse(data.attributeInfo);
                  return typeof parsed === 'object' && parsed.description ? parsed.description : JSON.stringify(parsed);
                } catch {
                  return data.attributeInfo;
                }
              } else if (typeof data.attributeInfo === 'object') {
                return data.attributeInfo.description || JSON.stringify(data.attributeInfo);
              }
            }
            return data.attributeDescription || '';
          })(),
          contentType: data.contentType || '',

          // distributionInfo fields
          distributionFormat: data.distributionFormat || '',
          distributor: data.distributor || '',
          onlineResource: data.onlineResource || '',
          transferOptions: data.transferOptions || '',

          // dataQualityInfo fields
          scope: data.scope || 'dataset',
          lineage: data.lineage || '',
          accuracy: data.accuracy || '',
          completeness: data.completeness || '',
          consistency: data.consistency || '',

          // metadataConstraints fields
          useConstraints: data.useConstraints || '',
          accessConstraints: data.accessConstraints || '',
          otherConstraints: data.otherConstraints || '',

          // SNI Specific
          sniCompliant: data.sniCompliant !== undefined ? data.sniCompliant : true,
          sniVersion: data.sniVersion || '1.0',
          sniStandard: data.sniStandard || 'SNI-ISO-19115-2019',
          bahasa: data.bahasa || 'id'
        })
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        setTimeout(() => router.push('/'), 3000)
      } else {
        setError('Gagal memuat metadata. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error fetching metadata:', error)
      setError('Terjadi kesalahan saat memuat metadata.')
    } finally {
      setLoading(false)
    }
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

  const goToNextSection = () => {
    const currentIndex = metadataEntities.findIndex(entity => entity.id === activeSection)
    if (currentIndex < metadataEntities.length - 1) {
      const nextSection = metadataEntities[currentIndex + 1]
      setActiveSection(nextSection.id)
      setCurrentSectionIndex(currentIndex + 1)
    }
  }

  const goToPreviousSection = () => {
    const currentIndex = metadataEntities.findIndex(entity => entity.id === activeSection)
    if (currentIndex > 0) {
      const prevSection = metadataEntities[currentIndex - 1]
      setActiveSection(prevSection.id)
      setCurrentSectionIndex(currentIndex - 1)
    }
  }

  const handleXmlFormatChange = (format: string) => {
    setXmlFormat(format)
  }

  const handleDownload = (format: string) => {
    if (!xmlContent) return

    const blob = new Blob([xmlContent], { type: 'text/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `metadata.${format === 'sni' ? 'json' : 'xml'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSendEmail = async () => {
    if (!emailRecipient) {
      setEmailMessage('Please enter recipient email address')
      return
    }

    setSendingEmail(true)
    setEmailMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/email/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient: emailRecipient,
          format: emailFormat
        })
      })

      const data = await response.json()

      if (response.ok) {
        setEmailMessage(`Email sent successfully to ${emailRecipient}`)
        setShowEmailModal(false)
        setEmailRecipient('')
      } else {
        setEmailMessage(data.message || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setEmailMessage('Failed to send email. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }


  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/metadata/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        router.push('/dashboard')
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        setTimeout(() => router.push('/'), 3000)
      } else {
        setError('Gagal menghapus metadata. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error deleting metadata:', error)
      setError('Terjadi kesalahan saat menghapus metadata.')
    }
  }

  const [formData, setFormData] = useState({
    // MD_Metadata Root fields
    fileIdentifier: '',
    language: 'ind',
    characterSet: 'utf8',
    parentIdentifier: '',
    hierarchyLevel: 'dataset',
    hierarchyLevelName: '',
    contactName: '',
    contactEmail: '',
    dateStamp: '',
    metadataStandardName: 'ISO 19115',
    metadataStandardVersion: '2003/Cor.1:2006',
    dataSetURI: '',
    locale: 'id',

    // identificationInfo fields
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

    // spatialRepresentationInfo fields
    axisDimensionProperties: '',
    cellGeometry: '',
    transformationParameterAvailability: false,
    checkPointAvailability: false,
    controlPointAvailability: false,
    orientationParameterAvailability: false,
    georectified: false,
    georeferenceable: false,

    // referenceSystemInfo fields
    referenceSystemIdentifier: 'EPSG:4326',
    referenceSystemType: 'geodetic',

    // contentInfo fields
    attributeDescription: '',
    contentType: '',

    // distributionInfo fields
    distributionFormat: '',
    distributor: '',
    onlineResource: '',
    transferOptions: '',

    // dataQualityInfo fields
    scope: 'dataset',
    lineage: '',
    accuracy: '',
    completeness: '',
    consistency: '',

    // metadataConstraints fields
    useConstraints: '',
    accessConstraints: '',
    otherConstraints: '',

    // SNI Specific
    sniCompliant: true,
    sniVersion: '1.0',
    sniStandard: 'SNI-ISO-19115-2019',
    bahasa: 'id'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields (ISO 19115 Mandatory)
    const requiredFields = [
      { value: formData.title?.trim(), name: 'Judul' },
      { value: formData.abstract?.trim(), name: 'Abstrak' },
      { value: formData.status?.trim(), name: 'Status' },
      { value: formData.extent?.trim(), name: 'Extent' },
      { value: formData.contactName?.trim(), name: 'Nama Kontak' },
      { value: formData.contactEmail?.trim(), name: 'Email Kontak' },
      { value: formData.spatialRepresentationType?.trim(), name: 'Spatial Representation Type' },
      { value: formData.referenceSystemIdentifier?.trim(), name: 'Reference System Identifier' },
      { value: formData.scope?.trim(), name: 'Scope' }
    ]

    const missingFields = requiredFields.filter(field => !field.value)

    if (missingFields.length > 0) {
      setError(`Lengkapi field berikut: ${missingFields.map(f => f.name).join(', ')}`)
      setShowErrorModal(true)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')

      // Map frontend field names to API expected field names
      const apiData = {
        ...formData,
        geographicExtent: formData.extent, // API expects geographicExtent
        coordinateSystem: formData.referenceSystemIdentifier, // API expects coordinateSystem
        contact: formData.contactName, // API expects contact as contactName
        contactEmail: formData.contactEmail,
        keywords: formData.descriptiveKeywords, // API expects keywords
        supplementalInfo: formData.additionalDocumentation, // API expects supplementalInfo
        updateFrequency: formData.resourceMaintenance, // API expects updateFrequency
        themeKeywords: formData.descriptiveKeywords, // API expects themeKeywords
        onlineResource: formData.onlineResource || formData.transferOptions, // API expects onlineResource
      }

      const response = await fetch(`/api/metadata/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })

      const data = await response.json()

      if (response.ok) {
        setMetadata(data)
        setXmlContent(data.xmlContent || '')
        router.push(`/metadata/${id}`)
      } else if (response.status === 401) {
        setError('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        setTimeout(() => router.push('/'), 3000)
      } else if (response.status === 400 && data.missingFields) {
        // Show specific missing fields in modal
        setError(data.message || 'Lengkapi semua field yang bertanda *')
        setApiMissingFields(data.missingFields)
        setShowErrorModal(true)
        // The modal will show the missing fields from the API
      } else {
        setError(data.message || 'Gagal menyimpan perubahan. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error updating metadata:', error)
      setError('Terjadi kesalahan saat menyimpan perubahan.')
    } finally {
      setSaving(false)
    }
  }

  const [showErrorModal, setShowErrorModal] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!metadata) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Metadata Tidak Ditemukan</h1>
          <p className="text-gray-600">Metadata yang Anda cari tidak ada atau telah dihapus.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
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
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Edit Metadata</h1>
                <p className="text-gray-600">Perbarui informasi metadata yang sudah ada</p>
              </div>

              {/* Section Navigation */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border border-gray-200">
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
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">


                  {/* Render fields based on active section */}
                  {activeSection === 'identificationInfo' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="completed">Completed</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="planned">Planned</option>
                          <option value="deprecated">Deprecated</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Status terkini dari dataset. Pilih sesuai kondisi data saat ini: completed (selesai), ongoing (sedang berlangsung), planned (direncanakan).</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Abstract <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="abstract"
                          value={formData.abstract}
                          onChange={handleChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Dataset ini berisi peta administrasi Indonesia tahun 2024 yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan. Data dikumpul dari sumber resmi pemerintah dan telah diverifikasi keakuratannya."
                        />
                        <p className="text-xs text-gray-500 mt-1">Ringkasan lengkap tentang isi, sumber, metode pengumpulan, dan kegunaan dataset. Minimal 100-200 kata.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purpose
                        </label>
                        <textarea
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.topicCategory}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.spatialResolution}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="1:25.000 (skala), 10 meter (resolusi)"
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
                          value={formData.pointOfContact}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nama: Dr. Ahmad Surya, Email: ahmad.surya@bps.go.id, Jabatan: Koordinator GIS BPS"
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
                          value={formData.descriptiveKeywords}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="administrasi, peta, indonesia, batas wilayah, kabupaten, provinsi"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kata kunci yang membantu pencarian data. Pisahkan dengan koma, gunakan istilah baku.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Extent <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="extent"
                          value={formData.extent}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Bounding Box: 95.0°E, 141.0°E, -11.0°N, 6.0°N - mencakup seluruh wilayah Indonesia"
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
                          value={formData.additionalDocumentation}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://bps.go.id/metodologi-peta-administrasi-2024.pdf"
                        />
                        <p className="text-xs text-gray-500 mt-1">Referensi ke dokumentasi teknis tambahan seperti metodologi pengumpulan data, spesifikasi teknis, atau laporan validasi.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Processing Level
                        </label>
                        <select
                          name="processingLevel"
                          value={formData.processingLevel}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.resourceMaintenance}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Update tahunan sesuai dengan perubahan administrasi pemerintahan"
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
                          value={formData.graphicOverview}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://data.bps.go.id/thumbnails/peta-administrasi-2024.jpg"
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
                          value={formData.resourceFormat}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="GeoJSON - format modern untuk data vektor berbasis web"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format file digital dari dataset asli.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resource Specific Usage
                        </label>
                        <textarea
                          name="resourceSpecificUsage"
                          value={formData.resourceSpecificUsage}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Digunakan oleh Kementerian PUPR untuk perencanaan jalan tol trans-Jawa"
                        />
                        <p className="text-xs text-gray-500 mt-1">Contoh spesifik penggunaan dataset di dunia nyata.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resource Constraints
                        </label>
                        <textarea
                          name="resourceConstraints"
                          value={formData.resourceConstraints}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ketentuan penggunaan, lisensi, dan pembatasan akses data.</p>
                      </div>
                    </div>
                  )}

                  {activeSection === 'root' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Identifier
                        </label>
                        <input
                          type="text"
                          name="fileIdentifier"
                          value={formData.fileIdentifier}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="BPS-2024-001 atau uuid:12345678-1234-1234-1234-123456789abc"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kode unik yang mengidentifikasi metadata ini. Biasanya menggunakan UUID atau kode internal organisasi. Contoh: untuk dataset BPS bisa menggunakan format BPS-2024-001, atau UUID seperti uuid:12345678-1234-1234-1234-123456789abc. Jika kosong, sistem akan generate UUID otomatis.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="language"
                          value={formData.language}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.characterSet}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.parentIdentifier}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="BPS-2024-SERIES-001 - untuk dataset yang merupakan bagian dari seri"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kode metadata induk jika dataset ini merupakan bagian dari seri data yang lebih besar. Kosongkan jika dataset ini berdiri sendiri.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hierarchy Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="hierarchyLevel"
                          value={formData.hierarchyLevel}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.hierarchyLevelName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.contactName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nama: Ahmad Surya, Email: ahmad@bps.go.id, Organisasi: BPS"
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
                          value={formData.contactEmail}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="john@example.com"
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
                          value={formData.dateStamp}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.metadataStandardName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.metadataStandardVersion}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.dataSetURI}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.locale}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="id - untuk bahasa Indonesia"
                        />
                        <p className="text-xs text-gray-500 mt-1">Pengaturan bahasa dan budaya untuk metadata. Gunakan kode bahasa ISO 639-1.</p>
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
                          value={formData.spatialRepresentationType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.axisDimensionProperties}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="X: 2D (longitude), Y: 2D (latitude) - untuk data geografis standar"
                        />
                        <p className="text-xs text-gray-500 mt-1">Informasi dimensi spasial data. Untuk data 2D standar, X dan Y adalah koordinat horizontal dan vertikal.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cell Geometry
                        </label>
                        <select
                          name="cellGeometry"
                          value={formData.cellGeometry}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                            checked={formData.georectified}
                            onChange={handleChange}
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
                            checked={formData.georeferenceable}
                            onChange={handleChange}
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
                          value={formData.referenceSystemIdentifier}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="EPSG:4326 - sistem koordinat WGS84 yang digunakan oleh GPS"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kode identifikasi sistem koordinat yang digunakan. EPSG:4326 adalah standar global untuk koordinat geografis.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reference System Type
                        </label>
                        <select
                          name="referenceSystemType"
                          value={formData.referenceSystemType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.attributeDescription}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="provinsi: string - nama provinsi, kode_prov: string - kode BPS provinsi, luas_km2: number - luas wilayah dalam km²"
                        />
                        <p className="text-xs text-gray-500 mt-1">Penjelasan detail tentang atribut/kolom data, tipe data, dan makna dari setiap atribut.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content Type
                        </label>
                        <select
                          name="contentType"
                          value={formData.contentType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                          value={formData.distributionFormat}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="GeoJSON - format modern untuk web GIS dan aplikasi mobile"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format file digital untuk distribusi data. Pilih format yang paling sesuai dengan kebutuhan pengguna.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Distributor
                        </label>
                        <input
                          type="text"
                          name="distributor"
                          value={formData.distributor}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Badan Pusat Statistik (BPS), Email: data@bps.go.id, Telepon: 021-3843140"
                        />
                        <p className="text-xs text-gray-500 mt-1">Informasi tentang pihak yang mendistribusikan data, termasuk kontak dan tanggung jawab.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Online Resource
                        </label>
                        <input
                          type="text"
                          name="onlineResource"
                          value={formData.onlineResource}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="URL sumber online"
                        />
                        <p className="text-xs text-gray-500 mt-1">Sumber online</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Transfer Options
                        </label>
                        <textarea
                          name="transferOptions"
                          value={formData.transferOptions}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Download via https://data.bps.go.id/download/peta-administrasi.zip, ukuran file: 50MB"
                        />
                        <p className="text-xs text-gray-500 mt-1">Cara-cara untuk mendapatkan data, seperti URL download, protokol akses, atau persyaratan khusus.</p>
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
                          value={formData.scope}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                        <p className="text-xs text-gray-500 mt-1">Ruang lingkup penerapan informasi kualitas data ini.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lineage
                        </label>
                        <textarea
                          name="lineage"
                          value={formData.lineage}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Data dikumpul dari survey lapangan tahun 2023 menggunakan GPS differential, kemudian diverifikasi dengan citra satelit resolusi 0.5m"
                        />
                        <p className="text-xs text-gray-500 mt-1">Riwayat lengkap data dari pengumpulan hingga pemrosesan akhir, termasuk sumber data dan metodologi.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Accuracy
                        </label>
                        <textarea
                          name="accuracy"
                          value={formData.accuracy}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Akurasi posisional: ±2.5 meter pada skala 1:25.000, akurasi atribut: 95% sesuai dengan data BPS"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tingkat akurasi posisional dan atribut data. Sertakan unit pengukuran dan metode validasi.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Completeness
                        </label>
                        <textarea
                          name="completeness"
                          value={formData.completeness}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Data lengkap 100% untuk 34 provinsi dan 514 kabupaten/kota di Indonesia"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tingkat kelengkapan data dalam persentase atau deskripsi cakupan data yang tersedia.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consistency
                        </label>
                        <textarea
                          name="consistency"
                          value={formData.consistency}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Konsisten dengan data administrasi pemerintah dan tidak ada konflik batas wilayah"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tingkat konsistensi data antar atribut dan dengan data referensi lainnya.</p>
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
                          value={formData.useConstraints}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ketentuan penggunaan data termasuk lisensi, hak cipta, dan persyaratan legal.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Access Constraints
                        </label>
                        <textarea
                          name="accessConstraints"
                          value={formData.accessConstraints}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="public - data dapat diakses secara bebas oleh publik"
                        />
                        <p className="text-xs text-gray-500 mt-1">Pembatasan akses data: public, restricted, confidential, atau protected.</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Other Constraints
                        </label>
                        <textarea
                          name="otherConstraints"
                          value={formData.otherConstraints}
                          onChange={handleChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Data hanya boleh digunakan untuk tujuan non-komersial dan pendidikan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Ketentuan lain yang tidak tercakup di atas, seperti persyaratan teknis atau etika penggunaan.</p>
                      </div>
                    </div>
                  )}

                  {/* SNI Specific - always visible */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SNI Version
                      </label>
                      <input
                        type="text"
                        name="sniVersion"
                        value={formData.sniVersion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="1.0"
                      />
                      <p className="text-xs text-gray-500 mt-1">Versi spesifik dari standar SNI yang digunakan untuk validasi metadata. 1.0 adalah versi pertama standar SNI ISO 19115:2019.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SNI Standard
                      </label>
                      <input
                        type="text"
                        name="sniStandard"
                        value={formData.sniStandard}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="SNI-ISO-19115-2019"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standar SNI yang menjadi acuan dalam pembuatan metadata. SNI ISO 19115:2019 adalah standar metadata geospasial Indonesia.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bahasa
                      </label>
                      <select
                        name="bahasa"
                        value={formData.bahasa}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="id">Indonesia</option>
                        <option value="en">English</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Bahasa utama yang digunakan dalam metadata. Untuk Indonesia, gunakan "id" (Bahasa Indonesia).</p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-800 font-medium">{error}</span>
                      </div>
                    </div>
                  )}

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

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 btn-primary py-2 px-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                          </svg>
                          Menyimpan...
                        </div>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </button>
                  </div>
                </form>

            </div>
          </div>
        </div>
      </div>

      {/* Error Modal for Required Fields */}
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
                  Lengkapi semua field yang bertanda * sebelum menyimpan perubahan:
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <ul className="text-sm text-red-800 space-y-2">
                    {(apiMissingFields.length > 0 ? apiMissingFields : (() => {
                      const requiredFields = [
                        { value: formData.title?.trim(), name: 'Judul' },
                        { value: formData.abstract?.trim(), name: 'Abstrak' },
                        { value: formData.status?.trim(), name: 'Status' },
                        { value: formData.extent?.trim(), name: 'Extent' },
                        { value: formData.contactName?.trim(), name: 'Nama Kontak' },
                        { value: formData.contactEmail?.trim(), name: 'Email Kontak' },
                        { value: formData.spatialRepresentationType?.trim(), name: 'Spatial Representation Type' },
                        { value: formData.referenceSystemIdentifier?.trim(), name: 'Reference System Identifier' },
                        { value: formData.scope?.trim(), name: 'Scope' }
                      ]
                      return requiredFields.filter(field => !field.value).map(field => field.name)
                    })()).map((fieldName, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {fieldName}
                      </li>
                    ))}
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
  )
}
