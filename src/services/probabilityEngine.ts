import { Suggestion, GridContext, PhraseContext } from '../types';
import { getGridSuggestions, getWordCompletions } from './openai';

/**
 * Build a prompt showing the full grid context for the AI.
 */
function buildGridPrompt(context: GridContext): string {
  const { grid, position } = context;
  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  if (rows === 0 || cols === 0) return '';

  // Find max word length for alignment
  let maxLen = 5; // minimum width
  for (const row of grid) {
    for (const word of row) {
      if (word.length > maxLen) maxLen = word.length;
    }
  }

  // Build grid visualization
  const lines: string[] = [];
  lines.push(`GRID (${rows}x${cols}):`);

  for (let r = 0; r < rows; r++) {
    const cells: string[] = [];
    for (let c = 0; c < cols; c++) {
      const isTarget = r === position.row && c === position.col;
      const word = grid[r][c];
      const display = isTarget ? '[___]' : (word || '·');
      cells.push(display.padEnd(maxLen));
    }
    lines.push(`Row ${r + 1}: ${cells.join(' | ')}`);
  }

  // Extract row and column phrases
  const rowWords = grid[position.row].map((w, i) =>
    i === position.col ? '[___]' : (w || '·')
  );
  const colWords = grid.map((row, i) =>
    i === position.row ? '[___]' : (row[position.col] || '·')
  );

  lines.push('');
  lines.push(`TARGET: Row ${position.row + 1}, Column ${position.col + 1}`);
  lines.push(`- Row reads:    "${rowWords.join(' ')}"`);
  lines.push(`- Column reads: "${colWords.join(' ')}"`);
  lines.push('');
  lines.push('Suggest ONE word that works well in both the row and column phrases.');

  return lines.join('\n');
}

/**
 * Get suggestions for a cell given full grid context.
 * Uses a single API call with the complete grid state.
 */
export async function getSuggestions(
  context: GridContext
): Promise<Suggestion[]> {
  const prompt = buildGridPrompt(context);

  if (!prompt) {
    return [];
  }

  const wordSuggestions = await getGridSuggestions(prompt);

  // Convert to Suggestion format
  return wordSuggestions.map(ws => ({
    word: ws.word,
    probability: ws.probability,
    combinedScore: ws.probability,
  }));
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
