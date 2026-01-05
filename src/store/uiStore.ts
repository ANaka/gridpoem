import { create } from 'zustand';
import { Position } from '../types';

type SuggestionMode = 'row' | 'column' | 'balanced';

interface UIState {
  selectedCell: Position | null;
  isEditing: boolean;
  editValue: string;
  suggestionMode: SuggestionMode;
  apiKey: string;
}

interface UIActions {
  selectCell: (position: Position) => void;
  clearSelection: () => void;
  startEditing: (initialValue?: string) => void;
  stopEditing: () => void;
  setEditValue: (value: string) => void;
  setSuggestionMode: (mode: SuggestionMode) => void;
  setApiKey: (key: string) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  selectedCell: null,
  isEditing: false,
  editValue: '',
  suggestionMode: 'balanced',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',

  selectCell: (position: Position) =>
    set({
      selectedCell: position,
      isEditing: false,
      editValue: '',
    }),

  clearSelection: () =>
    set({
      selectedCell: null,
      isEditing: false,
      editValue: '',
    }),

  startEditing: (initialValue?: string) =>
    set(() => ({
      isEditing: true,
      editValue: initialValue ?? '',
    })),

  stopEditing: () =>
    set({
      isEditing: false,
      editValue: '',
    }),

  setEditValue: (value: string) =>
    set({
      editValue: value,
    }),

  setSuggestionMode: (mode: SuggestionMode) =>
    set({
      suggestionMode: mode,
    }),

  setApiKey: (key: string) =>
    set({
      apiKey: key,
    }),
}));
