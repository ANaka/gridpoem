import { useGridStore } from '../../store/gridStore';

const MIN_SIZE = 2;
const MAX_SIZE = 10;

export function GridSizeControls() {
  const rows = useGridStore((state) => state.rows);
  const cols = useGridStore((state) => state.cols);
  const resizeGrid = useGridStore((state) => state.resizeGrid);

  const handleRowsChange = (delta: number) => {
    const newRows = Math.max(MIN_SIZE, Math.min(MAX_SIZE, rows + delta));
    if (newRows !== rows) {
      resizeGrid(newRows, cols);
    }
  };

  const handleColsChange = (delta: number) => {
    const newCols = Math.max(MIN_SIZE, Math.min(MAX_SIZE, cols + delta));
    if (newCols !== cols) {
      resizeGrid(rows, newCols);
    }
  };

  const handleRowsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const newRows = Math.max(MIN_SIZE, Math.min(MAX_SIZE, value));
      resizeGrid(newRows, cols);
    }
  };

  const handleColsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      const newCols = Math.max(MIN_SIZE, Math.min(MAX_SIZE, value));
      resizeGrid(rows, newCols);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Rows:</span>
        <div className="flex items-center gap-1">
          <button
            className="toolbar-btn px-2"
            onClick={() => handleRowsChange(-1)}
            disabled={rows <= MIN_SIZE}
            aria-label="Decrease rows"
          >
            -
          </button>
          <input
            type="number"
            className="w-12 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={rows}
            onChange={handleRowsInput}
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
          <button
            className="toolbar-btn px-2"
            onClick={() => handleRowsChange(1)}
            disabled={rows >= MAX_SIZE}
            aria-label="Increase rows"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Cols:</span>
        <div className="flex items-center gap-1">
          <button
            className="toolbar-btn px-2"
            onClick={() => handleColsChange(-1)}
            disabled={cols <= MIN_SIZE}
            aria-label="Decrease columns"
          >
            -
          </button>
          <input
            type="number"
            className="w-12 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={cols}
            onChange={handleColsInput}
            min={MIN_SIZE}
            max={MAX_SIZE}
          />
          <button
            className="toolbar-btn px-2"
            onClick={() => handleColsChange(1)}
            disabled={cols >= MAX_SIZE}
            aria-label="Increase columns"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
