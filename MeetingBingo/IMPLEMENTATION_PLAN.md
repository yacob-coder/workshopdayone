# Meeting Bingo — Implementation Plan

**Synthesized from**: PRD v1.0 · Architecture v1.0 · UXR v1.0  
**Current state**: Vite + React 19 + TypeScript scaffold (boilerplate only)  
**Target**: Functional MVP in ~90 minutes  

---

## Current State Assessment

| Item | Status |
|------|--------|
| Vite + React + TypeScript | ✅ Initialized |
| Tailwind CSS | ❌ Not installed |
| canvas-confetti | ❌ Not installed |
| Type definitions | ❌ Not created |
| Game components | ❌ Not created |
| Speech recognition hook | ❌ Not created |
| Category data | ❌ Not created |
| Game logic libs | ❌ Not created |

---

## Phase 1 — Foundation Setup (15–20 min)

### Step 1.1: Install missing dependencies

```bash
cd MeetingBingo/meeting-bingo
npm install canvas-confetti
npm install -D tailwindcss @tailwindcss/vite @types/canvas-confetti
```

### Step 1.2: Configure Tailwind CSS

Update `vite.config.ts` to use the Tailwind Vite plugin:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Replace `src/index.css` content with:

```css
@import "tailwindcss";
```

### Step 1.3: Create the folder structure

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Toast.tsx
│   ├── LandingPage.tsx
│   ├── CategorySelect.tsx
│   ├── GameBoard.tsx
│   ├── BingoCard.tsx
│   ├── BingoSquare.tsx
│   ├── TranscriptPanel.tsx
│   ├── GameControls.tsx
│   └── WinScreen.tsx
├── hooks/
│   ├── useSpeechRecognition.ts
│   ├── useGame.ts
│   └── useLocalStorage.ts
├── lib/
│   ├── cardGenerator.ts
│   ├── wordDetector.ts
│   ├── bingoChecker.ts
│   └── shareUtils.ts
├── data/
│   └── categories.ts
└── types/
    └── index.ts
```

### Step 1.4: Create type definitions

**File**: `src/types/index.ts`

```typescript
export type CategoryId = 'agile' | 'corporate' | 'tech';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  words: string[];
}

