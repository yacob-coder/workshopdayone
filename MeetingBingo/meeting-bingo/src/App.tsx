import { useState, useCallback } from 'react';
import type { GameState, CategoryId, WinningLine } from './types';
// App.css intentionally empty — styling via Tailwind (index.css)
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';
import { generateCard } from './lib/cardGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';

type Screen = 'landing' | 'category' | 'game' | 'win';

const INITIAL_GAME: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

export default function App() {
  // screen is ephemeral — always start on landing
  const [screen, setScreen] = useState<Screen>('landing');
  // game is persisted — survives page refresh
  const [game, setGame] = useLocalStorage<GameState>('mb-game', INITIAL_GAME);

  // Show "Resume" on landing page if a game is in progress
  const hasResumableGame = game.status === 'playing' && game.card !== null;

  const handleStart = useCallback(() => {
    setGame(INITIAL_GAME); // clear any saved game
    setScreen('category');
  }, [setGame]);

  const handleResume = useCallback(() => setScreen('game'), []);

  const handleCategorySelect = useCallback((categoryId: CategoryId) => {
    const card = generateCard(categoryId);
    setGame({
      status: 'playing',
      category: categoryId,
      card,
      isListening: false,
      startedAt: Date.now(),
      completedAt: null,
      winningLine: null,
      winningWord: null,
      filledCount: 1, // free space pre-filled
    });
    setScreen('game');
  }, [setGame]);

  const handleWin = useCallback((winningLine: WinningLine, winningWord: string) => {
    setGame(prev => ({
      ...prev,
      status: 'won',
      completedAt: Date.now(),
      winningLine,
      winningWord,
    }));
    setScreen('win');
  }, [setGame]);

  const handlePlayAgain = useCallback(() => setScreen('category'), []);

  const handleHome = useCallback(() => {
    setGame(INITIAL_GAME);
    setScreen('landing');
  }, [setGame]);

  const handleNewCard = useCallback(() => setScreen('category'), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {screen === 'landing' && (
        <LandingPage
          onStart={handleStart}
          onResume={hasResumableGame ? handleResume : undefined}
        />
      )}
      {screen === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={handleHome} />
      )}
      {screen === 'game' && game.card && (
        <GameBoard
          game={game}
          setGame={setGame}
          onWin={handleWin}
          onNewCard={handleNewCard}
        />
      )}
      {screen === 'win' && (
        <WinScreen game={game} onPlayAgain={handlePlayAgain} onHome={handleHome} />
      )}
    </div>
  );
}
