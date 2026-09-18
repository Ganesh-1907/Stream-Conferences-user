import { useState } from 'react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

export function ProgramPage({ event }: { event: EventData }) {
  const program = event.program || [];
  const [activeDay, setActiveDay] = useState(1);

  const currentDay = program.find((d) => d.dayNumber === activeDay) || program[0];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="Program Schedule"
        title="Conference Program"
        tagline="Explore the multi-track agenda, keynote lectures, and technical session schedule."
      />

      <div className="container-wide py-10 sm:py-14">
        {program.length === 0 ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No program schedule available for this event yet.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {program.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setActiveDay(day.dayNumber)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activeDay === day.dayNumber
                      ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                      : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  <span className="block font-bold">Day {day.dayNumber}</span>
                  {day.title && <span className="block text-xs mt-0.5 opacity-90">{day.title}</span>}
                  {day.date && <span className="block text-xs mt-0.5 opacity-70">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                </button>
              ))}
            </div>

            {currentDay && (
              <div>
                {currentDay.description && (
                  <p className="text-[hsl(var(--muted-foreground))] mb-6 italic text-base">{currentDay.description}</p>
                )}
                <div className="space-y-4">
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
                            {session.speaker && <span>Speaker: {session.speaker}</span>}
                            {session.location && <span>Location: {session.location}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