export interface BingoSquare {
  id: string;           // "row-col" e.g. "2-3"
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;
  isFreeSpace: boolean;
  filledAt: number | null;
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][];
  words: string[];      // flat list for detection
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;
  squares: string[];    // square IDs
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

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  duration?: number;
}
```

### Step 1.5: Create category data

**File**: `src/data/categories.ts`

Full word lists for all 3 categories as specified in PRD §4.2 and Architecture buzzword data section. Each category needs 40+ unique words:

- **Agile & Scrum** 🏃 — sprint, backlog, standup, retrospective, velocity, blocker, story points, epic, user story, scrum master, product owner, kanban, burndown, refinement, iteration, acceptance criteria, definition of done, capacity, throughput, cycle time, lead time, swimlane, ceremony, timeboxed, increment, artifact, transparency, inspection, adaptation, self-organizing, cross-functional, servant leader, impediment, spike, technical debt, refactor, MVP, release, deployment, continuous integration, CI/CD, demo, stakeholder, prioritize, scope creep, sprint goal, daily scrum, planning poker

- **Corporate Speak** 💼 — synergy, leverage, circle back, take offline, bandwidth, low-hanging fruit, move the needle, deep dive, touch base, action item, deliverable, stakeholder, alignment, visibility, paradigm shift, best practice, value proposition, ROI, bottom line, top of mind, streamline, optimize, scalable, proactive, holistic, robust, ecosystem, pivot, disruption, innovation, thought leader, core competency, mission critical, game changer, win-win, net-net, helicopter view, granular, drill down, boil the ocean, bleeding edge, north star, parking lot, table this, unpack, double-click, socialize

- **Tech & Engineering** 💻 — API, cloud, microservices, serverless, containerized, kubernetes, docker, CI/CD, pipeline, deployment, scalability, latency, throughput, database, schema, migration, refactor, technical debt, architecture, infrastructure, DevOps, observability, monitoring, alerting, incident, postmortem, SLA, uptime, performance, optimization, caching, load balancing, security, authentication, authorization, encryption, compliance, audit, code review, pull request, merge, branch, release, rollback, feature flag, A/B test

---

## Phase 2 — Core Game Logic (25–30 min)

### Step 2.1: Card generator

**File**: `src/lib/cardGenerator.ts`

Key implementation details:
- Use Fisher-Yates shuffle to randomize word order
- Select 24 words from shuffled array (leaving room for free space)
- Build 5×5 grid: iterate rows 0–4, cols 0–4
- Position [2][2] (center) is always `isFreeSpace: true`, `isFilled: true`, `word: 'FREE'`
- All other squares start `isFilled: false`, `isAutoFilled: false`
- Return `{ squares: BingoSquare[][], words: string[] }` — the flat words array is used by word detection to avoid re-flattening the grid on every transcript event

### Step 2.2: Bingo checker

**File**: `src/lib/bingoChecker.ts`

Check all 12 possible winning lines in this order (return first found):
1. **5 rows** — `squares[row].every(sq => sq.isFilled)` for row 0–4
2. **5 columns** — `squares.every(row => row[col].isFilled)` for col 0–4
3. **Diagonal ↘** — positions [0][0], [1][1], [2][2], [3][3], [4][4]
4. **Diagonal ↙** — positions [0][4], [1][3], [2][2], [3][1], [4][0]

Also export `countFilled(card)` for the progress counter, and `getClosestToWin(card)` which returns `{ needed: number, line: string }` — used by the UXR-derived "One away!" tension feature.

### Step 2.3: Word detector

**File**: `src/lib/wordDetector.ts`

Two detection passes:
1. **Exact match with word boundaries** — `\bword\b` regex (case-insensitive) for single words
2. **Substring match** — for multi-word phrases like "circle back", "story points"
3. **Aliases** — map common speech-to-text variations: `'ci/cd' → ['ci cd', 'cicd']`, `'mvp' → ['minimum viable product']`, `'roi' → ['return on investment']`, `'api' → ['a.p.i.']`, `'devops' → ['dev ops', 'dev-ops']`

The function signature is:
```typescript
detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>  // skip words already filled
): string[]
```

> **UXR priority**: < 500ms from spoken to filled (Moment 1 — First Auto-Fill). Process on every `onresult` final transcript, not on a timer.

### Step 2.4: Share utilities

**File**: `src/lib/shareUtils.ts`

Generate a text summary for clipboard:
```
🎯 I got BINGO in Meeting Bingo!
Category: Agile & Scrum
Time: 22 minutes
Winning word: "Scope Creep"
Squares filled: 12/24

