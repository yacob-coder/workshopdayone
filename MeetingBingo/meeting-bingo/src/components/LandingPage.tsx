import { Button } from './ui/Button';

interface Props {
  onStart: () => void;
  onResume?: () => void; // shown when a saved game exists
}

const STEPS: [string, string][] = [
  ['🗂️', 'Pick a buzzword category (Agile, Corporate, Tech)'],
  ['🃏', 'Get a unique 5×5 bingo card with 24 buzzwords'],
  ['🎤', "Enable your mic — words auto-fill as they're spoken"],
  ['🏆', 'Get 5 in a row to shout BINGO!'],
];

export function LandingPage({ onStart, onResume }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-lg w-full">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
          MEETING BINGO
        </h1>
        <p className="text-xl text-gray-600 mb-2">Turn any meeting into a game.</p>
        <p className="text-base text-blue-600 mb-8">
          Auto-detects buzzwords using speech recognition!
        </p>

        {/* Primary CTA */}
        <Button size="lg" onClick={onStart} className="w-full sm:w-auto mb-3">
          🎮 New Game
        </Button>

        {/* Resume button — only shown when a saved game exists */}
        {onResume && (
          <div className="mb-3">
            <Button
              size="lg"
              variant="secondary"
              onClick={onResume}
              className="w-full sm:w-auto"
            >
              ▶️ Resume Game
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-10">
          🔒 Audio processed locally. Never recorded or sent anywhere.
        </p>

        <hr className="border-gray-200 mb-8" />

        <h2 className="text-lg font-semibold text-gray-700 mb-4">How It Works</h2>
        <ol className="text-left space-y-3 text-gray-600">
          {STEPS.map(([icon, text], i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xl mt-0.5 flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
