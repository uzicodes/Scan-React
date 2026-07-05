'use client';

import { useState, useMemo } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    FileCode,
    ShieldAlert,
    Lightbulb,
    Wrench,
    Eye,
    ExternalLink,
    Hash,
    Sparkles,
    Check,
} from 'lucide-react';

/* ──────────────────────────── Types ──────────────────────────── */

interface FileLocation {
    file: string;
    line?: number;
}

interface Diagnostic {
    id?: string;
    severity?: 'error' | 'warning' | string;
    category?: string;
    rule?: string;
    count?: number;
    message?: string;
    solution?: string;
    learnMore?: string;
    files?: FileLocation[];
    file?: string;
    line?: number;
}

export interface ScanData {
    score?: number;
    diagnostics?: Diagnostic[];
}

/* ──────────────────────────── Score Ring ──────────────────────────── */

function ScoreRing({ score }: { score: number }) {
    const radius = 58;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s >= 90) return { ring: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', text: 'text-emerald-400', label: 'Excellent' };
        if (s >= 70) return { ring: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', text: 'text-amber-400', label: 'Needs Work' };
        return { ring: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)', text: 'text-rose-400', label: 'Critical' };
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
            <div
                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                style={{ background: color.glow }}
            />
            <svg
                width={radius * 2}
                height={radius * 2}
                className="transform -rotate-90"
            >
                <circle
                    cx={radius}
                    cy={radius}
                    r={normalizedRadius}
                    fill="none"
                    stroke="rgba(63, 63, 70, 0.4)"
                    strokeWidth={stroke}
                />
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
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ animation: 'count-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both' }}>
                <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${color.text}`}>
                    {score}
                </span>
                <span className="text-zinc-500 text-[10px] font-medium -mt-0.5">/ 100</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${color.text} opacity-90`}>
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
        <div className={`${accentBg} ${accentBorder} border rounded-xl p-3.5 sm:p-4 flex items-center gap-3.5 flex-1 min-w-[130px] transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
            <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={accentText} />
            </div>
            <div className="min-w-0">
                <span className={`text-xl sm:text-2xl font-bold block leading-none ${accentText}`}>{count}</span>
                <span className="text-zinc-400 text-[11px] sm:text-xs font-medium mt-1 block truncate">{label}</span>
            </div>
        </div>
    );
}

/* ──────────────────────────── Category Helpers ──────────────────────────── */

function getCategoryStyle(category: string) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('bug'))
        return { bg: 'bg-rose-500/15', border: 'border-rose-500/20', text: 'text-rose-400', icon: ShieldAlert };
    if (cat.includes('accessibility') || cat.includes('a11y'))
        return { bg: 'bg-amber-500/15', border: 'border-amber-500/20', text: 'text-amber-400', icon: Eye };
    if (cat.includes('maintain') || cat.includes('quality') || cat.includes('style'))
        return { bg: 'bg-[#469be0]/15', border: 'border-[#469be0]/30', text: 'text-[#469be0]', icon: Wrench };
    if (cat.includes('performance') || cat.includes('perf'))
        return { bg: 'bg-[#f241a0]/15', border: 'border-[#f241a0]/30', text: 'text-[#f241a0]', icon: Lightbulb };
    return { bg: 'bg-zinc-500/15', border: 'border-zinc-500/20', text: 'text-zinc-400', icon: AlertTriangle };
}

/* ──────────────────────────── Micro-Prompt Helpers ──────────────────────────── */

function generateSingleAIPrompt(issue: any): string {
    const filesText = issue.files && issue.files.length > 0
        ? issue.files.map((f: FileLocation) => `- ${f.file}${f.line ? ` (Line ${f.line})` : ''}`).join('\n')
        : 'N/A';

    return `Act as a senior React TypeScript expert specializing in React 19 and the React Compiler.
I need help fixing the following code quality / React Compiler compatibility issue in my codebase:

Rule / Issue: ${issue.rule} (${issue.category.toUpperCase()} - ${issue.severity.toUpperCase()})
Problem Description:
${issue.message || 'No description provided.'}

${issue.solution ? `Recommended Fix:\n${issue.solution}\n` : ''}
Affected Files & Lines:
${filesText}

Please explain why this issue happens in the context of modern React / React Compiler, and provide clean, production-ready code examples demonstrating how to refactor and resolve it in the affected files.`;
}

function AskAIButton({ issue }: { issue: any }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const prompt = generateSingleAIPrompt(issue);
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            title="Copy micro-prompt for AI"
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-200 shadow-sm ${copied
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                : 'bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400'
                }`}
        >
            {copied ? (
                <>
                    <Check size={13} className="text-emerald-400 shrink-0" />
                    <span>Copied Prompt</span>
                </>
            ) : (
                <>
                    <Sparkles size={13} className="shrink-0" />
                    <span>Ask AI</span>
                </>
            )}
        </button>
    );
}

