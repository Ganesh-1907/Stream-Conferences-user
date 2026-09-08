import type { EventData } from './layout';

export function AboutPage({ event }: { event: EventData }) {
  if (!event.description) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No description available for this event.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">About</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">About the event</h1>
      </div>
      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))] whitespace-pre-wrap leading-relaxed text-base">
        {event.description}
      </div>
    </div>
  );
}
