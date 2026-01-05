# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Type-check with TypeScript and build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture

GridPoem is a React application for creating grid-based poetry where words must work both horizontally and vertically. It uses OpenAI's API to suggest words based on log-probabilities from both row and column contexts.

### Core Concepts

- **Grid**: A 2D array of Cells where each cell contains a word and probability scores
- **Probability Engine**: Uses OpenAI's logprobs to calculate how well a word fits in both its row phrase and column phrase
- **Suggestion Modes**: "row", "column", or "balanced" (geometric mean of both probabilities)

### State Management

Two Zustand stores:
- `gridStore` - Grid data and cell operations, wrapped with `zundo` for undo/redo history (100 states)
- `uiStore` - UI state (selected cell, editing mode, API key, suggestion mode)

### Key Services (`src/services/`)

- `openai.ts` - OpenAI client wrapper using gpt-4o-mini with logprobs enabled
- `probabilityEngine.ts` - Builds context prompts, merges row/column suggestions, calculates combined scores
- `cache.ts` - LRU cache for probability lookups

### Custom Hooks (`src/hooks/`)

- `useGridNavigation` - Keyboard navigation (arrow keys, Enter to edit, Escape to cancel)
- `useProbabilities` - Recalculates cell probabilities when grid changes
- `useSuggestions` - Fetches word suggestions for the selected cell

## Environment Variables

Copy `.env.example` to `.env` and set:
- `VITE_OPENAI_API_KEY` - OpenAI API key (or enter via UI)

## Maintaining This File

Update CLAUDE.md as you work with the codebase. Add new patterns, commands, or architectural insights you discover. Keep it accurate and remove outdated information.
