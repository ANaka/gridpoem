import { create } from 'zustand';
import { Position } from '../types';

type SuggestionMode = 'row' | 'column' | 'balanced';

interface UIState {
  selectedCell: Position | null;
  isEditing: boolean;
  editValue: string;
  selectOnFocus: boolean;
  suggestionMode: SuggestionMode;
  apiKey: string;
}

interface UIActions {
  selectCell: (position: Position) => void;
  clearSelection: () => void;
  startEditing: (initialValue?: string, selectOnFocus?: boolean) => void;
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
  selectOnFocus: false,
  suggestionMode: 'balanced',
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',

  selectCell: (position: Position) =>
    set({
      selectedCell: position,
      isEditing: false,
      editValue: '',
      selectOnFocus: false,
    }),

  clearSelection: () =>
    set({
      selectedCell: null,
      isEditing: false,
      editValue: '',
      selectOnFocus: false,
    }),

  startEditing: (initialValue?: string, selectOnFocus: boolean = false) =>
    set(() => ({
      isEditing: true,
      editValue: initialValue ?? '',
      selectOnFocus,
    })),

  stopEditing: () =>
    set({
      isEditing: false,
      editValue: '',
      selectOnFocus: false,
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
