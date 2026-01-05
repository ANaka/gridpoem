import { Cell, Position, PhraseContext } from '../types';

/**
 * Get words before and after a position in its row
 */
export function getRowContext(cells: Cell[][], pos: Position): PhraseContext {
  const row = cells[pos.row];
  if (!row) {
    return { before: [], after: [] };
  }

  const before: string[] = [];
  const after: string[] = [];

  // Collect words before the position
  for (let col = 0; col < pos.col; col++) {
    const word = row[col]?.word?.trim();
    if (word) {
      before.push(word);
    }
  }

  // Collect words after the position
  for (let col = pos.col + 1; col < row.length; col++) {
    const word = row[col]?.word?.trim();
    if (word) {
      after.push(word);
    }
  }

  return { before, after };
}

/**
 * Get words above and below a position in its column
 */
export function getColumnContext(cells: Cell[][], pos: Position): PhraseContext {
  const before: string[] = [];
  const after: string[] = [];

  // Collect words above the position
  for (let row = 0; row < pos.row; row++) {
    const word = cells[row]?.[pos.col]?.word?.trim();
    if (word) {
      before.push(word);
    }
  }

  // Collect words below the position
  for (let row = pos.row + 1; row < cells.length; row++) {
    const word = cells[row]?.[pos.col]?.word?.trim();
    if (word) {
      after.push(word);
    }
  }

  return { before, after };
}

/**
 * Get all cells affected when a cell changes (same row + same column)
 */
export function getAffectedCells(pos: Position, rows: number, cols: number): Position[] {
  const affected: Position[] = [];

  // Add all cells in the same row
  for (let col = 0; col < cols; col++) {
    if (col !== pos.col) {
      affected.push({ row: pos.row, col });
    }
  }

  // Add all cells in the same column
  for (let row = 0; row < rows; row++) {
    if (row !== pos.row) {
      affected.push({ row, col: pos.col });
    }
  }

  // Add the cell itself
  affected.push(pos);

  return affected;
}

/**
 * Convert context to prompt string
 */
export function contextToPrompt(context: PhraseContext): string {
  const parts: string[] = [];

  if (context.before.length > 0) {
    parts.push(context.before.join(' '));
  }

  // Add placeholder for the current position
  parts.push('___');

  if (context.after.length > 0) {
    parts.push(context.after.join(' '));
  }

  return parts.join(' ');
}
