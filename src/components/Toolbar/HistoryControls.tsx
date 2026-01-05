import { useCallback } from 'react';
import { useStore } from 'zustand';
import { useGridStore } from '../../store/gridStore';

export function HistoryControls() {
  const { undo, redo } = useGridStore.temporal.getState();

  // Subscribe to temporal state changes for re-render (separate selectors to avoid new object refs)
  const canUndo = useStore(useGridStore.temporal, (state) => state.pastStates.length > 0);
  const canRedo = useStore(useGridStore.temporal, (state) => state.futureStates.length > 0);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  return (
    <div className="flex items-center gap-1">
      <button
        className="toolbar-btn"
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Cmd+Z)"
        aria-label="Undo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4"
          />
        </svg>
        <span className="text-xs text-gray-500 ml-1">Cmd+Z</span>
      </button>

      <button
        className="toolbar-btn"
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Cmd+Shift+Z)"
        aria-label="Redo"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 10h-10a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4"
          />
        </svg>
        <span className="text-xs text-gray-500 ml-1">Cmd+Shift+Z</span>
      </button>
    </div>
  );
}
