'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

// Metadata entities hierarchy
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

export default function MetadataExamples() {
  const router = useRouter()
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set(['root', 'identificationInfo']))
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthenticated(false)
      router.push('/')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memeriksa akses...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  const toggleEntity = (entityId: string) => {
    const newExpanded = new Set(expandedEntities)
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId)
    } else {
      newExpanded.add(entityId)
    }
    setExpandedEntities(newExpanded)
  }

  const selectField = (entityId: string, fieldId: string) => {
    setSelectedEntity(entityId)
    setSelectedField(fieldId)
  }

  const getSelectedField = () => {
    if (!selectedEntity || !selectedField) return null

    const entity = metadataEntities.find(e => e.id === selectedEntity)
    if (!entity) return null

    return entity.children?.find(f => f.id === selectedField) || null
  }

  const selectedFieldData = getSelectedField()

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Panduan Field Metadata Geospasial</h1>
            <p className="text-gray-600">Pelajari setiap field metadata sesuai standar ISO 19115, ISO 19139, dan SNI ISO 19115</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Struktur Metadata</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {metadataEntities.map((entity) => (
                  <div key={entity.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleEntity(entity.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 truncate">{entity.name}</span>
                      </div>
                      {entity.children && entity.children.length > 0 && (
                        <svg className={`w-4 h-4 transition-transform ${expandedEntities.has(entity.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>

                    {expandedEntities.has(entity.id) && entity.children && (
                      <div className="border-t border-gray-100">
                        {entity.children.map((field) => (
                          <button
                            key={field.id}
                            onClick={() => selectField(entity.id, field.id)}
                            className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 flex items-center ${
                              selectedEntity === entity.id && selectedField === field.id ? 'bg-blue-100 border-r-2 border-blue-500' : ''
                            }`}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${field.required ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className="text-gray-700 truncate">{field.name}</span>
                          </button>
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
            {selectedFieldData ? (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedFieldData.required
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedFieldData.required ? 'Wajib' : 'Opsional'}
                  </div>
                  <div className="text-sm text-gray-500">{selectedFieldData.standard}</div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedFieldData.name}</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedFieldData.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Contoh Pengisian</h3>
                    <div className="bg-gray-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <p className="text-gray-800 font-mono text-sm">{selectedFieldData.example}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Penjelasan Maksud</h3>
                    <div className="prose prose-sm max-w-none">
                      {selectedFieldData.id === 'fileIdentifier' && (
                        <p>Identifier unik yang membedakan metadata ini dari metadata lainnya. Biasanya menggunakan UUID atau identifier standar lainnya untuk memastikan keunikan global.</p>
                      )}
                      {selectedFieldData.id === 'language' && (
                        <p>Bahasa yang digunakan dalam penyusunan metadata. Menentukan bahasa untuk pemahaman isi metadata oleh pengguna dari berbagai negara.</p>
                      )}
                      {selectedFieldData.id === 'abstract' && (
                        <p>Ringkasan singkat tentang isi dataset. Harus mencakup informasi penting seperti cakupan geografis, jenis data, dan tujuan penggunaan untuk membantu pengguna memahami relevansi dataset.</p>
                      )}
                      {selectedFieldData.id === 'purpose' && (
                        <p>Tujuan spesifik penggunaan dataset. Menjelaskan bagaimana dataset dapat digunakan dan memberikan konteks aplikasi praktisnya.</p>
                      )}
                      {selectedFieldData.id === 'status' && (
                        <p>Status terkini dari dataset. Menunjukkan apakah dataset sudah lengkap, masih dalam proses pengembangan, atau masih dalam perencanaan.</p>
                      )}
                      {selectedFieldData.id === 'extent' && (
                        <p>Cakupan geografis dan temporal dari dataset. Menentukan area geografis yang dicakup dan periode waktu yang tercakup dalam data.</p>
                      )}
                      {selectedFieldData.id === 'spatialResolution' && (
                        <p>Tingkat detail spasial dari dataset. Menentukan skala atau resolusi minimum yang dapat direpresentasikan oleh data.</p>
                      )}
                      {selectedFieldData.id === 'topicCategory' && (
                        <p>Kategori topik standar ISO 19115 yang paling sesuai dengan isi dataset. Membantu klasifikasi dan pencarian dataset berdasarkan tema.</p>
                      )}
                      {selectedFieldData.id === 'lineage' && (
                        <p>Riwayat lengkap pengumpulan, pemrosesan, dan transformasi data. Memberikan transparansi tentang asal-usul dan kualitas data.</p>
                      )}
                      {selectedFieldData.id === 'contact' && (
                        <p>Informasi kontak orang atau organisasi yang bertanggung jawab atas metadata. Memastikan pengguna dapat menghubungi pihak terkait untuk informasi tambahan.</p>
                      )}
                      {selectedFieldData.id === 'useConstraints' && (
                        <p>Kendala atau persyaratan penggunaan dataset. Menjelaskan lisensi, hak cipta, atau pembatasan akses yang berlaku.</p>
                      )}
                      {!['fileIdentifier', 'language', 'abstract', 'purpose', 'status', 'extent', 'spatialResolution', 'topicCategory', 'lineage', 'contact', 'useConstraints'].includes(selectedFieldData.id) && (
                        <p>Field ini berisi informasi spesifik sesuai dengan standar metadata geospasial untuk memastikan interoperabilitas dan pemahaman yang konsisten.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Standar Terkait</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        ISO 19115:2003
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        ISO 19139:2007
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                        SNI ISO 19115:2019
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pilih Field Metadata</h3>
                <p className="text-gray-600">Klik pada salah satu field di sidebar kiri untuk melihat penjelasan detail, contoh pengisian, dan informasi standar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}