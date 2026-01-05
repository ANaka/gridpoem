import React, { useCallback, useRef, useEffect } from 'react';
import { useGridStore } from '../../store/gridStore';
import { useUIStore } from '../../store/uiStore';
import { probabilityToColor } from '../../utils';

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
      inputRef.current.select();
    }
  }, [isCellEditing]);

  // Handle single click to select
  const handleClick = useCallback(() => {
    if (!isCellEditing) {
      selectCell({ row, col });
    }
  }, [selectCell, row, col, isCellEditing]);

  // Handle double click to edit
  const handleDoubleClick = useCallback(() => {
    selectCell({ row, col });
    startEditing(cell?.word || '');
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
        />
      ) : (
        <span className="truncate px-1">
          {cell?.word || ''}
        </span>
      )}
    </div>
  );
};

export default GridCell;
