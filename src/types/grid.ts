export interface Position {
  row: number;
  col: number;
}

export interface Cell {
  id: string;
  word: string;
  rowProbability: number | null;
  colProbability: number | null;
  combinedProbability: number | null;
}

export type Grid = Cell[][];
