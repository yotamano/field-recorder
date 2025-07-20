'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recording {
  id: string;
  createdAt: string;
  audioUrl: string;
  transcript: string;
  title: string | null;
  summary: string | null;
}

interface RecordingCardProps {
  recording: Recording;
  isNew?: boolean;
}

export default function RecordingCard({ recording, isNew = false }: RecordingCardProps) {
  const [isExpanded, setIsExpanded] = useState(isNew);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTitle, setIsLoadingTitle] = useState(isNew && !recording.title);
  const [isLoadingSummary, setIsLoadingSummary] = useState(isNew && !recording.summary);
  const [currentRecording, setCurrentRecording] = useState(recording);

  // Simulate loading states for new recordings
  useEffect(() => {
    if (isNew) {
      // Check for metadata every 2 seconds if it's a new recording
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/recording/${recording.id}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentRecording(data.recording);
            
            if (data.recording.title) {
              setIsLoadingTitle(false);
            }
            
            if (data.recording.summary) {
              setIsLoadingSummary(false);
            }
            
            // If both title and summary are loaded, clear interval
            if (data.recording.title && data.recording.summary) {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error fetching recording metadata:', error);
        }
      }, 2000);
      
      // Clean up interval
      return () => clearInterval(interval);
    }
  }, [isNew, recording.id]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const handlePlayPause = () => {
    const audio = document.getElementById(`audio-${recording.id}`) as HTMLAudioElement;
    
    if (isPlaying) {
      audio?.pause();
    } else {
      audio?.play();
    }
  };

  return (
    <div 
      className={`
        border rounded-lg mb-4 overflow-hidden transition-all duration-200
        ${isExpanded ? 'shadow-md bg-white' : 'bg-gray-50 hover:bg-white'}
        ${isNew ? 'border-blue-300 bg-blue-50' : ''}
      `}
    >
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={handleToggleExpand}
      >
        <div className="flex-1">
          {isLoadingTitle ? (
            <div className="animate-pulse h-5 w-48 bg-gray-200 rounded mb-1"></div>
          ) : (
            <h3 className="font-medium text-gray-900">
              {currentRecording.title || 'Untitled Recording'}
            </h3>
          )}
          <p className="text-sm text-gray-500">{formatDate(currentRecording.createdAt)}</p>
        </div>
        
        {isNew && (isLoadingTitle || isLoadingSummary) && (
          <div className="mr-3 flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-blue-600">Processing</span>
          </div>
        )}
        
        <button
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <audio 
                id={`audio-${recording.id}`}
                src={currentRecording.audioUrl} 
                className="w-full mb-4"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
                {isLoadingSummary ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {currentRecording.summary || 'No summary available'}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Transcript</h4>
                <p className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                  {currentRecording.transcript}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 