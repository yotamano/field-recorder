'use client';

import { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { motion, AnimatePresence } from 'framer-motion';

interface Recording {
  id: string;
  createdAt: string;
  audioUrl: string;
  transcript: string;
  title: string | null;
  summary: string | null;
}

interface RecordingsListProps {
  recordings: Recording[];
}

export default function RecordingsList({ recordings }: RecordingsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
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

  const handlePlayPause = (id: string, audioUrl: string) => {
    if (playing === id) {
      const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    } else {
      setPlaying(id);
      setTimeout(() => {
        const audio = document.getElementById(`audio-${id}`) as HTMLAudioElement;
        audio?.play();
      }, 0);
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const recording = recordings[index];
    const isExpanded = expandedId === recording.id;
    const isPlaying = playing === recording.id;

    return (
      <div style={style} className="px-4">
        <div 
          className={`
            border rounded-lg mb-4 overflow-hidden transition-all duration-200
            ${isExpanded ? 'shadow-md bg-white' : 'bg-gray-50 hover:bg-white'}
          `}
        >
          <div 
            className="p-4 cursor-pointer flex justify-between items-center"
            onClick={() => handleToggleExpand(recording.id)}
          >
            <div>
              <h3 className="font-medium text-gray-900">
                {recording.title || 'Untitled Recording'}
              </h3>
              <p className="text-sm text-gray-500">{formatDate(recording.createdAt)}</p>
            </div>
            <button
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
              `}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause(recording.id, recording.audioUrl);
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
                    src={recording.audioUrl} 
                    className="w-full mb-4"
                    controls
                    onPlay={() => setPlaying(recording.id)}
                    onPause={() => setPlaying(null)}
                    onEnded={() => setPlaying(null)}
                  />
                  
                  {recording.summary && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
                      <p className="text-sm text-gray-600">{recording.summary}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Transcript</h4>
                    <p className="text-sm text-gray-600 max-h-40 overflow-y-auto">
                      {recording.transcript}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No recordings yet. Start recording to see your history here.</p>
      </div>
    );
  }

  return (
    <List
      height={600}
      width="100%"
      itemCount={recordings.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
} 