import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import type { GameState } from '../types';
import { BingoCard } from './BingoCard';
import { Button } from './ui/Button';
import { shareResult } from '../lib/shareUtils';
import { CATEGORIES } from '../data/categories';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
}

export function WinScreen({ game, onPlayAgain, onHome }: Props) {
  const [shareLabel, setShareLabel] = useState('📤 Share Result');

  useEffect(() => {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  }, []);

  const category = CATEGORIES.find(c => c.id === game.category);
  const duration =
    game.startedAt && game.completedAt
      ? formatDuration(game.completedAt - game.startedAt)
      : null;

  const handleShare = async () => {
    const result = await shareResult(game);
    if (result === 'copied') {
      setShareLabel('✅ Copied!');
      setTimeout(() => setShareLabel('📤 Share Result'), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl mb-2">🎉🎊</div>
        <h1 className="text-5xl font-bold text-green-600 mb-2">BINGO!</h1>
        <div className="text-3xl mb-8">🎊🎉</div>

        {/* Winning card */}
        {game.card && (
          <div className="mb-6">
            <BingoCard
              card={game.card}
              winningLine={game.winningLine}
              onSquareClick={() => {}}
              readOnly
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3">
            <div className="text-xl sm:text-2xl mb-1">⏱️</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">{duration ?? '—'}</div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3">
            <div className="text-xl sm:text-2xl mb-1">🏆</div>
            <div className="text-xs sm:text-sm font-bold text-gray-900 break-words leading-tight">
              {game.winningWord ?? '—'}
            </div>
            <div className="text-xs text-gray-500">Winning word</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-3">
            <div className="text-xl sm:text-2xl mb-1">📊</div>
            <div className="text-base sm:text-lg font-bold text-gray-900">
              {Math.max(0, game.filledCount - 1)}/24
            </div>
            <div className="text-xs text-gray-500">{category?.name ?? 'Squares'}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" size="lg" onClick={handleShare} className="flex-1">
            {shareLabel}
          </Button>
          <Button size="lg" onClick={onPlayAgain} className="flex-1">
            🔄 Play Again
          </Button>
        </div>

        <button
          onClick={onHome}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
