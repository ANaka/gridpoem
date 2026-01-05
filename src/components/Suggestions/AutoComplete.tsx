import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Suggestion } from '../../types';

interface Props {
  suggestions: Suggestion[];
  onSelect: (word: string) => void;
  filterText: string;
}

export const AutoComplete: React.FC<Props> = ({
  suggestions,
  onSelect,
  filterText,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on filterText (startsWith match)
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.word.toLowerCase().startsWith(filterText.toLowerCase())
  );

  // Reset selected index when filtered suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText, suggestions]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (filteredSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            onSelect(filteredSuggestions[selectedIndex].word);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            onSelect(filteredSuggestions[selectedIndex].word);
          }
          break;
        case 'Escape':
          // Let parent handle escape
          break;
      }
    },
    [filteredSuggestions, selectedIndex, onSelect]
  );

  // Add keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Don't render if no matching suggestions
  if (filteredSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 w-48 max-h-48 overflow-y-auto bg-white rounded shadow-lg border border-gray-200"
      style={{
        top: '100%',
        left: 0,
        marginTop: '4px',
      }}
    >
      <div ref={listRef} className="py-1">
        {filteredSuggestions.map((suggestion, index) => {
          const isSelected = index === selectedIndex;
          const percentage = Math.round(suggestion.combinedScore * 100);

          return (
            <div
              key={suggestion.word}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelect(suggestion.word)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-sm font-medium truncate flex-grow">
                {suggestion.word}
              </span>
              <span
                className={`text-xs ml-2 flex-shrink-0 ${
                  isSelected ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AutoComplete;
