import OpenAI from 'openai';

let client: OpenAI | null = null;

export function initializeOpenAI(apiKey: string): void {
  client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}

export function getOpenAIClient(): OpenAI | null {
  return client;
}

export function isOpenAIInitialized(): boolean {
  return client !== null;
}

export interface WordSuggestion {
  word: string;
  probability: number;
}

/**
 * Get word suggestions for a grid cell using full grid context.
 * Uses multiple completions to get word variety and probabilities.
 */
export async function getGridSuggestions(
  prompt: string,
  numCompletions: number = 10
): Promise<WordSuggestion[]> {
  if (!client) {
    throw new Error('OpenAI client not initialized.');
  }

  if (!prompt.trim()) {
    return [];
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a creative poet helping complete a grid poem. Output exactly ONE word that fits both the row and column context. Output only that single word, nothing else.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 4,
    n: numCompletions,
    temperature: 1.0,
  });

  // Count words across completions
  const wordCounts = new Map<string, number>();

  for (const choice of response.choices) {
    const content = choice.message.content?.trim().toLowerCase();
    if (!content) continue;

    // Extract first word, remove punctuation
    const word = content.split(/\s+/)[0].replace(/[^a-z'-]/gi, '');
    if (!word || word.length < 1) continue;

    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  // Convert to suggestions with probability = frequency
  const suggestions: WordSuggestion[] = [];
  for (const [word, count] of wordCounts) {
    suggestions.push({
      word,
      probability: count / numCompletions
    });
  }

  suggestions.sort((a, b) => b.probability - a.probability);
  return suggestions.slice(0, 10);
}

/**
 * Legacy: Get word completions for a simple context string.
 * Used by calculateCellProbabilities for existing word scoring.
 */
export async function getWordCompletions(
  contextBefore: string,
  numCompletions: number = 10
): Promise<WordSuggestion[]> {
  if (!client) {
    throw new Error('OpenAI client not initialized.');
  }

  const prompt = contextBefore.trim();
  if (!prompt) {
    return [];
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'Continue with exactly one word. Output only that word.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 4,
    n: numCompletions,
    temperature: 1.0,
  });

  const wordCounts = new Map<string, number>();

  for (const choice of response.choices) {
    const content = choice.message.content?.trim().toLowerCase();
    if (!content) continue;

    const word = content.split(/\s+/)[0].replace(/[^a-z'-]/gi, '');
    if (!word || word.length < 1) continue;

    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }

  const suggestions: WordSuggestion[] = [];
  for (const [word, count] of wordCounts) {
    suggestions.push({
      word,
      probability: count / numCompletions
    });
  }

  suggestions.sort((a, b) => b.probability - a.probability);
  return suggestions.slice(0, 8);
}
