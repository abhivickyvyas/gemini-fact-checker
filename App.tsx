import React, { useState, useEffect } from 'react';
import { factCheckWithGoogleSearch } from './services/geminiService';
import { FactCheckResult } from './types';
import ResultCard from './components/ResultCard';
import Spinner from './components/Spinner';
import ErrorAlert from './components/ErrorAlert';
import { SearchIcon, SparklesIcon, MenuIcon } from './components/icons';
import History from './components/History';

const examplePrompts = [
  "The Great Wall of China is visible from space with the naked eye.",
  "Humans only use 10% of their brains.",
  "Thomas Edison invented the light bulb.",
  "A penny dropped from the Empire State Building can be lethal."
];

interface HistoryItem {
  originalClaim: string;
  result: FactCheckResult;
}

const App: React.FC = () => {
  const [claim, setClaim] = useState<string>('');
  const [originalClaim, setOriginalClaim] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('factCheckHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('factCheckHistory');
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('factCheckHistory', JSON.stringify(history));
    } else {
      localStorage.removeItem('factCheckHistory');
    }
  }, [history]);

  const handleCheckClaim = async (claimToCheck: string) => {
    if (!claimToCheck.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setOriginalClaim(claimToCheck);

    try {
      const apiResult = await factCheckWithGoogleSearch(claimToCheck);
      setResult(apiResult);
      
      const newHistoryItem: HistoryItem = { originalClaim: claimToCheck, result: apiResult };
      setHistory(prevHistory => {
        const filteredHistory = prevHistory.filter(item => item.originalClaim !== claimToCheck);
        return [newHistoryItem, ...filteredHistory];
      });
    } catch (e: any) {
      setResult(null);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setClaim(prompt);
  };

  const handleClear = () => {
    setClaim('');
    setOriginalClaim('');
    setResult(null);
    setError(null);
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setClaim(item.originalClaim);
    setOriginalClaim(item.originalClaim);
    setResult(item.result);
    setError(null);
    setIsHistoryOpen(false); // Close sidebar on mobile after selection
  };

  const handleClearHistory = () => {
    setHistory([]);
    handleClear();
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 md:flex">
        {isHistoryOpen && (
            <div 
                className="fixed inset-0 z-20 bg-black/30 md:hidden"
                onClick={() => setIsHistoryOpen(false)}
                aria-hidden="true"
            />
        )}
        <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 transform flex-col bg-slate-100/95 backdrop-blur-sm border-r border-slate-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <History
              history={history}
              onItemClick={handleHistoryClick}
              onClear={handleClearHistory}
            />
        </aside>

        <main className="h-full flex-1 overflow-y-auto">
            <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 p-2 backdrop-blur-sm md:hidden">
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="p-2 text-slate-600 hover:text-slate-900"
                    aria-label="Open history menu"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                <div className="inline-flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-lg font-bold text-slate-900">
                        Veritas AI
                    </h1>
                </div>
                <div className="w-8"></div>
            </header>

            <div className="mx-auto max-w-3xl p-4 md:p-8">
                <header className="hidden md:block text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <SparklesIcon className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Veritas AI
                        </h1>
                    </div>
                    <p className="text-md text-slate-600">
                        Your real-time AI assistant for verifying factual accuracy.
                    </p>
                </header>

                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-slate-200">
                    <div className="flex flex-col gap-4">
                        <textarea
                            value={claim}
                            onChange={(e) => setClaim(e.target.value)}
                            placeholder="e.g., The Eiffel Tower is taller in the summer."
                            className="w-full h-28 md:h-32 p-4 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 resize-none"
                            disabled={isLoading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCheckClaim(claim);
                                }
                            }}
                        />
                        <div className="flex flex-col md:flex-row-reverse items-center gap-2">
                            <button
                                onClick={() => handleCheckClaim(claim)}
                                disabled={isLoading || !claim.trim()}
                                className="flex items-center justify-center w-full md:w-28 h-10 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <SearchIcon className="w-5 h-5 mr-2" />
                                        Check
                                    </>
                                )}
                            </button>
                            {(claim.trim().length > 0 || result) && !isLoading && (
                                <button
                                    onClick={handleClear}
                                    className="h-10 w-full md:w-auto px-4 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400"
                                    aria-label="Clear input and results"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 px-2">
                    <p className="text-sm text-slate-500 mb-2">Or try one of these examples:</p>
                    <div className="flex flex-wrap gap-2">
                        {examplePrompts.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => handleExampleClick(prompt)}
                                disabled={isLoading}
                                className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    {error && <ErrorAlert message={error} />}
                    {result && !isLoading && <ResultCard result={result} originalClaim={originalClaim} />}
                </div>

                <footer className="text-center mt-12 text-sm text-slate-500">
                    <p>Powered by Google Gemini. Results should be verified for accuracy.</p>
                </footer>
            </div>
        </main>
    </div>
  );
};

export default App;