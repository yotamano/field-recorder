import { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';

// Import dictionaries
import projects from '@/data/projects.json';
import people from '@/data/people.json';

export interface Label {
  id: string;
  name: string;
  category: 'project' | 'person' | 'ai';
  confidence: number;
}

interface UseLabelerOptions {
  text: string;
  threshold?: number;
}

export function useLabeler({ text, threshold = 0.4 }: UseLabelerOptions) {
  const [labels, setLabels] = useState<Label[]>([]);
  
  // Configure Fuse.js for fuzzy matching
  const projectsFuse = new Fuse(projects, {
    threshold,
    includeScore: true,
  });
  
  const peopleFuse = new Fuse(people, {
    threshold,
    includeScore: true,
  });

  // Function to detect labels from text
  const detectLabels = useCallback((inputText: string) => {
    if (!inputText || inputText.length < 3) return [];
    
    const words = inputText.split(/\s+/);
    const detectedLabels: Label[] = [];
    const processedNames = new Set<string>();
    
    // Try to match 1-3 word combinations
    for (let i = 0; i < words.length; i++) {
      for (let len = 1; len <= 3 && i + len <= words.length; len++) {
        const phrase = words.slice(i, i + len).join(' ');
        
        if (phrase.length < 3) continue;
        
        // Check for project matches
        const projectMatches = projectsFuse.search(phrase);
        if (projectMatches.length > 0 && projectMatches[0].score && projectMatches[0].score < threshold) {
          const match = projectMatches[0];
          if (!processedNames.has(match.item)) {
            detectedLabels.push({
              id: `project-${match.item.replace(/\s+/g, '-').toLowerCase()}`,
              name: match.item,
              category: 'project',
              confidence: 1 - (match.score || 0),
            });
            processedNames.add(match.item);
          }
        }
        
        // Check for people matches
        const peopleMatches = peopleFuse.search(phrase);
        if (peopleMatches.length > 0 && peopleMatches[0].score && peopleMatches[0].score < threshold) {
          const match = peopleMatches[0];
          if (!processedNames.has(match.item)) {
            detectedLabels.push({
              id: `person-${match.item.replace(/\s+/g, '-').toLowerCase()}`,
              name: match.item,
              category: 'person',
              confidence: 1 - (match.score || 0),
            });
            processedNames.add(match.item);
          }
        }
      }
    }
    
    // Sort by confidence
    return detectedLabels.sort((a, b) => b.confidence - a.confidence);
  }, [threshold, projectsFuse, peopleFuse]);

  // Update labels when text changes
  useEffect(() => {
    const newLabels = detectLabels(text);
    
    // Only update if labels have changed
    if (JSON.stringify(newLabels) !== JSON.stringify(labels)) {
      setLabels(newLabels);
    }
  }, [text, detectLabels, labels]);

  return { labels };
} 