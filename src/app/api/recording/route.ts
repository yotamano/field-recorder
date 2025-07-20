import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all recordings, ordered by most recent first
    const recordings = await prisma.recording.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        labels: true,
      },
    });

    return new Response(
      JSON.stringify({ recordings }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching recordings:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch recordings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 