import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

export function AboutPage({ event }: { event: EventData }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="About The Event"
        title="About the Event"
        tagline="Discover the mission, key themes, and global research highlights for this premier international conference."
      />

      {/* Main Content Body Container */}
      <div className="container-wide py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          {event?.description ? (
            <div
              className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg prose-strong:font-bold prose-strong:text-[hsl(var(--foreground))]"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          ) : (
            <p className="text-[hsl(var(--muted-foreground))] text-center py-8 font-medium">No detailed description has been published for this conference yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
