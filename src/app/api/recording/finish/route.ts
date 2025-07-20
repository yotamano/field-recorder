import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { transcript, audioUrl } = await request.json();

    if (!transcript || !audioUrl) {
      return new Response(
        JSON.stringify({ error: 'Transcript and audioUrl are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save recording to database
    const recording = await prisma.recording.create({
      data: {
        transcript,
        audioUrl,
      },
    });

    return new Response(
      JSON.stringify({ success: true, recordingId: recording.id }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving recording:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to save recording' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 