import { Cell, Grid } from '../types';

/**
 * Create a single empty cell
 */
export function createEmptyCell(row: number, col: number): Cell {
  return {
    id: `${row}-${col}`,
    word: '',
    rowProbability: null,
    colProbability: null,
    combinedProbability: null,
  };
}

/**
 * Create an empty grid of given dimensions
 */
export function createEmptyGrid(rows: number, cols: number): Grid {
  const grid: Grid = [];

  for (let row = 0; row < rows; row++) {
    const rowCells: Cell[] = [];
    for (let col = 0; col < cols; col++) {
      rowCells.push(createEmptyCell(row, col));
    }
    grid.push(rowCells);
  }

  return grid;
}