/* ──────────────────────────── Main Component ──────────────────────────── */

export default function ScanResults({ data }: { data: ScanData | null }) {
    const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');

    // ── Normalize diagnostics to guarantee unique keys & robust file/solution handling ──
    const normalizedDiagnostics = useMemo(() => {
        if (!data || !Array.isArray(data.diagnostics)) return [];

        return data.diagnostics.map((d, idx) => {
            const uniqueId = d.id || `diag-${idx}-${d.rule || 'rule'}`;
            const sev = (d.severity === 'error' || d.severity === 'warning') ? d.severity : 'warning';

            // Handle both grouped verbose format (`files: []`) and legacy format (`file`, `line`)
            let filesList: FileLocation[] = [];
            if (Array.isArray(d.files) && d.files.length > 0) {
                filesList = d.files;
            } else if (d.file) {
                filesList = [{ file: d.file, line: d.line }];
            }

            return {
                id: uniqueId,
                severity: sev,
                category: d.category || 'General',
                rule: d.rule || 'React Best Practices',
                count: d.count ?? (filesList.length > 0 ? filesList.length : 1),
                message: d.message || 'Potential improvement identified in code structure.',
                solution: d.solution || '',
                learnMore: d.learnMore || '',
                files: filesList,
            };
        });
    }, [data]);

    if (!data) return null;

    const score = typeof data.score === 'number' ? data.score : 0;
    const errors = normalizedDiagnostics.filter(d => d.severity === 'error');
    const warnings = normalizedDiagnostics.filter(d => d.severity === 'warning');

    const displayedDiagnostics = normalizedDiagnostics.filter(d =>
        filter === 'all' ? true : d.severity === filter
    );

    // Category counts calculation
    const categoryCounts = useMemo(() => {
        const counts = { bugs: 0, accessibility: 0, maintainability: 0, performance: 0 };
        normalizedDiagnostics.forEach(d => {
            const cat = d.category.toLowerCase();
            const n = d.count || 1;
            if (cat.includes('bug')) counts.bugs += n;
            else if (cat.includes('accessibility') || cat.includes('a11y')) counts.accessibility += n;
            else if (cat.includes('maintain') || cat.includes('quality') || cat.includes('style')) counts.maintainability += n;
            else if (cat.includes('performance') || cat.includes('perf')) counts.performance += n;
        });
        return counts;
    }, [normalizedDiagnostics]);

    const totalIssues = categoryCounts.bugs + categoryCounts.accessibility + categoryCounts.maintainability + categoryCounts.performance;

    return (
        <div className="w-full max-w-5xl mx-auto mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ═══════════════════ 1. Hero Scorecard ═══════════════════ */}
            <section className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 md:p-7 shadow-2xl shadow-indigo-500/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Codebase Health</h2>
                        <ScoreRing score={score} />
                    </div>

                    {/* Subtle divider on desktop */}
                    <div className="hidden md:block w-px h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent shrink-0" />

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full md:flex-1">
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
                            accentBg="bg-[#469be0]/15"
                            accentBorder="border-[#469be0]/30"
                            accentText="text-[#469be0]"
                        />
                        <StatCard
                            label="Performance"
                            count={categoryCounts.performance}
                            icon={Lightbulb}
                            accentBg="bg-[#f241a0]/15"
                            accentBorder="border-[#f241a0]/30"
                            accentText="text-[#f241a0]"
                        />
                    </div>
                </div>

                {/* Summary bar */}
                <div className="mt-5 pt-4 border-t border-zinc-800/60 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{totalIssues}</span> Total Issues</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{errors.length}</span> Errors</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-zinc-400"><span className="text-zinc-200 font-semibold">{warnings.length}</span> Warnings</span>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ React Compiler Success ═══════════════════ */}
            {normalizedDiagnostics.length === 0 && (
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
                            ({type === 'all' ? normalizedDiagnostics.length : type === 'error' ? errors.length : warnings.length})
                        </span>
                    </button>
                ))}
            </div>

            {/* ═══════════════════ 3. Issue Cards ═══════════════════ */}
            <div className="space-y-5">
                {displayedDiagnostics.map((issue) => {
                    const catStyle = getCategoryStyle(issue.category);

                    return (
                        <div
                            key={issue.id}
                            className="bg-zinc-950 border border-zinc-800/80 rounded-xl overflow-hidden shadow-lg shadow-black/20 transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl"
                        >
                            {/* ── Card Header: Category + Rule Name + Learn More Link ── */}
                            <div className="p-5 pb-4 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="mt-0.5 shrink-0">
                                        {issue.severity === 'error' ? (
                                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            {/* Category badge */}
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                                                {issue.category}
                                            </span>
                                            {/* Issue count badge */}
                                            {issue.count > 1 && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    ×{issue.count}
                                                </span>
                                            )}
                                        </div>
                                        {/* Rule name as title */}
                                        <h3 className="text-zinc-100 font-semibold text-base leading-snug">
                                            {issue.rule}
                                        </h3>
                                    </div>
                                </div>

                                {/* ── Top-Right Actions: Ask AI + Learn More ── */}
                                <div className="shrink-0 flex items-center gap-3 mt-0.5">
                                    <AskAIButton issue={issue} />
                                    {issue.learnMore && (
                                        <a
                                            href={issue.learnMore}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs text-indigo-400/80 hover:text-indigo-300 transition-colors font-medium"
                                        >
                                            Learn about this rule
                                            <ExternalLink size={11} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* ── Description / Problem ── */}
                            {issue.message && (
                                <div className="px-5 pb-4 pl-14">
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        {issue.message}
                                    </p>
                                </div>
                            )}

                            {/* ── Actionable Solution ── */}
                            {issue.solution ? (
                                <div className="mx-5 mb-4 ml-14 p-4 rounded-lg bg-emerald-500/[0.07] border border-emerald-500/20 flex items-start gap-3">
                                    <div className="mt-0.5 shrink-0">
                                        <Lightbulb size={16} className="text-emerald-400" />
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
                            ) : (
                                <div className="mx-5 mb-4 ml-14 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-2 text-xs text-zinc-500">
                                    <Lightbulb size={14} className="text-zinc-600 shrink-0" />
                                    <span>Review the rule documentation for specific implementation advice.</span>
                                </div>
                            )}

                            {/* ── Affected Files ── */}
                            {issue.files && issue.files.length > 0 && (
                                <div className="mx-5 mb-4 ml-14">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                                        Affected Files ({issue.files.length})
                                    </span>
                                    <div className="space-y-1.5">
                                        {issue.files.map((f, i) => (
                                            <div key={`${f.file}-${f.line || 0}-${i}`} className="flex items-center gap-2 text-xs font-mono bg-zinc-900/80 border border-zinc-800/60 rounded-lg px-3 py-2">
                                                <FileCode size={13} className="text-zinc-600 shrink-0" />
                                                <span className="text-zinc-300 truncate">{f.file}</span>
                                                {f.line !== undefined && f.line > 0 && (
                                                    <>
                                                        <span className="text-zinc-600">:</span>
                                                        <span className="flex items-center gap-0.5 text-[#f58291] font-medium">
                                                            <Hash size={10} className="text-[#f2d0d5]/70" />
                                                            {f.line}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {displayedDiagnostics.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No {filter === 'all' ? 'issues' : `${filter}s`} found.
                    </div>
                )}
            </div>
        </div>
    );
}