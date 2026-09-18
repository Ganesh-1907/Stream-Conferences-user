import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

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
          <div className="space-y-6">
            {tracks.map((track, i) => (
              <div key={i} className="flex gap-4 pb-6 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
                {track.image ? (
                  <img src={mediaUrl(track.image)} alt={track.title} className="w-16 h-16 shrink-0 rounded-xl object-cover border border-[hsl(var(--border))]" />
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-[hsl(var(--primary)/.1)] flex items-center justify-center text-xl font-bold text-[hsl(var(--primary))] font-['Space_Grotesk']">{(i + 1).toString().padStart(2, '0')}</div>
                )}
                <div>
                  <h3 className="font-bold text-xl text-[hsl(var(--foreground))] font-['Space_Grotesk']">{track.title}</h3>
                  {track.description && <p className="mt-1 text-base text-[hsl(var(--muted-foreground))] leading-relaxed">{track.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
