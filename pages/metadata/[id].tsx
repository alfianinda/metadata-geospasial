import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import jwt from 'jsonwebtoken'
import Navbar from '../../components/Navbar'
import XmlPreview from '../../components/XmlPreview'

// Metadata entities hierarchy - updated to match actual database schema
const metadataEntities = [
  {
    id: 'root',
    name: 'MD_Metadata (Root)',
    description: 'Elemen root dari metadata geospasial',
    required: true,
    children: [
      {
        id: 'fileIdentifier',
        name: 'fileIdentifier',
        description: 'Identifier unik untuk metadata',
        required: false,
        example: 'uuid:12345678-1234-1234-1234-123456789abc',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'language',
        name: 'language',
        description: 'Bahasa yang digunakan dalam metadata',
        required: true,
        example: 'ind (Bahasa Indonesia)',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'characterSet',
        name: 'characterSet',
        description: 'Character set yang digunakan',
        required: false,
        example: 'utf8',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'parentIdentifier',
        name: 'parentIdentifier',
        description: 'Identifier dari metadata parent',
        required: false,
        example: 'uuid:parent-1234-5678-9abc',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'hierarchyLevel',
        name: 'hierarchyLevel',
        description: 'Tingkat hierarki dataset',
        required: true,
        example: 'dataset',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'hierarchyLevelName',
        name: 'hierarchyLevelName',
        description: 'Nama tingkat hierarki',
        required: false,
        example: 'Dataset Geospasial',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'contact',
        name: 'contact',
        description: 'Informasi kontak untuk metadata',
        required: true,
        example: 'Nama: John Doe, Email: john@example.com',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'dateStamp',
        name: 'dateStamp',
        description: 'Tanggal pembuatan metadata',
        required: false,
        example: '2024-01-15',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'metadataStandardName',
        name: 'metadataStandardName',
        description: 'Nama standar metadata',
        required: false,
        example: 'ISO 19115',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'metadataStandardVersion',
        name: 'metadataStandardVersion',
        description: 'Versi standar metadata',
        required: false,
        example: '2003/Cor.1:2006',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'dataSetURI',
        name: 'dataSetURI',
        description: 'URI untuk mengakses dataset',
        required: false,
        example: 'https://data.example.com/dataset/123',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'locale',
        name: 'locale',
        description: 'Informasi locale untuk metadata',
        required: false,
        example: 'Bahasa Indonesia (id)',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'identificationInfo',
    name: 'identificationInfo',
    description: 'Informasi identifikasi dataset',
    required: true,
    children: [
      {
        id: 'title',
        name: 'title',
        description: 'Judul dataset',
        required: true,
        example: 'Peta Administrasi Indonesia 2024',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'status',
        name: 'status',
        description: 'Status dataset',
        required: true,
        example: 'completed (selesai), ongoing (sedang berlangsung), planned (direncanakan)',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'abstract',
        name: 'abstract',
        description: 'Ringkasan isi dataset',
        required: true,
        example: 'Dataset ini berisi peta administrasi Indonesia yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan.',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'purpose',
        name: 'purpose',
        description: 'Tujuan penggunaan dataset',
        required: false,
        example: 'Dataset ini digunakan untuk perencanaan pembangunan, analisis spasial, dan keperluan administrasi pemerintahan.',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'topicCategory',
        name: 'topicCategory',
        description: 'Kategori topik ISO 19115',
        required: false,
        example: 'boundaries, biota, climatology, economy, elevation, environment, geoscientific, health, imagery, intelligence, inlandWaters, location, oceans, planning, society, structure, transportation, utilities',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'spatialResolution',
        name: 'spatialResolution',
        description: 'Resolusi spasial dataset',
        required: false,
        example: '1:25.000 (skala), 10 meter (resolusi)',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'pointOfContact',
        name: 'pointOfContact',
        description: 'Titik kontak untuk dataset',
        required: false,
        example: 'Nama: Jane Smith, Email: jane@bps.go.id, Organisasi: BPS',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'descriptiveKeywords',
        name: 'descriptiveKeywords',
        description: 'Kata kunci deskriptif',
        required: false,
        example: 'administrasi, peta, indonesia, batas wilayah',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'extent',
        name: 'extent',
        description: 'Cakupan geografis dan temporal',
        required: true,
        example: 'Bounding Box: 95.0°E, 141.0°E, -11.0°N, 6.0°N',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'additionalDocumentation',
        name: 'additionalDocumentation',
        description: 'Dokumentasi tambahan',
        required: false,
        example: 'Link ke dokumentasi teknis atau metodologi',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'processingLevel',
        name: 'processingLevel',
        description: 'Tingkat pemrosesan data',
        required: false,
        example: 'raw (mentah), processed (diproses), interpreted (diinterpretasi)',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceMaintenance',
        name: 'resourceMaintenance',
        description: 'Informasi maintenance resource',
        required: false,
        example: 'Frekuensi update: tahunan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'graphicOverview',
        name: 'graphicOverview',
        description: 'Gambar overview dataset',
        required: false,
        example: 'Thumbnail atau preview gambar dataset',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceFormat',
        name: 'resourceFormat',
        description: 'Format resource dataset',
        required: false,
        example: 'GeoJSON, Shapefile, GeoTIFF',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceSpecificUsage',
        name: 'resourceSpecificUsage',
        description: 'Penggunaan spesifik resource',
        required: false,
        example: 'Digunakan oleh pemerintah daerah untuk perencanaan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'resourceConstraints',
        name: 'resourceConstraints',
        description: 'Kendala penggunaan resource',
        required: false,
        example: 'Lisensi Creative Commons, pembatasan akses',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'spatialRepresentationInfo',
    name: 'spatialRepresentationInfo',
    description: 'Informasi representasi spasial',
    required: false,
    children: [
      {
        id: 'spatialRepresentationType',
        name: 'spatialRepresentationType',
        description: 'Tipe representasi spasial',
        required: true,
        example: 'vector, grid, textTable',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'axisDimensionProperties',
        name: 'axisDimensionProperties',
        description: 'Properti dimensi sumbu',
        required: false,
        example: 'X: 2D, Y: 2D, Z: opsional',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'cellGeometry',
        name: 'cellGeometry',
        description: 'Geometri sel untuk grid',
        required: false,
        example: 'point, area',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'georectified',
        name: 'georectified',
        description: 'Status georectified',
        required: false,
        example: 'true/false',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'georeferenceable',
        name: 'georeferenceable',
        description: 'Status georeferenceable',
        required: false,
        example: 'true/false',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'referenceSystemInfo',
    name: 'referenceSystemInfo',
    description: 'Informasi sistem referensi',
    required: false,
    children: [
      {
        id: 'referenceSystemIdentifier',
        name: 'referenceSystemIdentifier',
        description: 'Identifier sistem referensi',
        required: true,
        example: 'EPSG:4326 (WGS84)',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'referenceSystemType',
        name: 'referenceSystemType',
        description: 'Tipe sistem referensi',
        required: false,
        example: 'geodetic, vertical, temporal',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'contentInfo',
    name: 'contentInfo',
    description: 'Informasi konten dataset',
    required: false,
    children: [
      {
        id: 'attributeDescription',
        name: 'attributeDescription',
        description: 'Deskripsi atribut',
        required: false,
        example: 'Nama atribut dan deskripsinya',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'contentType',
        name: 'contentType',
        description: 'Tipe konten',
        required: false,
        example: 'image, thematicClassification, physicalMeasurement',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'distributionInfo',
    name: 'distributionInfo',
    description: 'Informasi distribusi',
    required: false,
    children: [
      {
        id: 'distributionFormat',
        name: 'distributionFormat',
        description: 'Format distribusi',
        required: false,
        example: 'GeoJSON, Shapefile, GeoTIFF',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'distributor',
        name: 'distributor',
        description: 'Informasi distributor',
        required: false,
        example: 'Nama distributor dan kontak',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'transferOptions',
        name: 'transferOptions',
        description: 'Opsi transfer data',
        required: false,
        example: 'URL download, protokol akses',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'dataQualityInfo',
    name: 'dataQualityInfo',
    description: 'Informasi kualitas data',
    required: false,
    children: [
      {
        id: 'scope',
        name: 'scope',
        description: 'Cakupan kualitas data',
        required: true,
        example: 'dataset, series, feature',
        standard: 'ISO 19115 Mandatory'
      },
      {
        id: 'lineage',
        name: 'lineage',
        description: 'Riwayat data (lineage)',
        required: false,
        example: 'Sumber data, metode pengumpulan, proses pengolahan',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'accuracy',
        name: 'accuracy',
        description: 'Akurasi data',
        required: false,
        example: 'Positional accuracy, attribute accuracy',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'completeness',
        name: 'completeness',
        description: 'Kelengkapan data',
        required: false,
        example: 'Persentase data yang lengkap',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'consistency',
        name: 'consistency',
        description: 'Konsistensi data',
        required: false,
        example: 'Tingkat konsistensi antar atribut',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'metadataConstraints',
    name: 'metadataConstraints',
    description: 'Kendala metadata',
    required: false,
    children: [
      {
        id: 'useConstraints',
        name: 'useConstraints',
        description: 'Kendala penggunaan',
        required: false,
        example: 'Lisensi, hak cipta, pembatasan akses',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'accessConstraints',
        name: 'accessConstraints',
        description: 'Kendala akses',
        required: false,
        example: 'restricted, confidential, protected',
        standard: 'ISO 19115 Optional'
      },
      {
        id: 'otherConstraints',
        name: 'otherConstraints',
        description: 'Kendala lainnya',
        required: false,
        example: 'Persyaratan khusus penggunaan',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'sniSpecific',
    name: 'SNI Specific',
    description: 'Field khusus untuk standar SNI',
    required: false,
    children: [
      {
        id: 'sniCompliant',
        name: 'sniCompliant',
        description: 'Status kepatuhan terhadap SNI',
        required: false,
        example: 'true/false',
        standard: 'SNI Specific'
      },
      {
        id: 'sniVersion',
        name: 'sniVersion',
        description: 'Versi standar SNI',
        required: false,
        example: '1.0',
        standard: 'SNI Specific'
      },
      {
        id: 'sniStandard',
        name: 'sniStandard',
        description: 'Standar SNI yang digunakan',
        required: false,
        example: 'SNI ISO 19115:2019',
        standard: 'SNI Specific'
      },
      {
        id: 'bahasa',
        name: 'bahasa',
        description: 'Bahasa yang digunakan',
        required: false,
        example: 'id (Indonesia), en (English)',
        standard: 'SNI Specific'
      }
    ]
  },
  {
    id: 'fileInfo',
    name: 'File Information',
    description: 'Informasi file yang diupload',
    required: false,
    children: [
      {
        id: 'featureCount',
        name: 'Feature Count',
        description: 'Jumlah fitur geospasial dalam file',
        required: false,
        example: '1000',
        standard: 'File Info'
      },
      {
        id: 'geometryType',
        name: 'Geometry Type',
        description: 'Tipe bentuk geometri (Point, Line, Polygon)',
        required: false,
        example: 'Point, LineString, Polygon',
        standard: 'File Info'
      },
      {
        id: 'boundingBox',
        name: 'Bounding Box',
        description: 'Batas geografis dataset',
        required: false,
        example: '95.0°E, 141.0°E, -11.0°N, 6.0°N',
        standard: 'File Info'
      },
      {
        id: 'coordinateSystem',
        name: 'Coordinate System',
        description: 'Sistem referensi spasial yang digunakan',
        required: false,
        example: 'EPSG:4326 (WGS84)',
        standard: 'File Info'
      },
      {
        id: 'attributeInfo',
        name: 'Attribute Info',
        description: 'Informasi detail atribut dan tipe datanya',
        required: false,
        example: 'nama: string, kode: integer',
        standard: 'File Info'
      },
      {
        id: 'layerName',
        name: 'Layer Name',
        description: 'Nama layer atau dataset',
        required: false,
        example: 'administrasi_kabupaten',
        standard: 'File Info'
      },
      {
        id: 'fileSize',
        name: 'File Size',
        description: 'Ukuran file yang diupload',
        required: false,
        example: '10 MB',
        standard: 'File Info'
      },
      {
        id: 'originalFileName',
        name: 'Original File Name',
        description: 'Nama asli file yang diupload',
        required: false,
        example: 'data.shp',
        standard: 'File Info'
      },
      {
        id: 'dataFormat',
        name: 'Data Format',
        description: 'Format data geospasial',
        required: false,
        example: 'GeoJSON, Shapefile, GeoTIFF',
        standard: 'File Info'
      }
    ]
  }
]

interface FileInfo {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  url?: string
  createdAt: string
}

interface UserInfo {
  id: string
  email: string
  name?: string
  role: string
}

interface Metadata {
  id: string
  title: string
  abstract?: string
  purpose?: string
  status?: string
  updateFrequency?: string
  parentIdentifier?: string
  hierarchyLevel?: string
  hierarchyLevelName?: string
  characterSet?: string
  supplementalInfo?: string
  keywords?: string
  topicCategory?: string
  themeKeywords?: string
  boundingBox?: any
  spatialResolution?: string
  coordinateSystem?: string
  geographicExtent?: string
  verticalExtent?: any
  temporalStart?: string
  temporalEnd?: string
  dateType?: string
  dateStamp?: string
  contactName?: string
  contactEmail?: string
  contactOrganization?: string
  contactRole?: string
  contactPhone?: string
  contactAddress?: string
  metadataContactName?: string
  metadataContactEmail?: string
  metadataContactOrganization?: string
  distributionFormat?: string
  distributor?: string
  onlineResource?: string
  transferOptions?: any
  scope?: string
  lineage?: string
  accuracy?: string
  completeness?: string
  consistency?: string
  positionalAccuracy?: string
  conformity?: any
  useConstraints?: string
  accessConstraints?: string
  otherConstraints?: string
  referenceSystem?: string
  projection?: string
  featureTypes?: string
  attributeInfo?: any
  sniCompliant?: boolean
  sniVersion?: string
  sniStandard?: string
  bahasa?: string
  originalFileName?: string
  fileSize?: number
  featureCount?: number
  geometryType?: string
  dataFormat?: string
  processingLevel?: string
  processingHistory?: string
  xmlContent?: string
  xmlSchema?: string
  isPublished: boolean
  publishedAt?: string
  reviewStatus?: string
  approvalDate?: string
  ckanId?: string
  ckanUrl?: string
  fileIdentifier?: string
  language?: string
  metadataStandardName?: string
  metadataStandardVersion?: string
  dataSetURI?: string
  locale?: string
  // spatialRepresentationInfo fields
  spatialRepresentationType?: string
  axisDimensionProperties?: string
  cellGeometry?: string
  georectified?: boolean
  georeferenceable?: boolean
  contentType?: string
  // Additional fields for detail page
  pointOfContact?: string
  graphicOverview?: string
  resourceFormat?: string
  referenceSystemType?: string
  resourceSpecificUsage?: string
  resourceConstraints?: string
  resourceMaintenance?: string
  additionalDocumentation?: string
  descriptiveKeywords?: string
  createdAt: string
  updatedAt: string
  files: FileInfo[]
  user: UserInfo
  vocabularies?: any[]
}

export default function MetadataDetail() {
  const router = useRouter()
  const { id } = router.query
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'metadata' | 'xml'>('metadata')
  const [xmlContent, setXmlContent] = useState<string>('')
  const [xmlFormat, setXmlFormat] = useState<'iso19139' | 'sni' | 'sni-xml'>('iso19139')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailRecipient, setEmailRecipient] = useState('')
  const [emailFormat, setEmailFormat] = useState<'iso19139' | 'sni' | 'sni-xml'>('iso19139')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [activeSection, setActiveSection] = useState<string>('root')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['root']))

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    fetch(`/api/metadata/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Anda belum login atau sesi login telah berakhir')
          } else if (res.status === 404) {
            throw new Error('Metadata tidak ditemukan')
          } else {
            throw new Error('Gagal memuat metadata')
          }
        }
        return res.json()
      })
      .then((data) => {
        setMetadata(data)
        generateXmlContent(data, xmlFormat)
        setError(null)
      })
      .catch((err) => {
        setError(err.message)
        setMetadata(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const generateXmlContent = async (data: Metadata, format: 'iso19139' | 'sni' | 'sni-xml') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`/api/download/${data.id}?format=${format}&preview=true`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const xml = await response.text()
        setXmlContent(xml)
      } else {
        console.error('Failed to generate XML:', response.status, response.statusText)
        setXmlContent('Error: Failed to generate XML preview')
      }
    } catch (error) {
      console.error('Error generating XML:', error)
      setXmlContent('Error: Failed to generate XML preview')
    }
  }

  const handleXmlFormatChange = (format: 'iso19139' | 'sni' | 'sni-xml') => {
    setXmlFormat(format)
    if (metadata) {
      generateXmlContent(metadata, format)
    }
  }

  const handleDownload = async (format: 'iso19139' | 'sni' | 'sni-xml') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`/api/download/${metadata?.id}?format=${format}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const extension = format === 'sni' ? 'json' : 'xml'
        a.download = `${metadata?.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format}.${extension}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Download failed:', response.status, response.statusText)
        alert('Failed to download XML file')
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Error downloading XML file')
    }
  }

  const handleSendEmail = async () => {
    if (!emailRecipient.trim()) {
      setEmailMessage('Email address is required')
      return
    }

    setSendingEmail(true)
    setEmailMessage('')

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`/api/email/${metadata?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          recipientEmail: emailRecipient.trim(),
          format: emailFormat
        })
      })

      const result = await response.json()

      if (response.ok) {
        setEmailMessage('XML metadata sent successfully!')
        setTimeout(() => {
          setShowEmailModal(false)
          setEmailRecipient('')
          setEmailMessage('')
        }, 2000)
      } else {
        setEmailMessage(result.message || 'Failed to send email')
      }
    } catch (error) {
      setEmailMessage('Network error. Please try again.')
    } finally {
      setSendingEmail(false)
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


  const handleDelete = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(`/api/metadata/${metadata?.id}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (response.ok) {
        alert('Metadata berhasil dihapus!')
        router.push('/dashboard')
      } else if (response.status === 401) {
        alert('Sesi login Anda telah berakhir. Silakan login kembali.')
        localStorage.removeItem('token')
        router.push('/')
      } else if (response.status === 403) {
        alert('Anda tidak memiliki akses untuk menghapus metadata ini')
      } else {
        const result = await response.json()
        alert(result.message || 'Gagal menghapus metadata')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus metadata. Silakan coba lagi.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Memuat metadata...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Kembali
        </button>
      </div>
    </div>
  )

  if (!metadata) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Metadata Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">Metadata yang Anda cari tidak tersedia atau telah dihapus.</p>
        <button
          onClick={() => window.location.href = '/metadata'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Lihat Semua Metadata
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="card sticky top-24">
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
          <div className="lg:w-3/4">
            <div className="card">
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold gradient-text mb-2">{metadata.title}</h1>
                <p className="text-gray-600">Detail Metadata Geospasial</p>
              </div>

              {/* Action Buttons */}
              <div className="mb-6">
                <div className="flex flex-col gap-4">
                  {/* Download and Email Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => handleDownload('iso19139')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      ISO 19139 XML
                    </button>
                    <button
                      onClick={() => handleDownload('sni')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      SNI JSON
                    </button>
                    <button
                      onClick={() => handleDownload('sni-xml')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      SNI ISO 19115 XML
                    </button>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition duration-200"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email XML
                    </button>
                  </div>

                  {/* Admin Buttons - Edit and Delete side by side */}
                  {(() => {
                    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
                    if (!token) return null

                    try {
                      const decoded = jwt.decode(token) as any
                      const isAdmin = decoded?.role === 'ADMIN'

                      if (!isAdmin) return null

                      return (
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => router.push(`/edit/${metadata.id}`)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Metadata
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Apakah Anda yakin ingin menghapus metadata ini? Tindakan ini tidak dapat dibatalkan.')) {
                                handleDelete()
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition duration-200"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Hapus
                          </button>
                        </div>
                      )
                    } catch {
                      return null
                    }
                  })()}
                </div>
              </div>


              {/* Metadata Info */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 justify-center">
                  <span className="badge-primary">
                    ID: {metadata.id.slice(0, 8)}...
                  </span>
                  <span className="badge-secondary">
                    Dibuat: {new Date(metadata.createdAt).toLocaleDateString('id-ID')}
                  </span>
                  <span className="badge-primary">
                    Oleh: {metadata.user?.name || metadata.user?.email}
                  </span>
                  <span className={`badge ${metadata.isPublished ? 'badge-success' : 'badge-warning'}`}>
                    {metadata.isPublished ? 'Dipublikasikan' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="card mt-6">
              {/* Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('metadata')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'metadata'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Metadata Details
                    </button>
                    <button
                      onClick={() => setActiveTab('xml')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'xml'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      XML Preview
                    </button>
                  </nav>
                </div>
              </div>

        {activeTab === 'metadata' ? (
          <>
            {/* Section Navigation Tabs */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border border-gray-200">
                {metadataEntities.map((entity) => (
                  <button
                    type="button"
                    key={entity.id}
                    onClick={() => {
                      setActiveSection(entity.id)
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

            {/* Render fields based on active section */}
            {activeSection === 'root' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Identifier
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.fileIdentifier || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.language || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Character Set
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.characterSet || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Identifier
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.parentIdentifier || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hierarchy Level
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.hierarchyLevel || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hierarchy Level Name
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.hierarchyLevelName || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.contactName || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.contactEmail || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Stamp
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.dateStamp ? new Date(metadata.dateStamp).toLocaleDateString('id-ID') : 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata Standard Name
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.metadataStandardName || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metadata Standard Version
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.metadataStandardVersion || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Set URI
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.dataSetURI || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Locale
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.locale || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'identificationInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <div className="text-gray-700 font-medium bg-gray-50 p-2 rounded">{metadata.title}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.status || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abstract
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded leading-relaxed">{metadata.abstract}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.purpose || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic Category
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.topicCategory || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spatial Resolution
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.spatialResolution || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Point of Contact
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">
                    {metadata.pointOfContact || (metadata.contactName ? `${metadata.contactName}${metadata.contactEmail ? ` (${metadata.contactEmail})` : ''}` : 'Not specified')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descriptive Keywords
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.descriptiveKeywords || metadata.keywords || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extent
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.geographicExtent || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Documentation
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.supplementalInfo || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Level
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.processingLevel || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Maintenance
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.updateFrequency || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Format
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.dataFormat || metadata.resourceFormat || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Specific Usage
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.resourceSpecificUsage || metadata.purpose || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graphic Overview
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.graphicOverview || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resource Constraints
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.resourceConstraints || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'spatialRepresentationInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spatial Representation Type
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.spatialRepresentationType || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Axis Dimension Properties
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.axisDimensionProperties || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cell Geometry
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.cellGeometry || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Georectified
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.georectified !== undefined ? (metadata.georectified ? 'Yes' : 'No') : 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Georeferenceable
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.georeferenceable !== undefined ? (metadata.georeferenceable ? 'Yes' : 'No') : 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'referenceSystemInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference System Identifier
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.coordinateSystem || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference System Type
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.referenceSystemType || metadata.referenceSystem || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'contentInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attribute Description
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{(() => {
                    if (metadata.attributeInfo) {
                      if (typeof metadata.attributeInfo === 'string') {
                        try {
                          const parsed = JSON.parse(metadata.attributeInfo);
                          return parsed.description || metadata.attributeInfo;
                        } catch {
                          return metadata.attributeInfo;
                        }
                      } else if (typeof metadata.attributeInfo === 'object' && metadata.attributeInfo.description) {
                        return metadata.attributeInfo.description;
                      } else if (typeof metadata.attributeInfo === 'object') {
                        return JSON.stringify(metadata.attributeInfo);
                      }
                    }
                    return 'Not specified';
                  })()}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.contentType || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'distributionInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distribution Format
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.distributionFormat || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distributor
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.distributor || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Online Resource
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.onlineResource || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transfer Options
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.transferOptions ? JSON.stringify(metadata.transferOptions, null, 2) : 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'dataQualityInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.scope || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lineage
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.lineage || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accuracy
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.accuracy || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completeness
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.completeness || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consistency
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.consistency || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'metadataConstraints' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Use Constraints
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.useConstraints || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Constraints
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.accessConstraints || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Constraints
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.otherConstraints || 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'sniSpecific' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SNI Compliant
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.sniCompliant !== undefined ? (metadata.sniCompliant ? 'Yes' : 'No') : 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SNI Version
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.sniVersion || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SNI Standard
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.sniStandard || 'Not specified'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bahasa
                  </label>
                  <div className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{metadata.bahasa === 'id' ? 'Indonesia' : metadata.bahasa === 'en' ? 'English' : 'Not specified'}</div>
                </div>
              </div>
            )}

            {activeSection === 'fileInfo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Feature Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feature Count
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.featureCount ? metadata.featureCount.toLocaleString() : 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Number of geospatial features in the file</p>
                </div>

                {/* Geometry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geometry Type
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.geometryType || 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Type of geometric shapes (Point, Line, Polygon)</p>
                </div>

                {/* Bounding Box (Extent) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bounding Box (Extent)
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.geographicExtent || metadata.boundingBox ? JSON.stringify(metadata.boundingBox || metadata.geographicExtent, null, 2) : 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Geographical boundaries of the dataset</p>
                </div>

                {/* Coordinate System */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordinate System
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.coordinateSystem || 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Spatial reference system used</p>
                </div>

                {/* Attribute Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attribute Information
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200 max-h-32 overflow-y-auto">
                    {(() => {
                      if (metadata.attributeInfo) {
                        if (typeof metadata.attributeInfo === 'string') {
                          try {
                            const parsed = JSON.parse(metadata.attributeInfo);
                            return JSON.stringify(parsed, null, 2);
                          } catch {
                            return metadata.attributeInfo;
                          }
                        } else if (typeof metadata.attributeInfo === 'object') {
                          return JSON.stringify(metadata.attributeInfo, null, 2);
                        }
                      }
                      return 'Not available';
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Detailed information about data attributes and their types</p>
                </div>

                {/* Layer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layer Name
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.hierarchyLevelName || metadata.title || 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Name of the data layer or dataset</p>
                </div>

                {/* File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Size
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Size of the uploaded file</p>
                </div>

                {/* Original File Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original File Name
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.originalFileName || 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Original name of the uploaded file</p>
                </div>

                {/* Data Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Format
                  </label>
                  <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                    {metadata.dataFormat || 'Not available'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format of the geospatial data file</p>
                </div>
              </div>
            )}

            {/* Section Navigation Buttons */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-4 pb-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = metadataEntities.findIndex(e => e.id === activeSection)
                  if (currentIndex > 0) {
                    setActiveSection(metadataEntities[currentIndex - 1].id)
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
                  }
                }}
                disabled={metadataEntities.findIndex(e => e.id === activeSection) === metadataEntities.length - 1}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Associated Files */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Files</h3>
              <div className="space-y-4">
                {metadata.files && metadata.files.length > 0 ? (
                  metadata.files.map((file) => (
                    <div key={file.id} className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-indigo-800 mb-1">{file.originalName}</div>
                          <div className="text-xs text-gray-600">
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB • Type: {file.mimetype}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Uploaded: {new Date(file.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        {file.url && (
                          <a
                            href={file.url}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-4 text-center">
                    <div className="text-gray-500">No files associated with this metadata</div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created: {new Date(metadata.createdAt).toLocaleDateString('id-ID')}</span>
                <span>Last Updated: {new Date(metadata.updatedAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </>
        ) : (
          /* XML Preview Tab */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">XML Metadata Preview</h3>
                <p className="text-sm text-gray-600">Preview and edit XML metadata in different formats</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleXmlFormatChange('iso19139')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    xmlFormat === 'iso19139'
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  ISO 19139
                </button>
                <button
                  onClick={() => handleXmlFormatChange('sni')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    xmlFormat === 'sni'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  SNI JSON
                </button>
                <button
                  onClick={() => handleXmlFormatChange('sni-xml')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    xmlFormat === 'sni-xml'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  SNI ISO 19115 XML
                </button>
              </div>
            </div>

            {xmlContent ? (
              xmlFormat === 'sni' ? (
                // JSON Preview - tampilkan sebagai formatted JSON dengan styling khusus
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        JSON
                      </div>
                      <h4 className="text-lg font-semibold text-blue-800">SNI JSON Format Preview</h4>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-blue-900 font-mono leading-relaxed whitespace-pre-wrap">
                        {xmlContent}
                      </pre>
                    </div>
                    <div className="mt-4 text-sm text-blue-700">
                      <strong>Format:</strong> JSON (JavaScript Object Notation)<br/>
                      <strong>Standard:</strong> SNI ISO 19115:2019 Structure<br/>
                      <strong>Usage:</strong> API Integration, Developer Tools, Modern Applications
                    </div>
                  </div>
                </div>
              ) : (
                // XML Preview - gunakan XmlPreview component
                <div className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        XML
                      </div>
                      <h4 className="text-lg font-semibold text-green-800">
                        {xmlFormat === 'sni-xml' ? 'SNI ISO 19115 XML' : 'ISO 19139 XML'} Format Preview
                      </h4>
                    </div>
                    <XmlPreview
                      xmlContent={xmlContent}
                      title={`${xmlFormat === 'sni-xml' ? 'SNI ISO 19115 XML' : 'ISO 19139 XML'} - ${metadata.title}`}
                      readOnly={true}
                    />
                    <div className="mt-4 text-sm text-green-700">
                      <strong>Format:</strong> XML (eXtensible Markup Language)<br/>
                      <strong>Standard:</strong> {xmlFormat === 'sni-xml' ? 'SNI ISO 19115:2019' : 'ISO 19139:2007'}<br/>
                      <strong>Usage:</strong> GIS Software, Metadata Catalogs, Interoperability
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating XML preview...</p>
              </div>
            )}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Send XML via Email</h3>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      XML Format
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEmailFormat('iso19139')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          emailFormat === 'iso19139'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        ISO 19139
                      </button>
                      <button
                        onClick={() => setEmailFormat('sni')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          emailFormat === 'sni'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        SNI JSON
                      </button>
                      <button
                        onClick={() => setEmailFormat('sni-xml')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                          emailFormat === 'sni-xml'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        SNI ISO 19115 XML
                      </button>
                    </div>
                  </div>

                  {emailMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      emailMessage.includes('success')
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {emailMessage}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}