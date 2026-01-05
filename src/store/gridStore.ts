import { create } from 'zustand';
import { temporal } from 'zundo';
import { Cell, Grid, Position } from '../types';

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 5;

interface GridState {
  cells: Grid;
  rows: number;
  cols: number;
}

interface GridActions {
  setCell: (position: Position, word: string) => void;
  setCellProbabilities: (
    position: Position,
    probabilities: {
      rowProbability: number | null;
      colProbability: number | null;
      combinedProbability: number | null;
    }
  ) => void;
  clearCell: (position: Position) => void;
  resizeGrid: (rows: number, cols: number) => void;
  clearGrid: () => void;
}

type GridStore = GridState & GridActions;

const createEmptyCell = (row: number, col: number): Cell => ({
  id: `${row}-${col}`,
  word: '',
  rowProbability: null,
  colProbability: null,
  combinedProbability: null,
});

const createEmptyGrid = (rows: number, cols: number): Grid => {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => createEmptyCell(row, col))
  );
};

export const useGridStore = create<GridStore>()(
  temporal(
    (set) => ({
      cells: createEmptyGrid(DEFAULT_ROWS, DEFAULT_COLS),
      rows: DEFAULT_ROWS,
      cols: DEFAULT_COLS,

      setCell: (position: Position, word: string) =>
        set((state) => {
          const newCells = state.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === position.row && colIndex === position.col
                ? { ...cell, word }
                : cell
            )
          );
          return { cells: newCells };
        }),

      setCellProbabilities: (position: Position, probabilities) =>
        set((state) => {
          const newCells = state.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === position.row && colIndex === position.col
                ? { ...cell, ...probabilities }
                : cell
            )
          );
          return { cells: newCells };
        }),

      clearCell: (position: Position) =>
        set((state) => {
          const newCells = state.cells.map((row, rowIndex) =>
            row.map((cell, colIndex) =>
              rowIndex === position.row && colIndex === position.col
                ? createEmptyCell(position.row, position.col)
                : cell
            )
          );
          return { cells: newCells };
        }),

      resizeGrid: (rows: number, cols: number) =>
        set((state) => {
          const newCells = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: cols }, (_, colIndex) => {
              if (rowIndex < state.rows && colIndex < state.cols) {
                return {
                  ...state.cells[rowIndex][colIndex],
                  id: `${rowIndex}-${colIndex}`,
                };
              }
              return createEmptyCell(rowIndex, colIndex);
            })
          );
          return { cells: newCells, rows, cols };
        }),

      clearGrid: () =>
        set((state) => ({
          cells: createEmptyGrid(state.rows, state.cols),
        })),
    }),
    {
      limit: 100,
    }
  )
);
