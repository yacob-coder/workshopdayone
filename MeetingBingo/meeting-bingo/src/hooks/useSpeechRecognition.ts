import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpeechRecognitionState } from '../types';

// ─── Web Speech API type declarations ────────────────────────────────────────
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

const SR =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SR,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false); // stable ref to avoid stale closures in onend
  const onResultRef = useRef<((transcript: string) => void) | null>(null);

  useEffect(() => {
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));
      if (final && onResultRef.current) {
        onResultRef.current(final);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return; // intentional stop, not an error
      setState(prev => ({ ...prev, error: event.error, isListening: false }));
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      // Auto-restart when the browser stops after silence
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting
        }
      }
    };

    recognitionRef.current = recognition;
    return () => {
      isListeningRef.current = false;
      recognition.stop();
    };
  }, []);

  const startListening = useCallback((onResult?: (transcript: string) => void) => {
    if (!recognitionRef.current) return;
    onResultRef.current = onResult ?? null;
    isListeningRef.current = true;
    setState(prev => ({
      ...prev,
      isListening: true,
      transcript: '',
      interimTranscript: '',
      error: null,
    }));
    try {
      recognitionRef.current.start();
    } catch {
      // Already running
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    isListeningRef.current = false;
    onResultRef.current = null;
    setState(prev => ({ ...prev, isListening: false }));
    recognitionRef.current.stop();
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
