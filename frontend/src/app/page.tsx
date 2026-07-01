import Image from 'next/image';
import { Zap, Shield, Cpu } from 'lucide-react';
import ScanForm from './components/ScanForm';
import FeatureCard from './components/FeatureCard';

const features = [
  {
    icon: Zap,
    title: 'Instant Diagnostics',
    description:
      'Get a comprehensive code quality report in seconds. No local setup, no CLI to install — just paste your URL and go.',
  },
  {
    icon: Cpu,
    title: 'React Compiler Ready',
    description:
      'Verify whether your codebase meets the requirements for automatic optimization with the React Compiler.',
  },
  {
    icon: Shield,
    title: 'Security Focused',
    description:
      'Fully stateless analysis with zero code storage. Your source code is never persisted — privacy by design.',
  },
] as const;

export default function Home() {
  return (
    <main className="relative flex flex-col items-center min-h-screen overflow-hidden">
      {/* ---- Background layers ---- */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none" />

      {/* ---- Hero Section ---- */}
      <section
        id="hero-section"
        className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto px-6 pt-8 pb-20 sm:pt-12 sm:pb-28"
      >
        {/* Badge */}
        <div className="animate-fade-in-up mb-6 sm:mb-8">
          <span
            className="
              inline-flex items-center gap-2 px-4 py-1.5
              rounded-full text-xs font-medium
              bg-violet-500/10 text-violet-300
              border border-violet-500/20
              backdrop-blur-sm
            "
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Open-Source React Analyzer
          </span>
        </div>

        {/* Logo */}
        <div className="animate-fade-in-up mb-4 sm:mb-6 flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="ScanReact Logo"
            width={120}
            height={120}
            priority
            className="h-12 sm:h-16 w-auto object-contain drop-shadow-[0_0_25px_rgba(139,92,246,0.35)] transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Big brand title */}
        <h1
          className="
            animate-fade-in-up
            text-5xl sm:text-7xl md:text-8xl lg:text-9xl
            font-extrabold tracking-tight text-center
            leading-none text-white
            mb-6 sm:mb-10
          "
        >
          SCAN-REACT
        </h1>

        {/* Sub-heading */}
        <h2
          className="
            animate-fade-in-up-delay-1
            text-xl sm:text-3xl md:text-4xl lg:text-5xl
            font-bold tracking-tight text-center
            leading-[1.1] max-w-none whitespace-nowrap
            text-gradient
          "
        >
          Analyze your React codebase in seconds.
        </h2>

        {/* Sub-headline */}
        <p
          className="
            animate-fade-in-up-delay-2
            mt-6 text-xs sm:text-sm md:text-base
            text-zinc-400 text-center
            max-w-2xl leading-relaxed
          "
        >
          Automated static analysis and compiler&nbsp;readiness checks for any
          public GitHub repository. Ship&nbsp;faster, Ship&nbsp;safer.
        </p>

        {/* Scan form */}
        <div className="mt-12 w-full">
          <ScanForm />
        </div>
      </section>

      {/* ---- Divider shimmer ---- */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
        <div className="h-px w-full animate-shimmer rounded-full" />
      </div>

      {/* ---- Features Grid ---- */}
      <section
        id="features-section"
        className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 sm:py-28"
      >
        <div className="text-center mb-14 animate-fade-in-up-delay-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-3">
            Built for Modern React
          </h2>
          <p className="text-zinc-400 text-base max-w-xl mx-auto">
            Everything you need to audit, optimize, and future-proof your React
            applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`animate-fade-in-up-delay-${index + 2}`}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer
        id="footer"
        className="relative z-10 w-full border-t border-zinc-800/60 mt-auto"
      >
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-500/20 flex items-center justify-center">
              <Cpu size={14} className="text-violet-400" />
            </div>
            <span className="text-sm font-semibold text-zinc-300">
              ScanReact
            </span>
          </div>
          <p className="text-xs text-zinc-500">
            Open&#8209;source static analysis for React codebases.
          </p>
        </div>
      </footer>
    </main>
  );
}