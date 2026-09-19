import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

export function GuidelinesPage({ event }: { event: EventData }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="SUBMISSION & EVENT GUIDELINES"
        title="Author & Participant Guidelines"
        tagline="Review submission policies, presentation formats, manuscript structure, and ethics code."
      />

      <div className="container-wide py-10 sm:py-14">
        {!event.guidelines ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No detailed guidelines available for this event yet.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-['Space_Grotesk'] prose-headings:text-[hsl(var(--foreground))] prose-p:text-[hsl(var(--foreground)/0.85)] prose-strong:text-[hsl(var(--foreground))] prose-li:text-[hsl(var(--foreground)/0.85)] font-normal"
              dangerouslySetInnerHTML={{ __html: event.guidelines }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
