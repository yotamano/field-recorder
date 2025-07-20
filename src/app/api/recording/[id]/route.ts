import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Recording ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recording by ID
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: { labels: true },
    });

    if (!recording) {
      return new Response(
        JSON.stringify({ error: 'Recording not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ recording }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching recording:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch recording' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 