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
                          placeholder="Peta Administrasi Indonesia 2024"
                        />
                        <p className="text-xs text-gray-500 mt-1">Judul dataset</p>
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
                        <p className="text-xs text-gray-500 mt-1">Status dataset</p>
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
                          placeholder="Dataset ini berisi peta administrasi Indonesia yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan."
                        />
                        <p className="text-xs text-gray-500 mt-1">Ringkasan isi dataset</p>
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
                          placeholder="Dataset ini digunakan untuk perencanaan pembangunan, analisis spasial, dan keperluan administrasi pemerintahan."
                        />
                        <p className="text-xs text-gray-500 mt-1">Tujuan penggunaan dataset</p>
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
                          <option value="">Select Topic Category</option>
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
                        <p className="text-xs text-gray-500 mt-1">Kategori topik ISO 19115</p>
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
                        <p className="text-xs text-gray-500 mt-1">Resolusi spasial dataset</p>
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
                          placeholder="Nama: Jane Smith, Email: jane@bps.go.id, Organisasi: BPS"
                        />
                        <p className="text-xs text-gray-500 mt-1">Titik kontak untuk dataset</p>
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
                          placeholder="administrasi, peta, indonesia, batas wilayah"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kata kunci deskriptif</p>
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
                          placeholder="Bounding Box: 95.0°E, 141.0°E, -11.0°N, 6.0°N"
                        />
                        <p className="text-xs text-gray-500 mt-1">Cakupan geografis dan temporal</p>
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
                          placeholder="Link ke dokumentasi teknis atau metodologi"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dokumentasi tambahan</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tingkat pemrosesan data</p>
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
                          placeholder="Frekuensi update: tahunan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Informasi maintenance resource</p>
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
                          placeholder="Thumbnail atau preview gambar dataset"
                        />
                        <p className="text-xs text-gray-500 mt-1">Gambar overview dataset</p>
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
                          placeholder="GeoJSON, Shapefile, GeoTIFF"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format resource dataset</p>
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
                          placeholder="Digunakan oleh pemerintah daerah untuk perencanaan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Penggunaan spesifik resource</p>
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
                          placeholder="Lisensi Creative Commons, pembatasan akses"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kendala penggunaan resource</p>
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
                          placeholder="uuid:12345678-1234-1234-1234-123456789abc"
                        />
                        <p className="text-xs text-gray-500 mt-1">Identifier unik untuk metadata</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
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
                        <p className="text-xs text-gray-500 mt-1">Bahasa yang digunakan dalam metadata</p>
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
                          <option value="utf8">UTF-8</option>
                          <option value="ascii">ASCII</option>
                          <option value="iso88591">ISO-8859-1</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Character set yang digunakan</p>
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
                          placeholder="uuid:parent-1234-5678-9abc"
                        />
                        <p className="text-xs text-gray-500 mt-1">Identifier dari metadata parent</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tingkat hierarki dataset</p>
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
                          placeholder="Dataset Geospasial"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nama tingkat hierarki</p>
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
                          placeholder="John Doe"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nama kontak untuk metadata</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tanggal pembuatan metadata</p>
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
                          placeholder="ISO 19115"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nama standar metadata</p>
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
                          placeholder="2003/Cor.1:2006"
                        />
                        <p className="text-xs text-gray-500 mt-1">Versi standar metadata</p>
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
                          placeholder="https://data.example.com/dataset/123"
                        />
                        <p className="text-xs text-gray-500 mt-1">URI untuk mengakses dataset</p>
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
                          placeholder="Bahasa Indonesia (id)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Informasi locale untuk metadata</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tipe representasi spasial</p>
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
                          placeholder="X: 2D, Y: 2D, Z: opsional"
                        />
                        <p className="text-xs text-gray-500 mt-1">Properti dimensi sumbu</p>
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
                        <p className="text-xs text-gray-500 mt-1">Geometri sel untuk grid</p>
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
                          placeholder="EPSG:4326 (WGS84)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Identifier sistem referensi</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tipe sistem referensi</p>
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
                          placeholder="Nama atribut dan deskripsinya"
                        />
                        <p className="text-xs text-gray-500 mt-1">Deskripsi atribut</p>
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
                        <p className="text-xs text-gray-500 mt-1">Tipe konten</p>
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
                          placeholder="GeoJSON, Shapefile, GeoTIFF"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format distribusi</p>
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
                          placeholder="Nama distributor dan kontak"
                        />
                        <p className="text-xs text-gray-500 mt-1">Informasi distributor</p>
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
                          placeholder="URL download, protokol akses"
                        />
                        <p className="text-xs text-gray-500 mt-1">Opsi transfer data</p>
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
                        <p className="text-xs text-gray-500 mt-1">Cakupan kualitas data</p>
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
                          placeholder="Sumber data, metode pengumpulan, proses pengolahan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Riwayat data (lineage)</p>
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
                          placeholder="Positional accuracy, attribute accuracy"
                        />
                        <p className="text-xs text-gray-500 mt-1">Akurasi data</p>
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
                          placeholder="Persentase data yang lengkap"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kelengkapan data</p>
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
                          placeholder="Tingkat konsistensi antar atribut"
                        />
                        <p className="text-xs text-gray-500 mt-1">Konsistensi data</p>
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
                          placeholder="Lisensi, hak cipta, pembatasan akses"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kendala penggunaan</p>
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
                          placeholder="restricted, confidential, protected"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kendala akses</p>
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
                          placeholder="Persyaratan khusus penggunaan"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kendala lainnya</p>
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
