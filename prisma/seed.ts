import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const email = 'admin@example.com'
  const password = 'admin123'
  const name = 'Administrator'
  const role = 'ADMIN'

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (!existingUser) {
    const hashedPassword = await hashPassword(password)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    })
    console.log('✅ Admin user created:', email)
  } else {
    console.log('ℹ️ Admin user already exists:', email)
  }

  // Create regular user
  const userEmail = 'user@example.com'
  const userPassword = 'user123'
  const userName = 'Regular User'

  const existingRegularUser = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!existingRegularUser) {
    const hashedUserPassword = await hashPassword(userPassword)
    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedUserPassword,
        name: userName,
        role: 'USER',
      },
    })
    console.log('✅ Regular user created:', userEmail)
  } else {
    console.log('ℹ️ Regular user already exists:', userEmail)
  }

  // Seed controlled vocabulary data
  await seedControlledVocabulary()

  // Seed metadata examples
  await seedMetadataExamples()

  console.log('🎉 Database seeding completed!')
}

async function seedControlledVocabulary() {
  console.log('📚 Seeding controlled vocabulary...')

  // Topic Categories (ISO 19115)
  const topicCategories = [
    { code: 'farming', label: 'Pertanian', description: 'Informasi terkait pertanian' },
    { code: 'biota', label: 'Biota', description: 'Informasi terkait kehidupan liar' },
    { code: 'boundaries', label: 'Batas Wilayah', description: 'Informasi batas administratif' },
    { code: 'climatology', label: 'Klimatologi', description: 'Informasi terkait iklim' },
    { code: 'economy', label: 'Ekonomi', description: 'Informasi terkait ekonomi' },
    { code: 'elevation', label: 'Elevasi', description: 'Informasi terkait ketinggian' },
    { code: 'environment', label: 'Lingkungan', description: 'Informasi terkait lingkungan' },
    { code: 'geoscientific', label: 'Geosains', description: 'Informasi geosains' },
    { code: 'health', label: 'Kesehatan', description: 'Informasi terkait kesehatan' },
    { code: 'imagery', label: 'Citra', description: 'Informasi citra' },
    { code: 'intelligence', label: 'Intelijen', description: 'Informasi intelijen' },
    { code: 'inlandWaters', label: 'Perairan Daratan', description: 'Informasi perairan daratan' },
    { code: 'location', label: 'Lokasi', description: 'Informasi lokasi' },
    { code: 'oceans', label: 'Oseanografi', description: 'Informasi oseanografi' },
    { code: 'planning', label: 'Perencanaan', description: 'Informasi perencanaan' },
    { code: 'society', label: 'Masyarakat', description: 'Informasi masyarakat' },
    { code: 'structure', label: 'Struktur', description: 'Informasi struktur' },
    { code: 'transportation', label: 'Transportasi', description: 'Informasi transportasi' },
    { code: 'utilities', label: 'Utilitas', description: 'Informasi utilitas' }
  ]

  for (const category of topicCategories) {
    await prisma.controlledVocabulary.upsert({
      where: {
        category_code_language: {
          category: 'topicCategory',
          code: category.code,
          language: 'ID'
        }
      },
      update: {},
      create: {
        category: 'topicCategory',
        code: category.code,
        label: category.label,
        description: category.description,
        language: 'ID'
      }
    })
  }

  // Status values
  const statusValues = [
    { code: 'completed', label: 'Selesai', description: 'Dataset telah selesai' },
    { code: 'ongoing', label: 'Sedang Berlangsung', description: 'Dataset sedang dalam proses' },
    { code: 'planned', label: 'Direncanakan', description: 'Dataset direncanakan' },
    { code: 'deprecated', label: 'Usang', description: 'Dataset sudah tidak digunakan' }
  ]

  for (const status of statusValues) {
    await prisma.controlledVocabulary.upsert({
      where: {
        category_code_language: {
          category: 'status',
          code: status.code,
          language: 'ID'
        }
      },
      update: {},
      create: {
        category: 'status',
        code: status.code,
        label: status.label,
        description: status.description,
        language: 'ID'
      }
    })
  }

  // Update frequency
  const updateFrequencies = [
    { code: 'continual', label: 'Terus Menerus', description: 'Update terus menerus' },
    { code: 'daily', label: 'Harian', description: 'Update harian' },
    { code: 'weekly', label: 'Mingguan', description: 'Update mingguan' },
    { code: 'monthly', label: 'Bulanan', description: 'Update bulanan' },
    { code: 'quarterly', label: 'Triwulanan', description: 'Update triwulanan' },
    { code: 'biannually', label: 'Enam Bulanan', description: 'Update enam bulanan' },
    { code: 'annually', label: 'Tahunan', description: 'Update tahunan' },
    { code: 'asNeeded', label: 'Sesuai Kebutuhan', description: 'Update sesuai kebutuhan' },
    { code: 'irregular', label: 'Tidak Teratur', description: 'Update tidak teratur' },
    { code: 'notPlanned', label: 'Tidak Direncanakan', description: 'Tidak ada rencana update' }
  ]

  for (const freq of updateFrequencies) {
    await prisma.controlledVocabulary.upsert({
      where: {
        category_code_language: {
          category: 'updateFrequency',
          code: freq.code,
          language: 'ID'
        }
      },
      update: {},
      create: {
        category: 'updateFrequency',
        code: freq.code,
        label: freq.label,
        description: freq.description,
        language: 'ID'
      }
    })
  }

  // Contact roles
  const contactRoles = [
    { code: 'pointOfContact', label: 'Kontak Utama', description: 'Orang yang dapat dihubungi' },
    { code: 'custodian', label: 'Penjaga Data', description: 'Penanggung jawab data' },
    { code: 'owner', label: 'Pemilik', description: 'Pemilik data' },
    { code: 'user', label: 'Pengguna', description: 'Pengguna data' },
    { code: 'distributor', label: 'Distributor', description: 'Distributor data' },
    { code: 'originator', label: 'Pembuat', description: 'Pembuat data' },
    { code: 'principalInvestigator', label: 'Peneliti Utama', description: 'Peneliti utama' },
    { code: 'processor', label: 'Pengolah', description: 'Pengolah data' },
    { code: 'publisher', label: 'Penerbit', description: 'Penerbit data' },
    { code: 'author', label: 'Penulis', description: 'Penulis data' }
  ]

  for (const role of contactRoles) {
    await prisma.controlledVocabulary.upsert({
      where: {
        category_code_language: {
          category: 'contactRole',
          code: role.code,
          language: 'ID'
        }
      },
      update: {},
      create: {
        category: 'contactRole',
        code: role.code,
        label: role.label,
        description: role.description,
        language: 'ID'
      }
    })
  }

  // SNI Standards
  const sniStandards = [
    { code: 'SNI-ISO-19115-2019', label: 'SNI ISO 19115:2019', description: 'Standar metadata geospasial Indonesia' },
    { code: 'SNI-ISO-19139-2019', label: 'SNI ISO 19139:2019', description: 'Standar XML untuk metadata' },
    { code: 'SNI-ISO-19119-2019', label: 'SNI ISO 19119:2019', description: 'Standar layanan geospasial' }
  ]

  for (const sni of sniStandards) {
    await prisma.controlledVocabulary.upsert({
      where: {
        category_code_language: {
          category: 'sniStandard',
          code: sni.code,
          language: 'ID'
        }
      },
      update: {},
      create: {
        category: 'sniStandard',
        code: sni.code,
        label: sni.label,
        description: sni.description,
        language: 'ID'
      }
    })
  }

  console.log('✅ Controlled vocabulary seeded successfully')
}

