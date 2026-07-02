'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    FileCode,
    TerminalSquare,
    ShieldAlert
} from 'lucide-react';

interface Diagnostic {
    id: string;
    file: string;
    line: number;
    severity: 'error' | 'warning';
    category: string;
    message: string;
    context: string;
}

interface ScanData {
    score: number;
    diagnostics: Diagnostic[];
}

export default function ScanResults({ data }: { data: ScanData | null }) {
    const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

    if (!data) return null;

    const errors = data.diagnostics.filter(d => d.severity === 'error');
    const warnings = data.diagnostics.filter(d => d.severity === 'warning');

    const displayedDiagnostics = data.diagnostics.filter(d =>
        filter === 'all' ? true : d.severity === filter
    );

    // Determine health color based on score
    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. Hero Score Section */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                    <h2 className="text-xl font-medium text-zinc-400 mb-2">Codebase Health</h2>
                    <div className="flex items-baseline gap-3">
                        <span className={`text-6xl font-bold tracking-tighter ${getHealthColor(data.score)}`}>
                            {data.score}
                        </span>
                        <span className="text-zinc-500 text-2xl">/100</span>
                    </div>
                </div>

                <div className="flex gap-4 text-sm font-medium">
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-lg flex flex-col items-center min-w-[120px]">
                        <span className="text-3xl font-bold mb-1">{errors.length}</span>
                        Errors
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-lg flex flex-col items-center min-w-[120px]">
                        <span className="text-3xl font-bold mb-1">{warnings.length}</span>
                        Warnings
                    </div>
                </div>
            </section>

            {/* React Compiler Success State */}
            {errors.length === 0 && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6 flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-indigo-400 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-300 mb-1">React Compiler Ready</h3>
                        <p className="text-indigo-200/80 leading-relaxed">
                            🎉 Your codebase strictly follows the Rules of React. Zero critical errors found.
                            This repository is fully optimized and ready to automatically benefit from the native React Compiler.
                        </p>
                    </div>
                </div>
            )}

            {/* 2. Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                {(['all', 'error', 'warning'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === type
                                ? 'bg-zinc-800 text-zinc-100'
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                            }`}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                        <span className="ml-2 opacity-50">
                            ({type === 'all' ? data.diagnostics.length : type === 'error' ? errors.length : warnings.length})
                        </span>
                    </button>
                ))}
            </div>

            {/* 3. Diagnostics List */}
            <div className="space-y-4">
                {displayedDiagnostics.map((issue, idx) => (
                    <div key={`${issue.id}-${idx}`} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">

                        <div className="p-5 border-b border-zinc-800/50 flex items-start gap-4">
                            <div className="mt-1">
                                {issue.severity === 'error' ? (
                                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${issue.severity === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                        {issue.category}
                                    </span>
                                    <div className="flex items-center text-xs text-zinc-500 font-mono">
                                        <FileCode className="w-3 h-3 mr-1" />
                                        {issue.file} : {issue.line}
                                    </div>
                                </div>
                                <p className="text-zinc-300 font-medium leading-relaxed">
                                    {issue.message}
                                </p>
                            </div>
                        </div>

                        {/* Code Snippet Panel */}
                        <div className="bg-zinc-950 p-4 font-mono text-sm relative group">
                            <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                <TerminalSquare className="w-4 h-4 text-zinc-500" />
                            </div>
                            <pre className="text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                <code>{issue.context}</code>
                            </pre>
                        </div>

                    </div>
                ))}

                {displayedDiagnostics.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No {filter}s found.
                    </div>
                )}
            </div>
        </div>
    );
}