import { useState } from 'react';
import type { EventData } from './layout';

export function ProgramPage({ event }: { event: EventData }) {
  const program = event.program || [];
  const [activeDay, setActiveDay] = useState(1);

  if (program.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No program available for this event yet.</p>
      </div>
    );
  }

  const currentDay = program.find((d) => d.dayNumber === activeDay) || program[0];

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Program</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Conference program</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Explore the schedule, sessions and events</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {program.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDay(day.dayNumber)}
            className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeDay === day.dayNumber
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <span className="block">Day {day.dayNumber}</span>
            {day.title && <span className="block text-xs mt-0.5 opacity-80">{day.title}</span>}
            {day.date && <span className="block text-xs mt-0.5 opacity-60">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
          </button>
        ))}
      </div>

      {currentDay && (
        <div>
          {currentDay.description && (
            <p className="text-[hsl(var(--muted-foreground))] mb-6 italic">{currentDay.description}</p>
          )}
          <div>
            {currentDay.sessions.map((session, idx) => (
              <div key={idx} className="session-item">
                <div className="flex items-start gap-4">
                  <div className="session-time min-w-[90px]">{session.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="session-title">{session.title}</h3>
                      {session.type && <span className="session-badge">{session.type}</span>}
                    </div>
                    {session.description && <p className="mt-1 text-base text-[hsl(var(--muted-foreground))]">{session.description}</p>}
                    <div className="session-meta">
                      {session.speaker && <span>{session.speaker}</span>}
                      {session.track && <span>{session.track}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
