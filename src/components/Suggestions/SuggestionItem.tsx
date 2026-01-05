import React from 'react';
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
  const handleClick = () => {
    onSelect(suggestion.word);
  };

  // Calculate the percentage for display
  const percentage = Math.round(suggestion.combinedScore * 100);

  // Generate green gradient based on combinedScore
  // Higher scores get darker/more saturated green
  const getBarColor = (score: number): string => {
    const hue = 120; // Green
    const saturation = 40 + score * 40; // 40-80%
    const lightness = 60 - score * 20; // 60-40%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const barColor = getBarColor(suggestion.combinedScore);

  // Show keyboard shortcut hint for positions 1-9
  const shortcutHint = index < 9 ? index + 1 : null;

  return (
    <div
      className="suggestion-item flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded transition-colors"
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
      <div className="prob-bar w-16 h-2 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
        <div
          className="prob-bar-fill h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        />
      </div>

      {/* Percentage */}
      <span className="text-xs text-gray-500 w-10 text-right flex-shrink-0">
        {percentage}%
      </span>
    </div>
  );
};

export default SuggestionItem;
