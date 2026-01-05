import React from 'react';
import { useSuggestions } from '../../hooks';
import { useGridStore } from '../../store/gridStore';
import { useUIStore } from '../../store/uiStore';
import { SuggestionItem } from './SuggestionItem';

export const SuggestionPanel: React.FC = () => {
  const { suggestions, loading, error } = useSuggestions();
  const setCell = useGridStore((state) => state.setCell);
  const selectedCell = useUIStore((state) => state.selectedCell);
  const suggestionMode = useUIStore((state) => state.suggestionMode);
  const setSuggestionMode = useUIStore((state) => state.setSuggestionMode);

  const handleSelect = (word: string) => {
    if (selectedCell) {
      setCell(selectedCell, word);
    }
  };

  // Handle keyboard shortcuts (1-9) for quick selection
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle number keys 1-9 when not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9 && suggestions.length >= num) {
        e.preventDefault();
        handleSelect(suggestions[num - 1].word);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [suggestions, selectedCell]);

  return (
    <div className="fixed right-0 top-0 h-full w-72 border-l border-gray-200 bg-surface bg-white flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Suggestions
        </h2>

        {/* Mode toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              suggestionMode === 'row'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setSuggestionMode('row')}
          >
            Row
          </button>
          <button
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              suggestionMode === 'column'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setSuggestionMode('column')}
          >
            Column
          </button>
          <button
            className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              suggestionMode === 'balanced'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setSuggestionMode('balanced')}
          >
            Balanced
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500" />
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* No selection state */}
        {!selectedCell && !loading && !error && (
          <div className="p-4 text-sm text-gray-500 text-center">
            Select a cell to see suggestions
          </div>
        )}

        {/* Empty suggestions state */}
        {selectedCell && !loading && !error && suggestions.length === 0 && (
          <div className="p-4 text-sm text-gray-500 text-center">
            No suggestions available
          </div>
        )}

        {/* Suggestions list */}
        {!loading && !error && suggestions.length > 0 && (
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.word}
                suggestion={suggestion}
                index={index}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      {suggestions.length > 0 && (
        <div className="p-3 border-t border-gray-200 text-xs text-gray-400 text-center">
          Press 1-9 to quickly select a suggestion
        </div>
      )}
    </div>
  );
};

export default SuggestionPanel;
