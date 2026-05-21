import { CATEGORIES } from '../data/categories';
import type { CategoryId } from '../types';
import { Button } from './ui/Button';

interface Props {
  onSelect: (id: CategoryId) => void;
  onBack: () => void;
}

export function CategorySelect({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Choose Your Category
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Pick the buzzword set that matches your meeting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-5 flex flex-col gap-3 hover:border-blue-400 hover:shadow-md transition-all duration-200"
            >
              <div className="text-4xl">{cat.icon}</div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{cat.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
              </div>
              {/* Sample words preview */}
              <div className="flex flex-wrap gap-1">
                {cat.words.slice(0, 4).map(word => (
                  <span
                    key={word}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {word}
                  </span>
                ))}
                <span className="text-xs text-gray-400">+{cat.words.length - 4} more</span>
              </div>
              <Button onClick={() => onSelect(cat.id)} className="w-full mt-auto">
                Select
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
