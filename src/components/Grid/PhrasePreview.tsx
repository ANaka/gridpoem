import React from 'react';
import { useGridStore } from '../../store/gridStore';
import { useUIStore } from '../../store/uiStore';
import { getRowContext, getColumnContext, contextToPrompt } from '../../utils';

export const PhrasePreview: React.FC = () => {
  const cells = useGridStore((state) => state.cells);
  const selectedCell = useUIStore((state) => state.selectedCell);

  // Don't render if no cell is selected
  if (!selectedCell) {
    return null;
  }

  const rowContext = getRowContext(cells, selectedCell);
  const columnContext = getColumnContext(cells, selectedCell);

  const rowPhrase = contextToPrompt(rowContext);
  const columnPhrase = contextToPrompt(columnContext);

  // Check if there's any context to show
  const hasRowContext = rowContext.before.length > 0 || rowContext.after.length > 0;
  const hasColumnContext = columnContext.before.length > 0 || columnContext.after.length > 0;

  if (!hasRowContext && !hasColumnContext) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 text-sm text-gray-500">
        <p>Start typing to add words to the grid</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-3 text-sm text-gray-600 min-w-64 max-w-lg">
      {hasRowContext && (
        <div className="mb-1">
          <span className="font-medium text-gray-700">Row: </span>
          <span className="text-gray-500">{rowPhrase}</span>
        </div>
      )}
      {hasColumnContext && (
        <div>
          <span className="font-medium text-gray-700">Column: </span>
          <span className="text-gray-500">{columnPhrase}</span>
        </div>
      )}
    </div>
  );
};

export default PhrasePreview;
