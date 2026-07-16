'use client';

import React from 'react';
import Image from 'next/image';

export interface LoaderProps {
  /**
   * Size of the loader component.
   * 'sm' is ideal for buttons or inline elements.
   * 'md' is suitable for cards and standard containers.
   * 'lg' and 'xl' are perfect for full-page loaders or prominent indicators.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional text or phase description displayed beneath or alongside the loader */
  text?: string;
  /** Additional custom className for the wrapper */
  className?: string;
}

export default function Loader({ size = 'md', text, className = '' }: LoaderProps) {
  // Dimensions and styling based on size
  const sizeConfig = {
    sm: {
      wrapper: 'w-6 h-6',
      logo: 14,
      logoClass: 'w-3.5 h-3.5',
      ringOuter: 'border-[1.5px]',
      ringInner: 'border-[1.5px]',
      glowSize: 'w-5 h-5 blur-sm',
      textSize: 'text-xs mt-1.5 font-medium',
    },
    md: {
      wrapper: 'w-14 h-14',
      logo: 32,
      logoClass: 'w-8 h-8',
      ringOuter: 'border-2',
      ringInner: 'border-2',
      glowSize: 'w-12 h-12 blur-lg',
      textSize: 'text-sm mt-3 font-semibold tracking-wide',
    },
    lg: {
      wrapper: 'w-24 h-24',
      logo: 56,
      logoClass: 'w-14 h-14',
      ringOuter: 'border-[2.5px]',
      ringInner: 'border-[2.5px]',
      glowSize: 'w-20 h-20 blur-xl',
      textSize: 'text-base mt-4 font-semibold tracking-wide',
    },
    xl: {
      wrapper: 'w-32 h-32',
      logo: 72,
      logoClass: 'w-18 h-18',
      ringOuter: 'border-3',
      ringInner: 'border-3',
      glowSize: 'w-28 h-28 blur-2xl',
      textSize: 'text-lg mt-5 font-bold tracking-wide',
    },
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      {/* Animated Logo & Spinning Rings Container */}
      <div className={`relative flex items-center justify-center ${config.wrapper}`}>
        {/* Soft pulsing background glow matching brand colors */}
        <div
          className={`absolute rounded-full bg-gradient-to-tr from-[#74cc00]/30 via-violet-500/20 to-[#74cc00]/30 animate-pulse ${config.glowSize}`}
        />

        {/* Outer Spinning Ring - Clockwise */}
        <div
          className={`absolute inset-0 rounded-full border-transparent border-t-[#74cc00] border-r-violet-500/80 animate-spin-slow ${config.ringOuter}`}
          style={{ boxShadow: '0 0 15px rgba(116, 204, 0, 0.15)' }}
        />

        {/* Inner Spinning Ring - Counter-Clockwise */}
        <div
          className={`absolute inset-[15%] rounded-full border-transparent border-b-violet-400 border-l-[#74cc00]/80 animate-spin-reverse ${config.ringInner}`}
        />

        {/* Central Logo with gentle breathing / pulsing animation */}
        <div className="relative z-10 flex items-center justify-center animate-pulse">
          <Image
            src="/logo.png"
            alt="Loading..."
            width={config.logo}
            height={config.logo}
            priority
            className={`${config.logoClass} object-contain select-none drop-shadow-[0_0_10px_rgba(116,204,0,0.3)]`}
          />
        </div>
      </div>

      {/* Optional Loading Text / Phase Description */}
      {text && (
        <div
          style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          className={`text-center text-zinc-300 animate-pulse ${config.textSize}`}
        >
          {text}
        </div>
      )}
    </div>
  );
}
