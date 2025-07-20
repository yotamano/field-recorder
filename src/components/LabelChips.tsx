'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/hooks/useLabeler';

interface LabelChipsProps {
  labels: Label[];
}

export default function LabelChips({ labels }: LabelChipsProps) {
  if (!labels.length) return null;

  const getCategoryColor = (category: Label['category']) => {
    switch (category) {
      case 'project':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'person':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ai':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: Label['category']) => {
    switch (category) {
      case 'project':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
          </svg>
        );
      case 'person':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        );
      case 'ai':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-2 py-2">
      <AnimatePresence>
        {labels.map((label) => (
          <motion.div
            key={label.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              border ${getCategoryColor(label.category)}
            `}
            layout
          >
            <span className="mr-1">{getCategoryIcon(label.category)}</span>
            {label.name}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 