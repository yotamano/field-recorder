import { create } from 'zustand';

interface CaptionsState {
  transcript: string;
  isProcessing: boolean;
  error: string | null;
  pushText: (text: string) => void;
  clear: () => void;
  getCurrentText: () => string;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCaptionsStore = create<CaptionsState>((set, get) => ({
  transcript: '',
  isProcessing: false,
  error: null,

  pushText: (text: string) => {
    set((state) => ({
      transcript: state.transcript + ' ' + text,
      error: null, // Clear any previous errors
    }));
  },

  clear: () => {
    set({
      transcript: '',
      isProcessing: false,
      error: null,
    });
  },

  getCurrentText: () => {
    return get().transcript;
  },

  setProcessing: (processing: boolean) => {
    set({ isProcessing: processing });
  },

  setError: (error: string | null) => {
    set({ error });
  },
})); 