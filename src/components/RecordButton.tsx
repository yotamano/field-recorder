'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RecordButtonProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function RecordButton({ 
  isRecording, 
  onStartRecording, 
  onStopRecording 
}: RecordButtonProps) {
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll behavior for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsSticky(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  return (
    <motion.div
      className={`fixed z-50 transition-all duration-300 ${
        isSticky 
          ? 'top-4 left-4 right-4 w-auto' 
          : 'bottom-0 left-0 right-0 w-full'
      }`}
      layout
    >
      <motion.button
        onClick={handleClick}
        className={`
          relative w-full h-16 px-6 rounded-full font-semibold text-lg
          transition-all duration-300 ease-in-out
          ${isSticky 
            ? 'max-w-16 aspect-square' 
            : 'max-w-none'
          }
          ${isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/50'
          }
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          scale: isRecording ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: 2,
          repeat: isRecording ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        <motion.div
          className="flex items-center justify-center gap-3"
          layout
        >
          {isRecording ? (
            <>
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className={isSticky ? 'hidden' : 'block'}>
                Stop Recording
              </span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 bg-white rounded-full" />
              <span className={isSticky ? 'hidden' : 'block'}>
                Start Recording
              </span>
            </>
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  );
} 