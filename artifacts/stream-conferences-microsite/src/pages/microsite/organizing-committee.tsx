import { MapPin, BookOpen, GraduationCap } from 'lucide-react';
import type { EventData } from './layout';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function OrganizingCommitteePage({ event }: { event: EventData }) {
  const members = event.organizingCommittee || [];

  if (members.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No organizing committee members added yet for this event.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Committee</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Organizing Committee</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Meet the team behind this event</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {member.image ? (
                  <img
                    src={mediaUrl(member.image)}
                    alt={member.name || 'Committee Member'}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-[hsl(var(--muted-foreground))]">
                      {(member.name || 'M').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  {member.name && (
                    <h3 className="text-lg font-bold text-[hsl(var(--foreground))] truncate">{member.name}</h3>
                  )}
                  {member.degree && (
                    <p className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-1 mt-0.5">
                      <GraduationCap size={14} className="shrink-0" />
                      {member.degree}
                    </p>
                  )}
                </div>
              </div>

              {member.specialization && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                  <span className="font-semibold text-[hsl(var(--foreground))]">Specialization:</span> {member.specialization}
                </p>
              )}

              {member.researchArea && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2 flex items-start gap-1.5">
                  <BookOpen size={14} className="shrink-0 mt-0.5" />
                  <span>{member.researchArea}</span>
                </p>
              )}

              {member.country && (
                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" />
                  {member.country}
                </p>
              )}

              {member.biography && (
                <div
                  className="mt-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: member.biography }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
