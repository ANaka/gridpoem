import { Position } from './grid';

export interface Suggestion {
  word: string;
  probability: number;
  combinedScore: number;
  rowPhrase?: string;   // e.g., "hearts [run] deep"
  colPhrase?: string;   // e.g., "rivers [run] softly"
}

export interface GridContext {
  grid: string[][];    // All words (empty string for blank cells)
  position: Position;  // Target cell to fill
}

// Legacy - kept for compatibility with calculateCellProbabilities
export interface PhraseContext {
  before: string[];
  after: string[];
}
