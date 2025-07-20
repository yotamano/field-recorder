import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const assemblyAIKey = process.env.ASSEMBLYAI_KEY;
  
  if (!assemblyAIKey) {
    return new Response('AssemblyAI API key not configured', { status: 500 });
  }

  try {
    const formData = await request.formData();
    const audioBlob = formData.get('audio') as Blob;
    
    if (!audioBlob) {
      return new Response('No audio data provided', { status: 400 });
    }

    // Convert blob to buffer
    const audioBuffer = await audioBlob.arrayBuffer();

    // Create readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initialize AssemblyAI real-time transcription
          const response = await fetch('https://api.assemblyai.com/v2/realtime/transcript', {
            method: 'POST',
            headers: {
              'Authorization': assemblyAIKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sample_rate: 44100,
              encoding: 'webm',
              language_code: 'en_us',
              enable_partials: true,
              punctuate: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`AssemblyAI API error: ${response.statusText}`);
          }

          const { session_id } = await response.json();

          // Send audio data to AssemblyAI
          const audioResponse = await fetch(`https://api.assemblyai.com/v2/realtime/transcript/${session_id}/audio`, {
            method: 'POST',
            headers: {
              'Authorization': assemblyAIKey,
              'Content-Type': 'application/octet-stream',
            },
            body: audioBuffer,
          });

          if (!audioResponse.ok) {
            throw new Error(`Failed to send audio to AssemblyAI: ${audioResponse.statusText}`);
          }

          // Stream transcription results
          const eventSource = new EventSource(`https://api.assemblyai.com/v2/realtime/transcript/${session_id}/stream`);
          
          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'partial' || data.type === 'final') {
              const sseData = `data: ${JSON.stringify({
                type: data.type,
                text: data.text,
                confidence: data.confidence,
              })}\n\n`;
              
              controller.enqueue(encoder.encode(sseData));
            }
            
            if (data.type === 'final') {
              eventSource.close();
              controller.close();
            }
          };

          eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            eventSource.close();
            controller.close();
          };

        } catch (error) {
          console.error('Transcription error:', error);
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })}\n\n`;
          
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Upload route error:', error);
    return new Response('Internal server error', { status: 500 });
  }
} 