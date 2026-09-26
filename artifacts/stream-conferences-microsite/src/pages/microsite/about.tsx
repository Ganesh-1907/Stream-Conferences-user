import { Link } from 'wouter';
import { Layers, ChevronRight, ArrowRight } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

export function AboutPage({ event }: { event: EventData }) {
  const tracks = Array.isArray(event?.tracks) ? event.tracks : [];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="About The Event"
        title="About the Event"
        tagline="Discover the mission, key themes, and global research highlights for this premier international conference."
      />

      {/* Main Content Body Container: Tracks floated right so content covers 70% alongside it and 100% full width below it */}
      <div className="container-wide py-8 sm:py-10 w-full">
        {/* Right Floated Sidebar: Tracks List */}
        {tracks.length > 0 && (
          <aside className="w-full lg:w-[35%] xl:w-[36%] lg:max-w-[420px] xl:max-w-[440px] lg:float-right lg:ml-8 lg:mb-6 mb-8">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-2 text-[hsl(var(--primary))] font-extrabold text-base sm:text-lg">
                  <Layers size={20} className="shrink-0" />
                  <span>Conference Tracks</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
                  {tracks.length}
                </span>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {tracks.map((track, idx) => (
                  <Link
                    key={idx}
                    href={`/tracks?track=${idx}`}
                    className="group flex items-center justify-between gap-3 p-3 rounded-xl border border-transparent hover:border-[hsl(var(--primary)/.3)] bg-[hsl(var(--muted)/.5)] hover:bg-[hsl(var(--primary)/.08)] transition-all duration-200 cursor-pointer"
                    title={`View track: ${track.title}`}
                  >
                    <span className="text-sm font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors leading-snug line-clamp-2">
                      {track.title}
                    </span>
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                <Link
                  href="/tracks"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.9)] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <span>View All Tracks</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </aside>
        )}

        {/* About Description Content */}
        {event?.description ? (
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg text-justify prose-strong:font-bold prose-strong:text-[hsl(var(--foreground))]"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        ) : (
          <p className="text-[hsl(var(--muted-foreground))] text-center py-8 font-medium">
            No detailed description has been published for this conference yet.
          </p>
        )}

        <div className="clear-both" />
      </div>
    </div>
  );
}
