function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .trim();
}

/** Speech-to-text variations for words the STT engine often mangles */
const WORD_ALIASES: Record<string, string[]> = {
  'ci/cd':   ['ci cd', 'cicd', 'continuous integration continuous delivery'],
  'mvp':     ['minimum viable product', 'm.v.p.'],
  'roi':     ['return on investment', 'r.o.i.'],
  'api':     ['a.p.i.', 'ay pee eye'],
  'devops':  ['dev ops', 'dev-ops'],
  'sla':     ['s.l.a.', 'service level agreement'],
  'a/b test':['a b test', 'ab test', 'split test'],
};

/**
 * Detect which card words appear in the transcript.
 * Fires on every final STT result; must stay under ~5ms for 24 words.
 *
 * @param transcript   The new final transcript segment (not cumulative)
 * @param cardWords    Flat word list from BingoCard.words
 * @param alreadyFilled Set of lowercased words already marked filled
 */
export function detectWordsWithAliases(
  transcript: string,
  cardWords: string[],
  alreadyFilled: Set<string>,
): string[] {
  const normalized = normalizeText(transcript);
  const detected: string[] = [];

  for (const word of cardWords) {
    const lc = word.toLowerCase();
    if (alreadyFilled.has(lc)) continue;

    const normWord = normalizeText(word);
    let found = false;

    if (normWord.includes(' ')) {
      // Multi-word phrase — substring match
      found = normalized.includes(normWord);
    } else {
      // Single word — word-boundary match
      found = new RegExp(`\\b${escapeRegex(normWord)}\\b`, 'i').test(normalized);
    }

    if (!found) {
      // Check aliases
      const aliases = WORD_ALIASES[lc];
      if (aliases) {
        found = aliases.some(alias => normalized.includes(alias));
      }
    }

    if (found) detected.push(word);
  }

  return detected;
}
