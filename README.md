# GridPoem

Create grid-based poetry where words form meaningful phrases both horizontally and vertically. Uses AI to suggest words that fit both contexts.

## What is GridPoem?

GridPoem is an interactive tool for creating constrained poetry on a grid. Each word you place must work as part of two phrases:

- **Horizontally**: Words in each row form a left-to-right phrase
- **Vertically**: Words in each column form a top-to-bottom phrase

The app uses OpenAI's GPT-4o to suggest words that make sense in both directions simultaneously.

## Features

- **Interactive Grid Editor** - Click to select cells, type to add words
- **AI-Powered Suggestions** - Real-time word suggestions based on row and column context
- **Suggestion Modes** - Prioritize row context, column context, or balance both
- **Keyboard Navigation** - Full keyboard support for efficient editing
- **Undo/Redo** - 100-state history with Cmd+Z / Cmd+Shift+Z
- **Resizable Grid** - Adjust dimensions from 2x2 up to 10x10
- **Phrase Preview** - See current row and column phrases as you work

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- OpenAI API key

### Installation

```bash
git clone <repo-url>
cd gridpoem
npm install
```

### Environment Setup

Create a `.env` file:

```bash
VITE_OPENAI_API_KEY=your-openai-api-key
```

Or enter your API key via the toolbar in the app.

### Run

```bash
npm run dev
```

Open http://localhost:5173

## Usage

1. Enter your OpenAI API key in the toolbar (if not set in `.env`)
2. Click a cell or use arrow keys to select
3. Press Enter or start typing to edit
4. Review AI suggestions in the right panel
5. Click a suggestion or press 1-9 to select it
6. Continue building your grid poem

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Arrow keys | Navigate cells |
| Enter | Edit selected cell |
| Tab | Move to next cell |
| Shift+Tab | Move to previous cell |
| Escape | Cancel editing |
| Backspace/Delete | Clear cell |
| 1-9 | Select suggestion |
| Cmd+Z | Undo |
| Cmd+Shift+Z | Redo |

### Suggestion Modes

- **Row** - Prioritizes words that fit the horizontal phrase
- **Column** - Prioritizes words that fit the vertical phrase
- **Balanced** - Uses geometric mean of both probabilities

## Development

```bash
npm run dev      # Start dev server
npm run build    # Type-check and build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

See [CLAUDE.md](./CLAUDE.md) for architecture details.

## Tech Stack

- React + TypeScript + Vite
- Zustand + Zundo (state management with undo/redo)
- Tailwind CSS
- OpenAI API (GPT-4o)

## Maintaining This File

Keep this README up to date as the project evolves. Update features, commands, and usage instructions when they change.
