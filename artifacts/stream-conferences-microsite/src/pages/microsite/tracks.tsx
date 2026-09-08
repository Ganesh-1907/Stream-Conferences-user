import type { EventData } from './layout';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function TracksPage({ event }: { event: EventData }) {
  const tracks = Array.isArray(event.tracks) ? event.tracks : [];
  if (tracks.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No tracks available for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Themes</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Conference tracks</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">The thematic tracks to explore</p>
      </div>

      <div className="space-y-6">
        {tracks.map((track, i) => (
          <div key={i} className="flex gap-4 pb-6 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
            {track.image ? (
              <img src={mediaUrl(track.image)} alt={track.title} className="w-16 h-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-xl bg-[hsl(var(--primary) / .1)] flex items-center justify-center text-xl font-bold text-[hsl(var(--primary))]">{(i + 1).toString().padStart(2, '0')}</div>
            )}
            <div>
              <h3 className="font-bold text-xl text-[hsl(var(--foreground))]">{track.title}</h3>
              {track.description && <p className="mt-1 text-base text-[hsl(var(--muted-foreground))] leading-relaxed">{track.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
