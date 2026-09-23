import React from 'react';

export interface MicrositeHeroProps {
  badge: string;
  title: string;
  tagline: string;
}

export function MicrositeHero({ badge, title, tagline }: MicrositeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-white pt-20 pb-10 sm:pt-24 sm:pb-12 md:pt-28 md:pb-12">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/10 opacity-80" />

      {/* Left-Aligned Hero Content */}
      <div className="container-wide relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold uppercase tracking-widest mb-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            <span>{badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-black tracking-tight text-white leading-tight drop-shadow-sm">
            {title}
          </h1>

          {tagline && (
            <p className="mt-2.5 text-base sm:text-lg text-white/95 leading-relaxed pl-4 border-l-2 border-white/40 max-w-2xl font-medium">
              {tagline}
            </p>
          )}
        </div>
      </div>

      {/* Razor-Sharp Organic SVG Wave Curve */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-8 sm:h-10 md:h-12 text-[hsl(var(--background))]"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          fill="currentColor"
          shapeRendering="geometricPrecision"
        >
          <path d="M0,40 C320,145 640,90 960,35 C1160,15 1320,10 1440,20 L1440,160 L0,160 Z"></path>
        </svg>
      </div>
    </section>
  );
}
