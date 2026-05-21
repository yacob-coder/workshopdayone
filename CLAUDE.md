# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a workshop project building **Meeting Bingo** — a browser-based bingo game with live audio transcription via the Web Speech API. Players get a 5×5 bingo card filled with meeting buzzwords; speech recognition auto-fills squares when those words are spoken aloud.

The app lives in `MeetingBingo/meeting-bingo/`. Design documentation (PRD, architecture, UXR research, implementation plan) is in `MeetingBingo/`.

**Current state**: The Vite + React 19 + TypeScript scaffold exists but the game has not been implemented yet. The boilerplate `src/App.tsx` needs to be replaced with the full application per the implementation plan.

## Commands

All commands run from `MeetingBingo/meeting-bingo/`:

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Type-check + production build (tsc -b && vite build)
npm run preview    # Serve the production build locally
npm run lint       # ESLint
```

To install the missing dependencies required before implementation:
```bash
npm install canvas-confetti
npm install -D tailwindcss @tailwindcss/vite @types/canvas-confetti
```

## Architecture

### Tech Stack
- **React 19 + TypeScript** with Vite 8
- **Tailwind CSS** (via `@tailwindcss/vite` plugin — not the PostCSS approach)
- **Web Speech API** (browser-native, no API key needed; Chrome-primary, graceful fallback for Firefox)
- **canvas-confetti** for win celebration
- No backend, no auth — pure client-side; `localStorage` for persistence

### Screen Flow
```
landing → category → game → win
                  ↑_________↓ (play again)
```

State is managed in `App.tsx` with `useState<GameState>`. No Context needed at MVP scale — pass setters as props.

### Planned Source Structure
```
src/
├── App.tsx                  # Screen router, top-level game state
├── types/index.ts           # All shared TypeScript interfaces
├── data/categories.ts       # Buzzword lists for 3 categories (40+ words each)
├── lib/
│   ├── cardGenerator.ts     # Fisher-Yates shuffle → 5×5 BingoCard
│   ├── bingoChecker.ts      # Checks 12 winning lines (5 rows + 5 cols + 2 diagonals)
│   ├── wordDetector.ts      # Regex + alias matching against transcript
│   └── shareUtils.ts        # navigator.share() with clipboard fallback
├── hooks/
│   ├── useSpeechRecognition.ts   # Web Speech API wrapper (continuous, auto-restart)
│   ├── useGame.ts                # Game state mutations
│   └── useLocalStorage.ts        # Persistence helper
└── components/
    ├── LandingPage.tsx
    ├── CategorySelect.tsx
    ├── GameBoard.tsx        # Main container: header + card + transcript + controls
    ├── BingoCard.tsx        # 5×5 CSS grid
    ├── BingoSquare.tsx      # Individual square with 6 visual states
    ├── TranscriptPanel.tsx  # Live transcript + detected word badges
    ├── WinScreen.tsx        # Confetti + stats + share
    └── ui/Button.tsx, Toast.tsx
```

### Key Design Decisions

**Card**: 24 words + center FREE space (pre-filled). Square ID format: `"row-col"` (e.g. `"2-3"`). The `BingoCard.words` flat array avoids re-flattening the grid on every speech event.

**Word detection**: Two passes — `\bword\b` regex for single words, substring match for phrases. Alias map handles speech-to-text variations (`ci/cd → ['ci cd', 'cicd']`, `mvp → ['minimum viable product']`, etc.). Must fire within 500ms of spoken word (process on every `onresult` final event, not a timer).

**Speech hook**: `continuous = true`, `interimResults = true`. Auto-restarts in `onend` if `isListening` is still true (browser stops after silence). Returns `startListening(onResult?)`, `stopListening()`, `resetTranscript()`.

**Win detection**: Check all 12 lines after every square fill; return first match. The `WinScreen` triggers confetti on mount (no sound per UXR spec).

**Tailwind v4 config**: Uses `@tailwindcss/vite` plugin in `vite.config.ts` and `@import "tailwindcss"` in `index.css` — not the classic `tailwind.config.js` + PostCSS approach.
