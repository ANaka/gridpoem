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
 * Get word completions using completion-style prompting.
 * Uses multiple completions to get word variety and probabilities.
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
    model: 'gpt-4o-mini',
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
    logprobs: true
  });

  // Count words and track best logprob for each
  const wordData = new Map<string, { count: number; logprob: number }>();

  for (const choice of response.choices) {
    const content = choice.message.content?.trim().toLowerCase();
    if (!content) continue;

    const word = content.split(/\s+/)[0].replace(/[^a-z'-]/gi, '');
    if (!word || word.length < 1) continue;

    const logprob = choice.logprobs?.content?.[0]?.logprob ?? -3;

    const existing = wordData.get(word);
    if (existing) {
      existing.count++;
      existing.logprob = Math.max(existing.logprob, logprob);
    } else {
      wordData.set(word, { count: 1, logprob });
    }
  }

  // Convert to suggestions - use count as main signal
  const suggestions: WordSuggestion[] = [];
  for (const [word, data] of wordData) {
    suggestions.push({
      word,
      probability: data.count / numCompletions
    });
  }

  suggestions.sort((a, b) => b.probability - a.probability);
  return suggestions.slice(0, 8);
}
