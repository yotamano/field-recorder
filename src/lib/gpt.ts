import { OpenAI } from 'openai';

interface MetadataResponse {
  title: string;
  summary: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate title and summary from transcript using OpenAI
 */
export async function getMeta(transcript: string): Promise<MetadataResponse> {
  try {
    // Truncate transcript if too long
    const maxLength = 4000;
    const truncatedTranscript = transcript.length > maxLength 
      ? transcript.substring(0, maxLength) + '...'
      : transcript;
    
    const prompt = `
      You are an AI assistant that generates metadata for voice recordings.
      Based on the following transcript, generate a concise title (max 50 characters) and a brief summary (max 200 characters).
      
      Transcript:
      "${truncatedTranscript}"
      
      Respond in JSON format with "title" and "summary" fields.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You generate metadata for voice recordings.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(content) as MetadataResponse;
      return {
        title: parsed.title || 'Untitled Recording',
        summary: parsed.summary || 'No summary available',
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        title: 'Untitled Recording',
        summary: 'No summary available',
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Untitled Recording',
      summary: 'No summary available',
    };
  }
} 