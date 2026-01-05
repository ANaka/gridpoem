import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Grid, PhrasePreview } from './components/Grid';
import { SuggestionPanel } from './components/Suggestions';
import { useGridNavigation, useProbabilities } from './hooks';
import { initializeOpenAI } from './services/openai';

function App() {
  // Initialize OpenAI client from env variable on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envKey) {
      initializeOpenAI(envKey);
    }
  }, []);

  // Initialize keyboard navigation
  useGridNavigation();

  // Initialize probability calculations
  useProbabilities();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fafafa' }}>
      <Toolbar />

      <main className="flex-1 flex">
        {/* Main content area - offset for fixed sidebar */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 mr-72">
          <Grid />
          <PhrasePreview />
        </div>

        {/* Suggestions sidebar */}
        <SuggestionPanel />
      </main>
    </div>
  );
}

export default App;
