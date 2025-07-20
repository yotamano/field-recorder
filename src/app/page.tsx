'use client';

import { useEffect, useState } from 'react';
import RecordButton from '@/components/RecordButton';
import RecordingsList from '@/components/RecordingsList';
import { useRecorder } from '@/hooks/useRecorder';
import { useCaptionsStore } from '@/stores/captions';

interface Recording {
  id: string;
  createdAt: string;
  audioUrl: string;
  transcript: string;
  title: string | null;
  summary: string | null;
}

export default function Home() {
  const { transcript, isProcessing, error, pushText, clear, setProcessing, setError } = useCaptionsStore();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState<'record' | 'history'>('record');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isRecording, startRecording, stopRecording, error: recorderError, audioBlob } = useRecorder({
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

  // Fetch recordings on initial load
  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/recording');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      
      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (err) {
      console.error('Error fetching recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    clear(); // Clear previous transcript
    setError(null);
    await startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
    
    // Save recording when stopped
    if (audioBlob && transcript) {
      try {
        // Create a URL for the audio blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Save to database via API
        const response = await fetch('/api/recording/finish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript,
            audioUrl,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save recording');
        }
        
        // Refresh recordings list
        fetchRecordings();
        
      } catch (err) {
        console.error('Error saving recording:', err);
        setError(err instanceof Error ? err.message : 'Failed to save recording');
      }
    }
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
          
          {/* Tabs */}
          <div className="flex mt-6 border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'record'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('record')}
            >
              Record
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'record' ? (
          <>
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
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recording History</h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">Loading recordings...</p>
              </div>
            ) : (
              <RecordingsList recordings={recordings} />
            )}
          </>
        )}
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
