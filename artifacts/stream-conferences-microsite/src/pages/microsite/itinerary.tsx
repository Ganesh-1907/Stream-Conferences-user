import type { EventData } from './layout';

export function ItineraryPage({ event }: { event: EventData }) {
  const itinerary = event.itinerary || [];
  if (itinerary.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No itinerary available for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Itinerary</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Detailed schedule</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">A day-by-day guide to the event</p>
      </div>

      <div>
        {itinerary.map((item, idx) => (
          <div key={idx} className="timeline-item">
            <div className="flex items-center gap-3">
              <span className="session-time">{item.time}</span>
              {item.type && <span className="session-badge">{item.type}</span>}
            </div>
            <h3 className="session-title mt-1">{item.title}</h3>
            {item.description && <p className="mt-1 text-base text-[hsl(var(--muted-foreground))]">{item.description}</p>}
            <div className="session-meta">
              {item.speaker && <span>{item.speaker}</span>}
              {item.track && <span>{item.track}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
