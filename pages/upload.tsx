'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

// Metadata entities hierarchy - updated to match actual form fields
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
    dateStamp: '',
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
    bahasa: 'id'
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

    // Validate individual Shapefile components
    const hasShp = fileNames.some(name => name.endsWith('.shp'))
    const hasShx = fileNames.some(name => name.endsWith('.shx'))
    const hasDbf = fileNames.some(name => name.endsWith('.dbf'))

    // Check for auxiliary Shapefile files (these should not be uploaded alone)
    const hasAuxiliaryFiles = fileNames.some(name =>
      name.endsWith('.prj') ||
      name.endsWith('.cpg') ||
      name.endsWith('.sbn') ||
      name.endsWith('.sbx')
    )

    // If there are auxiliary files but no core Shapefile files, reject
    if (hasAuxiliaryFiles && !hasShp && !hasShx && !hasDbf) {
      return {
        isValid: false,
        message: 'File pendukung Shapefile (.prj, .cpg, .sbn, .sbx) tidak dapat diupload tanpa file utama (.shp, .shx, .dbf)'
      }
    }

    // If there's a .shp file, we must have .shx and .dbf
    if (hasShp) {
      if (!hasShx && !hasDbf) {
        return {
          isValid: false,
          message: 'Untuk Shapefile, pastikan memilih minimal file .shp, .shx, dan .dbf'
        }
      } else if (!hasShx) {
        return {
          isValid: false,
          message: 'File .shx tidak ditemukan. Shapefile memerlukan file .shp, .shx, dan .dbf'
        }
      } else if (!hasDbf) {
        return {
          isValid: false,
          message: 'File .dbf tidak ditemukan. Shapefile memerlukan file .shp, .shx, dan .dbf'
        }
      }
    }

    // If there are .shx or .dbf files without .shp, that's also invalid
    if ((hasShx || hasDbf) && !hasShp) {
      return {
        isValid: false,
        message: 'File .shx atau .dbf ditemukan tanpa file .shp. Shapefile memerlukan ketiga file tersebut'
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    setFiles(selectedFiles)

    if (selectedFiles && selectedFiles.length > 0) {
      // Validate Shapefile components
      const validation = validateShapefileComponents(selectedFiles)
      if (!validation.isValid) {
        setError(validation.message)
        setShowErrorModal(true)
        return
      } else {
        setError(null)
        setShowErrorModal(false)
      }

      // Check if we have compressed files
      const hasCompressed = Array.from(selectedFiles).some(file =>
        file.name.toLowerCase().endsWith('.zip') || file.name.toLowerCase().endsWith('.rar')
      )

      if (hasCompressed) {
        // For compressed files, skip geospatial extraction here
        // It will be handled after extraction in the main upload API
        setGeospatialInfo(null)
        return
      }

      // Extract geospatial information from the first file (only for non-compressed files)
      const firstFile = selectedFiles[0]
      try {
        const formData = new FormData()
        formData.append('file', firstFile)

        const response = await fetch('/api/extract-geospatial', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const data = await response.json()
          setGeospatialInfo(data)

          // Auto-fill metadata fields based on extracted information
          if (data.title) {
            setMetadata(prev => ({ ...prev, title: data.title }))
          }
          if (data.abstract) {
            setMetadata(prev => ({ ...prev, abstract: data.abstract }))
          }
          if (data.featureCount) {
            setMetadata(prev => ({ ...prev, purpose: `Dataset berisi ${data.featureCount} fitur geospasial` }))
          }
          if (data.coordinateSystem) {
            setMetadata(prev => ({ ...prev, coordinateSystem: data.coordinateSystem }))
          }
        }
      } catch (error) {
        console.error('Error extracting geospatial info:', error)
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

    // Add geospatial info if available
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
          router.push('/dashboard')
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
                className={`border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
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
                        accept=".geojson,.shp,.shx,.dbf,.prj,.cpg,.sbn,.sbx,.zip,.rar"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="pl-2">atau seret dan jatuhkan</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 space-y-1">
                    <p><strong>Format yang didukung:</strong></p>
                    <p>• GeoJSON - file tunggal</p>
                    <p>• Shapefile - pilih minimal file utama (.shp, .shx, .dbf) + file pendukung opsional</p>
                    <p>• Shapefile terkompresi - ZIP/RAR didukung dengan validasi otomatis</p>
                    <p>• Maksimal 10MB per file</p>
                    <p className="text-orange-600 font-medium mt-2">
                      ⚠️ File pendukung (.prj, .cpg, .sbn, .sbx) tidak dapat diupload tanpa file utama
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                      <p className="text-green-800 font-medium text-sm">✅ Dukungan ZIP/RAR:</p>
                      <p className="text-green-700 text-xs mt-1">
                        Sistem akan otomatis mengekstrak dan memvalidasi komponen Shapefile
                      </p>
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
                {files.length > 0 && (getShapefileStatus(files).shp || getShapefileStatus(files).compressed) && (
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
                          Sistem akan mengekstrak dan memvalidasi komponen Shapefile dari file ZIP/RAR
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
                              .{component.toUpperCase()}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Komponen wajib: .SHP, .SHX, .DBF | Pendukung: .PRJ, .CPG, .SBN, .SBX
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ File pendukung tidak dapat diupload tanpa file utama (.SHP, .SHX, .DBF)
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {geospatialInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Informasi Geospasial (Otomatis):</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Jumlah Fitur:</span>
                    <span className="ml-2 text-blue-600">{geospatialInfo.featureCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Tipe Geometri:</span>
                    <span className="ml-2 text-blue-600">{geospatialInfo.geometryType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Sistem Koordinat:</span>
                    <span className="ml-2 text-blue-600">{geospatialInfo.coordinateSystem}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Format File:</span>
                    <span className="ml-2 text-blue-600">{geospatialInfo.dataFormat}</span>
                  </div>
                </div>
                {geospatialInfo.boundingBox && (
                  <div className="mt-3">
                    <span className="font-medium text-blue-700">Bounding Box:</span>
                    <div className="text-xs text-blue-600 mt-1">
                      Min X: {geospatialInfo.boundingBox.minX}, Min Y: {geospatialInfo.boundingBox.minY}<br />
                      Max X: {geospatialInfo.boundingBox.maxX}, Max Y: {geospatialInfo.boundingBox.maxY}
                    </div>
                  </div>
                )}
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
                        placeholder="uuid:12345678-1234-1234-1234-123456789abc"
                      />
                      <p className="text-xs text-gray-500 mt-1">Identifier unik untuk metadata</p>
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
                      <p className="text-xs text-gray-500 mt-1">Bahasa yang digunakan dalam metadata</p>
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
                      <p className="text-xs text-gray-500 mt-1">Character set yang digunakan</p>
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
                      <p className="text-xs text-gray-500 mt-1">Tingkat hierarki dataset</p>
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
                        value={metadata.contactName || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contactName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.contactEmail || ''}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contactEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.dateStamp}
                        onChange={(e) => setMetadata(prev => ({ ...prev, dateStamp: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.metadataStandardName}
                        onChange={(e) => setMetadata(prev => ({ ...prev, metadataStandardName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.metadataStandardVersion}
                        onChange={(e) => setMetadata(prev => ({ ...prev, metadataStandardVersion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.dataSetURI}
                        onChange={(e) => setMetadata(prev => ({ ...prev, dataSetURI: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.locale}
                        onChange={(e) => setMetadata(prev => ({ ...prev, locale: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Bahasa Indonesia (id)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Informasi locale untuk metadata</p>
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
                        value={metadata.status}
                        onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.abstract}
                        onChange={(e) => setMetadata(prev => ({ ...prev, abstract: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.purpose}
                        onChange={(e) => setMetadata(prev => ({ ...prev, purpose: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <p className="text-xs text-gray-500 mt-1">Kategori topik ISO 19115</p>
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
                        value={metadata.pointOfContact}
                        onChange={(e) => setMetadata(prev => ({ ...prev, pointOfContact: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.descriptiveKeywords}
                        onChange={(e) => setMetadata(prev => ({ ...prev, descriptiveKeywords: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.extent}
                        onChange={(e) => setMetadata(prev => ({ ...prev, extent: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.additionalDocumentation}
                        onChange={(e) => setMetadata(prev => ({ ...prev, additionalDocumentation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.processingLevel}
                        onChange={(e) => setMetadata(prev => ({ ...prev, processingLevel: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.resourceMaintenance}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceMaintenance: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.graphicOverview}
                        onChange={(e) => setMetadata(prev => ({ ...prev, graphicOverview: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.resourceFormat}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.resourceSpecificUsage}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceSpecificUsage: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.resourceConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, resourceConstraints: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Lisensi Creative Commons, pembatasan akses"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kendala penggunaan resource</p>
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
                      <p className="text-xs text-gray-500 mt-1">Tipe representasi spasial</p>
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
                      <p className="text-xs text-gray-500 mt-1">Properti dimensi sumbu</p>
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
                      <p className="text-xs text-gray-500 mt-1">Geometri sel untuk grid</p>
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
                      <p className="text-xs text-gray-500 mt-1">Status georectified</p>
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
                      <p className="text-xs text-gray-500 mt-1">Status georeferenceable</p>
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
                      <p className="text-xs text-gray-500 mt-1">Identifier sistem referensi</p>
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
                        value={metadata.attributeDescription}
                        onChange={(e) => setMetadata(prev => ({ ...prev, attributeDescription: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.contentType}
                        onChange={(e) => setMetadata(prev => ({ ...prev, contentType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.distributionFormat}
                        onChange={(e) => setMetadata(prev => ({ ...prev, distributionFormat: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.distributor}
                        onChange={(e) => setMetadata(prev => ({ ...prev, distributor: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        value={metadata.onlineResource}
                        onChange={(e) => setMetadata(prev => ({ ...prev, onlineResource: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="URL sumber online"
                      />
                      <p className="text-xs text-gray-500 mt-1">URL sumber online</p>
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
                      <p className="text-xs text-gray-500 mt-1">Cakupan kualitas data</p>
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
                      <p className="text-xs text-gray-500 mt-1">Riwayat data (lineage)</p>
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
                      <p className="text-xs text-gray-500 mt-1">Akurasi data</p>
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
                      <p className="text-xs text-gray-500 mt-1">Kelengkapan data</p>
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
                        value={metadata.useConstraints}
                        onChange={(e) => setMetadata(prev => ({ ...prev, useConstraints: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Lisensi, hak cipta, pembatasan akses"
                      />
                      <p className="text-xs text-gray-500 mt-1">Kendala penggunaan</p>
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
                      <p className="text-xs text-gray-500 mt-1">Kendala akses</p>
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
                      <p className="text-xs text-gray-500 mt-1">Kendala lainnya</p>
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
                      placeholder="1.0"
                    />
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
                  </div>
                </div>

                {/* Auto-extracted File Information - shown after upload */}
                {geospatialInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Original File Name
                      </label>
                      <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        {geospatialInfo.originalFileName || 'Not available'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-extracted from uploaded file</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Size
                      </label>
                      <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        {geospatialInfo.fileSize ? `${(geospatialInfo.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Not available'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-extracted from uploaded file</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Feature Count
                      </label>
                      <div className="text-gray-700 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                        {geospatialInfo.featureCount ? geospatialInfo.featureCount.toLocaleString() : 'Not available'}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Auto-extracted from uploaded file</p>
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-700">{error}</span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowErrorModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
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