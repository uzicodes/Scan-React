import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  animationDelay?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  animationDelay = '',
}: FeatureCardProps) {
  return (
    <div className={`glass-card rounded-2xl p-8 transition-all duration-300 ease-out group cursor-default ${animationDelay}`.trim()}>
      {/* Icon container */}
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-violet-500/15 group-hover:border-violet-500/30 group-hover:shadow-[0_0_16px_rgba(139,92,246,0.15)]">
        <Icon size={22} className="text-violet-400 transition-colors group-hover:text-violet-300" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-zinc-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
