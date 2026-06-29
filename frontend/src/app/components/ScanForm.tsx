'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function ScanForm() {
  const [githubUrl, setGithubUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = githubUrl.trim().length > 0;

  const handleScan = async () => {
    if (!isValidUrl || isScanning) return;

    const ghUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;
    if (!ghUrlPattern.test(githubUrl.trim())) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setError('');
    setIsScanning(true);

    try {
      const response = await fetch('http://localhost:3001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();
      // TODO: Navigate to results page or display results
      console.log('Scan result:', data);
    } catch {
      setError('Unable to reach the analysis server. Is the backend running?');
    } finally {
      setIsScanning(false);
    }
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
        className={`
          relative flex items-center gap-2
          rounded-2xl border bg-zinc-900/80 backdrop-blur-sm
          p-1.5 transition-all duration-300
          ${isScanning
            ? 'border-violet-500/50 animate-pulse-glow'
            : error
              ? 'border-red-500/50'
              : 'border-zinc-700/60 hover:border-zinc-600 focus-within:border-violet-500/50 focus-within:shadow-[0_0_20px_rgba(139,92,246,0.12)]'
          }
        `}
      >
        <div className="pl-4 text-zinc-500">
          <Search size={20} />
        </div>

        <input
          id="github-url-input"
          type="url"
          value={githubUrl}
          onChange={(e) => {
            setGithubUrl(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="https://github.com/owner/repository"
          disabled={isScanning}
          aria-label="GitHub repository URL"
          className="
            flex-1 bg-transparent text-zinc-100
            placeholder:text-zinc-500 text-base
            py-3 px-2 outline-none
            disabled:opacity-50
            font-mono
          "
        />

        <button
          id="start-scan-button"
          onClick={handleScan}
          disabled={!isValidUrl || isScanning}
          aria-label="Start scan"
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl
            text-sm font-semibold transition-all duration-300
            cursor-pointer
            ${isValidUrl && !isScanning
              ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 active:scale-[0.97]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }
          `}
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="animate-spin-slow" />
              <span>Scanning…</span>
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
