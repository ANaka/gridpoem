import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { useGridStore } from '../../store/gridStore';
import { useUIStore } from '../../store/uiStore';
import { probabilityToColor } from '../../utils';

// Calculate font size to fit text within cell
// Cell width ~68px (80px - 12px padding), monospace char width ~0.6em
const BASE_FONT_SIZE = 18;
const MIN_FONT_SIZE = 8;
const CELL_WIDTH = 68;
const CHAR_WIDTH_RATIO = 0.6;

function calculateFontSize(text: string): number {
  if (!text || text.length === 0) return BASE_FONT_SIZE;
  const neededWidth = text.length * BASE_FONT_SIZE * CHAR_WIDTH_RATIO;
  if (neededWidth <= CELL_WIDTH) return BASE_FONT_SIZE;
  const scaledSize = CELL_WIDTH / (text.length * CHAR_WIDTH_RATIO);
  return Math.max(MIN_FONT_SIZE, Math.round(scaledSize));
}

interface GridCellProps {
  row: number;
  col: number;
}

export const GridCell: React.FC<GridCellProps> = ({ row, col }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Get cell data from grid store
  const cell = useGridStore((state) => state.cells[row]?.[col]);
  const setCell = useGridStore((state) => state.setCell);

  // Get selection state from UI store
  const selectedCell = useUIStore((state) => state.selectedCell);
  const isEditing = useUIStore((state) => state.isEditing);
  const editValue = useUIStore((state) => state.editValue);
  const selectOnFocus = useUIStore((state) => state.selectOnFocus);
  const selectCell = useUIStore((state) => state.selectCell);
  const startEditing = useUIStore((state) => state.startEditing);
  const stopEditing = useUIStore((state) => state.stopEditing);
  const setEditValue = useUIStore((state) => state.setEditValue);

  // Determine if this cell is selected
  const isSelected = selectedCell?.row === row && selectedCell?.col === col;
  const isCellEditing = isSelected && isEditing;
  const isEmpty = !cell?.word;

  // Focus input when editing starts
  useEffect(() => {
    if (isCellEditing && inputRef.current) {
      inputRef.current.focus();
      if (selectOnFocus) {
        inputRef.current.select();
      } else {
        // Move cursor to end
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }
  }, [isCellEditing, selectOnFocus]);

  // Handle single click to select
  const handleClick = useCallback(() => {
    if (!isCellEditing) {
      selectCell({ row, col });
    }
  }, [selectCell, row, col, isCellEditing]);

  // Handle double click to edit - select all existing text
  const handleDoubleClick = useCallback(() => {
    selectCell({ row, col });
    startEditing(cell?.word || '', true);  // selectOnFocus = true
  }, [selectCell, startEditing, row, col, cell?.word]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditValue(e.target.value);
    },
    [setEditValue]
  );

  // Handle input blur - save the value
  const handleInputBlur = useCallback(() => {
    if (editValue.trim() !== cell?.word) {
      setCell({ row, col }, editValue.trim());
    }
    stopEditing();
  }, [editValue, cell?.word, setCell, row, col, stopEditing]);

  // Handle key down in input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (editValue.trim() !== cell?.word) {
          setCell({ row, col }, editValue.trim());
        }
        stopEditing();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopEditing();
      }
    },
    [editValue, cell?.word, setCell, row, col, stopEditing]
  );

  // Get background color from probability
  const backgroundColor = probabilityToColor(cell?.combinedProbability ?? null);

  // Calculate font size to fit text
  const displayText = isCellEditing ? editValue : (cell?.word || '');
  const fontSize = useMemo(() => calculateFontSize(displayText), [displayText]);

  return (
    <div
      className={`
        grid-cell
        ${isSelected ? 'selected' : ''}
        ${isCellEditing ? 'editing' : ''}
        ${isEmpty ? 'empty' : ''}
      `}
      style={{ backgroundColor }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isCellEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          className="grid-cell-input"
          style={{ fontSize }}
        />
      ) : (
        <span className="px-1.5" style={{ fontSize }}>
          {cell?.word || ''}
        </span>
      )}
    </div>
  );
};

export default GridCell;
