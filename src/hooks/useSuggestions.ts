import { useState, useEffect, useRef } from 'react';
import { useGridStore } from '../store/gridStore';
import { useUIStore } from '../store/uiStore';
import { getSuggestions } from '../services';
import { Suggestion, GridContext } from '../types';
import { useDebounce } from './useDebounce';

interface UseSuggestionsResult {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that fetches word suggestions for the currently selected cell.
 * Passes full grid context to the AI for better suggestions.
 */
export function useSuggestions(): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cells } = useGridStore();
  const { selectedCell, apiKey } = useUIStore();

  // Track the latest request to avoid race conditions
  const requestIdRef = useRef(0);

  // Debounce the selected cell to avoid rapid API calls during navigation
  const debouncedSelectedCell = useDebounce(selectedCell, 300);

  // Create a stable key for the current cell context
  const contextKey = debouncedSelectedCell
    ? `${debouncedSelectedCell.row}-${debouncedSelectedCell.col}`
    : null;

  useEffect(() => {
    // Clear suggestions if no cell is selected or no API key
    if (!debouncedSelectedCell || !apiKey) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchSuggestions = async () => {
      const currentRequestId = ++requestIdRef.current;

      setLoading(true);
      setError(null);

      try {
        // Convert Cell[][] to string[][] for the grid context
        const grid: string[][] = cells.map(row =>
          row.map(cell => cell.word)
        );

        // Check if there's any context (any filled cells besides target)
        const hasContext = grid.some((row, r) =>
          row.some((word, c) =>
            word && !(r === debouncedSelectedCell.row && c === debouncedSelectedCell.col)
          )
        );

        if (!hasContext) {
          // No context available - return empty suggestions
          if (currentRequestId === requestIdRef.current) {
            setSuggestions([]);
            setLoading(false);
          }
          return;
        }

        const context: GridContext = {
          grid,
          position: debouncedSelectedCell,
        };

        const result = await getSuggestions(context);

        // Only update state if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          setSuggestions(result);
          setLoading(false);
        }
      } catch (err) {
        // Only update state if this is still the latest request
        if (currentRequestId === requestIdRef.current) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to fetch suggestions';
          setError(errorMessage);
          setSuggestions([]);
          setLoading(false);
        }
      }
    };

    fetchSuggestions();
  }, [contextKey, cells, apiKey]);

  // Clear suggestions when cell changes (before debounce kicks in)
  useEffect(() => {
    if (selectedCell !== debouncedSelectedCell) {
      // Cell just changed, show loading state
      if (selectedCell && apiKey) {
        setLoading(true);
      }
    }
  }, [selectedCell, debouncedSelectedCell, apiKey]);

  return {
    suggestions,
    loading,
    error,
  };
}
