import { useEffect, useRef, useCallback } from 'react';
import { useGridStore } from '../store/gridStore';
import { useUIStore } from '../store/uiStore';
import { calculateCellProbabilities } from '../services';
import { getRowContext, getColumnContext, getAffectedCells } from '../utils';
import { Position } from '../types';
import { useDebouncedCallback } from './useDebounce';

/**
 * Hook that manages probability calculations for grid cells.
 * When a cell changes, it recalculates probabilities for affected cells
 * (same row and column) with debouncing to avoid excessive API calls.
 */
export function useProbabilities() {
  const { cells, rows, cols, setCellProbabilities } = useGridStore();
  const { apiKey } = useUIStore();

  // Track which cells need recalculation
  const pendingCellsRef = useRef<Set<string>>(new Set());
  const previousCellsRef = useRef<string | null>(null);

  // Convert position to string key for Set
  const positionToKey = (pos: Position): string => `${pos.row}-${pos.col}`;

  // Convert string key back to position
  const keyToPosition = (key: string): Position => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  };

  // Process pending probability calculations
  const processPendingCalculations = useCallback(async () => {
    if (!apiKey || pendingCellsRef.current.size === 0) {
      return;
    }

    // Get all pending cells and clear the set
    const cellsToProcess = Array.from(pendingCellsRef.current);
    pendingCellsRef.current.clear();

    // Process each cell
    const calculations = cellsToProcess.map(async (key) => {
      const pos = keyToPosition(key);
      const cell = cells[pos.row]?.[pos.col];

      // Skip if cell doesn't exist or is empty
      if (!cell || !cell.word.trim()) {
        // Clear probabilities for empty cells
        setCellProbabilities(pos, {
          rowProbability: null,
          colProbability: null,
          combinedProbability: null,
        });
        return;
      }

      try {
        const rowContext = getRowContext(cells, pos);
        const colContext = getColumnContext(cells, pos);

        // Only calculate if there's some context
        const hasRowContext = rowContext.before.length > 0 || rowContext.after.length > 0;
        const hasColContext = colContext.before.length > 0 || colContext.after.length > 0;

        if (!hasRowContext && !hasColContext) {
          // No context available, set null probabilities
          setCellProbabilities(pos, {
            rowProbability: null,
            colProbability: null,
            combinedProbability: null,
          });
          return;
        }

        const probabilities = await calculateCellProbabilities(
          rowContext,
          colContext,
          cell.word
        );

        setCellProbabilities(pos, {
          rowProbability: hasRowContext ? probabilities.rowProbability : null,
          colProbability: hasColContext ? probabilities.colProbability : null,
          combinedProbability:
            hasRowContext && hasColContext ? probabilities.combinedProbability : null,
        });
      } catch (error) {
        console.error(`Error calculating probabilities for cell ${key}:`, error);
        // Keep existing probabilities on error
      }
    });

    await Promise.allSettled(calculations);
  }, [cells, apiKey, setCellProbabilities]);

  // Debounced version of the calculation processor
  const debouncedProcessCalculations = useDebouncedCallback(
    processPendingCalculations,
    300
  );

  // Queue cells for probability recalculation
  const queueCellsForRecalculation = useCallback(
    (positions: Position[]) => {
      for (const pos of positions) {
        pendingCellsRef.current.add(positionToKey(pos));
      }
      debouncedProcessCalculations();
    },
    [debouncedProcessCalculations]
  );

  // Detect cell changes and queue affected cells for recalculation
  useEffect(() => {
    // Create a snapshot of current cells for comparison
    const currentSnapshot = JSON.stringify(
      cells.map((row) => row.map((cell) => cell.word))
    );

    // Skip on first render
    if (previousCellsRef.current === null) {
      previousCellsRef.current = currentSnapshot;
      return;
    }

    // Skip if no change
    if (previousCellsRef.current === currentSnapshot) {
      return;
    }

    // Find which cells changed
    const previousCells = JSON.parse(previousCellsRef.current) as string[][];
    const changedPositions: Position[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const currentWord = cells[row]?.[col]?.word ?? '';
        const previousWord = previousCells[row]?.[col] ?? '';

        if (currentWord !== previousWord) {
          changedPositions.push({ row, col });
        }
      }
    }

    // Update previous snapshot
    previousCellsRef.current = currentSnapshot;

    // If cells changed, get all affected cells and queue for recalculation
    if (changedPositions.length > 0) {
      const affectedCells = new Set<string>();

      for (const changedPos of changedPositions) {
        const affected = getAffectedCells(changedPos, rows, cols);
        for (const pos of affected) {
          affectedCells.add(positionToKey(pos));
        }
      }

      queueCellsForRecalculation(
        Array.from(affectedCells).map(keyToPosition)
      );
    }
  }, [cells, rows, cols, queueCellsForRecalculation]);

  // Recalculate all probabilities when API key changes (becomes available)
  useEffect(() => {
    if (apiKey) {
      // Queue all non-empty cells for recalculation
      const nonEmptyCells: Position[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (cells[row]?.[col]?.word.trim()) {
            nonEmptyCells.push({ row, col });
          }
        }
      }
      if (nonEmptyCells.length > 0) {
        queueCellsForRecalculation(nonEmptyCells);
      }
    }
  }, [apiKey]); // Only re-run when API key changes

  return {
    queueCellsForRecalculation,
    processPendingCalculations,
  };
}
