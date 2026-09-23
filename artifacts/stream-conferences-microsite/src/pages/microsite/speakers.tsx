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
import { MicrositeHero } from '@/components/microsite-hero';
import { getNameInitials } from '@/lib/utils';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export const SPEAKER_CATEGORIES = [
  { key: 'keynote', label: 'Keynote Speaker', title: 'Keynote Speakers', icon: Award, badgeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' },
  { key: 'speaker', label: 'Speaker', title: 'Speakers', icon: Presentation, badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200/80' },
  { key: 'poster', label: 'Poster Presentation', title: 'Poster Presentations', icon: Presentation, badgeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' },
  { key: 'yrf', label: 'YRF', title: 'YRF (Young Researchers Forum)', icon: Award, badgeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' },
  { key: 'student', label: 'Student', title: 'Student Speakers', icon: GraduationCap, badgeClass: 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white' },
] as const;

export function getSpeakerCategoryKey(speaker: any): string {
  if (speaker?.category) {
    const c = String(speaker.category).toLowerCase().trim();
    if (['keynote', 'speaker', 'poster', 'yrf', 'student'].includes(c)) return c;
  }
  if (speaker?.isKeynote) return 'keynote';
  return 'speaker';
}

export function SpeakersPage({ event }: { event: EventData }) {
  const speakers = event.speakers || [];
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);

  const OTHER_CATEGORY_RANK: Record<string, number> = {
    speaker: 1,
    poster: 2,
    yrf: 3,
    student: 4,
  };

  const keynoteSpeakers = speakers.filter((s) => getSpeakerCategoryKey(s) === 'keynote');
  const otherSpeakers = [...speakers]
    .filter((s) => getSpeakerCategoryKey(s) !== 'keynote')
    .sort((a, b) => {
      const catA = getSpeakerCategoryKey(a);
      const catB = getSpeakerCategoryKey(b);
      const rankA = OTHER_CATEGORY_RANK[catA] ?? 99;
      const rankB = OTHER_CATEGORY_RANK[catB] ?? 99;
      return rankA - rankB;
    });

  if (speakers.length === 0) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <MicrositeHero
          badge="KEYNOTE & SPEAKERS"
          title="Speakers & Presenters"
          tagline="Meet the distinguished lineup of keynote experts, global researchers, and industry leaders."
        />
        <div className="container-wide py-16 text-center">
          <div className="max-w-2xl mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 sm:p-12 shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
              Speakers & Panelists To Be Announced Soon
            </h2>
            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg mx-auto">
              Our distinguished lineup of keynote experts, global researchers, and industry leaders for {event.title} will be announced shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const SpeakerCard = ({ speaker }: { speaker: any }) => {
    const categoryKey = getSpeakerCategoryKey(speaker);
    const categoryConfig = SPEAKER_CATEGORIES.find((c) => c.key === categoryKey) || SPEAKER_CATEGORIES[1];
    const isKeynote = categoryKey === 'keynote';

    return (
      <div
        onClick={() => setSelectedSpeaker(speaker)}
        className="group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-5 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary)/.5)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Lanyard Notch / ID Badge Slot */}
        <div className="w-10 h-1.5 rounded-full bg-[hsl(var(--border))] mb-3 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

        {/* Top-Right Category Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${categoryConfig.badgeClass} shadow-sm`}>
            {isKeynote && <Award size={12} />}
            {categoryConfig.label}
          </span>
        </div>

        {/* Top Center Circular Image */}
        <div className="relative mb-3 w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary)/.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] shadow-md flex items-center justify-center shrink-0">
          {speaker.avatar ? (
            <img
              src={mediaUrl(speaker.avatar)}
              alt={speaker.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-2xl font-['Space_Grotesk'] shadow-inner">
              {getNameInitials(speaker.name, 'S')}
            </div>
          )}
          {isKeynote && (
            <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md border-2 border-[hsl(var(--card))]">
              <Award size={11} />
            </div>
          )}
        </div>

        {/* Speaker Name */}
        <h3 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 w-full px-1">
          {speaker.name}
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
        badge="KEYNOTE & SPEAKERS"
        title="Meet Our Speakers"
        tagline="Discover the visionary keynote presenters and global researchers driving scientific advancement."
      />
      <div className="container-wide pt-6 pb-6 sm:pt-8 sm:pb-8 space-y-10">
        {/* Keynote Speakers Section */}
        {keynoteSpeakers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
              <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))] flex items-center gap-2">
                <Award size={26} className="text-amber-500 shrink-0" />
                Keynote Speakers
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {keynoteSpeakers.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {keynoteSpeakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.name || idx} speaker={speaker} />
              ))}
            </div>
          </div>
        )}

        {/* All Other Speakers & Presenters Section */}
        {otherSpeakers.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
              <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))] flex items-center gap-2">
                <Presentation size={26} className="text-[hsl(var(--secondary))] shrink-0" />
                Speakers
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[hsl(var(--secondary)/.1)] text-[hsl(var(--secondary))] border border-[hsl(var(--secondary)/.2)]">
                {otherSpeakers.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherSpeakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.name || idx} speaker={speaker} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Speaker Details Modal Popup */}
      <Dialog open={Boolean(selectedSpeaker)} onOpenChange={(open) => !open && setSelectedSpeaker(null)}>
        {selectedSpeaker && (() => {
          const categoryKey = getSpeakerCategoryKey(selectedSpeaker);
          const categoryConfig = SPEAKER_CATEGORIES.find((c) => c.key === categoryKey) || SPEAKER_CATEGORIES[1];
          return (
            <DialogContent className="sm:max-w-3xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] p-6 sm:p-8">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedSpeaker.name}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-2">
                {/* Left Column: Circle Avatar & Category Badge Down below */}
                <div className="flex flex-col items-center text-center w-full sm:w-48 shrink-0 gap-3">
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full ring-4 ring-[hsl(var(--primary)/.3)] overflow-hidden shadow-xl bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] flex items-center justify-center shrink-0">
                    {selectedSpeaker.avatar ? (
                      <img
                        src={mediaUrl(selectedSpeaker.avatar)}
                        alt={selectedSpeaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white font-bold text-4xl font-['Space_Grotesk']">
                        {getNameInitials(selectedSpeaker.name, 'S')}
                      </div>
                    )}
                  </div>

                  {/* Category Badge Down to Profile Image */}
                  <div className="pt-1">
                    <span className={`inline-block text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full ${categoryConfig.badgeClass} shadow-xs`}>
                      {categoryConfig.label}
                    </span>
                  </div>
                </div>

                {/* Right Column: Key : Value Format List */}
                <div className="flex-1 w-full space-y-3.5 text-left">
                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Name :</span>
                    <span className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] font-['Space_Grotesk']">{selectedSpeaker.name}</span>
                  </div>

                  {/* Category */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                    <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Category :</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">{categoryConfig.label}</span>
                  </div>

                  {selectedSpeaker.designation && selectedSpeaker.designation.toLowerCase() !== categoryConfig.label.toLowerCase() && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Designation :</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">{selectedSpeaker.designation}</span>
                    </div>
                  )}

                  {selectedSpeaker.degree && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Degree :</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">{selectedSpeaker.degree}</span>
                    </div>
                  )}

                  {selectedSpeaker.organization && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Organization :</span>
                      <span className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                        <Building2 size={14} className="text-[hsl(var(--primary))]" />
                        {selectedSpeaker.organization}
                      </span>
                    </div>
                  )}

                  {selectedSpeaker.topic && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Topic :</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">{selectedSpeaker.topic}</span>
                    </div>
                  )}

                  {selectedSpeaker.bio && (
                    <div className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 text-sm pt-1">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Biography :</span>
                      <div className="flex-1 text-sm text-[hsl(var(--foreground))] leading-relaxed text-justify">
                        {selectedSpeaker.bio}
                      </div>
                    </div>
                  )}

                  {(selectedSpeaker.linkedin || selectedSpeaker.twitter || selectedSpeaker.website) && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm pt-2">
                      <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Socials :</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedSpeaker.linkedin && (
                          <a
                            href={selectedSpeaker.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Linkedin size={12} /> LinkedIn
                          </a>
                        )}
                        {selectedSpeaker.twitter && (
                          <a
                            href={selectedSpeaker.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Twitter size={12} /> Twitter
                          </a>
                        )}
                        {selectedSpeaker.website && (
                          <a
                            href={selectedSpeaker.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white transition-all inline-flex items-center gap-1 text-xs font-semibold"
                          >
                            <Globe size={12} /> Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}

