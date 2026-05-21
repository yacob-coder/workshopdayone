import { useState, useCallback, useEffect } from 'react';
import type { GameState, Toast, WinningLine } from '../types';
import { BingoCard } from './BingoCard';
import { TranscriptPanel } from './TranscriptPanel';
import { ToastContainer } from './ui/Toast';
import { Button } from './ui/Button';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { detectWordsWithAliases } from '../lib/wordDetector';
import { checkForBingo, countFilled, getClosestToWin } from '../lib/bingoChecker';

interface Props {
  game: GameState;
  setGame: React.Dispatch<React.SetStateAction<GameState>>;
  onWin: (winningLine: WinningLine, winningWord: string) => void;
  onNewCard: () => void;
}

export function GameBoard({ game, setGame, onWin, onNewCard }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  // ── Win detection ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!game.card || game.status !== 'playing') return;
    const winningLine = checkForBingo(game.card);
    if (!winningLine) return;

    // Find the word that completed the line (most recently filled)
    const lastFilled = game.card.squares
      .flat()
      .filter(sq => sq.isFilled && !sq.isFreeSpace)
      .sort((a, b) => (b.filledAt ?? 0) - (a.filledAt ?? 0))[0];

    onWin(winningLine, lastFilled?.word ?? '');
  }, [game.card, game.status, onWin]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, duration: 2500 }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  /** Apply a single word fill to the card (no win checking — handled by useEffect) */
  const applyFill = useCallback((
    prev: GameState,
    word: string,
    isAuto: boolean,
  ): GameState => {
    if (!prev.card) return prev;
    const newSquares = prev.card.squares.map(row =>
      row.map(sq =>
        sq.word.toLowerCase() === word.toLowerCase() && !sq.isFilled
          ? { ...sq, isFilled: true, isAutoFilled: isAuto, filledAt: Date.now() }
          : sq,
      ),
    );
    const newCard = { ...prev.card, squares: newSquares };
    return { ...prev, card: newCard, filledCount: countFilled(newCard) };
  }, []);

  // ── Manual square click (toggle) ───────────────────────────────────────────
  const handleSquareClick = useCallback((row: number, col: number) => {
    setGame(prev => {
      if (!prev.card) return prev;
      const sq = prev.card.squares[row][col];
      if (sq.isFreeSpace) return prev;

      if (sq.isFilled) {
        // Untoggle
        const newSquares = prev.card.squares.map(r =>
          r.map(s =>
            s.id === sq.id
              ? { ...s, isFilled: false, isAutoFilled: false, filledAt: null }
              : s,
          ),
        );
        const newCard = { ...prev.card, squares: newSquares };
        return { ...prev, card: newCard, filledCount: countFilled(newCard) };
      } else {
        return applyFill(prev, sq.word, false);
      }
    });
  }, [setGame, applyFill]);

  // ── Speech toggle ──────────────────────────────────────────────────────────
  const handleToggleListen = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening((newSegment) => {
      setGame(prev => {
        if (!prev.card) return prev;

        const alreadyFilled = new Set(
          prev.card.squares.flat()
            .filter(sq => sq.isFilled)
            .map(sq => sq.word.toLowerCase()),
        );

        const found = detectWordsWithAliases(newSegment, prev.card.words, alreadyFilled);
        if (found.length === 0) return prev;

        setDetectedWords(dw => [...dw, ...found]);
        found.forEach(w => addToast(`✨ "${w}" detected!`));

        return found.reduce((acc, word) => applyFill(acc, word, true), prev);
      });
    });
  }, [isListening, startListening, stopListening, setGame, applyFill, addToast]);

  // ── New card ───────────────────────────────────────────────────────────────
  const handleNewCard = useCallback(() => {
    stopListening();
    onNewCard();
  }, [stopListening, onNewCard]);

  if (!game.card) return null;

  const closestToWin = getClosestToWin(game.card);
  const oneAway = closestToWin?.needed === 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-sm sm:text-lg font-bold text-gray-900">🎯 Meeting Bingo</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium ${isListening ? 'text-red-500' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="hidden xs:inline">{isListening ? 'Live' : 'Paused'}</span>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 px-2 sm:px-2.5 py-1 rounded-full">
              {Math.max(0, game.filledCount - 1)}/24
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* One away banner */}
        {oneAway && (
          <div className="mb-4 bg-amber-100 border border-amber-300 rounded-lg px-4 py-2 text-center text-amber-800 font-semibold animate-pulse">
            ⚡ One away on {closestToWin?.line}!
          </div>
        )}

        <BingoCard
          card={game.card}
          winningLine={game.winningLine}
          onSquareClick={handleSquareClick}
        />

        <TranscriptPanel
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={detectedWords}
          isListening={isListening}
          isSupported={isSupported}
        />

        {/* Controls */}
        <div className="flex gap-3 mt-4">
          <Button variant="secondary" onClick={handleNewCard} className="flex-1">
            🔄 New Card
          </Button>
          {isSupported && (
            <Button
              variant={isListening ? 'ghost' : 'primary'}
              onClick={handleToggleListen}
              className="flex-1"
            >
              {isListening ? '⏹️ Stop Listening' : '▶️ Start Listening'}
            </Button>
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
