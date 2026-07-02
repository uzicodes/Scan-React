'use client';

import { Send, Download, Code2, Database, LayoutGrid, Cpu, Terminal } from 'lucide-react';

const engineDetails = [
  {
    title: 'Engine Execution',
    description:
      'We run the react-doctor static analysis package directly against the cloned repository to evaluate React Compiler compatibility.',
  },
  {
    title: 'Rule Validation',
    description:
      "The engine parses the codebase to detect strict violations of the 'Rules of React', such as mutated props and invalid hook dependencies.",
  },
  {
    title: 'Smart Categorization',
    description:
      'The raw output is transformed into two severities: Errors (critical compiler blockers) and Warnings (architectural anti-patterns).',
  },
  {
    title: 'Contextual Delivery',
    description:
      'Results are bundled into a JSON payload with precise file paths, line numbers, and code snippets to hydrate the debugging UI.',
  },
] as const;

const stages = [
  {
    step: '01',
    title: 'Request',
    description:
      'User input validation and secure HTTPS request routing to the analysis backend.',
    icon: Send,
  },
  {
    step: '02',
    title: 'Ingestion',
    description:
      'Automated cloning of the repository using git clone --depth 1 for optimized network performance.',
    icon: Download,
  },
  {
    step: '03',
    title: 'Analysis',
    description:
      'Execution of the static analysis engine, parsing repository components into Abstract Syntax Trees (AST).',
    icon: Code2,
  },
  {
    step: '04',
    title: 'Transformation',
    description:
      'Mapping raw diagnostic output into a standardized JSON schema for predictable UI consumption.',
    icon: Database,
  },
  {
    step: '05',
    title: 'Delivery',
    description:
      'JSON serialization and frontend state hydration to populate the interactive dashboard with results.',
    icon: LayoutGrid,
  },
] as const;

export default function PipelineSection() {
  return (
    <section id="pipeline-section" className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 sm:py-28">
      {/* Section Header */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-4">
          <Cpu size={14} className="text-white-400" />
          SYSTEM SPECIFICATION
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#74cc00] mb-3">
          Architecture Pipeline Integration
        </h2>
        <p className="text-zinc-400 text-base max-w-xl mx-auto">
          A high-speed, stateless lifecycle engineered for zero-latency code diagnostics.
        </p>
      </div>

      {/* Documentation Excerpt Card */}
      <div className="w-full max-w-4xl mx-auto bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
        {/* Terminal / Documentation Top Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-700/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-700/80" />
              <span className="w-3 h-3 rounded-full bg-green-700/80" />
            </div>
            <span className="ml-3 font-mono text-xs text-zinc-400 flex items-center gap-1.5">
              <Terminal size={12} className="text-indigo-400" />
              ARCHITECTURE.md
            </span>
          </div>
          <span className="font-mono text-[11px] text-indigo-400/80 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
            v1-stable
          </span>
        </div>

        {/* Stepper Body */}
        <div className="p-6 sm:p-10 relative">
          {/* Vertical connecting dashed line */}
          <div className="absolute left-[43px] sm:left-[59px] top-14 bottom-14 w-0 border-l border-dashed border-indigo-500/30 pointer-events-none" />

          <div className="space-y-8 sm:space-y-10">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <div key={stage.step} className="relative flex items-start gap-5 sm:gap-6 group">
                  {/* Stepper Node / Icon Container */}
                  <div className="relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-zinc-900 border border-green-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/5 transition-all duration-300 group-hover:bg-indigo-500/10 group-hover:border-green-500/40 group-hover:scale-105">
                    <Icon size={20} className="text-indigo-400 transition-colors duration-300 group-hover:text-green-300" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <span className="font-mono text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                        {stage.step}
                      </span>
                      <span className="hidden sm:inline text-zinc-700">/</span>
                      <h3 className="text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-white transition-colors">
                        {stage.title}
                      </h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engine Details Bullet Points */}
      <div className="w-full max-w-4xl mx-auto mt-10 px-4 sm:px-6">
        <ul className="list-disc list-outside ml-6 space-y-3 text-sm sm:text-base text-zinc-400 leading-relaxed font-sans marker:text-[#74cc00]">
          {engineDetails.map((detail) => (
            <li key={detail.title} className="pl-1">
              <strong className="text-zinc-100 font-semibold">{detail.title}:</strong> {detail.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
