import type { EventData } from './layout';

export function GuidelinesPage({ event }: { event: EventData }) {
  if (!event.guidelines) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No guidelines available for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Guidelines</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Important guidelines</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Everything participants need to know</p>
      </div>

      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: event.guidelines }} />
    </div>
  );
}
