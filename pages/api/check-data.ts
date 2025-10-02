import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    const metadata = await prisma.metadata.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        isPublished: true,
        userId: true,
        createdAt: true
      }
    });

    res.status(200).json({
      users: users,
      metadata: metadata,
      totalUsers: users.length,
      totalMetadata: metadata.length
    });

  } catch (error) {
    console.error('Error checking data:', error);
    res.status(500).json({
      error: 'Failed to check data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}