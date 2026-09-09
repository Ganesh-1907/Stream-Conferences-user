import { useState } from 'react';
import {
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  ExternalLink,
} from 'lucide-react';
import type { EventData } from './layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function OrganizingCommitteePage({ event }: { event: EventData }) {
  const members = event.organizingCommittee || [];
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  if (members.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No organizing committee members added yet for this event.</p>
      </div>
    );
  }

  const isKeyMember = (m: any) => Boolean(
    m.isKey || m.isKeynote || m.isChair ||
    m.role?.toLowerCase().includes('chair') ||
    m.role?.toLowerCase().includes('key') ||
    m.role?.toLowerCase().includes('lead') ||
    m.specialization?.toLowerCase().includes('chair')
  );

  const keyMembers = members.filter(isKeyMember);
  const otherMembers = members.filter((m) => !isKeyMember(m));

  const CommitteeCard = ({ member, isKey = false }: { member: any; isKey?: boolean }) => {
    return (
      <div
        onClick={() => setSelectedMember(member)}
        className="group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-6 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary)/.5)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Lanyard Notch / ID Badge Slot */}
        <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--border))] mb-4 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

        {/* Top-Right Key/Chair Badge */}
        {isKey && (
          <div className="absolute top-3.5 right-3.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              <Award size={12} /> {member.role || 'Chair'}
            </span>
          </div>
        )}

        {/* Top Center Circular Image */}
        <div className="relative mb-4 w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary)/.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] shadow-md flex items-center justify-center shrink-0">
          {member.image ? (
            <img
              src={mediaUrl(member.image)}
              alt={member.name || 'Committee Member'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-3xl font-['Space_Grotesk'] shadow-inner">
              {(member.name || 'M').charAt(0).toUpperCase()}
            </div>
          )}
          {isKey && (
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md border-2 border-[hsl(var(--card))]">
              <Award size={13} />
            </div>
          )}
        </div>

        {/* Member Name */}
        <h3 className="font-['Space_Grotesk'] font-bold text-lg sm:text-xl text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 w-full px-1">
          {member.name}
        </h3>

        {/* Degree */}
        {member.degree && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--primary))] uppercase tracking-wider bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 rounded-full">
              <GraduationCap size={12} />
              {member.degree}
            </span>
          </div>
        )}

        {/* Specialization */}
        {member.specialization && (
          <p className="text-sm font-semibold text-[hsl(var(--primary))] mt-1.5 line-clamp-1 w-full px-1">
            {member.specialization}
          </p>
        )}

        {/* Research Area Pill */}
        {member.researchArea && (
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))] text-xs font-medium max-w-full">
              <BookOpen size={12} className="shrink-0" />
              <span className="truncate">{member.researchArea}</span>
            </span>
          </div>
        )}

        {/* Country */}
        {member.country && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 flex items-center justify-center gap-1.5 line-clamp-1 w-full px-1">
            <MapPin size={12} className="shrink-0 opacity-70" />
            <span>{member.country}</span>
          </p>
        )}

        {/* Biography Excerpt */}
        {member.biography && (
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed px-1">
            {member.biography.replace(/<[^>]*>/g, '')}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 w-full flex items-center justify-center border-t border-[hsl(var(--border)/.6)] text-xs">
          <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1">
            View Profile <ExternalLink size={11} className="opacity-70" />
          </span>
        </div>

        {/* Decorative ID bottom stripe */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.4)] to-transparent absolute bottom-0 left-0" />
      </div>
    );
  };

  return (
    <div className="container-wide py-12">
      <div className="mb-10">
        <span className="section-eyebrow">Committee</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
          Organizing Committee
        </h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">
          Meet the team behind this event
        </p>
      </div>

      {keyMembers.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[hsl(var(--foreground))]">
            <Award size={20} className="text-amber-500" />
            Committee Chairs & Key Leaders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {keyMembers.map((member, idx) => (
              <CommitteeCard key={member.name || idx} member={member} isKey />
            ))}
          </div>
        </div>
      )}

      {otherMembers.length > 0 && (
        <div>
          {keyMembers.length > 0 && (
            <h3 className="text-xl font-bold mb-6 text-[hsl(var(--foreground))]">
              Committee Members
            </h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherMembers.map((member, idx) => (
              <CommitteeCard key={member.name || idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      <Dialog open={Boolean(selectedMember)} onOpenChange={(open) => !open && setSelectedMember(null)}>
        {selectedMember && (
          <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] p-6">
            <DialogHeader className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-24 h-24 rounded-full ring-4 ring-[hsl(var(--primary)/.3)] overflow-hidden shadow-lg bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] flex items-center justify-center">
                {selectedMember.image ? (
                  <img
                    src={mediaUrl(selectedMember.image)}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-2xl font-['Space_Grotesk']">
                    {(selectedMember.name || 'M').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
                  {selectedMember.name}
                </DialogTitle>
                {selectedMember.degree && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 rounded-full mt-1.5">
                    <GraduationCap size={13} />
                    {selectedMember.degree}
                  </span>
                )}
                {selectedMember.specialization && (
                  <p className="text-sm font-semibold text-[hsl(var(--primary))] mt-1">
                    {selectedMember.specialization}
                  </p>
                )}
                {selectedMember.country && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center justify-center gap-1.5">
                    <MapPin size={13} className="opacity-70" />
                    <span>{selectedMember.country}</span>
                  </p>
                )}
              </div>
            </DialogHeader>

            {selectedMember.researchArea && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))] text-xs font-medium">
                  <BookOpen size={13} />
                  <span>Research: {selectedMember.researchArea}</span>
                </span>
              </div>
            )}

            {selectedMember.biography && (
              <div
                className="mt-4 text-xs text-[hsl(var(--foreground)/0.85)] leading-relaxed text-center px-2 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedMember.biography }}
              />
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
