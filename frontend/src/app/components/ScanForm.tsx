'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface ScanFormProps {
  isLoading?: boolean;
  onScan: (url: string) => void;
}

export default function ScanForm({ isLoading = false, onScan }: ScanFormProps) {
  const [githubUrl, setGithubUrl] = useState('');
  const [error, setError] = useState('');

  const isValidUrl = githubUrl.trim().length > 0;

  const handleScan = () => {
    if (!isValidUrl || isLoading) return;

    const ghUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;
    if (!ghUrlPattern.test(githubUrl.trim())) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setError('');
    onScan(githubUrl.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up-delay-2">
      {/* Input group */}
      <div
        className={`relative flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border bg-zinc-900/80 backdrop-blur-sm p-1.5 transition-all duration-300 ${
          isLoading
            ? 'border-violet-500/50 animate-pulse-glow'
            : error
              ? 'border-red-500/50'
              : 'border-zinc-700/60 hover:border-zinc-600 focus-within:border-violet-500/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.12)]'
        }`}
      >
        <div className="flex-1 flex items-center min-w-0">
          <div className="pl-4 text-zinc-500">
            <Search size={20} />
          </div>

          <input
            id="github-url-input"
            type="url"
            autoComplete="off"
            spellCheck="false"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/owner/repository"
            disabled={isLoading}
            aria-label="GitHub repository URL"
            className={`flex-1 min-w-0 bg-transparent placeholder:text-zinc-500 text-base py-3 px-2 outline-none disabled:opacity-50 font-mono transition-colors duration-200 ${
              githubUrl.trim().length > 0 ? 'text-green-400 font-medium' : 'text-zinc-100'
            }`}
          />
        </div>

        <button
          id="start-scan-button"
          onClick={handleScan}
          disabled={!isValidUrl || isLoading}
          aria-label="Start scan"
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer w-full sm:w-auto ${
            isValidUrl && !isLoading
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 active:scale-[0.97]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              <span>Analyzing…</span>
            </>
          ) : (
            <span>Start Scan</span>
          )}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-400/90 text-center animate-fade-in-up">
          {error}
        </p>
      )}

      {/* Hint */}
      <p className="mt-4 text-xs text-zinc-500 text-center">
        Paste any public GitHub repository URL to start your analysis
      </p>
    </div>
  );
}