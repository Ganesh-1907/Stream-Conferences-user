import { useState } from 'react';
import {
  Award,
  Presentation,
  Globe,
  Linkedin,
  Twitter,
  GraduationCap,
  Building2,
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

export function SpeakersPage({ event }: { event: EventData }) {
  const speakers = event.speakers || [];
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);

  if (speakers.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No speakers announced yet for this event.</p>
      </div>
    );
  }

  const keynoteSpeakers = speakers.filter((s) => s.isKeynote);
  const otherSpeakers = speakers.filter((s) => !s.isKeynote);

  const SpeakerCard = ({ speaker, isKeynote = false }: { speaker: any; isKeynote?: boolean }) => {
    const hasSocials = Boolean(speaker.linkedin || speaker.twitter || speaker.website);

    return (
      <div
        onClick={() => setSelectedSpeaker(speaker)}
        className="group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-6 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary)/.5)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Lanyard Notch / ID Badge Slot */}
        <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--border))] mb-4 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

        {/* Top-Right Keynote Badge */}
        {isKeynote && (
          <div className="absolute top-3.5 right-3.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              <Award size={12} /> Keynote
            </span>
          </div>
        )}

        {/* Top Center Circular Image */}
        <div className="relative mb-4 w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary)/.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] shadow-md flex items-center justify-center shrink-0">
          {speaker.avatar ? (
            <img
              src={mediaUrl(speaker.avatar)}
              alt={speaker.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-3xl font-['Space_Grotesk'] shadow-inner">
              {(speaker.name || 'S').charAt(0).toUpperCase()}
            </div>
          )}
          {isKeynote && (
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md border-2 border-[hsl(var(--card))]">
              <Award size={13} />
            </div>
          )}
        </div>

        {/* Speaker Name */}
        <h3 className="font-['Space_Grotesk'] font-bold text-lg sm:text-xl text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 w-full px-1">
          {speaker.name}
        </h3>

        {/* Degree */}
        {speaker.degree && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--primary))] uppercase tracking-wider bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 rounded-full">
              <GraduationCap size={12} />
              {speaker.degree}
            </span>
          </div>
        )}

        {/* Designation */}
        {speaker.designation && (
          <p className="text-sm font-semibold text-[hsl(var(--primary))] mt-1 line-clamp-1 w-full px-1">
            {speaker.designation}
          </p>
        )}

        {/* Organization */}
        {speaker.organization && (
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center justify-center gap-1.5 line-clamp-1 w-full px-1">
            <Building2 size={12} className="shrink-0 opacity-70" />
            <span>{speaker.organization}</span>
          </p>
        )}

        {/* Topic Pill */}
        {speaker.topic && (
          <div className="mt-3 w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))] text-xs font-medium max-w-full">
              <Presentation size={12} className="shrink-0" />
              <span className="truncate">{speaker.topic}</span>
            </span>
          </div>
        )}

        {/* Bio Excerpt */}
        {speaker.bio && (
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-relaxed px-1">
            {speaker.bio}
          </p>
        )}

        {/* Footer / Socials */}
        <div className="mt-auto pt-4 w-full flex items-center justify-between border-t border-[hsl(var(--border)/.6)] text-xs">
          <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1">
            View Profile <ExternalLink size={11} className="opacity-70" />
          </span>
          {hasSocials && (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {speaker.linkedin && (
                <a
                  href={speaker.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md flex items-center justify-center bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={13} />
                </a>
              )}
              {speaker.twitter && (
                <a
                  href={speaker.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md flex items-center justify-center bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
                  title="Twitter"
                >
                  <Twitter size={13} />
                </a>
              )}
              {speaker.website && (
                <a
                  href={speaker.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-md flex items-center justify-center bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all"
                  title="Website"
                >
                  <Globe size={13} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Decorative ID bottom stripe */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.4)] to-transparent absolute bottom-0 left-0" />
      </div>
    );
  };

  return (
    <div className="container-wide py-12">
      <div className="mb-10">
        <span className="section-eyebrow">Speakers</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
          Meet our speakers
        </h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">
          Esteemed speakers and keynote presenters
        </p>
      </div>

      {keynoteSpeakers.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[hsl(var(--foreground))]">
            <Award size={20} className="text-amber-500" />
            Keynote Speakers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {keynoteSpeakers.map((speaker, idx) => (
              <SpeakerCard key={speaker.name || idx} speaker={speaker} isKeynote />
            ))}
          </div>
        </div>
      )}

      {otherSpeakers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-6 text-[hsl(var(--foreground))]">Speakers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherSpeakers.map((speaker, idx) => (
              <SpeakerCard key={speaker.name || idx} speaker={speaker} />
            ))}
          </div>
        </div>
      )}

      {/* Speaker Details Modal */}
      <Dialog open={Boolean(selectedSpeaker)} onOpenChange={(open) => !open && setSelectedSpeaker(null)}>
        {selectedSpeaker && (
          <DialogContent className="sm:max-w-md bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] p-6">
            <DialogHeader className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-24 h-24 rounded-full ring-4 ring-[hsl(var(--primary)/.3)] overflow-hidden shadow-lg bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] flex items-center justify-center">
                {selectedSpeaker.avatar ? (
                  <img
                    src={mediaUrl(selectedSpeaker.avatar)}
                    alt={selectedSpeaker.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-2xl font-['Space_Grotesk']">
                    {(selectedSpeaker.name || 'S').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
                  {selectedSpeaker.name}
                </DialogTitle>
                {selectedSpeaker.degree && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-wider bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 rounded-full mt-1.5">
                    <GraduationCap size={13} />
                    {selectedSpeaker.degree}
                  </span>
                )}
                {selectedSpeaker.designation && (
                  <p className="text-sm font-semibold text-[hsl(var(--primary))] mt-1">
                    {selectedSpeaker.designation}
                  </p>
                )}
                {selectedSpeaker.organization && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center justify-center gap-1.5">
                    <Building2 size={13} className="opacity-70" />
                    <span>{selectedSpeaker.organization}</span>
                  </p>
                )}
              </div>
            </DialogHeader>

            {selectedSpeaker.topic && (
              <div className="mt-2 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))] text-xs font-medium">
                  <Presentation size={13} />
                  <span>Topic: {selectedSpeaker.topic}</span>
                </span>
              </div>
            )}

            {selectedSpeaker.bio && (
              <div className="mt-4 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed text-center px-2">
                {selectedSpeaker.bio}
              </div>
            )}

            {(selectedSpeaker.linkedin || selectedSpeaker.twitter || selectedSpeaker.website) && (
              <div className="mt-5 pt-4 flex items-center justify-center gap-3 border-t border-[hsl(var(--border)/.6)]">
                {selectedSpeaker.linkedin && (
                  <a
                    href={selectedSpeaker.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Linkedin size={15} /> LinkedIn
                  </a>
                )}
                {selectedSpeaker.twitter && (
                  <a
                    href={selectedSpeaker.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Twitter size={15} /> Twitter
                  </a>
                )}
                {selectedSpeaker.website && (
                  <a
                    href={selectedSpeaker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Globe size={15} /> Website
                  </a>
                )}
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

