const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      name: 'Administrator',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      name: 'Regular User',
      role: 'USER',
    },
  });

  console.log('✅ Regular user created:', regularUser.email);

  // Create sample metadata
  const metadataSamples = [
    {
      title: 'Peta Administrasi Indonesia',
      abstract: 'Peta batas administrasi provinsi dan kabupaten di Indonesia',
      keywords: 'administrasi, batas, indonesia',
      boundingBox: '{"minX":95,"minY":-11,"maxX":141,"maxY":6,"crs":"EPSG:4326"}',
      status: 'completed',
      isPublished: true,
      reviewStatus: 'approved',
      sniCompliant: true,
      bahasa: 'id',
      userId: adminUser.id,
    },
    {
      title: 'Data Populasi Per Kabupaten',
      abstract: 'Data statistik populasi berdasarkan kabupaten/kota di Indonesia tahun 2023',
      keywords: 'populasi, demografi, statistik',
      boundingBox: '{"minX":95,"minY":-11,"maxX":141,"maxY":6,"crs":"EPSG:4326"}',
      status: 'completed',
      isPublished: true,
      reviewStatus: 'approved',
      sniCompliant: true,
      bahasa: 'id',
      userId: adminUser.id,
    },
    {
      title: 'Peta Jaringan Jalan Nasional',
      abstract: 'Peta jaringan jalan nasional dan tol di Indonesia',
      keywords: 'transportasi, jalan, infrastruktur',
      boundingBox: '{"minX":95,"minY":-11,"maxX":141,"maxY":6,"crs":"EPSG:4326"}',
      status: 'completed',
      isPublished: true,
      reviewStatus: 'approved',
      sniCompliant: true,
      bahasa: 'id',
      userId: adminUser.id,
    },
    {
      title: 'Data Curah Hujan Tahunan',
      abstract: 'Data curah hujan tahunan di seluruh Indonesia tahun 2022-2023',
      keywords: 'iklim, curah hujan, meteorologi',
      boundingBox: '{"minX":95,"minY":-11,"maxX":141,"maxY":6,"crs":"EPSG:4326"}',
      status: 'completed',
      isPublished: true,
      reviewStatus: 'approved',
      sniCompliant: true,
      bahasa: 'id',
      userId: regularUser.id,
    },
    {
      title: 'Peta Penggunaan Lahan',
      abstract: 'Peta penggunaan lahan di Pulau Jawa tahun 2023',
      keywords: 'lahan, penggunaan lahan, pertanian',
      boundingBox: '{"minX":105,"minY":-9,"maxX":115,"maxY":-5,"crs":"EPSG:4326"}',
      status: 'ongoing',
      isPublished: false,
      reviewStatus: 'draft',
      sniCompliant: false,
      bahasa: 'id',
      userId: regularUser.id,
    },
  ];

  for (const metadataData of metadataSamples) {
    const metadata = await prisma.metadata.create({
      data: metadataData,
    });
    console.log('✅ Metadata created:', metadata.title);
  }

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@example.com / password');
  console.log('User: user@example.com / password');
  console.log('\n🌐 Aplikasi: https://geospatial-metadata-engslygsm-alamazed-cos-projects.vercel.app');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });