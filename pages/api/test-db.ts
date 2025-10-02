import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Test environment variables
    const dbUrl = process.env.DATABASE_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    // Basic database connection test (without Prisma)
    const { Client } = require('pg');
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    await client.end();

    res.status(200).json({
      message: 'Database connection successful',
      env: {
        DATABASE_URL: dbUrl ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: nextAuthSecret ? 'Set' : 'Not set',
        NEXTAUTH_URL: nextAuthUrl ? 'Set' : 'Not set'
      }
    });

  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set'
      }
    });
  }
}