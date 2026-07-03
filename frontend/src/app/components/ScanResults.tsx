'use client';

import { useState, useMemo } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    FileCode,
    TerminalSquare,
    ShieldAlert,
    Lightbulb,
    Wrench,
    Eye,
} from 'lucide-react';

/* ──────────────────────────── Types ──────────────────────────── */

interface Diagnostic {
    id: string;
    file: string;
    line: number;
    severity: 'error' | 'warning';
    category: string;
    message: string;
    context: string;
    solution?: string;
}

export interface ScanData {
    score: number;
    diagnostics: Diagnostic[];
}

/* ──────────────────────────── Score Ring ──────────────────────────── */

function ScoreRing({ score }: { score: number }) {
    const radius = 80;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = (s: number) => {
        if (s >= 90) return { ring: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', text: 'text-emerald-400', label: 'Excellent' };
        if (s >= 70) return { ring: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', text: 'text-amber-400', label: 'Needs Work' };
        return { ring: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)', text: 'text-rose-400', label: 'Critical' };
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
            {/* Glow effect */}
            <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ background: color.glow }}
            />

            <svg
                width={radius * 2}
                height={radius * 2}
                className="transform -rotate-90"
            >
                {/* Background track */}
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke="rgba(63, 63, 70, 0.4)"
                    strokeWidth={stroke}
                />
                {/* Animated progress arc */}
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke={color.ring}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        ['--ring-circumference' as string]: circumference,
                        ['--ring-offset' as string]: offset,
                        animation: 'score-ring 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                    }}
                />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'count-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both' }}>
                <span className={`text-5xl font-bold tracking-tight ${color.text}`}>
                    {score}
                </span>
                <span className="text-zinc-500 text-xs font-medium mt-0.5">/ 100</span>
                <span className={`text-[10px] font-semibold uppercase tracking-widest mt-1 ${color.text} opacity-80`}>
                    {color.label}
                </span>
            </div>
        </div>
    );
}

/* ──────────────────────────── Category Stat Card ──────────────────────────── */

function StatCard({ label, count, icon: Icon, accentBg, accentBorder, accentText }: {
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    accentBg: string;
    accentBorder: string;
    accentText: string;
}) {
    return (
        <div className={`${accentBg} ${accentBorder} border rounded-xl px-5 py-4 flex items-center gap-4 min-w-[150px] transition-all duration-300 hover:scale-[1.02]`}>
            <div className={`w-10 h-10 rounded-lg ${accentBg} flex items-center justify-center`}>
                <Icon size={20} className={accentText} />
            </div>
            <div>
                <span className={`text-2xl font-bold block leading-none ${accentText}`}>{count}</span>
                <span className="text-zinc-400 text-xs font-medium mt-0.5 block">{label}</span>
            </div>
        </div>
    );
}

/* ──────────────────────────── Main Component ──────────────────────────── */

export default function ScanResults({ data }: { data: ScanData | null }) {
    const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

    if (!data || !Array.isArray(data.diagnostics)) return null;

    const errors = data.diagnostics.filter(d => d.severity === 'error');
    const warnings = data.diagnostics.filter(d => d.severity === 'warning');

    const displayedDiagnostics = data.diagnostics.filter(d =>
        filter === 'all' ? true : d.severity === filter
    );

    // Category counts (case-insensitive)
    const categoryCounts = useMemo(() => {
        const counts = { bugs: 0, accessibility: 0, maintainability: 0 };
        data.diagnostics.forEach(d => {
            const cat = d.category?.toLowerCase() || '';
            if (cat.includes('bug')) counts.bugs++;
            else if (cat.includes('accessibility') || cat.includes('a11y')) counts.accessibility++;
            else if (cat.includes('maintain') || cat.includes('quality') || cat.includes('style')) counts.maintainability++;
        });
        return counts;
    }, [data.diagnostics]);

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ═══════════════════ 1. Hero Scorecard ═══════════════════ */}
            <section className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-8 md:p-10 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-2">Codebase Health</h2>
                        <ScoreRing score={data.score ?? 0} />
                    </div>

                    {/* Category Breakdown */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <StatCard
                            label="Bugs"
                            count={categoryCounts.bugs}
                            icon={ShieldAlert}
                            accentBg="bg-rose-500/10"
                            accentBorder="border-rose-500/20"
                            accentText="text-rose-400"
                        />
                        <StatCard
                            label="Accessibility"
                            count={categoryCounts.accessibility}
                            icon={Eye}
                            accentBg="bg-amber-500/10"
                            accentBorder="border-amber-500/20"
                            accentText="text-amber-400"
                        />
                        <StatCard
                            label="Maintainability"
                            count={categoryCounts.maintainability}
                            icon={Wrench}
                            accentBg="bg-indigo-500/10"
                            accentBorder="border-indigo-500/20"
                            accentText="text-indigo-400"
                        />
                    </div>
                </div>

                {/* Summary bar */}
                <div className="mt-6 pt-5 border-t border-zinc-800/60 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{errors.length}</span> Errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{warnings.length}</span> Warnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{data.diagnostics.length}</span> Total</span>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ React Compiler Success State ═══════════════════ */}
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

            {/* ═══════════════════ 2. Filter Tabs ═══════════════════ */}
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

            {/* ═══════════════════ 3. Diagnostics List ═══════════════════ */}
            <div className="space-y-4">
                {displayedDiagnostics.map((issue, idx) => (
                    <div
                        key={`${issue.id}-${idx}`}
                        className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl"
                    >
                        {/* ── Card Header ── */}
                        <div className="p-5 border-b border-zinc-800/50 flex items-start gap-4">
                            <div className="mt-1">
                                {issue.severity === 'error' ? (
                                    <ShieldAlert className="w-5 h-5 text-rose-500" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Category + File path + Line */}
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${issue.severity === 'error'
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                        }`}>
                                        {issue.category}
                                    </span>
                                    <div className="flex items-center text-xs text-zinc-500 font-mono gap-1.5">
                                        <FileCode className="w-3.5 h-3.5 text-zinc-600" />
                                        <span className="text-zinc-400">{issue.file}</span>
                                        <span className="text-zinc-600">:</span>
                                        <span className="text-indigo-400 font-semibold">{issue.line}</span>
                                    </div>
                                </div>

                                {/* Problem / Message */}
                                <p className="text-zinc-300 font-medium leading-relaxed">
                                    {issue.message}
                                </p>
                            </div>
                        </div>

                        {/* ── Actionable Solution Block ── */}
                        {issue.solution && (
                            <div className="mx-5 my-4 p-4 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/20 flex items-start gap-3">
                                <div className="mt-0.5 shrink-0">
                                    <Lightbulb className="w-4.5 h-4.5 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 block mb-1">
                                        Recommended Fix
                                    </span>
                                    <p className="text-emerald-300/90 text-sm leading-relaxed">
                                        {issue.solution}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Code Snippet Panel ── */}
                        {issue.context && (
                            <div className="bg-zinc-950 p-4 font-mono text-sm relative group border-t border-zinc-800/30">
                                <div className="absolute top-4 right-4 opacity-30 group-hover:opacity-100 transition-opacity">
                                    <TerminalSquare className="w-4 h-4 text-zinc-500" />
                                </div>
                                <pre className="text-zinc-400 overflow-x-auto whitespace-pre-wrap">
                                    <code>{issue.context}</code>
                                </pre>
                            </div>
                        )}
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