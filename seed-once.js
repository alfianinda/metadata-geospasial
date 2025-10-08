const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('./lib/auth')

async function seedOnce() {
  const prisma = new PrismaClient()

  try {
    console.log('🌱 Checking if database needs seeding...')

    // Check if users already exist
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log('ℹ️ Database already has users, skipping seed')
      return
    }

    console.log('📝 Seeding database for first time...')

    // Create admin user
    const hashedPassword = await hashPassword('admin123')
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    })

    // Create regular user
    const hashedUserPassword = await hashPassword('user123')
    await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: hashedUserPassword,
        name: 'Regular User',
        role: 'USER',
      },
    })

    console.log('✅ Users created successfully')

    // Run the full seed script
    require('./prisma/seed.ts')

  } catch (error) {
    console.error('❌ Error during one-time seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  seedOnce()
}

module.exports = { seedOnce }