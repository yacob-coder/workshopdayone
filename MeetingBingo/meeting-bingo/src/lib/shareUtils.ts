import type { GameState } from '../types';
import { CATEGORIES } from '../data/categories';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
}

function buildShareText(game: GameState): string {
  const category = CATEGORIES.find(c => c.id === game.category);
  const duration =
    game.startedAt && game.completedAt
      ? formatDuration(game.completedAt - game.startedAt)
      : '?';
  const filled = game.filledCount;

  return [
    '🎯 I got BINGO in Meeting Bingo!',
    `Category: ${category?.name ?? 'Unknown'}`,
    `Time: ${duration}`,
    game.winningWord ? `Winning word: "${game.winningWord}"` : '',
    `Squares filled: ${filled}/24`,
    '',
    'Play at: meetingbingo.vercel.app',
  ]
    .filter(line => line !== null)
    .join('\n');
}

/**
 * Share the game result.
 * Uses native share sheet on mobile; falls back to clipboard.
 * Returns 'shared' | 'copied' | 'error'.
 */
export async function shareResult(game: GameState): Promise<'shared' | 'copied' | 'error'> {
  const text = buildShareText(game);

  if (navigator.share) {
    try {
      await navigator.share({ title: '🎯 Meeting Bingo', text });
      return 'shared';
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'error';
  }
}
