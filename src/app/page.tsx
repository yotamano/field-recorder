'use client';

import { useEffect } from 'react';
import RecordButton from '@/components/RecordButton';
import { useRecorder } from '@/hooks/useRecorder';
import { useCaptionsStore } from '@/stores/captions';

export default function Home() {
  const { transcript, isProcessing, error, pushText, clear, setProcessing, setError } = useCaptionsStore();
  
  const { isRecording, startRecording, stopRecording, error: recorderError } = useRecorder({
    onAudioChunk: async (blob) => {
      try {
        setProcessing(true);
        
        const formData = new FormData();
        formData.append('audio', blob);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) return;
        
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'partial' || data.type === 'final') {
                  pushText(data.text);
                }
                
                if (data.type === 'error') {
                  setError(data.message);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transcription failed');
      } finally {
        setProcessing(false);
      }
    },
  });

  const handleStartRecording = async () => {
    clear(); // Clear previous transcript
    setError(null);
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  // Handle recorder errors
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
    }
  }, [recorderError, setError]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Field Recorder</h1>
          <p className="text-gray-600 mt-2">AI-powered voice recording with real-time transcription</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Indicators */}
        <div className="mb-6 flex gap-4">
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Transcript Display */}
        <div className="bg-white rounded-lg shadow-sm border p-6 min-h-[400px]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Transcript</h2>
          
          {transcript ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-12">
              <p>Start recording to see your transcript here...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use:</h3>
          <ol className="text-blue-800 space-y-2">
            <li>1. Click the "Start Recording" button at the bottom</li>
            <li>2. Speak clearly into your microphone</li>
            <li>3. Watch your transcript appear in real-time</li>
            <li>4. Click "Stop Recording" when finished</li>
          </ol>
        </div>
      </main>

      {/* Record Button */}
      <RecordButton
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
    </div>
  );
}