Play at: meetingbingo.vercel.app
```

Use `navigator.share()` if available (mobile), fall back to `navigator.clipboard.writeText()`.

---

## Phase 3 — Components (30–35 min)

Build components in this dependency order (leaf nodes first):

### Step 3.1: Shared UI components

**`src/components/ui/Button.tsx`** — accept `variant: 'primary' | 'secondary' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`, `disabled`, `onClick`, `children`. Use Tailwind for styling.

**`src/components/ui/Toast.tsx`** — fixed position bottom notification. Auto-dismiss after `duration` ms (default 3000). Green for `success`, blue for `info`.

### Step 3.2: BingoSquare

**File**: `src/components/BingoSquare.tsx`

Visual states (Tailwind classes):
| State | Background | Border | Text |
|-------|-----------|--------|------|
| Default | `bg-white` | `border-gray-200` | `text-gray-700` |
| Hover | `hover:bg-blue-50` | `hover:border-blue-300` | — |
| Filled (manual) | `bg-blue-500` | `border-blue-600` | `text-white` |
| Auto-filled | `bg-blue-500` + `animate-bounce` (brief) | — | — |
| Free space | `bg-amber-100` | `border-amber-300` | `text-amber-700` |
| Winning | `bg-green-500` | `border-green-600` + `ring-2 ring-green-300` | `text-white` |

> **UXR**: Free space shows ⭐ FREE. Filled squares get strikethrough text per Architecture spec.

### Step 3.3: BingoCard

**File**: `src/components/BingoCard.tsx`

Renders the 5×5 grid using CSS Grid (`grid grid-cols-5 gap-1`). Passes through `winningSquareIds: Set<string>` so each BingoSquare knows if it's in the winning line. Handles `onSquareClick(row, col)` callback.

### Step 3.4: TranscriptPanel

**File**: `src/components/TranscriptPanel.tsx`

Three sub-sections:
1. **Status indicator** — pulsing red dot when listening, gray when paused
2. **Transcript text** — last 100 characters of final transcript + italic interim text. Shows "Waiting for speech..." when empty.
3. **Detected words** — last 5 detected words as green pill badges with ✨ prefix

> **UXR Principle 6 (Minimal Friction)**: This panel is informational only. Users shouldn't need to look at it to play.

### Step 3.5: LandingPage

**File**: `src/components/LandingPage.tsx`

Layout (matches PRD §6.2 wireframe):
- Header: 🎯 MEETING BINGO (large, bold)
- Subtitle: "Turn any meeting into a game."
- Sub-subtitle: "Auto-detects buzzwords using speech recognition!"
- CTA: Large "🎮 NEW GAME" button
- Privacy notice: 🔒 "Audio processed locally. Never recorded."
- Divider
- How It Works: 4 numbered steps

> **UXR Principle 4 (Trust Through Transparency)**: Privacy message must appear on landing page, before any mic request.

### Step 3.6: CategorySelect

**File**: `src/components/CategorySelect.tsx`

3 category cards in a responsive grid (`grid grid-cols-1 sm:grid-cols-3`). Each card shows:
- Icon (emoji)
- Category name
- Description
- 3–4 sample words as preview
- [Select] button

Include "← Back to Home" link at bottom.

### Step 3.7: GameBoard

**File**: `src/components/GameBoard.tsx`

Layout (matches PRD §6.4 wireframe):
- **Header row**: Logo | 🎤 status | X/24 filled counter
- **BingoCard** (main content)
- **TranscriptPanel** (below card)
- **Controls row**: [🔄 New Card] | [⏹️ Stop / ▶️ Start Listening]

> **UXR Moment 2 (Near-Bingo Tension)**: When `getClosestToWin()` returns `needed === 1`, show a pulsing "⚡ One away!" banner above the card.

### Step 3.8: WinScreen

**File**: `src/components/WinScreen.tsx`

Layout (matches PRD §6.5 wireframe):
- 🎉 🎊 BINGO! 🎊 🎉 heading
- Winning card (BingoCard in read-only mode, winning line highlighted)
- Stats: ⏱️ Time to BINGO | 🏆 Winning word | 📊 Squares filled / category
- Two buttons: [📤 SHARE RESULT] | [🔄 PLAY AGAIN]
- Trigger confetti animation on mount

> **UXR Principle 3 (Silent Celebration)**: No sound. Confetti plays immediately. Screenshot-optimized layout.

---

## Phase 4 — Speech Recognition Hook (15–20 min)

### Step 4.1: useSpeechRecognition hook

**File**: `src/hooks/useSpeechRecognition.ts`

Key behaviors:
- Feature detect: `const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition`
- If not supported, return `{ isSupported: false, ... }` — GameBoard shows manual-only mode
- Configure: `continuous = true`, `interimResults = true`, `lang = 'en-US'`
- **Auto-restart**: In `recognition.onend`, if `isListening` is still true, call `recognition.start()` — this handles the browser stopping after silence
- Accumulate final transcripts in state; provide interim separately for display
- Expose `startListening(onResult?)`, `stopListening()`, `resetTranscript()`
- `onResult` callback fires on every final result — this is where word detection runs

### Step 4.2: Wire up auto-fill in App/GameBoard

When `useSpeechRecognition`'s `onResult` fires:
1. Call `detectWordsWithAliases(newFinalTranscript, card.words, alreadyFilledSet)`
2. For each detected word, find its square in the card grid
3. Update that square: `isFilled = true`, `isAutoFilled = true`, `filledAt = Date.now()`
4. Show a Toast for each detected word
5. Run `checkForBingo(updatedCard)` — if winning line found, trigger win

---

## Phase 5 — App Orchestration (10 min)

### Step 5.1: Rewrite App.tsx

Replace the boilerplate with the screen-router pattern from Architecture §Component Implementation:

```
Screen state: 'landing' | 'category' | 'game' | 'win'
```

Screen transitions:
- `landing` → `category` on "New Game" click
- `category` → `game` on category select (generates card, sets startedAt)
- `game` → `win` on BINGO detection (sets completedAt, winningLine, winningWord)
- `win` → `category` on "Play Again"
- `win` / `category` → `landing` on "Home"

### Step 5.2: Game state management

Keep all game state in `App.tsx` using `useState<GameState>`. Pass setters down as props — no need for Context at MVP scale. The Architecture plan shows this pattern in `GameBoard.tsx` receiving `setGame`.

### Step 5.3: localStorage persistence (P1)

Use a `useLocalStorage` hook to persist game state:
- Save on every state change
- On load, check for in-progress game and offer to resume
- Clear on "New Game"

---

## Phase 6 — Win Celebration (10 min)

### Step 6.1: Confetti

In `WinScreen.tsx`, import `canvas-confetti` and fire on mount:

```typescript
import confetti from 'canvas-confetti';

