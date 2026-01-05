import React, { useState } from 'react';
import { Suggestion } from '../../types';

interface Props {
  suggestion: Suggestion;
  index: number;
  onSelect: (word: string) => void;
}

export const SuggestionItem: React.FC<Props> = ({
  suggestion,
  index,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    onSelect(suggestion.word);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Calculate the percentage for display
  const percentage = Math.round(suggestion.combinedScore * 100);

  // Generate green gradient based on combinedScore
  const getBarColor = (score: number): string => {
    const hue = 120; // Green
    const saturation = 40 + score * 40; // 40-80%
    const lightness = 60 - score * 20; // 60-40%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const barColor = getBarColor(suggestion.combinedScore);

  // Show keyboard shortcut hint for positions 1-9
  const shortcutHint = index < 9 ? index + 1 : null;

  // Highlight the suggested word in phrases
  const highlightWord = (phrase: string, word: string) => {
    if (!phrase) return null;
    const parts = phrase.split(word);
    if (parts.length === 1) return phrase;
    return (
      <>
        {parts[0]}<strong className="text-blue-600">{word}</strong>{parts.slice(1).join(word)}
      </>
    );
  };

  return (
    <div className="suggestion-item-wrapper">
      <div
        className="suggestion-item flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded transition-colors"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(suggestion.word);
          }
        }}
      >
        {/* Keyboard shortcut hint */}
        {shortcutHint && (
          <span className="text-xs text-gray-400 font-mono w-4 flex-shrink-0">
            {shortcutHint}
          </span>
        )}

        {/* Word */}
        <span className="flex-grow font-medium text-sm truncate">
          {suggestion.word}
        </span>

        {/* Probability bar */}
        <div className="prob-bar w-12 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          <div
            className="prob-bar-fill h-full rounded-full transition-all"
            style={{
              width: `${percentage}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {/* Percentage */}
        <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
          {percentage}%
        </span>

        {/* Expand button for phrase preview */}
        {(suggestion.rowPhrase || suggestion.colPhrase) && (
          <button
            onClick={toggleExpand}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-xs"
            title="Show phrases"
          >
            {expanded ? '▲' : '▼'}
          </button>
        )}
      </div>

      {/* Phrase previews */}
      {expanded && (suggestion.rowPhrase || suggestion.colPhrase) && (
        <div className="px-3 pb-2 text-xs text-gray-600 space-y-1 bg-gray-50 rounded-b mx-1 mb-1">
          {suggestion.rowPhrase && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400">→</span>
              <span className="italic">{highlightWord(suggestion.rowPhrase, suggestion.word)}</span>
            </div>
          )}
          {suggestion.colPhrase && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400">↓</span>
              <span className="italic">{highlightWord(suggestion.colPhrase, suggestion.word)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionItem;
