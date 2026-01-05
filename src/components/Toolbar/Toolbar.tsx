import { HistoryControls } from './HistoryControls';
import { GridSizeControls } from './GridSizeControls';
import { ApiKeyInput } from './ApiKeyInput';

export function Toolbar() {
  return (
    <header className="sticky top-0 z-10 flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-surface">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800">Grid Poem</h1>
      </div>

      <div className="flex items-center">
        <GridSizeControls />
      </div>

      <div className="flex items-center gap-4">
        <HistoryControls />
        <div className="w-px h-6 bg-gray-300" />
        <ApiKeyInput />
      </div>
    </header>
  );
}
