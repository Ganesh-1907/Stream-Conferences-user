import type { EventData } from './layout';
import { BookOpen } from 'lucide-react';
import { MicrositeHero } from '@/components/microsite-hero';

function stripHtmlTags(html?: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

export function AboutPage({ event }: { event: EventData }) {
  const rawSubtext = (event as any)?.shortDescription || stripHtmlTags(event?.description);
  const subtext = rawSubtext
    ? (rawSubtext.length > 200 ? `${rawSubtext.slice(0, 197)}...` : rawSubtext)
    : "Discover the mission, key themes, and global research highlights for this premier international conference.";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="About The Event"
        title="About the Event"
        tagline={subtext}
      />

      {/* Main Content Body Container */}
      <div className="container-wide py-10 sm:py-14">
        <div className="max-w-4xl">
          {event?.description ? (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[hsl(var(--border))]">
                <BookOpen className="text-[hsl(var(--primary))] h-6 w-6 shrink-0" />
                <h2 className="text-2xl sm:text-3xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">Overview & Scope</h2>
              </div>
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg prose-strong:font-bold prose-strong:text-[hsl(var(--foreground))]"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          ) : (
            <p className="text-[hsl(var(--muted-foreground))] text-center py-8 font-medium">No detailed description has been published for this conference yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
