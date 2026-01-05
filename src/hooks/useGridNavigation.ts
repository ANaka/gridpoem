import { useEffect, useCallback } from 'react';
import { useGridStore } from '../store/gridStore';
import { useUIStore } from '../store/uiStore';

/**
 * Hook for handling keyboard navigation in the grid.
 * Listens for keyboard events on the document and handles:
 * - Arrow keys: move selection (up/down/left/right)
 * - Enter: start editing if selected, or confirm edit if editing
 * - Escape: cancel editing
 * - Tab: move to next cell (wrap at row end)
 * - Backspace (when not editing): clear selected cell
 * - Cmd+Z / Ctrl+Z: undo
 * - Cmd+Shift+Z / Ctrl+Y: redo
 */
export function useGridNavigation() {
  const { cells, rows, cols, setCell, clearCell } = useGridStore();
  const {
    selectedCell,
    isEditing,
    editValue,
    selectCell,
    clearSelection,
    startEditing,
    stopEditing,
  } = useUIStore();

  const moveSelection = useCallback(
    (deltaRow: number, deltaCol: number) => {
      if (!selectedCell) {
        // If no cell is selected, select the first cell
        selectCell({ row: 0, col: 0 });
        return;
      }

      const newRow = Math.max(0, Math.min(rows - 1, selectedCell.row + deltaRow));
      const newCol = Math.max(0, Math.min(cols - 1, selectedCell.col + deltaCol));

      if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
        selectCell({ row: newRow, col: newCol });
      }
    },
    [selectedCell, rows, cols, selectCell]
  );

  const moveToNextCell = useCallback(() => {
    if (!selectedCell) {
      selectCell({ row: 0, col: 0 });
      return;
    }

    let newCol = selectedCell.col + 1;
    let newRow = selectedCell.row;

    // Wrap to next row if at end of current row
    if (newCol >= cols) {
      newCol = 0;
      newRow = newRow + 1;

      // Wrap to first row if at end of grid
      if (newRow >= rows) {
        newRow = 0;
      }
    }

    selectCell({ row: newRow, col: newCol });
  }, [selectedCell, rows, cols, selectCell]);

  const moveToPreviousCell = useCallback(() => {
    if (!selectedCell) {
      selectCell({ row: rows - 1, col: cols - 1 });
      return;
    }

    let newCol = selectedCell.col - 1;
    let newRow = selectedCell.row;

    // Wrap to previous row if at start of current row
    if (newCol < 0) {
      newCol = cols - 1;
      newRow = newRow - 1;

      // Wrap to last row if at start of grid
      if (newRow < 0) {
        newRow = rows - 1;
      }
    }

    selectCell({ row: newRow, col: newCol });
  }, [selectedCell, rows, cols, selectCell]);

  const confirmEdit = useCallback(() => {
    if (!selectedCell) return;

    // Set the cell value and stop editing
    setCell(selectedCell, editValue.trim());
    stopEditing();
  }, [selectedCell, editValue, setCell, stopEditing]);

  const cancelEdit = useCallback(() => {
    stopEditing();
  }, [stopEditing]);

  const handleUndo = useCallback(() => {
    const { undo } = useGridStore.temporal.getState();
    undo();
  }, []);

  const handleRedo = useCallback(() => {
    const { redo } = useGridStore.temporal.getState();
    redo();
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Handle undo/redo first (works regardless of editing state)
      if (cmdOrCtrl && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (cmdOrCtrl && event.key === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }

      // If editing, only handle Enter and Escape
      if (isEditing) {
        if (event.key === 'Enter') {
          event.preventDefault();
          confirmEdit();
          // Move to next cell after confirming
          moveToNextCell();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          cancelEdit();
        } else if (event.key === 'Tab') {
          event.preventDefault();
          confirmEdit();
          if (event.shiftKey) {
            moveToPreviousCell();
          } else {
            moveToNextCell();
          }
        }
        return;
      }

      // Not editing - handle navigation and other keys
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          moveSelection(-1, 0);
          break;

        case 'ArrowDown':
          event.preventDefault();
          moveSelection(1, 0);
          break;

        case 'ArrowLeft':
          event.preventDefault();
          moveSelection(0, -1);
          break;

        case 'ArrowRight':
          event.preventDefault();
          moveSelection(0, 1);
          break;

        case 'Enter':
          event.preventDefault();
          if (selectedCell) {
            const currentWord = cells[selectedCell.row][selectedCell.col].word;
            startEditing(currentWord);
          }
          break;

        case 'Escape':
          event.preventDefault();
          clearSelection();
          break;

        case 'Tab':
          event.preventDefault();
          if (event.shiftKey) {
            moveToPreviousCell();
          } else {
            moveToNextCell();
          }
          break;

        case 'Backspace':
        case 'Delete':
          event.preventDefault();
          if (selectedCell) {
            clearCell(selectedCell);
          }
          break;

        default:
          // Start editing on any printable character
          if (
            selectedCell &&
            event.key.length === 1 &&
            !cmdOrCtrl &&
            !event.altKey
          ) {
            event.preventDefault();
            startEditing(event.key);
          }
          break;
      }
    },
    [
      isEditing,
      selectedCell,
      cells,
      moveSelection,
      moveToNextCell,
      moveToPreviousCell,
      confirmEdit,
      cancelEdit,
      handleUndo,
      handleRedo,
      startEditing,
      stopEditing,
      clearSelection,
      clearCell,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    moveSelection,
    moveToNextCell,
    moveToPreviousCell,
    confirmEdit,
    cancelEdit,
    handleUndo,
    handleRedo,
  };
}