useEffect(() => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
  });
}, []);
```

### Step 6.2: Share button

In `WinScreen.tsx`, implement the share button using `shareUtils.ts`:
1. Try `navigator.share()` (triggers native sheet on mobile — PRD US-4.3)
2. Fall back to `navigator.clipboard.writeText()` with a "Copied!" Toast

---

## Phase 7 — Polish & Deploy (10–15 min)

### Step 7.1: Responsive tweaks

- BingoCard: `text-xs` on mobile, `text-sm` on sm+
- Category grid: single column on mobile, 3 columns on sm+
- GameBoard header: stack vertically on very small screens

### Step 7.2: Browser fallback

In GameBoard, if `!isSupported` from the speech hook:
```
⚠️ Speech recognition not available in this browser.
   Tap squares manually to play. (Works best in Chrome)
```

### Step 7.3: Deploy to Vercel

```bash
npm run build
# Then push to GitHub and import to Vercel, or:
npx vercel --prod
```

---

## Acceptance Criteria Checklist

Mapped to PRD §3 user stories — verify each before calling MVP complete:

### Setup
- [ ] Landing page loads in < 2 seconds
- [ ] 3 category cards displayed with sample words
- [ ] 5×5 grid generated with 24 unique words + 1 free space (center)
- [ ] Free space pre-filled; no duplicate words on card
- [ ] Can regenerate card before starting

### Speech
- [ ] Clear microphone permission prompt with privacy explanation
- [ ] Visual indicator when microphone is active (pulsing dot)
- [ ] Transcription begins within 1 second of enabling
- [ ] Continuous mode — doesn't stop after silence
- [ ] Auto-fill triggers within 500ms of detection
- [ ] Toast notification shows detected word
- [ ] Graceful fallback if speech API unavailable (Firefox)

### Gameplay
- [ ] Tap/click square toggles filled state (manual fallback)
- [ ] Counter shows X/24 squares filled
- [ ] "One away!" indicator when 4 squares in a line
- [ ] BINGO detected for all 12 lines (5 rows + 5 cols + 2 diagonals)
- [ ] Winning line highlighted on card

### Win
- [ ] Confetti plays on BINGO (no sound by default)
- [ ] Shows: time elapsed, winning word, squares filled, category
- [ ] Share button copies result text to clipboard
- [ ] "Play Again" resets to category selection

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Web Speech API unavailable | Feature-detect on load; show manual-only mode with clear message |
| Transcription misses words | Manual tap always works; word aliases cover common TTS variations |
| Scope creep during build | P2 features (dark mode, localStorage) are explicitly droppable — ship P0+P1 first |
| Firefox users | Progressive enhancement — core manual game works everywhere |
| Confetti performance | `canvas-confetti` is 7KB and GPU-accelerated; no risk |

---

## Build Order Summary

```
Phase 1  (15–20 min)  Install Tailwind + confetti → types → folder structure → category data
Phase 2  (25–30 min)  cardGenerator → bingoChecker → wordDetector → shareUtils
Phase 3  (30–35 min)  Button/Toast → BingoSquare → BingoCard → TranscriptPanel 
                       → LandingPage → CategorySelect → GameBoard → WinScreen
Phase 4  (15–20 min)  useSpeechRecognition hook → wire auto-fill in GameBoard
Phase 5  (10 min)     App.tsx rewrite + screen routing + state management
Phase 6  (10 min)     Confetti + share button
Phase 7  (10–15 min)  Responsive polish + browser fallback + Vercel deploy
─────────────────────────────────────────────────────────────────
Total:   ~90 minutes  (P0 features + P1 features)
```

---

*Synthesized from PRD v1.0, Architecture v1.0, and UXR v1.0*  
*Ready for implementation*
