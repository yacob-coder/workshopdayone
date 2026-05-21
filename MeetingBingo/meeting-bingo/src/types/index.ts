// =============================================
// CATEGORY & WORDS
// =============================================
export type CategoryId = 'agile' | 'corporate' | 'tech';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  words: string[];
}

// =============================================
// BINGO CARD
// =============================================
export interface BingoSquare {
  id: string;             // "row-col" e.g. "2-3"
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;  // filled by speech recognition
  isFreeSpace: boolean;
  filledAt: number | null;
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][];
  words: string[];        // flat list for efficient word detection
}

// =============================================
// GAME STATE
// =============================================
export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;          // 0–4 for row/col, 0–1 for diagonal
  squares: string[];      // IDs of winning squares
}

export interface GameState {
  status: GameStatus;
  category: CategoryId | null;
  card: BingoCard | null;
  isListening: boolean;
  startedAt: number | null;
  completedAt: number | null;
  winningLine: WinningLine | null;
  winningWord: string | null;
  filledCount: number;
}

// =============================================
// SPEECH RECOGNITION
// =============================================
export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// =============================================
// UI STATE
// =============================================
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}
