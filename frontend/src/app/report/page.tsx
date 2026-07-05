'use client';

import { useEffect, useState, useCallback, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Terminal,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Loader2,
} from 'lucide-react';
import ScanResults, { type ScanData } from '../components/ScanResults';

/* ──────────────────────────── Types ──────────────────────────── */

type Phase = 'cloning' | 'analyzing' | 'finalizing';

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'dimmed';
}

/* ──────────────────────────── Terminal Loader ──────────────────────────── */

function TerminalLoader({ repoUrl }: { repoUrl: string }) {
  const repoName = useMemo(
    () => repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, ''),
    [repoUrl]
  );

  const initialLines = useMemo<TerminalLine[]>(
    () => [{ text: `$ scanreact analyze ${repoName}`, type: 'dimmed' }],
    [repoName]
  );

  const [phase, setPhase] = useState<Phase>('cloning');
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [dots, setDots] = useState('');

  // Animate the trailing dots
  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(id);
  }, []);

  // Cycle through phases to give the user a sense of progress
  useEffect(() => {
    const t1 = setTimeout(() => {
      setLines((prev) => [
        ...prev,
        { text: `▸ Cloning ${repoName} (depth=1)…`, type: 'info' },
      ]);
    }, 600);

    // Phase 2 — after 3 s
    const t2 = setTimeout(() => {
      setPhase('analyzing');
      setLines((prev) => [
        ...prev,
        { text: '✓ Repository cloned successfully', type: 'success' },
        { text: '▸ Running react-doctor diagnostics…', type: 'info' },
      ]);
    }, 3000);

    // Phase 3 — after 7 s
    const t3 = setTimeout(() => {
      setPhase('finalizing');
      setLines((prev) => [
        ...prev,
        { text: '✓ Static analysis complete', type: 'success' },
        { text: '▸ Computing health score…', type: 'info' },
      ]);
    }, 7000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [repoName]);

  const phaseLabel: Record<Phase, string> = {
    cloning: 'Cloning repository',
    analyzing: 'Running diagnostics',
    finalizing: 'Computing results',
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in-up">
      {/* Terminal window */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/5">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/60">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-3 text-xs text-zinc-500 font-mono">
            scanreact — analysis engine
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-sm leading-relaxed min-h-[200px] space-y-1.5">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`animate-fade-in-up ${
                line.type === 'success'
                  ? 'text-emerald-400'
                  : line.type === 'dimmed'
                    ? 'text-zinc-600'
                    : 'text-violet-300'
              }`}
            >
              {line.text}
            </div>
          ))}

          {/* Blinking cursor line */}
          <div className="flex items-center gap-2 mt-2">
            <Loader2 size={14} className="text-violet-400 animate-spin-slow" />
            <span className="text-zinc-400">
              {phaseLabel[phase]}{dots}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-full bg-zinc-800/50 rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
          style={{
            width:
              phase === 'cloning'
                ? '30%'
                : phase === 'analyzing'
                  ? '65%'
                  : '90%',
          }}
        />
      </div>

      <p className="mt-4 text-xs text-zinc-500 text-center">
        This may take 30–90 seconds depending on repository size
      </p>
    </div>
  );
}

/* ──────────────────────────── Error Card ──────────────────────────── */

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-zinc-900 border border-rose-500/30 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">
          Analysis Failed
        </h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
        <Link
          href="/"
          onClick={() => {
            try { sessionStorage.clear(); } catch (e) {}
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-600/20 hover:shadow-violet-500/30 active:scale-[0.97]"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────────── Report Content (reads searchParams) ── */

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const repoUrl = searchParams.get('url');

  const [scanData, setScanData] = useState<ScanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runScan = useCallback(async (githubUrl: string) => {
    setIsLoading(true);
    setError(null);
    setScanData(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scan`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ githubUrl }),
        }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(
          errJson.error || `Server responded with status ${response.status}`
        );
      }

      const result = await response.json();
      const parsed: ScanData = result.data || result;
      setScanData(parsed);
      try {
        sessionStorage.setItem(`scan_result_${githubUrl}`, JSON.stringify(parsed));
      } catch (e) {
        console.warn('Failed to cache scan result in sessionStorage:', e);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach the analysis server. Is the backend running?';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Kick off the scan as soon as the page loads (or restore from sessionStorage on refresh)
  const hasFetched = useRef(false);
  useEffect(() => {
    if (!repoUrl) {
      router.replace('/');
      return;
    }
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Check sessionStorage first to prevent re-scanning on page refresh
    try {
      const cached = sessionStorage.getItem(`scan_result_${repoUrl}`);
      if (cached) {
        const parsed: ScanData = JSON.parse(cached);
        setScanData(parsed);
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to load cached scan result from sessionStorage:', e);
    }

    // Use a microtask to satisfy the react-hooks/set-state-in-effect rule
    const controller = new AbortController();
    (async () => {
      if (controller.signal.aborted) return;
      await runScan(repoUrl);
    })();
    return () => controller.abort();
  }, [repoUrl, runScan, router]);

  // Guard: no URL → redirect handled above, show nothing while redirecting
  if (!repoUrl) return null;

  // Extract readable repo name for the header
  const repoName = repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, '');

  return (
    <>
      {/* ---- Repo header ---- */}
      <div className="w-full max-w-5xl mx-auto mb-10 animate-fade-in-up">
        <Link
          href="/"
          onClick={() => {
            try { sessionStorage.removeItem(`scan_result_${repoUrl}`); } catch (e) {}
          }}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <GitBranch size={18} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-zinc-100 truncate">
              {repoName}
            </h1>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 transition-colors font-mono"
            >
              {repoUrl}
              <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* ---- States ---- */}
      {isLoading && <TerminalLoader repoUrl={repoUrl} />}
      {error && !isLoading && <ErrorCard message={error} />}
      {scanData && !isLoading && <ScanResults data={scanData} />}
    </>
  );
}

/* ──────────────────────────── Page Shell ──────────────────────────── */

export default function ReportPage() {
  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-10 pb-20 sm:pt-14 sm:pb-28">
        {/* Suspense boundary required by useSearchParams */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <Terminal className="w-6 h-6 text-violet-400 animate-pulse" />
              <span className="ml-3 text-sm text-zinc-500">Loading…</span>
            </div>
          }
        >
          <ReportContent />
        </Suspense>
      </section>
    </main>
  );
}
