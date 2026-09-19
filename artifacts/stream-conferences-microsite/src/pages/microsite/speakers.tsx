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
    const hasSocials = Boolean(speaker.linkedin || speaker.twitter || speaker.website);
    const categoryKey = getSpeakerCategoryKey(speaker);
    const categoryConfig = SPEAKER_CATEGORIES.find((c) => c.key === categoryKey) || SPEAKER_CATEGORIES[1];
    const isKeynote = categoryKey === 'keynote';

    return (
      <div
        onClick={() => setSelectedSpeaker(speaker)}
        className="group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-6 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary)/.5)] transition-all duration-300 cursor-pointer overflow-hidden"
      >
        {/* Lanyard Notch / ID Badge Slot */}
        <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--border))] mb-4 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

        {/* Top-Right Category Badge */}
        <div className="absolute top-3.5 right-3.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${categoryConfig.badgeClass} shadow-sm`}>
            {isKeynote && <Award size={12} />}
            {categoryConfig.label}
          </span>
        </div>

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
              {getNameInitials(speaker.name, 'S')}
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
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="KEYNOTE & SPEAKERS"
        title="Meet Our Speakers"
        tagline="Discover the visionary keynote presenters and global researchers driving scientific advancement."
      />
      <div className="container-wide py-10 sm:py-14 space-y-12">
        {/* Keynote Speakers Section */}
        {keynoteSpeakers.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-3 font-['Space_Grotesk']">
              <Award size={22} className="text-amber-500" />
              <span>Keynote Speakers</span>
              <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {keynoteSpeakers.length}
              </span>
            </h3>
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
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] pb-3 font-['Space_Grotesk']">
              <Presentation size={22} className="text-[hsl(var(--primary))]" />
              <span>Speakers</span>
              <span className="ml-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/.2)]">
                {otherSpeakers.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {otherSpeakers.map((speaker, idx) => (
                <SpeakerCard key={speaker.name || idx} speaker={speaker} />
              ))}
            </div>
          </div>
        )}
      </div>

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
                    {getNameInitials(selectedSpeaker.name, 'S')}
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

