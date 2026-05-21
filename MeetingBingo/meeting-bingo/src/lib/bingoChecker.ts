import type { BingoCard, WinningLine } from '../types';

/**
 * Check all 12 possible winning lines.
 * Returns the first match found, or null.
 */
export function checkForBingo(card: BingoCard): WinningLine | null {
  const { squares } = card;

  // 5 rows
  for (let row = 0; row < 5; row++) {
    if (squares[row].every(sq => sq.isFilled)) {
      return {
        type: 'row',
        index: row,
        squares: squares[row].map(sq => sq.id),
      };
    }
  }

  // 5 columns
  for (let col = 0; col < 5; col++) {
    if (squares.every(r => r[col].isFilled)) {
      return {
        type: 'column',
        index: col,
        squares: squares.map(r => r[col].id),
      };
    }
  }

  // Diagonal ↘ [0][0]→[4][4]
  if ([0, 1, 2, 3, 4].every(i => squares[i][i].isFilled)) {
    return {
      type: 'diagonal',
      index: 0,
      squares: [0, 1, 2, 3, 4].map(i => `${i}-${i}`),
    };
  }

  // Diagonal ↙ [0][4]→[4][0]
  if ([0, 1, 2, 3, 4].every(i => squares[i][4 - i].isFilled)) {
    return {
      type: 'diagonal',
      index: 1,
      squares: [0, 1, 2, 3, 4].map(i => `${i}-${4 - i}`),
    };
  }

  return null;
}

/** Count how many squares are currently filled */
export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter(sq => sq.isFilled).length;
}

/**
 * Return how many squares away the closest winning line is.
 * Used for the "One away!" tension indicator.
 */
export function getClosestToWin(card: BingoCard): { needed: number; line: string } | null {
  const { squares } = card;

  const lines: { squares: typeof squares[0]; name: string }[] = [
    ...squares.map((row, i) => ({ squares: row, name: `Row ${i + 1}` })),
    ...[0, 1, 2, 3, 4].map(col => ({
      squares: squares.map(r => r[col]),
      name: `Column ${col + 1}`,
    })),
    {
      squares: [0, 1, 2, 3, 4].map(i => squares[i][i]),
      name: 'Diagonal ↘',
    },
    {
      squares: [0, 1, 2, 3, 4].map(i => squares[i][4 - i]),
      name: 'Diagonal ↙',
    },
  ];

  let closest = { needed: 5, line: '' };
  for (const line of lines) {
    const needed = line.squares.filter(sq => !sq.isFilled).length;
    if (needed > 0 && needed < closest.needed) {
      closest = { needed, line: line.name };
    }
  }

  return closest.needed < 5 ? closest : null;
}
