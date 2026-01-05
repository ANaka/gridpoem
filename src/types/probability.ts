export interface Suggestion {
  word: string;
  rowProbability: number;
  colProbability: number;
  combinedScore: number;
  source: 'row' | 'column' | 'both';
}

export interface PhraseContext {
  before: string[];
  after: string[];
}
