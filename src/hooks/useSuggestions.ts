import { useState, useEffect, useRef } from 'react';
import { useGridStore } from '../store/gridStore';
import { useUIStore } from '../store/uiStore';
import { getSuggestions } from '../services';
import { getRowContext, getColumnContext } from '../utils';
import { Suggestion } from '../types';
import { useDebounce } from './useDebounce';

interface UseSuggestionsResult {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that fetches word suggestions for the currently selected cell.
 * Returns suggestions based on row and column context, with debouncing
 * to avoid excessive API calls.
 */
export function useSuggestions(): UseSuggestionsResult {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { cells } = useGridStore();
  const { selectedCell, suggestionMode, apiKey } = useUIStore();

  // Track the latest request to avoid race conditions
  const requestIdRef = useRef(0);

  // Debounce the selected cell to avoid rapid API calls during navigation
  const debouncedSelectedCell = useDebounce(selectedCell, 300);

  // Create a stable key for the current cell context
  const contextKey = debouncedSelectedCell
    ? `${debouncedSelectedCell.row}-${debouncedSelectedCell.col}-${suggestionMode}`
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
        const rowContext = getRowContext(cells, debouncedSelectedCell);
        const colContext = getColumnContext(cells, debouncedSelectedCell);

        // Check if there's any context to base suggestions on
        const hasRowContext = rowContext.before.length > 0 || rowContext.after.length > 0;
        const hasColContext = colContext.before.length > 0 || colContext.after.length > 0;

        if (!hasRowContext && !hasColContext) {
          // No context available - return empty suggestions
          if (currentRequestId === requestIdRef.current) {
            setSuggestions([]);
            setLoading(false);
          }
          return;
        }

        const result = await getSuggestions(rowContext, colContext, suggestionMode);

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
  }, [contextKey, cells, apiKey]); // Use contextKey instead of individual deps to avoid extra triggers

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
