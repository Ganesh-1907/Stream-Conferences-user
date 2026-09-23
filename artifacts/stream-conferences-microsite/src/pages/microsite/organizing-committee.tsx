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
import { getNameInitials } from '@/lib/utils';

import { MicrositeHero } from '@/components/microsite-hero';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function OrganizingCommitteePage({ event }: { event: EventData }) {
  const members = event.organizingCommittee || [];
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  if (members.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <MicrositeHero
          badge="ORGANIZING COMMITTEE"
          title="Organizing Committee"
          tagline="Meet the distinguished academic chairs, organizers, and advisory board."
        />
        <div className="container-wide py-16 text-center">
          <p className="text-[hsl(var(--muted-foreground))] font-medium">No organizing committee members added yet for this event.</p>
        </div>
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
        className="card-lift group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-5 shadow-sm cursor-pointer overflow-hidden"
      >
        {/* Lanyard Notch / ID Badge Slot */}
        <div className="w-10 h-1.5 rounded-full bg-[hsl(var(--border))] mb-3 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

        {/* Top-Right Key/Chair Badge */}
        {isKey && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              <Award size={12} /> {member.role || 'Chair'}
            </span>
          </div>
        )}

        {/* Top Center Circular Image */}
        <div className="relative mb-3 w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary)/.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] shadow-md flex items-center justify-center shrink-0">
          {member.image ? (
            <img
              src={mediaUrl(member.image)}
              alt={member.name || 'Committee Member'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-2xl font-['Space_Grotesk'] shadow-inner">
              {getNameInitials(member.name, 'M')}
            </div>
          )}
          {isKey && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md border-2 border-[hsl(var(--card))]">
              <Award size={11} />
            </div>
          )}
        </div>

        {/* Member Name */}
        <h3 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 w-full px-1">
          {member.name}
        </h3>

        {/* View Profile Button */}
        <div className="mt-3 pt-3 w-full flex items-center justify-center border-t border-[hsl(var(--border)/.6)] text-xs">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] font-semibold text-xs group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all shadow-xs">
            View Profile <ExternalLink size={12} />
          </span>
        </div>

        {/* Decorative ID bottom stripe */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.4)] to-transparent absolute bottom-0 left-0" />
      </div>
    );
  };

  return (
    <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="ORGANIZING COMMITTEE"
        title="Organizing Committee"
        tagline="Meet the distinguished academic chairs, conference leads, and scientific committee members."
      />
      <div className="container-wide pt-6 pb-6 sm:pt-8 sm:pb-8">

      {keyMembers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b border-[hsl(var(--border))] pb-3">
            <Award size={26} className="text-amber-500 shrink-0" />
            <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
              Committee Chairs & Key Leaders
            </h3>
          </div>
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
            <div className="border-b border-[hsl(var(--border))] pb-3 mb-6">
              <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
                Committee Members
              </h3>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherMembers.map((member, idx) => (
              <CommitteeCard key={member.name || idx} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Member Details Modal Popup */}
      <Dialog open={Boolean(selectedMember)} onOpenChange={(open) => !open && setSelectedMember(null)}>
        {selectedMember && (
          <DialogContent className="sm:max-w-3xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] p-6 sm:p-8">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedMember.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-2">
              {/* Left Column: Circle Profile Image + Specialization Down below */}
              <div className="flex flex-col items-center text-center w-full sm:w-48 shrink-0 gap-3">
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-[hsl(var(--primary)/.3)] overflow-hidden shadow-xl bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] flex items-center justify-center shrink-0">
                  {selectedMember.image ? (
                    <img
                      src={mediaUrl(selectedMember.image)}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-4xl font-['Space_Grotesk']">
                      {getNameInitials(selectedMember.name, 'M')}
                    </div>
                  )}
                </div>

                {/* Specialization Down to Profile Image */}
                {selectedMember.specialization && (
                  <div className="pt-1">
                    <span className="inline-block text-xs sm:text-sm font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.2)] px-3 py-1 rounded-full">
                      {selectedMember.specialization}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: All Content formatted as Key : Value */}
              <div className="flex-1 w-full space-y-3.5 text-left">
                {/* Name as Key : Value */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                  <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Name :</span>
                  <span className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] font-['Space_Grotesk']">{selectedMember.name}</span>
                </div>

                {selectedMember.role && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Role :</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">{selectedMember.role}</span>
                  </div>
                )}

                {selectedMember.degree && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Degree :</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">{selectedMember.degree}</span>
                  </div>
                )}

                {selectedMember.country && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Country :</span>
                    <span className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                      <MapPin size={14} className="text-[hsl(var(--primary))]" />
                      {selectedMember.country}
                    </span>
                  </div>
                )}

                {selectedMember.researchArea && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Research Area :</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">{selectedMember.researchArea}</span>
                  </div>
                )}

                {selectedMember.biography && (
                  <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 text-sm pt-1">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Biography :</span>
                    <div
                      className="flex-1 text-sm text-[hsl(var(--foreground))] leading-relaxed prose prose-sm dark:prose-invert max-w-none text-justify"
                      dangerouslySetInnerHTML={{ __html: selectedMember.biography }}
                    />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  </div>
  );
}
