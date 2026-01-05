import { Suggestion, PhraseContext } from '../types';
import { getWordCompletions, WordSuggestion } from './openai';

/**
 * Get suggestions for a cell given row and column context.
 * Uses completion-style prompting for natural word suggestions.
 */
export async function getSuggestions(
  rowContext: PhraseContext,
  colContext: PhraseContext,
  mode: 'row' | 'column' | 'balanced' = 'balanced'
): Promise<Suggestion[]> {
  const rowPrompt = rowContext.before.join(' ');
  const colPrompt = colContext.before.join(' ');

  // Fetch completions in parallel
  const [rowSuggestions, colSuggestions] = await Promise.all([
    rowPrompt ? getWordCompletions(rowPrompt) : Promise.resolve([]),
    colPrompt ? getWordCompletions(colPrompt) : Promise.resolve([])
  ]);

  // Merge suggestions from both contexts
  return mergeSuggestions(rowSuggestions, colSuggestions, mode);
}

/**
 * Merge and rank suggestions from row and column contexts
 */
function mergeSuggestions(
  rowSuggestions: WordSuggestion[],
  colSuggestions: WordSuggestion[],
  mode: 'row' | 'column' | 'balanced'
): Suggestion[] {
  const suggestionMap = new Map<string, Suggestion>();

  // Process row suggestions
  for (const s of rowSuggestions) {
    suggestionMap.set(s.word, {
      word: s.word,
      rowProbability: s.probability,
      colProbability: 0,
      combinedScore: 0,
      source: 'row'
    });
  }

  // Process column suggestions
  for (const s of colSuggestions) {
    const existing = suggestionMap.get(s.word);
    if (existing) {
      existing.colProbability = s.probability;
      existing.source = 'both';
    } else {
      suggestionMap.set(s.word, {
        word: s.word,
        rowProbability: 0,
        colProbability: s.probability,
        combinedScore: 0,
        source: 'column'
      });
    }
  }

  // Calculate combined scores based on mode
  for (const suggestion of suggestionMap.values()) {
    switch (mode) {
      case 'row':
        suggestion.combinedScore = suggestion.rowProbability;
        break;
      case 'column':
        suggestion.combinedScore = suggestion.colProbability;
        break;
      case 'balanced':
        // Geometric mean, with bonus for words in both contexts
        const rowProb = suggestion.rowProbability || 0.05;
        const colProb = suggestion.colProbability || 0.05;
        suggestion.combinedScore = Math.sqrt(rowProb * colProb);
        if (suggestion.source === 'both') {
          suggestion.combinedScore *= 2;
        }
        break;
    }
  }

  const suggestions = Array.from(suggestionMap.values());
  suggestions.sort((a, b) => b.combinedScore - a.combinedScore);

  return suggestions.slice(0, 10);
}

/**
 * Calculate probability for a specific word in context.
 * Returns a rough estimate based on whether the word appears in completions.
 */
export async function calculateCellProbabilities(
  rowContext: PhraseContext,
  colContext: PhraseContext,
  word: string
): Promise<{ rowProbability: number; colProbability: number; combinedProbability: number }> {
  const normalizedWord = word.toLowerCase().trim();

  const [rowSuggestions, colSuggestions] = await Promise.all([
    rowContext.before.length > 0 ? getWordCompletions(rowContext.before.join(' ')) : Promise.resolve([]),
    colContext.before.length > 0 ? getWordCompletions(colContext.before.join(' ')) : Promise.resolve([])
  ]);

  // Find the word in suggestions
  const rowMatch = rowSuggestions.find(s => s.word === normalizedWord);
  const colMatch = colSuggestions.find(s => s.word === normalizedWord);

  const rowProbability = rowMatch?.probability ?? 0;
  const colProbability = colMatch?.probability ?? 0;
  const combinedProbability = Math.sqrt(
    (rowProbability || 0.01) * (colProbability || 0.01)
  );

  return { rowProbability, colProbability, combinedProbability };
}