async function seedMetadataExamples() {
  console.log('📄 Seeding metadata examples...')

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } })
  const regularUser = await prisma.user.findUnique({ where: { email: 'user@example.com' } })

  if (!adminUser || !regularUser) {
    console.log('❌ Users not found, skipping metadata examples')
    return
  }

  // Example 1: Administrative Boundaries
  await prisma.metadata.create({
    data: {
      title: 'Peta Administrasi Indonesia 2024',
      abstract: 'Dataset peta administrasi Indonesia yang mencakup batas-batas wilayah provinsi, kabupaten, dan kecamatan. Data diperoleh dari Badan Pusat Statistik (BPS) dan telah diperbarui berdasarkan perubahan administrasi terbaru tahun 2024.',
      purpose: 'Dataset ini digunakan untuk perencanaan pembangunan, analisis spasial, keperluan administrasi pemerintahan, dan sebagai referensi geografis untuk berbagai keperluan.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'administrasi, peta, indonesia, batas wilayah, provinsi, kabupaten, kecamatan',
      topicCategory: 'boundaries',
      themeKeywords: 'administrative_units, boundaries',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '1:25.000',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-12-31'),
      contactName: 'Dr. Ahmad Santoso',
      contactEmail: 'ahmad.santoso@bps.go.id',
      contactOrganization: 'Badan Pusat Statistik',
      contactRole: 'pointOfContact',
      contactPhone: '+62-21-3456789',
      contactAddress: 'Jl. Dr. Sutomo 6-8, Jakarta 10710, Indonesia',
      metadataContactName: 'Siti Nurhaliza',
      metadataContactEmail: 'siti.nurhaliza@bps.go.id',
      metadataContactOrganization: 'Badan Pusat Statistik',
      distributionFormat: 'GeoJSON, Shapefile',
      onlineResource: 'https://data.bps.go.id/dataset/peta-administrasi-indonesia-2024',
      lineage: 'Data dikumpulkan dari sumber resmi pemerintah daerah, diverifikasi dengan data sensus BPS, dan diintegrasikan menggunakan software GIS ArcGIS Pro 3.1.',
      accuracy: 'Akurasi posisional: ±5 meter, Kelengkapan atribut: 100%',
      completeness: 'Dataset lengkap mencakup seluruh wilayah Indonesia',
      consistency: 'Data konsisten dengan standar SNI ISO 19115:2019',
      useConstraints: 'Penggunaan untuk keperluan resmi pemerintah dan akademik',
      accessConstraints: 'restricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0 International',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Polygon, MultiPolygon',
      attributeInfo: {
        provinsi: { type: 'string', description: 'Nama provinsi' },
        kabupaten: { type: 'string', description: 'Nama kabupaten/kota' },
        kecamatan: { type: 'string', description: 'Nama kecamatan' },
        kode_prov: { type: 'string', description: 'Kode provinsi BPS' },
        kode_kab: { type: 'string', description: 'Kode kabupaten BPS' },
        kode_kec: { type: 'string', description: 'Kode kecamatan BPS' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'peta_administrasi_indonesia_2024.zip',
      fileSize: 150000000, // 150MB
      featureCount: 85000,
      geometryType: 'Polygon',
      dataFormat: 'Shapefile',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan tahun 2023, diproses dan diverifikasi tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-03-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-03-10'),
      userId: adminUser.id
    }
  })

  // Example 2: Elevation Data
  await prisma.metadata.create({
    data: {
      title: 'Digital Elevation Model (DEM) Indonesia 30m',
      abstract: 'Model elevasi digital Indonesia dengan resolusi 30 meter yang dihasilkan dari pengolahan data satelit SRTM (Shuttle Radar Topography Mission). Dataset ini mencakup seluruh wilayah Indonesia dengan akurasi vertikal ±16 meter.',
      purpose: 'Dataset DEM digunakan untuk analisis hidrologi, perencanaan infrastruktur, pemodelan risiko bencana, dan berbagai aplikasi GIS yang memerlukan data elevasi.',
      status: 'completed',
      updateFrequency: 'asNeeded',
      keywords: 'DEM, elevasi, SRTM, topografi, indonesia, 30m',
      topicCategory: 'elevation',
      themeKeywords: 'elevation, topography',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '30 meter',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      verticalExtent: {
        minZ: -100,
        maxZ: 4884,
        unit: 'meter'
      },
      temporalStart: new Date('2000-01-01'),
      temporalEnd: new Date('2000-12-31'),
      contactName: 'Dr. Rina Sari',
      contactEmail: 'rina.sari@big.go.id',
      contactOrganization: 'Badan Informasi Geospasial',
      contactRole: 'custodian',
      contactPhone: '+62-21-3841234',
      contactAddress: 'Jl. Raya Jakarta-Bogor KM 46, Cibinong, Bogor 16911, Indonesia',
      metadataContactName: 'Ahmad Rahman',
      metadataContactEmail: 'ahmad.rahman@big.go.id',
      metadataContactOrganization: 'Badan Informasi Geospasial',
      distributionFormat: 'GeoTIFF, ASCII Grid',
      onlineResource: 'https://tanahair.indonesia.go.id/dem-30m',
      lineage: 'Data SRTM diunduh dari USGS Earth Explorer, diproses menggunakan software PCI Geomatica, dikoreksi menggunakan data lapangan dan GPS.',
      accuracy: 'Akurasi vertikal RMSE: ±16 meter, Akurasi horizontal: ±20 meter',
      completeness: 'Coverage 100% wilayah Indonesia, data hilang di daerah terpencil',
      consistency: 'Data konsisten dengan standar internasional DEM',
      useConstraints: 'Penggunaan untuk keperluan non-komersial',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Sumber: NASA SRTM',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Grid',
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'dem_indonesia_30m_2024.tif',
      fileSize: 2000000000, // 2GB (within INT limit)
      geometryType: 'Grid',
      dataFormat: 'GeoTIFF',
      processingLevel: 'processed',
      processingHistory: 'Data SRTM diproses tahun 2023, dikoreksi dan divalidasi tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-02-20'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-02-15'),
      userId: adminUser.id
    }
  })

  // Example 3: Land Use/Land Cover
  await prisma.metadata.create({
    data: {
      title: 'Peta Penggunaan Lahan Indonesia 2023',
      abstract: 'Peta penggunaan lahan Indonesia tahun 2023 yang diklasifikasikan berdasarkan citra satelit Sentinel-2. Dataset mencakup 15 kelas penggunaan lahan utama dengan akurasi keseluruhan 85%.',
      purpose: 'Dataset digunakan untuk perencanaan tata ruang, monitoring perubahan lahan, analisis dampak lingkungan, dan kebijakan pengelolaan sumber daya alam.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'penggunaan lahan, land use, land cover, sentinel-2, klasifikasi, indonesia',
      topicCategory: 'planning',
      themeKeywords: 'land_use, land_cover',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '10 meter',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2023-01-01'),
      temporalEnd: new Date('2023-12-31'),
      contactName: 'Prof. Dr. Budi Santosa',
      contactEmail: 'budi.santosa@klhk.go.id',
      contactOrganization: 'Kementerian Lingkungan Hidup dan Kehutanan',
      contactRole: 'owner',
      contactPhone: '+62-21-5730155',
      contactAddress: 'Jl. DI Panjaitan Kav. 24, Jakarta 13410, Indonesia',
      metadataContactName: 'Maya Putri',
      metadataContactEmail: 'maya.putri@klhk.go.id',
      metadataContactOrganization: 'Kementerian Lingkungan Hidup dan Kehutanan',
      distributionFormat: 'GeoTIFF, Shapefile',
      onlineResource: 'https://geoportal.menlhk.go.id/layer/penggunaan-lahan-2023',
      lineage: 'Citra Sentinel-2 diklasifikasi menggunakan algoritma Random Forest dengan training data dari survei lapangan tahun 2022-2023.',
      accuracy: 'Akurasi keseluruhan: 85%, Kappa coefficient: 0.82',
      completeness: 'Coverage 95% wilayah Indonesia, 5% data awan',
      consistency: 'Klasifikasi konsisten dengan standar FAO Land Cover Classification System',
      useConstraints: 'Penggunaan untuk keperluan resmi pemerintah',
      accessConstraints: 'restricted',
      otherConstraints: 'Lisensi khusus untuk instansi pemerintah',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Polygon',
      attributeInfo: {
        class_id: { type: 'integer', description: 'ID kelas penggunaan lahan' },
        class_name: { type: 'string', description: 'Nama kelas penggunaan lahan' },
        area_ha: { type: 'float', description: 'Luas area dalam hektar' },
        confidence: { type: 'float', description: 'Tingkat kepercayaan klasifikasi (0-1)' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'landuse_indonesia_2023.zip',
      fileSize: 2100000000, // ~2GB (within INT limit)
      featureCount: 1500000,
      geometryType: 'Polygon',
      dataFormat: 'Shapefile',
      processingLevel: 'interpreted',
      processingHistory: 'Citra dikumpulkan tahun 2023, diklasifikasi menggunakan machine learning, divalidasi dengan data lapangan',
      isPublished: true,
      publishedAt: new Date('2024-04-10'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-04-05'),
      userId: adminUser.id
    }
  })

  // Example 4: Population Density
  await prisma.metadata.create({
    data: {
      title: 'Kepadatan Penduduk Indonesia 2020',
      abstract: 'Dataset kepadatan penduduk Indonesia tahun 2020 berdasarkan data sensus BPS. Data disajikan dalam format grid 100m x 100m dengan estimasi populasi per sel grid.',
      purpose: 'Dataset digunakan untuk perencanaan pembangunan, analisis demografi, perencanaan infrastruktur, dan kebijakan publik terkait pelayanan sosial.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'kepadatan penduduk, populasi, demografi, sensus, indonesia, 2020',
      topicCategory: 'society',
      themeKeywords: 'population, demography',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '100 meter',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2020-01-01'),
      temporalEnd: new Date('2020-12-31'),
      contactName: 'Dr. Dewi Anggraini',
      contactEmail: 'dewi.anggraini@bps.go.id',
      contactOrganization: 'Badan Pusat Statistik',
      contactRole: 'pointOfContact',
      contactPhone: '+62-21-3456789',
      contactAddress: 'Jl. Dr. Sutomo 6-8, Jakarta 10710, Indonesia',
      metadataContactName: 'Rudi Hartono',
      metadataContactEmail: 'rudi.hartono@bps.go.id',
      metadataContactOrganization: 'Badan Pusat Statistik',
      distributionFormat: 'GeoTIFF, CSV',
      onlineResource: 'https://data.bps.go.id/dataset/kepadatan-penduduk-2020',
      lineage: 'Data sensus 2020 diinterpolasi menggunakan dasymetric mapping dengan land use sebagai ancillary data.',
      accuracy: 'Akurasi estimasi: ±15% pada tingkat kecamatan',
      completeness: 'Coverage 100% wilayah berpenduduk Indonesia',
      consistency: 'Konsisten dengan data sensus BPS 2020',
      useConstraints: 'Penggunaan untuk keperluan akademik dan pemerintah',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Grid',
      attributeInfo: {
        population: { type: 'integer', description: 'Jumlah penduduk per grid' },
        density: { type: 'float', description: 'Kepadatan penduduk per km²' },
        confidence: { type: 'float', description: 'Tingkat kepercayaan estimasi' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'population_density_indonesia_2020.zip',
      fileSize: 150000000, // 150MB
      featureCount: 2500000,
      geometryType: 'Grid',
      dataFormat: 'GeoTIFF',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan dari sensus tahun 2020, diproses menggunakan spatial interpolation tahun 2021',
      isPublished: true,
      publishedAt: new Date('2021-08-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2021-08-10'),
      userId: adminUser.id
    }
  })

  // Example 5: Forest Cover
  await prisma.metadata.create({
    data: {
      title: 'Tutupan Hutan Indonesia 2023',
      abstract: 'Dataset tutupan hutan Indonesia tahun 2023 yang diklasifikasikan menjadi hutan primer, sekunder, mangrove, dan lahan terbuka. Data dihasilkan dari analisis citra satelit Landsat 8 dan Sentinel-2.',
      purpose: 'Dataset digunakan untuk monitoring deforestasi, perencanaan konservasi, pengelolaan sumber daya hutan, dan kebijakan lingkungan nasional.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'tutupan hutan, forest cover, deforestasi, konservasi, indonesia, 2023',
      topicCategory: 'environment',
      themeKeywords: 'forest, conservation',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '30 meter',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2023-01-01'),
      temporalEnd: new Date('2023-12-31'),
      contactName: 'Prof. Dr. Ir. Bambang Hero Saharjo',
      contactEmail: 'bambang.saharjo@ipb.ac.id',
      contactOrganization: 'Institut Pertanian Bogor',
      contactRole: 'custodian',
      contactPhone: '+62-251-8626722',
      contactAddress: 'Jl. Raya Darmaga, Bogor 16680, Indonesia',
      metadataContactName: 'Maya Sari',
      metadataContactEmail: 'maya.sari@ipb.ac.id',
      metadataContactOrganization: 'Institut Pertanian Bogor',
      distributionFormat: 'GeoTIFF, Shapefile',
      onlineResource: 'https://geoportal.menlhk.go.id/layer/tutupan-hutan-2023',
      lineage: 'Citra satelit diklasifikasi menggunakan algoritma Random Forest dengan training data dari survei lapangan dan data historis.',
      accuracy: 'Akurasi keseluruhan: 92%, Kappa coefficient: 0.89',
      completeness: 'Coverage 95% wilayah Indonesia, 5% data awan',
      consistency: 'Konsisten dengan definisi tutupan hutan KLHK',
      useConstraints: 'Penggunaan untuk keperluan konservasi dan perencanaan',
      accessConstraints: 'restricted',
      otherConstraints: 'Lisensi khusus untuk instansi pemerintah',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Polygon',
      attributeInfo: {
        class_id: { type: 'integer', description: 'ID kelas tutupan hutan' },
        class_name: { type: 'string', description: 'Nama kelas tutupan hutan' },
        area_ha: { type: 'float', description: 'Luas area dalam hektar' },
        confidence: { type: 'float', description: 'Tingkat kepercayaan klasifikasi (0-1)' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'forest_cover_indonesia_2023.zip',
      fileSize: 2100000000, // 2GB
      featureCount: 500000,
      geometryType: 'Polygon',
      dataFormat: 'Shapefile',
      processingLevel: 'interpreted',
      processingHistory: 'Citra dikumpulkan tahun 2023, diklasifikasi menggunakan deep learning, divalidasi dengan survei lapangan',
      isPublished: true,
      publishedAt: new Date('2024-03-25'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-03-20'),
      userId: adminUser.id
    }
  })

  // Example 6: Geological Map
  await prisma.metadata.create({
    data: {
      title: 'Peta Geologi Indonesia Skala 1:250.000',
      abstract: 'Peta geologi Indonesia skala 1:250.000 yang mencakup formasi batuan, struktur geologi, dan sumber daya mineral. Data dihasilkan dari survei geologi sistematis selama 50 tahun terakhir.',
      purpose: 'Dataset digunakan untuk perencanaan pembangunan, eksplorasi mineral, penelitian geologi, dan mitigasi bencana geologi.',
      status: 'completed',
      updateFrequency: 'asNeeded',
      keywords: 'geologi, geological map, formasi batuan, mineral, indonesia, 1:250000',
      topicCategory: 'geoscientific',
      themeKeywords: 'geology, geological_units',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '1:250.000',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('1970-01-01'),
      temporalEnd: new Date('2020-12-31'),
      contactName: 'Prof. Dr. Ir. Sudarsono',
      contactEmail: 'sudarsono@esdm.go.id',
      contactOrganization: 'Kementerian Energi dan Sumber Daya Mineral',
      contactRole: 'custodian',
      contactPhone: '+62-21-3804242',
      contactAddress: 'Jl. Medan Merdeka Selatan No. 18, Jakarta Pusat 10110, Indonesia',
      metadataContactName: 'Dewi Lestari',
      metadataContactEmail: 'dewi.lestari@esdm.go.id',
      metadataContactOrganization: 'Kementerian Energi dan Sumber Daya Mineral',
      distributionFormat: 'GeoPDF, Shapefile',
      onlineResource: 'https://geoportal.esdm.go.id/layer/peta-geologi-indonesia',
      lineage: 'Data dikumpulkan dari survei geologi lapangan, analisis laboratorium, dan interpretasi geofisika selama periode 1970-2020.',
      accuracy: 'Akurasi stratigrafi: ±10 juta tahun, Akurasi spasial: ±500 meter',
      completeness: 'Coverage 80% wilayah Indonesia, data kurang di daerah terpencil',
      consistency: 'Konsisten dengan International Stratigraphic Chart',
      useConstraints: 'Penggunaan untuk keperluan akademik dan industri',
      accessConstraints: 'restricted',
      otherConstraints: 'Lisensi khusus untuk perusahaan pertambangan',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Polygon, LineString',
      attributeInfo: {
        formation: { type: 'string', description: 'Nama formasi geologi' },
        age: { type: 'string', description: 'Umur geologi' },
        lithology: { type: 'string', description: 'Litologi batuan' },
        structure: { type: 'string', description: 'Struktur geologi' },
        mineral: { type: 'string', description: 'Sumber daya mineral' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'geological_map_indonesia_250k.zip',
      fileSize: 1610612736, // 1.5GB
      featureCount: 75000,
      geometryType: 'Polygon',
      dataFormat: 'Shapefile',
      processingLevel: 'processed',
      processingHistory: 'Data survei terintegrasi dan didigitalisasi tahun 2015-2020',
      isPublished: true,
      publishedAt: new Date('2021-06-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2021-06-10'),
      userId: regularUser.id
    }
  })

  // Example 7: Health Facilities
  await prisma.metadata.create({
    data: {
      title: 'Fasilitas Kesehatan Indonesia 2024',
      abstract: 'Dataset fasilitas kesehatan Indonesia tahun 2024 yang mencakup rumah sakit, puskesmas, klinik, dan apotek. Data dikumpulkan dari Kementerian Kesehatan dan Dinas Kesehatan provinsi.',
      purpose: 'Dataset digunakan untuk perencanaan kesehatan masyarakat, analisis aksesibilitas layanan kesehatan, dan kebijakan kesehatan nasional.',
      status: 'completed',
      updateFrequency: 'quarterly',
      keywords: 'fasilitas kesehatan, rumah sakit, puskesmas, klinik, indonesia, 2024',
      topicCategory: 'health',
      themeKeywords: 'health_facilities, health_services',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: 'point',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-12-31'),
      contactName: 'Dr. Budi Santoso',
      contactEmail: 'budi.santoso@kemenkes.go.id',
      contactOrganization: 'Kementerian Kesehatan',
      contactRole: 'pointOfContact',
      contactPhone: '+62-21-52907458',
      contactAddress: 'Jl. HR Rasuna Said Blok X-5 Kav. 4-9, Jakarta Selatan 12950, Indonesia',
      metadataContactName: 'Maya Sari',
      metadataContactEmail: 'maya.sari@kemenkes.go.id',
      metadataContactOrganization: 'Kementerian Kesehatan',
      distributionFormat: 'GeoJSON, CSV',
      onlineResource: 'https://data.kemenkes.go.id/dataset/fasilitas-kesehatan-indonesia',
      lineage: 'Data dikumpulkan dari Sistem Informasi Rumah Sakit (SIRS) dan verifikasi lapangan oleh Dinas Kesehatan kabupaten/kota.',
      accuracy: 'Akurasi posisional: ±50 meter untuk fasilitas besar, ±200 meter untuk fasilitas kecil',
      completeness: 'Coverage 95% fasilitas kesehatan terdaftar',
      consistency: 'Konsisten dengan klasifikasi fasilitas kesehatan Kemenkes',
      useConstraints: 'Penggunaan untuk keperluan kesehatan masyarakat',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Point',
      attributeInfo: {
        facility_id: { type: 'string', description: 'ID fasilitas kesehatan unik' },
        name: { type: 'string', description: 'Nama fasilitas' },
        type: { type: 'string', description: 'Tipe fasilitas (RS, Puskesmas, Klinik, Apotek)' },
        level: { type: 'string', description: 'Tingkat fasilitas (A, B, C, D)' },
        beds: { type: 'integer', description: 'Jumlah tempat tidur' },
        doctors: { type: 'integer', description: 'Jumlah dokter' },
        phone: { type: 'string', description: 'Nomor telepon' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'health_facilities_indonesia_2024.geojson',
      fileSize: 104857600, // 100MB
      featureCount: 45000,
      geometryType: 'Point',
      dataFormat: 'GeoJSON',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan dari berbagai sumber tahun 2023-2024, diverifikasi dan diintegrasikan tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-06-10'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-06-05'),
      userId: adminUser.id
    }
  })

  // Example 8: Satellite Imagery
  await prisma.metadata.create({
    data: {
      title: 'Citra Satelit Sentinel-2 Indonesia Januari 2024',
      abstract: 'Citra satelit Sentinel-2 multispektral Indonesia bulan Januari 2024 dengan resolusi 10m, 20m, dan 60m. Citra telah dikoreksi atmosferik dan geometrik.',
      purpose: 'Citra digunakan untuk monitoring lahan, analisis vegetasi, pemetaan penggunaan lahan, dan berbagai aplikasi penginderaan jauh.',
      status: 'completed',
      updateFrequency: 'monthly',
      keywords: 'citra satelit, sentinel-2, multispektral, indonesia, januari 2024',
      topicCategory: 'imagery',
      themeKeywords: 'satellite_imagery, earth_observation',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '10 meter (RGB), 20 meter (Red Edge, NIR), 60 meter (SWIR)',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-01-31'),
      contactName: 'Dr. Ahmad Rahman',
      contactEmail: 'ahmad.rahman@big.go.id',
      contactOrganization: 'Badan Informasi Geospasial',
      contactRole: 'distributor',
      contactPhone: '+62-21-3841234',
      contactAddress: 'Jl. Raya Jakarta-Bogor KM 46, Cibinong, Bogor 16911, Indonesia',
      metadataContactName: 'Siti Nurhaliza',
      metadataContactEmail: 'siti.nurhaliza@big.go.id',
      metadataContactOrganization: 'Badan Informasi Geospasial',
      distributionFormat: 'GeoTIFF, JPEG2000',
      onlineResource: 'https://tanahair.indonesia.go.id/sentinel-2-indonesia',
      lineage: 'Citra Sentinel-2 Level-1C diproses menggunakan software SNAP untuk koreksi atmosferik dan geometrik.',
      accuracy: 'Akurasi geometrik: <12 meter, Akurasi radiometrik: ±5%',
      completeness: 'Coverage 100% wilayah Indonesia, komposit bulan Januari',
      consistency: 'Konsisten dengan standar ESA untuk produk Sentinel-2',
      useConstraints: 'Penggunaan untuk keperluan non-komersial',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Copernicus Open Access',
      referenceSystem: 'EPSG:4326',
      projection: 'UTM Zone 47-53N',
      featureTypes: 'Grid',
      attributeInfo: {
        band: { type: 'string', description: 'Nama band spektral' },
        resolution: { type: 'integer', description: 'Resolusi spasial (meter)' },
        wavelength: { type: 'float', description: 'Panjang gelombang (nm)' },
        cloud_cover: { type: 'float', description: 'Persentase tutupan awan (%)' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'sentinel2_indonesia_jan2024.zip',
      fileSize: 1073741824, // 1GB
      geometryType: 'Grid',
      dataFormat: 'GeoTIFF',
      processingLevel: 'processed',
      processingHistory: 'Citra dikoreksi atmosferik menggunakan algoritma Sen2Cor tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-02-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-02-10'),
      userId: regularUser.id
    }
  })

  // Example 9: River Network
  await prisma.metadata.create({
    data: {
      title: 'Jaringan Sungai Indonesia 2024',
      abstract: 'Dataset jaringan sungai Indonesia tahun 2024 yang mencakup sungai utama, anak sungai, dan saluran irigasi. Data dihasilkan dari integrasi berbagai sumber topografi dan hidrologi.',
      purpose: 'Dataset digunakan untuk perencanaan pengelolaan sumber daya air, analisis hidrologi, perencanaan irigasi, dan mitigasi bencana banjir.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'jaringan sungai, river network, hidrologi, irigasi, indonesia, 2024',
      topicCategory: 'inlandWaters',
      themeKeywords: 'hydrography, rivers',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '1:50.000',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-12-31'),
      contactName: 'Ir. Bambang Wibowo',
      contactEmail: 'bambang.wibowo@pu.go.id',
      contactOrganization: 'Kementerian Pekerjaan Umum dan Perumahan Rakyat',
      contactRole: 'custodian',
      contactPhone: '+62-21-72790255',
      contactAddress: 'Jl. Pattimura No. 20, Kebayoran Baru, Jakarta Selatan 12110, Indonesia',
      metadataContactName: 'Rina Kartika',
      metadataContactEmail: 'rina.kartika@pu.go.id',
      metadataContactOrganization: 'Kementerian Pekerjaan Umum dan Perumahan Rakyat',
      distributionFormat: 'GeoJSON, Shapefile',
      onlineResource: 'https://geoportal.pu.go.id/layer/jaringan-sungai-indonesia',
      lineage: 'Data dikumpulkan dari Peta RBI, citra satelit, dan survei lapangan, diintegrasikan menggunakan ArcGIS Hydro.',
      accuracy: 'Akurasi posisional: ±25 meter untuk sungai utama, ±50 meter untuk anak sungai',
      completeness: 'Coverage 90% sungai dengan debit > 1 m³/s',
      consistency: 'Konsisten dengan sistem klasifikasi sungai nasional',
      useConstraints: 'Penggunaan untuk keperluan perencanaan dan akademik',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'LineString, MultiLineString',
      attributeInfo: {
        river_id: { type: 'string', description: 'ID sungai unik' },
        name: { type: 'string', description: 'Nama sungai' },
        class: { type: 'string', description: 'Kelas sungai (utama, sekunder, tersier)' },
        length_km: { type: 'float', description: 'Panjang sungai dalam km' },
        basin: { type: 'string', description: 'Nama daerah aliran sungai' },
        discharge: { type: 'float', description: 'Debit rata-rata (m³/s)' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'river_network_indonesia_2024.zip',
      fileSize: 524288000, // 500MB
      featureCount: 180000,
      geometryType: 'LineString',
      dataFormat: 'Shapefile',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan dari berbagai sumber tahun 2023-2024, diverifikasi dan diintegrasikan tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-07-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-07-10'),
      userId: adminUser.id
    }
  })

  // Example 10: Marine Protected Areas
  await prisma.metadata.create({
    data: {
      title: 'Kawasan Konservasi Laut Indonesia 2024',
      abstract: 'Dataset kawasan konservasi laut Indonesia tahun 2024 yang mencakup Taman Nasional Laut, Cagar Alam Laut, Suaka Margasatwa Laut, dan Zona Ekonomi Eksklusif. Data resmi dari Kementerian Kelautan dan Perikanan.',
      purpose: 'Dataset digunakan untuk perencanaan konservasi laut, pengelolaan sumber daya pesisir, penegakan hukum, dan pendidikan lingkungan.',
      status: 'completed',
      updateFrequency: 'annually',
      keywords: 'kawasan konservasi laut, marine protected areas, taman nasional laut, indonesia, 2024',
      topicCategory: 'oceans',
      themeKeywords: 'marine_protected_areas, conservation',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '1:100.000',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia (perairan laut)',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-12-31'),
      contactName: 'Dr. Ir. Antam Noviar',
      contactEmail: 'antam.noviar@kkp.go.id',
      contactOrganization: 'Kementerian Kelautan dan Perikanan',
      contactRole: 'owner',
      contactPhone: '+62-21-3513300',
      contactAddress: 'Jl. Medan Merdeka Timur No. 16, Jakarta Pusat 10110, Indonesia',
      metadataContactName: 'Sari Indah',
      metadataContactEmail: 'sari.indah@kkp.go.id',
      metadataContactOrganization: 'Kementerian Kelautan dan Perikanan',
      distributionFormat: 'GeoJSON, Shapefile',
      onlineResource: 'https://geoportal.kkp.go.id/layer/kawasan-konservasi-laut',
      lineage: 'Data dikumpulkan dari SK Menteri KKP tentang penetapan kawasan konservasi, diverifikasi dengan citra satelit dan survei lapangan.',
      accuracy: 'Akurasi posisional: ±100 meter untuk batas laut',
      completeness: 'Coverage 100% kawasan konservasi laut yang ditetapkan',
      consistency: 'Konsisten dengan Undang-undang No. 27 Tahun 2007 tentang Pengelolaan Wilayah Pesisir',
      useConstraints: 'Penggunaan untuk keperluan konservasi dan perencanaan',
      accessConstraints: 'restricted',
      otherConstraints: 'Lisensi khusus untuk instansi pemerintah',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Polygon, MultiPolygon',
      attributeInfo: {
        mpa_id: { type: 'string', description: 'ID kawasan konservasi unik' },
        name: { type: 'string', description: 'Nama kawasan konservasi' },
        type: { type: 'string', description: 'Tipe kawasan (TNL, CAL, SML, ZEE)' },
        status: { type: 'string', description: 'Status hukum (ditunjuk, ditetapkan)' },
        area_ha: { type: 'float', description: 'Luas area dalam hektar' },
        province: { type: 'string', description: 'Provinsi pengelola' },
        year_established: { type: 'integer', description: 'Tahun penetapan' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'marine_protected_areas_indonesia_2024.zip',
      fileSize: 209715200, // 200MB
      featureCount: 250,
      geometryType: 'Polygon',
      dataFormat: 'Shapefile',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan dari berbagai SK Menteri tahun 2023-2024, didigitalisasi dan diverifikasi tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-08-20'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-08-15'),
      userId: regularUser.id
    }
  })

  // Example 11: Transportation Network
  await prisma.metadata.create({
    data: {
      title: 'Jaringan Transportasi Indonesia 2024',
      abstract: 'Dataset jaringan transportasi Indonesia tahun 2024 yang mencakup jalan tol, jalan nasional, kereta api, bandara, dan pelabuhan. Data dihasilkan dari integrasi berbagai sumber resmi pemerintah.',
      purpose: 'Dataset digunakan untuk perencanaan transportasi, analisis aksesibilitas, perencanaan logistik, dan kebijakan transportasi nasional.',
      status: 'completed',
      updateFrequency: 'quarterly',
      keywords: 'jaringan transportasi, transportation network, jalan tol, kereta api, bandara, pelabuhan, indonesia, 2024',
      topicCategory: 'transportation',
      themeKeywords: 'transportation, infrastructure',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: '1:25.000',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2024-01-01'),
      temporalEnd: new Date('2024-12-31'),
      contactName: 'Ir. Danang Parikesit',
      contactEmail: 'danang.parikesit@kemenhub.go.id',
      contactOrganization: 'Kementerian Perhubungan',
      contactRole: 'pointOfContact',
      contactPhone: '+62-21-3847630',
      contactAddress: 'Jl. Medan Merdeka Barat No. 8, Jakarta Pusat 10110, Indonesia',
      metadataContactName: 'Sari Dewi',
      metadataContactEmail: 'sari.dewi@kemenhub.go.id',
      metadataContactOrganization: 'Kementerian Perhubungan',
      distributionFormat: 'GeoJSON, Shapefile',
      onlineResource: 'https://geoportal.kemenhub.go.id/layer/jaringan-transportasi-indonesia',
      lineage: 'Data dikumpulkan dari berbagai operator transportasi, diverifikasi dengan survei lapangan dan citra satelit.',
      accuracy: 'Akurasi posisional: ±10 meter untuk jalan tol, ±50 meter untuk jalan lokal',
      completeness: 'Coverage 95% infrastruktur transportasi utama',
      consistency: 'Konsisten dengan data Kemenhub dan stakeholder terkait',
      useConstraints: 'Penggunaan untuk keperluan perencanaan dan akademik',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'LineString, Point, Polygon',
      attributeInfo: {
        transport_id: { type: 'string', description: 'ID infrastruktur transportasi unik' },
        name: { type: 'string', description: 'Nama infrastruktur' },
        type: { type: 'string', description: 'Tipe transportasi (jalan, kereta, udara, laut)' },
        class: { type: 'string', description: 'Kelas infrastruktur (tol, nasional, lokal)' },
        length_km: { type: 'float', description: 'Panjang dalam km (untuk jalan/rel)' },
        capacity: { type: 'integer', description: 'Kapasitas (untuk bandara/pelabuhan)' },
        status: { type: 'string', description: 'Status operasional' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'transportation_network_indonesia_2024.zip',
      fileSize: 734003200, // 700MB
      featureCount: 125000,
      geometryType: 'LineString',
      dataFormat: 'Shapefile',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan dari berbagai operator tahun 2023-2024, diverifikasi dan diintegrasikan tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-09-10'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-09-05'),
      userId: adminUser.id
    }
  })

  // Example 12: Climate Data
  await prisma.metadata.create({
    data: {
      title: 'Data Iklim Indonesia 2023',
      abstract: 'Dataset data iklim Indonesia tahun 2023 yang mencakup curah hujan, suhu udara, kelembaban, dan tekanan udara. Data dihasilkan dari jaringan stasiun meteorologi BMKG.',
      purpose: 'Dataset digunakan untuk perencanaan pertanian, analisis cuaca, penelitian iklim, dan kebijakan lingkungan.',
      status: 'completed',
      updateFrequency: 'monthly',
      keywords: 'data iklim, climate data, curah hujan, suhu udara, bmkg, indonesia, 2023',
      topicCategory: 'climatology',
      themeKeywords: 'climate, meteorology',
      boundingBox: {
        minX: 95.0,
        minY: -11.0,
        maxX: 141.0,
        maxY: 6.0,
        crs: 'EPSG:4326'
      },
      spatialResolution: 'point',
      coordinateSystem: 'WGS84',
      geographicExtent: 'Indonesia',
      temporalStart: new Date('2023-01-01'),
      temporalEnd: new Date('2023-12-31'),
      contactName: 'Dr. Dwikorita Karnawati',
      contactEmail: 'dwikorita.karnawati@bmkg.go.id',
      contactOrganization: 'Badan Meteorologi, Klimatologi, dan Geofisika',
      contactRole: 'custodian',
      contactPhone: '+62-21-4246321',
      contactAddress: 'Jl. Angkasa I No. 2, Kemayoran, Jakarta Pusat 10720, Indonesia',
      metadataContactName: 'Ahmad Zaki',
      metadataContactEmail: 'ahmad.zaki@bmkg.go.id',
      metadataContactOrganization: 'Badan Meteorologi, Klimatologi, dan Geofisika',
      distributionFormat: 'CSV, NetCDF',
      onlineResource: 'https://data.bmkg.go.id/dataset/data-iklim-indonesia',
      lineage: 'Data dikumpulkan dari jaringan stasiun meteorologi otomatis (AWS) dan manual BMKG, dikualitaskan menggunakan prosedur WMO.',
      accuracy: 'Akurasi suhu: ±0.2°C, Curah hujan: ±1mm, Kelembaban: ±3%',
      completeness: 'Coverage 95% wilayah Indonesia melalui 500+ stasiun',
      consistency: 'Konsisten dengan standar WMO dan prosedur BMKG',
      useConstraints: 'Penggunaan untuk keperluan akademik dan pemerintah',
      accessConstraints: 'unrestricted',
      otherConstraints: 'Lisensi Creative Commons Attribution 4.0',
      referenceSystem: 'EPSG:4326',
      projection: 'WGS84 Geographic',
      featureTypes: 'Point',
      attributeInfo: {
        station_id: { type: 'string', description: 'ID stasiun meteorologi' },
        station_name: { type: 'string', description: 'Nama stasiun' },
        date: { type: 'date', description: 'Tanggal pengukuran' },
        temperature: { type: 'float', description: 'Suhu udara (°C)' },
        humidity: { type: 'float', description: 'Kelembaban relatif (%)' },
        rainfall: { type: 'float', description: 'Curah hujan (mm)' },
        pressure: { type: 'float', description: 'Tekanan udara (hPa)' },
        wind_speed: { type: 'float', description: 'Kecepatan angin (m/s)' }
      },
      sniCompliant: true,
      sniVersion: '1.0',
      sniStandard: 'SNI-ISO-19115-2019',
      bahasa: 'id',
      originalFileName: 'climate_data_indonesia_2023.zip',
      fileSize: 157286400, // 150MB
      featureCount: 182500, // 500 stasiun x 365 hari
      geometryType: 'Point',
      dataFormat: 'CSV',
      processingLevel: 'processed',
      processingHistory: 'Data dikumpulkan real-time tahun 2023, dikualitaskan dan divalidasi tahun 2024',
      isPublished: true,
      publishedAt: new Date('2024-01-15'),
      reviewStatus: 'approved',
      approvalDate: new Date('2024-01-10'),
      userId: regularUser.id
    }
  })

  console.log('✅ Metadata examples seeded successfully (12 complete examples created)')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })