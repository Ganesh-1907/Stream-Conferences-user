import { useState, useEffect } from 'react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { ExternalLink, ArrowRight, ArrowLeft } from 'lucide-react';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function TracksPage({ event }: { event: EventData }) {
  const tracks = Array.isArray(event.tracks) ? event.tracks : [];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackParam = params.get('track');
    if (trackParam !== null) {
      const idx = parseInt(trackParam, 10);
      if (!isNaN(idx) && idx >= 0 && idx < tracks.length) {
        setSelectedIndex(idx);
      }
    }
  }, [tracks.length]);

  const handleSelectTrack = (index: number) => {
    setSelectedIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a track is selected, render the dedicated Track Details View
  if (selectedIndex !== null && tracks[selectedIndex]) {
    const track = tracks[selectedIndex];
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        {/* Top Hero Banner with Track Name as Headline */}
        <MicrositeHero
          badge={`TRACK 0${selectedIndex + 1}`}
          title={track.title}
          tagline={`Official scientific scope, research topics, and presentation guidelines for ${event.title || 'this conference'}.`}
        />

        <div className="container-wide pt-4 sm:pt-6 pb-12 sm:pb-16 space-y-12 sm:space-y-16">
          {/* Header Row: Back Button on Left & Centered Track Image starting on the same line */}
          <div className="relative w-full flex flex-col md:flex-row items-start justify-center gap-6">
            <div className="md:absolute md:left-0 md:top-0 z-10">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] font-semibold text-sm text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] transition shadow-xs cursor-pointer"
              >
                <ArrowLeft size={16} /> Back to All Tracks
              </button>
            </div>

            {track.image && (
              <div className="w-full max-w-2xl sm:max-w-3xl rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 shadow-md flex items-center justify-center">
                <img
                  src={mediaUrl(track.image)}
                  alt={track.title}
                  className="max-h-56 sm:max-h-64 md:max-h-72 w-auto max-w-full rounded-xl object-contain"
                />
              </div>
            )}
          </div>

          {/* Down Content / Description */}
          <div className="card-lift rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 sm:p-12 shadow-sm space-y-6">
            <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))] border-b border-[hsl(var(--border))] pb-4">
              Track Overview & Research Topics
            </h3>
            {track.description ? (
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg text-justify"
                dangerouslySetInnerHTML={{ __html: track.description }}
              />
            ) : (
              <p className="text-[hsl(var(--muted-foreground))] opacity-75">No description provided for this track.</p>
            )}
          </div>

          {/* Last Links / Reference Links */}
          {Array.isArray(track.referenceLinks) && track.referenceLinks.length > 0 && (
            <div className="card-lift rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-4">
              <h4 className="text-base font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                Track Resources & Reference Links
              </h4>
              <div className="flex flex-wrap gap-3 pt-2">
                {track.referenceLinks.map((link: any, li: number) => (
                  <a
                    key={li}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary)/.1)] border border-[hsl(var(--primary)/.25)] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition shadow-xs"
                  >
                    <ExternalLink size={15} /> {link.label || (link as any).title || link.url}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Tracks List Page View (Horizontal image left, content right layout as in screenshot 2)
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="SCIENTIFIC TRACKS"
        title="Conference Tracks"
        tagline="Explore the thematic tracks, session domains, and interdisciplinary research areas."
      />

      <div className="container-wide py-10 sm:py-14">
        {tracks.length === 0 ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No tracks available for this event yet.</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {tracks.map((track, i) => (
              <div key={i} className="card-lift flex flex-col sm:flex-row items-start gap-6 sm:gap-8 p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs">
                {/* Left Side: Track Image or Number Badge */}
                {track.image ? (
                  <img
                    src={mediaUrl(track.image)}
                    alt={track.title}
                    className="w-full sm:w-56 md:w-64 h-44 sm:h-44 md:h-48 shrink-0 rounded-2xl object-cover border border-[hsl(var(--border))] shadow-md bg-[hsl(var(--card))]"
                  />
                ) : (
                  <div className="w-full sm:w-56 md:w-64 h-44 sm:h-44 md:h-48 shrink-0 rounded-2xl bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.18)] flex items-center justify-center text-4xl sm:text-5xl font-black text-[hsl(var(--primary))] font-['Space_Grotesk'] shadow-sm">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                )}

                {/* Right Side: Title, Clamped Description, Read More Button & Links */}
                <div className="flex-1 pt-1 space-y-3">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-[hsl(var(--foreground))] font-['Space_Grotesk'] leading-snug">
                    {track.title}
                  </h3>
                  {track.description && (
                    <div
                      className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3 text-justify"
                      dangerouslySetInnerHTML={{ __html: track.description }}
                    />
                  )}

                  <div className="pt-2 flex items-center gap-4 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(i)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                      Read More <ArrowRight size={14} />
                    </button>

                    {Array.isArray(track.referenceLinks) && track.referenceLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {track.referenceLinks.map((link: any, li: number) => (
                          <a
                            key={li}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors shadow-xs"
                          >
                            <ExternalLink size={12} /> {link.label || (link as any).title || link.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
