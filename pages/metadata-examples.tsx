'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

const metadataEntities = [
  {
    id: 'root',
    name: 'MD_Metadata (Root)',
    description: 'Informasi dasar dan pengaturan metadata geospasial',
    detailedExplanation: 'Kategori ini menjelaskan identitas dasar dan pengaturan administratif dari metadata geospasial. Ini mencakup informasi fundamental seperti bahasa, format karakter, hierarki data, dan kontak pembuat metadata. Kategori ini menjawab pertanyaan: "Siapa yang membuat metadata ini?", "Dalam bahasa apa metadata ditulis?", dan "Bagaimana metadata ini terstruktur dalam sistem organisasi?".',
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
    detailedExplanation: 'Kategori ini menjelaskan isi dan karakteristik utama dari dataset geospasial. Ini mencakup judul, deskripsi lengkap, tujuan penggunaan, klasifikasi tematik, resolusi spasial, dan cakupan geografis. Kategori ini menjawab pertanyaan: "Apa isi dataset ini?", "Untuk apa data ini digunakan?", "Di daerah mana data ini berlaku?", dan "Seberapa detail data ini?".',
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
        example: 'Lisensi Creative Commons Attribution 4.0 International (CC BY 4.0) - bebas digunakan dengan mencantumkan sumber',
        standard: 'ISO 19115 Optional'
      }
    ]
  },
  {
    id: 'spatialRepresentationInfo',
    name: 'spatialRepresentationInfo',
    description: 'Informasi tentang bagaimana data geospasial direpresentasikan dan disimpan secara teknis',
    detailedExplanation: 'Kategori ini menjelaskan struktur teknis dan format penyimpanan data geospasial. Ini mencakup tipe representasi (vektor vs raster), dimensi spasial, geometri sel, dan status koreksi geometri. Kategori ini menjawab pertanyaan: "Bagaimana data ini disimpan secara teknis?", "Apakah ini data titik/garis/polygon atau citra?", "Sudahkah data dikoreksi secara geometri?", dan "Bagaimana cara menampilkan data ini?".',
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
    detailedExplanation: 'Kategori ini menjelaskan sistem referensi spasial yang digunakan untuk memposisikan data di permukaan bumi. Ini mencakup kode EPSG, tipe sistem koordinat (geodetic/projected), dan parameter proyeksi. Kategori ini menjawab pertanyaan: "Dalam sistem koordinat apa data ini?", "Bagaimana cara menginterpretasikan koordinat X,Y?", dan "Apakah data ini kompatibel dengan GPS?".',
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
    detailedExplanation: 'Kategori ini menjelaskan struktur dan isi atribut dari dataset geospasial. Ini mencakup deskripsi detail setiap kolom data, tipe data, dan klasifikasi isi (image, thematic, atau physical). Kategori ini menjawab pertanyaan: "Apa saja kolom data yang ada?", "Tipe data apa yang disimpan?", dan "Bagaimana cara menginterpretasikan nilai atribut?".',
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
    detailedExplanation: 'Kategori ini menjelaskan cara mendapatkan dan mengakses dataset. Ini mencakup format distribusi, informasi distributor, URL akses online, dan opsi transfer data. Kategori ini menjawab pertanyaan: "Di mana saya bisa mendapatkan data ini?", "Dalam format apa data tersedia?", "Siapa yang bertanggung jawab distribusi?", dan "Bagaimana cara mengunduh data?".',
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
        id: 'onlineResource',
        name: 'onlineResource',
        description: 'Alamat web (URL) lengkap untuk mengakses dataset asli atau sumber data online. Ini adalah tautan langsung ke data yang dapat diakses oleh pengguna.',
        required: false,
        example: 'https://data.bps.go.id/dataset/peta-administrasi-indonesia-2024',
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
    detailedExplanation: 'Kategori ini menjelaskan kualitas dan keandalan data geospasial. Ini mencakup riwayat pengumpulan data, tingkat akurasi posisional dan atribut, kelengkapan data, dan konsistensi internal. Kategori ini menjawab pertanyaan: "Seberapa akurat data ini?", "Apakah data lengkap?", "Bagaimana data dikumpulkan?", dan "Apakah data bisa dipercaya?".',
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
    detailedExplanation: 'Kategori ini menjelaskan ketentuan hukum dan pembatasan penggunaan data. Ini mencakup lisensi, hak cipta, pembatasan akses, dan persyaratan khusus. Kategori ini menjawab pertanyaan: "Apakah saya boleh menggunakan data ini?", "Dalam kondisi apa saya boleh menggunakannya?", "Apakah ada lisensi yang berlaku?", dan "Siapa pemilik hak cipta data?".',
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

export default function MetadataExamples() {
  const router = useRouter()
  const [selectedEntity, setSelectedEntity] = useState<string | null>('root')
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

  const selectEntity = (entityId: string) => {
    setSelectedEntity(entityId)
    setSelectedField(null)
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
            <h1 className="text-3xl font-bold gradient-text mb-2">Panduan Lengkap Metadata Geospasial</h1>
            <p className="text-gray-600">Pelajari setiap kategori dan field metadata sesuai standar ISO 19115, ISO 19139, dan SNI ISO 19115. Klik kategori untuk memahami apa yang dijelaskan setiap bagian metadata.</p>
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
                    <div className="flex items-center">
                      <button
                        onClick={() => selectEntity(entity.id)}
                        className={`flex-1 text-left px-3 py-2 hover:bg-blue-50 flex items-center ${
                          selectedEntity === entity.id && !selectedField ? 'bg-blue-100 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${entity.required ? 'bg-red-400' : 'bg-green-400'}`}></span>
                          <span className="text-sm font-medium text-gray-900 truncate">{entity.name}</span>
                        </div>
                      </button>
                      {entity.children && entity.children.length > 0 && (
                        <button
                          onClick={() => toggleEntity(entity.id)}
                          className="px-2 py-2 hover:bg-gray-50"
                        >
                          <svg className={`w-4 h-4 transition-transform ${expandedEntities.has(entity.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>

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
            {/* Category Overview */}
            {selectedEntity && !selectedFieldData && (
              <div className="card mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    metadataEntities.find(e => e.id === selectedEntity)?.required
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {metadataEntities.find(e => e.id === selectedEntity)?.required ? 'Wajib' : 'Opsional'}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {metadataEntities.find(e => e.id === selectedEntity)?.name}
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi Kategori</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {metadataEntities.find(e => e.id === selectedEntity)?.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Apa yang Dijelaskan Kategori Ini?</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-blue-800 leading-relaxed">
                        {metadataEntities.find(e => e.id === selectedEntity)?.detailedExplanation}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Field dalam Kategori Ini</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metadataEntities.find(e => e.id === selectedEntity)?.children?.map((field) => (
                        <button
                          key={field.id}
                          onClick={() => selectField(selectedEntity, field.id)}
                          className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${field.required ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className="font-medium text-gray-900">{field.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{field.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                        <div>
                          <p><strong>Apa itu File Identifier?</strong></p>
                          <p>File Identifier adalah kode unik yang membedakan metadata ini dari metadata lainnya di seluruh dunia. Ini seperti nomor identitas atau plat nomor untuk dataset Anda.</p>
                          <p><strong>Bagaimana menentukan identifier?</strong></p>
                          <ul>
                            <li><strong>UUID (Universally Unique Identifier):</strong> Sistem akan generate otomatis jika dikosongkan. Contoh: uuid:12345678-1234-1234-1234-123456789abc</li>
                            <li><strong>Kode Organisasi:</strong> Gunakan format seperti DKB-2024-001, dll.</li>
                            <li><strong>DOI (Digital Object Identifier):</strong> Jika dataset memiliki DOI resmi</li>
                          </ul>
                          <p><strong>Kapan menggunakan UUID vs Kode Organisasi?</strong></p>
                          <ul>
                            <li>UUID: Untuk dataset internal atau yang belum dipublikasikan secara resmi</li>
                            <li>Kode Organisasi: Untuk dataset yang akan dipublikasikan atau memiliki nomor resmi</li>
                          </ul>
                        </div>
                      )}
                      {selectedFieldData.id === 'language' && (
                        <div>
                          <p><strong>Bahasa dalam Metadata</strong></p>
                          <p>Field ini menentukan bahasa utama yang digunakan dalam semua teks metadata. Ini penting untuk:</p>
                          <ul>
                            <li>Pemahaman yang benar oleh pengguna internasional</li>
                            <li>Pemrosesan otomatis oleh mesin pencari</li>
                            <li>Kompatibilitas dengan standar internasional</li>
                          </ul>
                          <p><strong>Untuk Indonesia:</strong> Selalu gunakan "ind" (Bahasa Indonesia) kecuali ada kebutuhan khusus untuk menggunakan bahasa lain.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'characterSet' && (
                        <div>
                          <p><strong>Character Set (Set Karakter)</strong></p>
                          <p>Menentukan encoding karakter yang digunakan untuk menyimpan teks. UTF-8 adalah standar modern yang:</p>
                          <ul>
                            <li>Mendukung semua bahasa termasuk huruf Indonesia (é, è, ê, dll.)</li>
                            <li>Kompatibel dengan web dan aplikasi modern</li>
                            <li>Mencegah masalah tampilan karakter yang rusak</li>
                          </ul>
                          <p><strong>Kapan menggunakan character set lain?</strong> Hanya jika sistem legacy memerlukan ASCII atau ISO-8859-1.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'parentIdentifier' && (
                        <div>
                          <p><strong>Parent Identifier</strong></p>
                          <p>Digunakan ketika dataset ini merupakan bagian dari kumpulan data yang lebih besar (series). Contoh:</p>
                          <ul>
                            <li>Dataset peta kabupaten adalah bagian dari "Peta Administrasi Indonesia 2024"</li>
                            <li>Data sensus kecamatan adalah bagian dari "Sensus Penduduk 2020"</li>
                          </ul>
                          <p><strong>Kosongkan jika:</strong> Dataset berdiri sendiri dan tidak memiliki parent dataset.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'hierarchyLevel' && (
                        <div>
                          <p><strong>Tingkat Hierarki Dataset</strong></p>
                          <ul>
                            <li><strong>dataset:</strong> Data tunggal seperti peta satu kabupaten, citra satelit satu area</li>
                            <li><strong>series:</strong> Kumpulan dataset terkait, seperti semua peta administrasi Indonesia</li>
                            <li><strong>service:</strong> Layanan web GIS atau API</li>
                            <li><strong>application:</strong> Aplikasi atau software</li>
                          </ul>
                          <p><strong>Untuk data geospasial Indonesia:</strong> Hampir selalu "dataset" kecuali Anda membuat portal data.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'contact' && (
                        <div>
                          <p><strong>Informasi Kontak</strong></p>
                          <p>Siapa yang bisa dihubungi untuk pertanyaan tentang dataset ini? Biasanya:</p>
                          <ul>
                            <li><strong>Pembuat data:</strong> Orang yang mengumpulkan/mengolah data</li>
                            <li><strong>Koordinator GIS:</strong> Penanggung jawab teknis</li>
                            <li><strong>Admin database:</strong> Untuk pertanyaan teknis</li>
                          </ul>
                          <p><strong>Format:</strong> Nama lengkap, email aktif, dan institusi/organisasi.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'title' && (
                        <div>
                          <p><strong>Judul Dataset yang Efektif</strong></p>
                          <p>Judul harus mencakup minimal:</p>
                          <ul>
                            <li><strong>Jenis data:</strong> Peta, Citra, Data statistik, dll.</li>
                            <li><strong>Cakupan geografis:</strong> Indonesia, Jawa Barat, Jakarta, dll.</li>
                            <li><strong>Tahun/waktu:</strong> 2024, 2020-2024, dll.</li>
                            <li><strong>Skala/resolusi:</strong> Jika relevan</li>
                          </ul>
                          <p><strong>Contoh buruk:</strong> "Data" atau "Peta"</p>
                          <p><strong>Contoh baik:</strong> "Peta Administrasi Indonesia Tahun 2024 Skala 1:25.000"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'abstract' && (
                        <div>
                          <p><strong>Abstract yang Informatif</strong></p>
                          <p>Abstract harus menjawab pertanyaan:</p>
                          <ul>
                            <li>Apa isi dataset ini?</li>
                            <li>Dari mana data diperoleh?</li>
                            <li>Bagaimana data dikumpulkan/di proses?</li>
                            <li>Siapa target penggunanya?</li>
                            <li>Apa kegunaan praktisnya?</li>
                          </ul>
                          <p><strong>Panjang optimal:</strong> 100-200 kata. Sertakan kata kunci penting untuk pencarian.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'purpose' && (
                        <div>
                          <p><strong>Tujuan Penggunaan Dataset</strong></p>
                          <p>Jelaskan aplikasi praktis dataset ini:</p>
                          <ul>
                            <li>Perencanaan pembangunan infrastruktur</li>
                            <li>Analisis spasial untuk kebijakan</li>
                            <li>Monitoring lingkungan</li>
                            <li>Penelitian akademis</li>
                            <li>Pendidikan dan pelatihan</li>
                          </ul>
                          <p><strong>Bedakan dengan abstract:</strong> Abstract menjelaskan ISI data, purpose menjelaskan KEGUNAAN data.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'status' && (
                        <div>
                          <p><strong>Status Dataset</strong></p>
                          <ul>
                            <li><strong>completed:</strong> Dataset final, lengkap, siap digunakan</li>
                            <li><strong>ongoing:</strong> Masih dalam proses pengumpulan/processing</li>
                            <li><strong>planned:</strong> Masih dalam perencanaan, belum ada data</li>
                            <li><strong>deprecated:</strong> Dataset sudah tidak direkomendasikan, ada versi terbaru</li>
                          </ul>
                          <p><strong>Untuk data DKB:</strong> Biasanya "completed" setelah melalui proses validasi.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'topicCategory' && (
                        <div>
                          <p><strong>Kategori Topik ISO 19115</strong></p>
                          <p>Pilih kategori yang paling dominan:</p>
                          <ul>
                            <li><strong>boundaries:</strong> Batas wilayah, administrasi</li>
                            <li><strong>elevation:</strong> Ketinggian, DEM, kontur</li>
                            <li><strong>imagery:</strong> Citra satelit, foto udara</li>
                            <li><strong>planning:</strong> Perencanaan, zoning</li>
                            <li><strong>transportation:</strong> Jaringan transportasi</li>
                            <li><strong>environment:</strong> Lingkungan, ekosistem</li>
                          </ul>
                          <p><strong>Untuk peta administrasi Indonesia:</strong> Pilih "boundaries"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'spatialResolution' && (
                        <div>
                          <p><strong>Resolusi Spasial</strong></p>
                          <p>Ada dua cara menyatakan:</p>
                          <ul>
                            <li><strong>Skala peta:</strong> 1:25.000 (1 cm di peta = 25.000 cm di lapangan = 250 meter)</li>
                            <li><strong>Resolusi:</strong> 10 meter, 30 meter (untuk citra satelit)</li>
                          </ul>
                          <p><strong>Konversi skala ke resolusi:</strong> Pada skala 1:25.000, resolusi maksimal ~2.5 meter untuk detail yang berguna.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'extent' && (
                        <div>
                          <p><strong>Cakupan Geografis (Bounding Box)</strong></p>
                          <p>Format: BT(Bujur Timur), BB(Bujur Barat), LU(Lintang Utara), LS(Lintang Selatan)</p>
                          <p><strong>Untuk Indonesia:</strong> 95.0°BT, 141.0°BT, -11.0°LS, 6.0°LU</p>
                          <p><strong>Cara mendapatkan:</strong> Dari software GIS (QGIS, ArcGIS) atau metadata sumber data.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'descriptiveKeywords' && (
                        <div>
                          <p><strong>Kata Kunci untuk Pencarian</strong></p>
                          <p>Gunakan istilah baku yang mungkin dicari pengguna:</p>
                          <ul>
                            <li>Nama geografis: Indonesia, Jawa, Jakarta</li>
                            <li>Jenis data: peta, citra, shapefile</li>
                            <li>Tema: administrasi, batas, wilayah</li>
                            <li>Tahun: 2024, 2020-2024</li>
                          </ul>
                          <p><strong>Tips:</strong> Pisahkan dengan koma, gunakan lowercase, hindari kata-kata umum seperti "data" atau "peta" saja.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'spatialRepresentationType' && (
                        <div>
                          <p><strong>Jenis Representasi Data Geospasial</strong></p>
                          <ul>
                            <li><strong>vector:</strong> Data titik/garis/polygon. Contoh: peta jalan, batas wilayah, sungai, gedung. Format: Shapefile, GeoJSON, KML</li>
                            <li><strong>grid:</strong> Data raster dalam bentuk grid. Contoh: citra satelit, DEM, peta kontur, data cuaca. Format: GeoTIFF, JPEG2000</li>
                            <li><strong>textTable:</strong> Data tabular dengan kolom koordinat. Contoh: spreadsheet dengan kolom latitude/longitude</li>
                            <li><strong>tin:</strong> Triangulated Irregular Network untuk permukaan 3D. Contoh: model elevasi detail</li>
                            <li><strong>stereoModel:</strong> Model stereoskopik untuk visualisasi 3D</li>
                            <li><strong>video:</strong> Video dengan koordinat geografis</li>
                          </ul>
                          <p><strong>Untuk data Indonesia:</strong> Kebanyakan data adalah "vector" (peta) atau "grid" (citra satelit)</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'referenceSystemIdentifier' && (
                        <div>
                          <p><strong>Sistem Koordinat</strong></p>
                          <ul>
                            <li><strong>EPSG:4326 (WGS84):</strong> Sistem global GPS, dalam derajat. Paling umum digunakan.</li>
                            <li><strong>EPSG:32748-32750:</strong> UTM zona Indonesia (48-50)</li>
                            <li><strong>EPSG:23830-23893:</strong> TM3 zona Indonesia</li>
                          </ul>
                          <p><strong>Untuk web GIS:</strong> Selalu gunakan EPSG:4326</p>
                          <p><strong>Untuk kartografi:</strong> Gunakan sistem proyeksi sesuai standar DKB</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'distributionFormat' && (
                        <div>
                          <p><strong>Format Distribusi Data</strong></p>
                          <ul>
                            <li><strong>GeoJSON:</strong> Format modern untuk web GIS, kompak, mendukung atribut kompleks</li>
                            <li><strong>Shapefile:</strong> Format klasik ESRI, masih banyak digunakan</li>
                            <li><strong>GeoTIFF:</strong> Untuk data raster, mendukung koordinat</li>
                            <li><strong>KML/KMZ:</strong> Untuk Google Earth</li>
                          </ul>
                          <p><strong>Pertimbangan:</strong> Pilih format yang paling banyak digunakan oleh target pengguna Anda.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'scope' && (
                        <div>
                          <p><strong>Cakupan Informasi Kualitas</strong></p>
                          <ul>
                            <li><strong>dataset:</strong> Kualitas berlaku untuk seluruh dataset</li>
                            <li><strong>feature:</strong> Kualitas bervariasi per fitur</li>
                            <li><strong>attribute:</strong> Kualitas bervariasi per atribut</li>
                          </ul>
                          <p><strong>Untuk data DKB:</strong> Biasanya "dataset" karena kualitas seragam.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'lineage' && (
                        <div>
                          <p><strong>Riwayat Data (Lineage)</strong></p>
                          <p>Jelaskan proses dari awal hingga akhir:</p>
                          <ul>
                            <li>Sumber data asli</li>
                            <li>Metode pengumpulan</li>
                            <li>Proses validasi</li>
                            <li>Transformasi yang dilakukan</li>
                            <li>Referensi ke metodologi detail</li>
                          </ul>
                          <p><strong>Tujuan:</strong> Memberikan transparansi dan memungkinkan reproduksi data.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'accuracy' && (
                        <div>
                          <p><strong>Akurasi Data</strong></p>
                          <ul>
                            <li><strong>Positional accuracy:</strong> Ketepatan posisi geografis (dalam meter)</li>
                            <li><strong>Attribute accuracy:</strong> Ketepatan nilai atribut (dalam persen)</li>
                            <li><strong>Temporal accuracy:</strong> Ketepatan waktu</li>
                          </ul>
                          <p><strong>Contoh:</strong> "Akurasi posisional ±2.5m pada skala 1:25.000"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'useConstraints' && (
                        <div>
                          <p><strong>Lisensi dan Ketentuan Penggunaan</strong></p>
                          <ul>
                            <li><strong>Creative Commons:</strong> CC BY, CC BY-SA, dll.</li>
                            <li><strong>Lisensi terbuka:</strong> BSD, MIT</li>
                            <li><strong>Lisensi terbatas:</strong> Untuk penggunaan internal</li>
                            <li><strong>Hak cipta:</strong> © DKB Otorita Ibu Kota Nusantara 2024</li>
                          </ul>
                          <p><strong>Untuk data pemerintah Indonesia:</strong> Biasanya menggunakan CC BY atau lisensi terbuka.</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'dateStamp' && (
                        <div>
                          <p><strong>Tanggal Pembuatan Metadata yang Akurat</strong></p>
                          <p>Field ini mencatat kapan metadata ini pertama kali dibuat atau terakhir kali diperbarui. Ini penting untuk:</p>
                          <ul>
                            <li><strong>Tracking versi:</strong> Mengetahui kapan informasi terakhir diperbarui</li>
                            <li><strong>Validitas data:</strong> Memastikan metadata masih relevan dengan kondisi terkini</li>
                            <li><strong>Audit trail:</strong> Melacak riwayat perubahan metadata</li>
                          </ul>
                          <p><strong>Format yang benar:</strong> YYYY-MM-DD (contoh: 2024-01-15)</p>
                          <p><strong>Kapan diupdate:</strong> Setiap kali ada perubahan signifikan pada dataset atau metadata</p>
                          <p><strong>Untuk data DKB:</strong> Gunakan tanggal ketika metadata disahkan atau dipublikasikan</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'metadataStandardName' && (
                        <div>
                          <p><strong>Standar Metadata yang Digunakan</strong></p>
                          <p>Menunjukkan standar metadata apa yang menjadi acuan dalam pembuatan metadata ini. Penting untuk:</p>
                          <ul>
                            <li><strong>Interoperabilitas:</strong> Memastikan metadata bisa dibaca sistem lain</li>
                            <li><strong>Compliance:</strong> Memenuhi standar nasional/internasional</li>
                            <li><strong>Kualitas:</strong> Mengikuti best practices yang terbukti</li>
                          </ul>
                          <p><strong>Untuk Indonesia:</strong></p>
                          <ul>
                            <li><strong>ISO 19115:</strong> Standar internasional untuk metadata geospasial</li>
                            <li><strong>SNI ISO 19115:</strong> Standar nasional Indonesia yang mengadopsi ISO 19115</li>
                          </ul>
                          <p><strong>Kenapa penting:</strong> Sistem katalog data menggunakan informasi ini untuk memproses metadata dengan benar</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'metadataStandardVersion' && (
                        <div>
                          <p><strong>Versi Spesifik Standar Metadata</strong></p>
                          <p>Menentukan versi tepat dari standar yang digunakan, karena standar berkembang seiring waktu:</p>
                          <ul>
                            <li><strong>ISO 19115:2003:</strong> Versi asli, masih banyak digunakan</li>
                            <li><strong>ISO 19115:2003/Cor.1:2006:</strong> Koreksi teknis dari versi 2003</li>
                            <li><strong>ISO 19115-1:2014:</strong> Versi terbaru dengan perbaikan signifikan</li>
                          </ul>
                          <p><strong>Untuk SNI:</strong> SNI ISO 19115:2019 mengacu pada ISO 19115:2003/Cor.1:2006</p>
                          <p><strong>Dampak:</strong> Versi yang berbeda mungkin memiliki field atau struktur yang sedikit berbeda</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'dataSetURI' && (
                        <div>
                          <p><strong>Alamat Web Resmi Dataset</strong></p>
                          <p>URL lengkap dan permanen untuk mengakses dataset asli. Ini seperti "alamat rumah" digital dataset:</p>
                          <ul>
                            <li><strong>Permanence:</strong> URL yang tidak berubah seiring waktu</li>
                            <li><strong>Direct access:</strong> Pengguna bisa langsung mengakses data</li>
                            <li><strong>Machine readable:</strong> Sistem bisa otomatis mengunduh data</li>
                          </ul>
                          <p><strong>Contoh URL yang baik:</strong></p>
                          <ul>
                            <li>https://data.bps.go.id/dataset/peta-administrasi-indonesia-2024</li>
                            <li>https://tanahair.indonesia.go.id/data/batas-wilayah-provinsi</li>
                          </ul>
                          <p><strong>Kosongkan jika:</strong> Data belum dipublikasikan online atau masih dalam tahap internal</p>
                          <p><strong>Persistent identifier:</strong> Lebih baik menggunakan DOI atau PURL untuk jaminan permanensi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'locale' && (
                        <div>
                          <p><strong>Pengaturan Bahasa dan Regional</strong></p>
                          <p>Menentukan bahasa dan konvensi regional yang digunakan dalam metadata. Kode bahasa ISO 639-1:</p>
                          <ul>
                            <li><strong>id:</strong> Bahasa Indonesia (untuk Indonesia)</li>
                            <li><strong>en:</strong> English (untuk internasional)</li>
                            <li><strong>ms:</strong> Bahasa Melayu (untuk Malaysia)</li>
                          </ul>
                          <p><strong>Mengapa penting:</strong></p>
                          <ul>
                            <li>Formatting tanggal dan angka sesuai konvensi lokal</li>
                            <li>Sorting teks sesuai aturan bahasa</li>
                            <li>Kompatibilitas dengan sistem internasional</li>
                          </ul>
                          <p><strong>Untuk data Indonesia:</strong> Selalu gunakan "id" kecuali ada kebutuhan khusus ekspor</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'hierarchyLevelName' && (
                        <div>
                          <p><strong>Nama Deskriptif Tingkat Hierarki</strong></p>
                          <p>Menjelaskan secara spesifik jenis dataset dalam konteks hierarki yang dipilih. Contoh:</p>
                          <ul>
                            <li>Jika hierarchyLevel = "dataset": "Dataset Peta Administrasi Kabupaten"</li>
                            <li>Jika hierarchyLevel = "series": "Seri Data Sensus Penduduk Indonesia"</li>
                            <li>Jika hierarchyLevel = "service": "Layanan Web GIS DKB Otorita Ibu Kota Nusantara"</li>
                          </ul>
                          <p><strong>Tujuan:</strong> Memberikan konteks yang lebih jelas tentang jenis data</p>
                          <p><strong>Tips penulisan:</strong> Gunakan istilah yang spesifik dan deskriptif, bukan kata-kata umum</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'pointOfContact' && (
                        <div>
                          <p><strong>Kontak Ahli untuk Dataset Ini</strong></p>
                          <p>Orang yang paling kompeten untuk menjawab pertanyaan teknis tentang dataset. Bukan sembarang kontak, tapi:</p>
                          <ul>
                            <li><strong>Ahli teknis:</strong> Yang memahami metodologi pengumpulan data</li>
                            <li><strong>Data steward:</strong> Penanggung jawab kualitas data</li>
                            <li><strong>GIS specialist:</strong> Ahli sistem informasi geografis</li>
                          </ul>
                          <p><strong>Informasi yang dibutuhkan:</strong></p>
                          <ul>
                            <li>Nama lengkap dan gelar</li>
                            <li>Email aktif (bukan email umum)</li>
                            <li>Jabatan spesifik</li>
                            <li>Institusi/organisasi</li>
                            <li>Nomor telepon (opsional)</li>
                          </ul>
                          <p><strong>Contoh yang baik:</strong> "Dr. Ahmad Surya, ahmad.surya@dkb.go.id, Koordinator GIS DKB Otorita Ibu Kota Nusantara"</p>
                          <p><strong>Bukan contoh yang baik:</strong> "Admin, info@bps.go.id, BPS" (terlalu umum)</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'additionalDocumentation' && (
                        <div>
                          <p><strong>Referensi Dokumentasi Teknis Lengkap</strong></p>
                          <p>Tautan ke dokumentasi detail yang tidak muat dalam metadata standar. Termasuk:</p>
                          <ul>
                            <li><strong>Metodologi pengumpulan data:</strong> Cara data dikumpulkan, instrumen yang digunakan</li>
                            <li><strong>Spesifikasi teknis:</strong> Format data, struktur atribut, sistem koordinat detail</li>
                            <li><strong>Laporan validasi:</strong> Hasil quality assurance dan quality control</li>
                            <li><strong>Manual penggunaan:</strong> Cara menggunakan data dengan benar</li>
                            <li><strong>Laporan penelitian:</strong> Studi yang menghasilkan data ini</li>
                          </ul>
                          <p><strong>Format URL yang baik:</strong></p>
                          <ul>
                            <li>PDF: https://bps.go.id/metodologi-peta-administrasi-2024.pdf</li>
                            <li>Web: https://tanahair.go.id/dokumentasi/batas-wilayah</li>
                            <li>DOI: https://doi.org/10.1234/abcd</li>
                          </ul>
                          <p><strong>Tips:</strong> Pastikan URL aktif dan dokumentasi benar-benar ada</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'processingLevel' && (
                        <div>
                          <p><strong>Tingkat Kematangan Pengolahan Data</strong></p>
                          <p>Menunjukkan seberapa jauh data telah diproses dari kondisi mentah:</p>
                          <ul>
                            <li><strong>raw:</strong> Data mentah langsung dari sensor/instrument, belum diproses</li>
                            <li><strong>processed:</strong> Data telah dikoreksi, dinormalisasi, dan divalidasi</li>
                            <li><strong>interpreted:</strong> Data telah dianalisis dan diberi interpretasi ahli</li>
                          </ul>
                          <p><strong>Contoh untuk data geospasial:</strong></p>
                          <ul>
                            <li><strong>Raw:</strong> Citra satelit asli tanpa koreksi geometri</li>
                            <li><strong>Processed:</strong> Citra satelit yang sudah dikoreksi geometri dan atmosferik</li>
                            <li><strong>Interpreted:</strong> Peta penggunaan lahan hasil klasifikasi citra</li>
                          </ul>
                          <p><strong>Dampak pada pengguna:</strong> Data processed lebih siap pakai tapi mungkin kehilangan beberapa informasi asli</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'resourceMaintenance' && (
                        <div>
                          <p><strong>Jadwal Update dan Pemeliharaan Data</strong></p>
                          <p>Informasi tentang seberapa sering data diperbarui dan bagaimana pemeliharaannya. Penting untuk:</p>
                          <ul>
                            <li><strong>Planning pengguna:</strong> Mengetahui kapan data terbaru tersedia</li>
                            <li><strong>Resource allocation:</strong> Institusi tahu kapan perlu update</li>
                            <li><strong>Data currency:</strong> Memastikan data masih relevan</li>
                          </ul>
                          <p><strong>Jenis frekuensi:</strong></p>
                          <ul>
                            <li><strong>continual:</strong> Update terus menerus (real-time)</li>
                            <li><strong>daily:</strong> Setiap hari</li>
                            <li><strong>weekly:</strong> Setiap minggu</li>
                            <li><strong>monthly:</strong> Setiap bulan</li>
                            <li><strong>quarterly:</strong> Setiap 3 bulan</li>
                            <li><strong>biannually:</strong> Setiap 6 bulan</li>
                            <li><strong>annually:</strong> Setiap tahun</li>
                            <li><strong>asNeeded:</strong> Sesuai kebutuhan</li>
                            <li><strong>irregular:</strong> Tidak terjadwal</li>
                            <li><strong>notPlanned:</strong> Tidak ada rencana update</li>
                          </ul>
                          <p><strong>Untuk data administrasi:</strong> Biasanya "annually" atau sesuai perubahan regulasi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'graphicOverview' && (
                        <div>
                          <p><strong>Gambar Preview Dataset</strong></p>
                          <p>Gambar kecil yang menunjukkan contoh isi dataset. Berfungsi sebagai:</p>
                          <ul>
                            <li><strong>Quick preview:</strong> Pengguna bisa melihat data tanpa mengunduh</li>
                            <li><strong>Visual verification:</strong> Memastikan data sesuai ekspektasi</li>
                            <li><strong>Search result enhancement:</strong> Membuat hasil pencarian lebih menarik</li>
                          </ul>
                          <p><strong>Jenis gambar yang baik:</strong></p>
                          <ul>
                            <li>Thumbnail peta dengan legenda</li>
                            <li>Preview citra satelit dengan koordinat</li>
                            <li>Gambar contoh fitur data (point, line, polygon)</li>
                          </ul>
                          <p><strong>Format yang didukung:</strong> JPG, PNG, GIF (ukuran kecil &lt; 100KB)</p>
                          <p><strong>Naming convention:</strong> thumbnail_[nama_dataset].jpg</p>
                          <p><strong>Hosting:</strong> Upload ke CDN atau server yang reliable</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'resourceFormat' && (
                        <div>
                          <p><strong>Format File Digital Asli</strong></p>
                          <p>Format teknis sebenarnya dari file data. Berbeda dengan distribution format:</p>
                          <ul>
                            <li><strong>Resource format:</strong> Format asli data di penyimpanan</li>
                            <li><strong>Distribution format:</strong> Format untuk didistribusikan ke pengguna</li>
                          </ul>
                          <p><strong>Format umum untuk data geospasial:</strong></p>
                          <ul>
                            <li><strong>Vector:</strong> Shapefile, GeoJSON, GML, KML</li>
                            <li><strong>Raster:</strong> GeoTIFF, JPEG2000, ECW, MrSID</li>
                            <li><strong>Database:</strong> PostGIS, Oracle Spatial, SQL Server Spatial</li>
                            <li><strong>Web:</strong> WMS, WFS, WMTS</li>
                          </ul>
                          <p><strong>Contoh detail:</strong></p>
                          <ul>
                            <li>Shapefile (ESRI) - format klasik, terdiri dari .shp, .shx, .dbf</li>
                            <li>GeoJSON - format modern untuk web, kompak dan readable</li>
                            <li>GeoTIFF - TIFF dengan informasi koordinat geografis</li>
                          </ul>
                          <p><strong>Kompatibilitas:</strong> Pilih format yang didukung software target pengguna</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'resourceSpecificUsage' && (
                        <div>
                          <p><strong>Contoh Penggunaan Nyata Dataset</strong></p>
                          <p>Menceritakan bagaimana dataset ini benar-benar digunakan di dunia nyata. Lebih spesifik dari "purpose":</p>
                          <ul>
                            <li><strong>Contoh konkret:</strong> "Digunakan oleh Kementerian PUPR untuk perencanaan jalan tol trans-Jawa"</li>
                            <li><strong>Impact measurement:</strong> "Membantu mengidentifikasi 500 hektar lahan kritis untuk konservasi"</li>
                            <li><strong>Decision support:</strong> "Menjadi dasar kebijakan alokasi anggaran pengendalian banjir"</li>
                          </ul>
                          <p><strong>Mengapa penting:</strong></p>
                          <ul>
                            <li>Menunjukkan nilai praktis data</li>
                            <li>Membantu pengguna memahami relevansi</li>
                            <li>Mendorong penggunaan data</li>
                            <li>Menunjukkan dampak kebijakan</li>
                          </ul>
                          <p><strong>Tips penulisan:</strong> Sertakan nama institusi, jenis kegiatan, dan hasil yang dicapai</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'resourceConstraints' && (
                        <div>
                          <p><strong>Ketentuan Penggunaan dan Pembatasan Data</strong></p>
                          <p>Aturan hukum dan praktis yang mengatur penggunaan dataset. Melindungi hak pemilik data:</p>
                          <ul>
                            <li><strong>Lisensi:</strong> Creative Commons, BSD, MIT, GPL</li>
                            <li><strong>Hak cipta:</strong> © DKB Otorita Ibu Kota Nusantara 2024, All rights reserved</li>
                            <li><strong>Pembatasan akses:</strong> Internal use only, research only</li>
                            <li><strong>Persyaratan atribusi:</strong> Harus mencantumkan sumber</li>
                          </ul>
                          <p><strong>Jenis lisensi umum:</strong></p>
                          <ul>
                            <li><strong>CC BY:</strong> Bebas digunakan dengan mencantumkan sumber</li>
                            <li><strong>CC BY-SA:</strong> Atribusi + share alike</li>
                            <li><strong>CC0:</strong> Domain public, bebas sepenuhnya</li>
                            <li><strong>Restricted:</strong> Hanya untuk penggunaan internal</li>
                          </ul>
                          <p><strong>Untuk data pemerintah Indonesia:</strong> Biasanya menggunakan lisensi terbuka dengan atribusi wajib</p>
                          <p><strong>Konsekuensi:</strong> Pelanggaran lisensi bisa berujung sanksi hukum</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'axisDimensionProperties' && (
                        <div>
                          <p><strong>Informasi Dimensi Spasial Data</strong></p>
                          <p>Menjelaskan struktur dimensi spasial dari data grid/raster. Untuk data 2D standar:</p>
                          <ul>
                            <li><strong>X axis:</strong> Longitude/easting, biasanya dalam derajat atau meter</li>
                            <li><strong>Y axis:</strong> Latitude/northing, biasanya dalam derajat atau meter</li>
                            <li><strong>Z axis:</strong> Elevation/ketinggian (opsional), dalam meter</li>
                          </ul>
                          <p><strong>Contoh untuk data geografis:</strong></p>
                          <ul>
                            <li>X: 2D (longitude), Y: 2D (latitude)</li>
                            <li>X: 3D (easting), Y: 3D (northing), Z: 3D (elevation)</li>
                          </ul>
                          <p><strong>Untuk data temporal:</strong> Dapat menyertakan dimensi waktu (T)</p>
                          <p><strong>Importance:</strong> Sistem GIS menggunakan informasi ini untuk menampilkan data dengan benar</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'cellGeometry' && (
                        <div>
                          <p><strong>Bentuk Geometri Sel Raster</strong></p>
                          <p>Menentukan bagaimana setiap sel/pixel dalam data raster mewakili area di dunia nyata:</p>
                          <ul>
                            <li><strong>point:</strong> Setiap sel mewakili satu titik koordinat (jarang digunakan)</li>
                            <li><strong>area:</strong> Setiap sel mewakili area persegi (paling umum)</li>
                          </ul>
                          <p><strong>Contoh penggunaan:</strong></p>
                          <ul>
                            <li><strong>Area:</strong> Citra satelit - setiap pixel 10x10 meter mewakili area 100m²</li>
                            <li><strong>Point:</strong> Data poin sampling - setiap sel adalah lokasi sampling</li>
                          </ul>
                          <p><strong>Dampak pada analisis:</strong></p>
                          <ul>
                            <li>Area: Cocok untuk overlay dan statistik areal</li>
                            <li>Point: Cocok untuk interpolasi dan modeling</li>
                          </ul>
                          <p><strong>Default untuk remote sensing:</strong> Selalu "area"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'georectified' && (
                        <div>
                          <p><strong>Status Koreksi Geometri Raster</strong></p>
                          <p>Menunjukkan apakah data raster telah dikoreksi sehingga memiliki sistem koordinat yang akurat:</p>
                          <ul>
                            <li><strong>true:</strong> Data sudah dikoreksi geometri, siap digunakan</li>
                            <li><strong>false:</strong> Data masih dalam kondisi asli, perlu koreksi</li>
                          </ul>
                          <p><strong>Proses georectification meliputi:</strong></p>
                          <ul>
                            <li>Koreksi distorsi lensa kamera</li>
                            <li>Koreksi perspektif (terrain correction)</li>
                            <li>Transformasi ke sistem koordinat target</li>
                            <li>Resampling pixel ke grid regular</li>
                          </ul>
                          <p><strong>Ground Control Points (GCP):</strong> Titik referensi di lapangan untuk akurasi koreksi</p>
                          <p><strong>RMSE (Root Mean Square Error):</strong> Ukuran akurasi koreksi geometri</p>
                          <p><strong>Untuk citra satelit:</strong> Biasanya sudah georectified oleh penyedia data</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'georeferenceable' && (
                        <div>
                          <p><strong>Kemampuan Georeferensi Data</strong></p>
                          <p>Menunjukkan apakah data memiliki informasi yang cukup untuk diposisikan di permukaan bumi:</p>
                          <ul>
                            <li><strong>true:</strong> Data memiliki koordinat geografis, bisa ditampilkan di peta</li>
                            <li><strong>false:</strong> Data tidak memiliki referensi spasial</li>
                          </ul>
                          <p><strong>Yang membuat data georeferenceable:</strong></p>
                          <ul>
                            <li>Sistem koordinat (coordinate system)</li>
                            <li>Datum vertikal dan horizontal</li>
                            <li>Projection parameters</li>
                            <li>Bounding box atau extent</li>
                          </ul>
                          <p><strong>Contoh data yang tidak georeferenceable:</strong></p>
                          <ul>
                            <li>Skema jalan tanpa koordinat</li>
                            <li>Peta konseptual</li>
                            <li>Diagram skematik</li>
                          </ul>
                          <p><strong>Untuk data geospasial:</strong> Hampir selalu "true"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'referenceSystemType' && (
                        <div>
                          <p><strong>Jenis Sistem Referensi Koordinat</strong></p>
                          <p>Mengklasifikasikan tipe sistem koordinat yang digunakan:</p>
                          <ul>
                            <li><strong>geodetic:</strong> Sistem berdasarkan ellipsoid bumi (WGS84, GRS80)</li>
                            <li><strong>vertical:</strong> Sistem untuk ketinggian/elevasi</li>
                            <li><strong>temporal:</strong> Sistem untuk referensi waktu</li>
                          </ul>
                          <p><strong>Contoh untuk Indonesia:</strong></p>
                          <ul>
                            <li><strong>Geodetic:</strong> WGS84 (GPS), DGN95 (Indonesia)</li>
                            <li><strong>Vertical:</strong> EGM2008, local vertical datum</li>
                            <li><strong>Temporal:</strong> UTC, WIB</li>
                          </ul>
                          <p><strong>Kenapa penting:</strong> Sistem yang berbeda memerlukan transformasi untuk integrasi</p>
                          <p><strong>Default untuk data geografis:</strong> "geodetic"</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'attributeDescription' && (
                        <div>
                          <p><strong>Penjelasan Detail Atribut Data</strong></p>
                          <p>Deskripsi lengkap tentang setiap kolom/atribut dalam dataset. Penting untuk:</p>
                          <ul>
                            <li><strong>Memahami isi data:</strong> Menjelaskan makna setiap atribut</li>
                            <li><strong>Validasi data:</strong> Mengetahui tipe dan range nilai yang valid</li>
                            <li><strong>Analisis yang benar:</strong> Menggunakan atribut sesuai fungsinya</li>
                          </ul>
                          <p><strong>Informasi yang perlu disertakan:</strong></p>
                          <ul>
                            <li><strong>Nama atribut:</strong> provinsi, luas_km2, kode_wilayah</li>
                            <li><strong>Tipe data:</strong> string, integer, float, date</li>
                            <li><strong>Deskripsi:</strong> Penjelasan makna atribut</li>
                            <li><strong>Unit:</strong> km², meter, derajat</li>
                            <li><strong>Range nilai:</strong> 0-999999, 1900-2100</li>
                            <li><strong>Contoh nilai:</strong> "Jawa Barat", 53222.45</li>
                          </ul>
                          <p><strong>Format penulisan:</strong> nama_atribut (tipe): deskripsi - contoh: luas_km2 (float): luas wilayah dalam kilometer persegi - contoh: 53222.45</p>
                          <p><strong>Untuk Shapefile:</strong> Biasanya ada di file .dbf dan dokumentasi atribut</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'contentType' && (
                        <div>
                          <p><strong>Jenis Isi Data dalam Dataset</strong></p>
                          <p>Mengklasifikasikan tipe isi data berdasarkan karakteristiknya:</p>
                          <ul>
                            <li><strong>image:</strong> Data citra/visual (foto, satelit, scan)</li>
                            <li><strong>thematicClassification:</strong> Data klasifikasi tematik (tutupan lahan, tipe tanah)</li>
                            <li><strong>physicalMeasurement:</strong> Pengukuran fisik (elevasi, temperatur, kedalaman)</li>
                          </ul>
                          <p><strong>Contoh penggunaan:</strong></p>
                          <ul>
                            <li><strong>Image:</strong> Citra satelit RGB, foto udara, scanned map</li>
                            <li><strong>Thematic:</strong> Peta penggunaan lahan, klasifikasi geologi</li>
                            <li><strong>Physical:</strong> DEM, data suhu, data curah hujan</li>
                          </ul>
                          <p><strong>Dampak pada processing:</strong></p>
                          <ul>
                            <li>Image: Memerlukan image processing techniques</li>
                            <li>Thematic: Cocok untuk spatial analysis</li>
                            <li>Physical: Bisa diinterpolasi dan dimodelkan</li>
                          </ul>
                          <p><strong>Untuk data Indonesia:</strong> Thematic classification paling umum untuk data administrasi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'distributor' && (
                        <div>
                          <p><strong>Informasi Distributor Dataset</strong></p>
                          <p>Pihak yang bertanggung jawab mendistribusikan dan menyediakan akses ke dataset. Bisa berbeda dengan:</p>
                          <ul>
                            <li><strong>Originator:</strong> Yang membuat data</li>
                            <li><strong>Publisher:</strong> Yang mempublikasikan data</li>
                            <li><strong>Distributor:</strong> Yang menangani distribusi teknis</li>
                          </ul>
                          <p><strong>Informasi distributor meliputi:</strong></p>
                          <ul>
                            <li>Nama organisasi lengkap</li>
                            <li>Kontak teknis (bukan kontak umum)</li>
                            <li>Alamat email dan telepon</li>
                            <li>Website resmi</li>
                            <li>Jam operasional</li>
                          </ul>
                          <p><strong>Contoh untuk DKB:</strong></p>
                          <ul>
                            <li>Nama: DKB (Data dan Kecerdasan Buatan) Otorita Ibu Kota Nusantara</li>
                            <li>Email: data@dkb.go.id</li>
                            <li>Telepon: 021-3843140</li>
                            <li>Website: https://data.bps.go.id</li>
                          </ul>
                          <p><strong>Kenapa penting:</strong> Pengguna tahu ke mana harus menghubungi untuk masalah teknis distribusi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'onlineResource' && (
                        <div>
                          <p><strong>Sumber Online Dataset</strong></p>
                          <p>URL lengkap dan permanen untuk mengakses dataset asli. Ini adalah tautan langsung ke data yang dapat diakses oleh pengguna. Penting untuk:</p>
                          <ul>
                            <li><strong>Permanence:</strong> URL yang tidak berubah seiring waktu</li>
                            <li><strong>Direct access:</strong> Pengguna bisa langsung mengakses data</li>
                            <li><strong>Machine readable:</strong> Sistem bisa otomatis mengunduh data</li>
                            <li><strong>Interoperability:</strong> Memungkinkan integrasi dengan sistem lain</li>
                          </ul>
                          <p><strong>Jenis URL yang baik:</strong></p>
                          <ul>
                            <li><strong>Portal data resmi:</strong> https://data.bps.go.id/dataset/peta-administrasi-indonesia-2024</li>
                            <li><strong>Repository institusi:</strong> https://repository.bps.go.id/handle/123456789/12345</li>
                            <li><strong>Persistent identifier:</strong> https://doi.org/10.1234/abcd-efgh</li>
                            <li><strong>API endpoint:</strong> https://api.bps.go.id/geospatial/v1/boundaries</li>
                          </ul>
                          <p><strong>Ketika kosongkan field ini:</strong></p>
                          <ul>
                            <li>Data belum dipublikasikan online</li>
                            <li>Data masih dalam tahap internal/proses</li>
                            <li>Data hanya tersedia dalam format fisik</li>
                            <li>Akses data memerlukan autentikasi khusus</li>
                          </ul>
                          <p><strong>Best practices:</strong></p>
                          <ul>
                            <li>Gunakan HTTPS untuk keamanan</li>
                            <li>Pastikan URL aktif dan dapat diakses publik</li>
                            <li>Lebih baik menggunakan DOI atau PURL untuk permanensi</li>
                            <li>Sertakan dalam transferOptions jika ada multiple cara akses</li>
                          </ul>
                          <p><strong>Untuk data DKB:</strong> Biasanya mengarah ke portal data resmi atau repository institusi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'transferOptions' && (
                        <div>
                          <p><strong>Cara Mendapatkan dan Mengakses Data</strong></p>
                          <p>Menjelaskan semua metode yang tersedia untuk mendapatkan dataset:</p>
                          <ul>
                            <li><strong>Download langsung:</strong> URL download dengan ukuran file</li>
                            <li><strong>API access:</strong> REST API, GraphQL endpoints</li>
                            <li><strong>Web services:</strong> WMS, WFS, WMTS</li>
                            <li><strong>FTP access:</strong> Server FTP dengan kredensial</li>
                            <li><strong>Physical media:</strong> CD/DVD, hard disk (jarang)</li>
                          </ul>
                          <p><strong>Informasi yang perlu disertakan:</strong></p>
                          <ul>
                            <li>URL atau endpoint lengkap</li>
                            <li>Protokol akses (HTTP, FTP, API)</li>
                            <li>Format data yang tersedia</li>
                            <li>Batasan akses (rate limit, quota)</li>
                            <li>Persyaratan autentikasi</li>
                            <li>Ukuran file perkiraan</li>
                          </ul>
                          <p><strong>Contoh lengkap:</strong></p>
                          <ul>
                            <li>"Download via HTTPS: https://data.bps.go.id/download/peta-administrasi.zip (50MB)"</li>
                            <li>"WMS service: https://geoserver.bps.go.id/wms"</li>
                            <li>"API access: https://api.bps.go.id/geospatial/v1/administrasi (rate limit: 1000 requests/hour)"</li>
                          </ul>
                          <p><strong>Best practice:</strong> Berikan multiple options untuk kemudahan akses</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'completeness' && (
                        <div>
                          <p><strong>Tingkat Kelengkapan Data</strong></p>
                          <p>Mengukur seberapa lengkap dataset dibandingkan dengan cakupan yang diharapkan:</p>
                          <ul>
                            <li><strong>100%:</strong> Semua data sesuai spesifikasi</li>
                            <li><strong>95%:</strong> 5% data hilang tapi tidak kritikal</li>
                            <li><strong>80%:</strong> 20% data hilang, perlu hati-hati</li>
                          </ul>
                          <p><strong>Aspek kelengkapan:</strong></p>
                          <ul>
                            <li><strong>Spatial coverage:</strong> Cakupan geografis tercapai?</li>
                            <li><strong>Temporal coverage:</strong> Periode waktu lengkap?</li>
                            <li><strong>Attribute completeness:</strong> Semua atribut terisi?</li>
                            <li><strong>Feature completeness:</strong> Semua fitur tercatat?</li>
                          </ul>
                          <p><strong>Cara mengukur:</strong></p>
                          <ul>
                            <li>Perbandingan dengan sumber resmi</li>
                            <li>Validasi lapangan</li>
                            <li>Cross-check dengan dataset lain</li>
                          </ul>
                          <p><strong>Untuk data administrasi:</strong> Biasanya 95-100% untuk data resmi pemerintah</p>
                          <p><strong>Konsekuensi:</strong> Data tidak lengkap bisa menyebabkan kesimpulan yang bias</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'consistency' && (
                        <div>
                          <p><strong>Tingkat Konsistensi Internal Data</strong></p>
                          <p>Mengukur seberapa konsisten data antar atribut dan dengan standar yang berlaku:</p>
                          <ul>
                            <li><strong>100%:</strong> Tidak ada inkonsistensi</li>
                            <li><strong>95%:</strong> Inkonsistensi minor, tidak mempengaruhi penggunaan</li>
                            <li><strong>80%:</strong> Inkonsistensi signifikan, perlu verifikasi</li>
                          </ul>
                          <p><strong>Jenis konsistensi:</strong></p>
                          <ul>
                            <li><strong>Format konsistensi:</strong> Semua tanggal format sama?</li>
                            <li><strong>Domain konsistensi:</strong> Kode provinsi valid?</li>
                            <li><strong>Relational konsistensi:</strong> Luas wilayah masuk akal?</li>
                            <li><strong>Temporal konsistensi:</strong> Data tidak矛盾 dengan waktu</li>
                          </ul>
                          <p><strong>Contoh masalah:</strong></p>
                          <ul>
                            <li>Kode wilayah tidak sesuai dengan nama</li>
                            <li>Luas kabupaten &gt; luas provinsi</li>
                            <li>Tanggal update lebih lama dari tanggal pembuatan</li>
                          </ul>
                          <p><strong>Cara validasi:</strong> Automated checks, manual review, cross-validation</p>
                          <p><strong>Untuk data DKB:</strong> Biasanya &gt;95% konsisten setelah quality control</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'accessConstraints' && (
                        <div>
                          <p><strong>Pembatasan Akses terhadap Dataset</strong></p>
                          <p>Menentukan siapa yang boleh mengakses data dan dalam kondisi apa:</p>
                          <ul>
                            <li><strong>public:</strong> Terbuka untuk umum tanpa batasan</li>
                            <li><strong>restricted:</strong> Terbatas untuk kelompok tertentu</li>
                            <li><strong>confidential:</strong> Rahasia, akses sangat terbatas</li>
                            <li><strong>protected:</strong> Dilindungi undang-undang</li>
                          </ul>
                          <p><strong>Faktor penentu:</strong></p>
                          <ul>
                            <li>Klasifikasi keamanan nasional</li>
                            <li>Undang-undang privasi (PDP)</li>
                            <li>Perjanjian bilateral/internasional</li>
                            <li>Sensitivitas informasi</li>
                          </ul>
                          <p><strong>Contoh untuk Indonesia:</strong></p>
                          <ul>
                            <li><strong>Public:</strong> Data administrasi, statistik umum</li>
                            <li><strong>Restricted:</strong> Data survei sensitif</li>
                            <li><strong>Confidential:</strong> Data intelijen, militer</li>
                          </ul>
                          <p><strong>Legal basis:</strong> UU No. 14 Tahun 2008 tentang Keterbukaan Informasi Publik</p>
                          <p><strong>Untuk data DKB:</strong> Kebanyakan "public" kecuali data yang dilindungi</p>
                        </div>
                      )}
                      {selectedFieldData.id === 'otherConstraints' && (
                        <div>
                          <p><strong>Ketentuan Khusus Tambahan</strong></p>
                          <p>Ketentuan penggunaan yang tidak tercakup dalam field lain. Meliputi:</p>
                          <ul>
                            <li><strong>Persyaratan teknis:</strong> Software khusus untuk membuka data</li>
                            <li><strong>Etika penggunaan:</strong> Tidak untuk kepentingan komersial</li>
                            <li><strong>Credit requirements:</strong> Cara mencantumkan sumber</li>
                            <li><strong>Usage limitations:</strong> Maksimal penggunaan per hari</li>
                            <li><strong>Redistribution rules:</strong> Boleh/tidak boleh disebarkan ulang</li>
                          </ul>
                          <p><strong>Contoh ketentuan:</strong></p>
                          <ul>
                            <li>"Data hanya boleh digunakan untuk tujuan pendidikan dan penelitian"</li>
                            <li>"Penggunaan komersial memerlukan izin tertulis dari DKB Otorita Ibu Kota Nusantara"</li>
                            <li>"Harus mencantumkan sumber: Sumber - DKB Otorita Ibu Kota Nusantara"</li>
                            <li>"Tidak boleh digunakan untuk kampanye politik"</li>
                          </ul>
                          <p><strong>Kenapa terpisah:</strong> Ketentuan ini lebih spesifik dari lisensi umum</p>
                          <p><strong>Legal weight:</strong> Sama mengikatnya dengan lisensi utama</p>
                        </div>
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