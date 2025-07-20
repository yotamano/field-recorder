import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getMeta } from '@/lib/gpt';

// Initialize Prisma client
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { transcript, audioUrl, labels = [] } = await request.json();

    if (!transcript || !audioUrl) {
      return new Response(
        JSON.stringify({ error: 'Transcript and audioUrl are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Save recording to database first (without metadata)
    const recording = await prisma.recording.create({
      data: {
        transcript,
        audioUrl,
        // Create labels if provided
        labels: {
          create: labels.map((label: { name: string }) => ({
            name: label.name,
          })),
        },
      },
    });

    // Generate metadata asynchronously
    try {
      const { title, summary } = await getMeta(transcript);
      
      // Update recording with metadata
      await prisma.recording.update({
        where: { id: recording.id },
        data: { title, summary },
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          recordingId: recording.id,
          metadata: { title, summary }
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (metaError) {
      console.error('Error generating metadata:', metaError);
      
      // Return success even if metadata generation fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          recordingId: recording.id,
          metadataError: 'Failed to generate metadata'
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error saving recording:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to save recording' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 