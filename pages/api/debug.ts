import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('🔍 Starting debug check...');

    // Check environment variables
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    };

    console.log('Environment check:', envCheck);

    // Test database connection
    let dbConnection = 'Failed';
    let userCount = 0;
    let metadataCount = 0;

    try {
      const prisma = new PrismaClient();

      // Test connection
      await prisma.$connect();
      dbConnection = 'Success';

      // Count records
      userCount = await prisma.user.count();
      metadataCount = await prisma.metadata.count();

      // Get sample data
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true },
        take: 3
      });

      const metadata = await prisma.metadata.findMany({
        select: { id: true, title: true, status: true, isPublished: true },
        take: 3
      });

      await prisma.$disconnect();

      res.status(200).json({
        timestamp: new Date().toISOString(),
        environment: envCheck,
        database: {
          connection: dbConnection,
          userCount,
          metadataCount,
          sampleUsers: users,
          sampleMetadata: metadata
        },
        status: 'Debug completed successfully'
      });

    } catch (dbError) {
      console.error('Database error:', dbError);
      dbConnection = `Failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;

      res.status(500).json({
        timestamp: new Date().toISOString(),
        environment: envCheck,
        database: {
          connection: dbConnection,
          userCount,
          metadataCount
        },
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        status: 'Debug completed with errors'
      });
    }

  } catch (error) {
    console.error('Debug failed:', error);
    res.status(500).json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'Debug failed completely'
    });
  }
}