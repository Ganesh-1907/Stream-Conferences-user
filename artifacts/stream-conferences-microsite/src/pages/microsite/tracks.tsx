import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { ExternalLink } from 'lucide-react';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function TracksPage({ event }: { event: EventData }) {
  const tracks = Array.isArray(event.tracks) ? event.tracks : [];

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
          <div className="w-full space-y-6 sm:space-y-8">
            {tracks.map((track, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
                {track.image ? (
                  <img
                    src={mediaUrl(track.image)}
                    alt={track.title}
                    className="w-32 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 shrink-0 rounded-2xl object-cover border border-[hsl(var(--border))] shadow-md bg-[hsl(var(--card))]"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-48 sm:h-36 md:w-56 md:h-40 shrink-0 rounded-2xl bg-[hsl(var(--primary)/.1)] border border-[hsl(var(--primary)/.2)] flex items-center justify-center text-3xl sm:text-5xl font-black text-[hsl(var(--primary))] font-['Space_Grotesk'] shadow-sm">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                )}
                <div className="flex-1 pt-1">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-[hsl(var(--foreground))] font-['Space_Grotesk'] leading-snug">{track.title}</h3>
                  {track.description && (
                    <p className="mt-2 text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">{track.description}</p>
                  )}
                  {Array.isArray(track.referenceLinks) && track.referenceLinks.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {track.referenceLinks.map((link: any, li: number) => (
                        <a
                          key={li}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors shadow-sm"
                        >
                          <ExternalLink size={12} /> {link.label || (link as any).title || link.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
