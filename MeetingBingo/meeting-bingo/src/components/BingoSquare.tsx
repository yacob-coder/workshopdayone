import type { BingoSquare as BingoSquareType } from '../types';
import { cn } from '../lib/utils';

interface Props {
  square: BingoSquareType;
  isWinningSquare: boolean;
  onClick: () => void;
}

export function BingoSquare({ square, isWinningSquare, onClick }: Props) {
  const { word, isFilled, isFreeSpace } = square;

  return (
    <button
      onClick={onClick}
      disabled={isFreeSpace}
      className={cn(
        'aspect-square p-0.5 sm:p-1 border-2 rounded-lg',
        'flex items-center justify-center text-center',
        'text-[10px] sm:text-xs md:text-sm font-medium leading-tight',
        'transition-all duration-200',
        // Default unfilled
        !isFilled && !isFreeSpace &&
          'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-105 active:scale-95',
        // Filled (manual or auto)
        isFilled && !isFreeSpace && !isWinningSquare &&
          'bg-blue-500 border-blue-600 text-white',
        // Free space
        isFreeSpace &&
          'bg-amber-100 border-amber-300 text-amber-700 cursor-default',
        // Winning square overrides everything
        isWinningSquare &&
          'bg-green-500 border-green-600 text-white ring-2 ring-green-300',
      )}
    >
      <span className={cn('break-words', isFilled && !isFreeSpace && 'line-through opacity-90')}>
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  );
}
