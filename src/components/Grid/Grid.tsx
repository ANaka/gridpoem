import React from 'react';
import { useGridStore } from '../../store/gridStore';
import { GridCell } from './GridCell';

export const Grid: React.FC = () => {
  const cells = useGridStore((state) => state.cells);
  const rows = useGridStore((state) => state.rows);
  const cols = useGridStore((state) => state.cols);

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <GridCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Grid;
