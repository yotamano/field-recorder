'use client';

import { FixedSizeList as List } from 'react-window';
import RecordingCard from './RecordingCard';

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
  newRecordingId?: string;
}

export default function RecordingsList({ recordings, newRecordingId }: RecordingsListProps) {
  if (recordings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No recordings yet. Start recording to see your history here.</p>
      </div>
    );
  }

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const recording = recordings[index];
    const isNew = recording.id === newRecordingId;
    
    return (
      <div style={style} className="px-4">
        <RecordingCard recording={recording} isNew={isNew} />
      </div>
    );
  };

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