import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays, Clock3, MapPin, Download, Users, ArrowUpRight, ArrowRight, FileText,
  Timer, Award, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown,
  Calendar, Megaphone, FileEdit, ListOrdered, Sparkles, Layers,
  GraduationCap, Building2, Presentation, ExternalLink, Linkedin, Twitter, Globe
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

function formatDateRange(event: EventData): string {
  const start = event.startDate || event.eventDate;
  if (!start) return event.day && event.month ? `${event.month} ${event.day}` : '';
  const startD = new Date(start);
  const end = event.endDate ? new Date(event.endDate) : null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (end && end.getTime() !== startD.getTime()) {
    return `${startD.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }
  return startD.toLocaleDateString(undefined, opts);
}

function useCountdown(targetDate: string | Date | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
    secs: Math.floor((diff % 60_000) / 1_000),
    expired: false,
  };
}

function createCalendarReminder(event: EventData) {
  const title = encodeURIComponent(event.title || 'Conference');
  const details = encodeURIComponent(event.description || event.theme || '');
  const location = encodeURIComponent(event.venue || event.location || '');
  const startD = event.startDate || event.eventDate;
  const start = startD ? new Date(startD).toISOString().replace(/-|:|\.\d+/g, '') : '';
  const end = event.endDate ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '') : start;
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  window.open(googleUrl, '_blank');
}

function HeaderBannerCarousel({ banners, title, location }: { banners: string[]; title: string; location: string }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  if (banners.length === 0) return null;

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full aspect-[1500/500] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-[hsl(var(--border))] group bg-black/5">
        {banners.map((imgUrl, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={imgUrl}
              alt={`${title} banner ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Subtle Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* Top Right Location Caption (Matching screenshot) */}
            {location && (
              <div className="absolute top-3 right-4 px-3 py-1 rounded-md bg-black/40 backdrop-blur-sm text-white text-xs md:text-sm font-semibold tracking-wide">
                {location}
              </div>
            )}

            {/* Bottom Left Title Caption (Matching screenshot) */}
            {title && (
              <div className="absolute bottom-3 left-4 px-3 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs md:text-sm font-bold uppercase tracking-wider line-clamp-1 max-w-[80%]">
                {title}
              </div>
            )}
          </div>
        ))}

        {/* Carousel Prev/Next Buttons */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((prev) => (prev + 1) % banners.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition opacity-0 group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots (Matching screenshot) */}
      {banners.length > 1 && (
        <div className="flex items-center gap-2 mt-3">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-3 h-3 bg-[#65a30d]'
                  : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomePage({ event }: { event: EventData }) {
  const startDate = event.startDate || event.eventDate;
  const fees = Array.isArray(event.fees) ? event.fees : [];
  const speakersCount = Array.isArray(event.speakers) ? event.speakers.length : 0;
  const programDays = Array.isArray(event.program) ? event.program.length : 0;

  const isExpired = startDate ? new Date(startDate).getTime() < Date.now() : false;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);

  const featuredSpeakers = useMemo(() => {
    const list = Array.isArray(event.speakers) ? [...event.speakers] : [];
    list.sort((a, b) => (b.isKeynote ? 1 : 0) - (a.isKeynote ? 1 : 0));
    return list.slice(0, 4);
  }, [event.speakers]);

  const faqs = useMemo(() => {
    return Array.isArray(event.faqs) ? [...event.faqs].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  }, [event.faqs]);

  const headerBanners = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(event.headerBanners) && event.headerBanners.length > 0) {
      list.push(...event.headerBanners.map((u) => mediaUrl(u)));
    }
    if (event.bannerUrl && !event.bannerUrl.endsWith('.pdf')) {
      const bUrl = mediaUrl(event.bannerUrl);
      if (!list.includes(bUrl)) list.push(bUrl);
    }
    return list;
  }, [event.headerBanners, event.bannerUrl]);

  interface QuickLinkItem {
    title: string;
    icon: any;
    href: string;
    isExternal?: boolean;
    hasNew?: boolean;
  }

  const quickLinks: QuickLinkItem[] = [
    {
      title: 'Tracks',
      icon: Layers,
      href: '/tracks',
    },
    {
      title: 'Fees',
      icon: FileEdit,
      href: '/fees',
    },
    {
      title: 'Committee',
      icon: Users,
      href: '/organizing-committee',
    },
    {
      title: 'Venue',
      icon: MapPin,
      href: '/venue',
    },
    {
      title: 'Brochure',
      icon: Download,
      href: '/brochure',
    },
  ];

  const heroImage = headerBanners[0] || (event.bannerUrl && !event.bannerUrl.endsWith('.pdf') ? mediaUrl(event.bannerUrl) : '') || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

  return (
    <>
      {/* Event Banner & Hero Header (Configurable Event Microsite Hero) */}
      <section className="relative w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] py-8 md:py-12 border-b border-[hsl(var(--border))]">
        <div className="container-wide space-y-8">
          {/* Header Banners Carousel (Dynamic from Backend) */}
          {headerBanners.length > 0 && (
            <HeaderBannerCarousel
              banners={headerBanners}
              title={event.title}
              location={event.venue || event.location || ''}
            />
          )}

          {/* Event Content Header Card */}
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-10 shadow-xl space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Type Badge & Cohort */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--primary)/.15)] text-[hsl(var(--primary))] text-xs font-bold uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))] animate-pulse" />
                  {event.eventType === 'conference' ? 'Annual Scientific Summit' : 'Live Webinar Series'}
                </span>
                {event.activeCohort && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] text-xs font-semibold">
                    {event.activeCohort.isCurrent ? 'Current Cohort' : 'Cohort'} · {event.activeCohort.label || `${event.activeCohort.year} Batch ${event.activeCohort.batchNo}`}
                  </span>
                )}
              </div>

              {/* Countdown Timer */}
              {(() => {
                const cd = useCountdown(startDate);
                if (!cd) return null;
                return (
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      <Timer size={14} className="text-[hsl(var(--secondary))]" />
                      {cd.expired ? 'Event Live' : 'Happening In:'}
                    </span>
                    {!cd.expired && (
                      <div className="flex gap-1.5">
                        {[
                          { v: cd.days, l: 'D' },
                          { v: cd.hours, l: 'H' },
                          { v: cd.mins, l: 'M' },
                          { v: cd.secs, l: 'S' },
                        ].map((s) => (
                          <div key={s.l} className="flex flex-col items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] px-2.5 py-1 min-w-[42px]">
                            <span className="text-sm font-bold tabular-nums text-[hsl(var(--foreground))] leading-tight">{String(s.v).padStart(2, '0')}</span>
                            <span className="text-[9px] uppercase font-mono text-[hsl(var(--muted-foreground))]">{s.l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Main Title & Theme */}
            <div className="space-y-4">
              <h1 className="display text-3xl sm:text-5xl font-black leading-tight text-[hsl(var(--foreground))]">
                {event.title}
              </h1>
              {(event.theme || event.description) && (
                <p className="text-base sm:text-lg leading-relaxed text-[hsl(var(--muted-foreground))] max-w-3xl">
                  {event.theme || event.description}
                </p>
              )}
            </div>

            {/* Event Details Meta Pill Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] pt-2 border-t border-[hsl(var(--border))]">
              {formatDateRange(event) && (
                <span className="inline-flex items-center gap-2 bg-[hsl(var(--muted)/.5)] px-3.5 py-2 rounded-xl border border-[hsl(var(--border))]">
                  <CalendarDays size={16} className="text-[hsl(var(--secondary))]" />
                  {formatDateRange(event)}
                </span>
              )}
              {(event.startTime || event.endTime) && (
                <span className="inline-flex items-center gap-2 bg-[hsl(var(--muted)/.5)] px-3.5 py-2 rounded-xl border border-[hsl(var(--border))]">
                  <Clock3 size={16} className="text-[hsl(var(--secondary))]" />
                  {event.startTime || '—'} – {event.endTime || '—'}
                </span>
              )}
              {(event.venue || event.location) && (
                <span className="inline-flex items-center gap-2 bg-[hsl(var(--muted)/.5)] px-3.5 py-2 rounded-xl border border-[hsl(var(--border))]">
                  <MapPin size={16} className="text-[hsl(var(--secondary))]" />
                  {event.venue || event.location}
                </span>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/register"
                className="btn-main btn-primary px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider"
              >
                <span>REGISTER NOW</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/submit-abstract"
                className="btn-main btn-quiet px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-[hsl(var(--border))]"
              >
                <span>Submit Abstract</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Interactive Banner Carousel, Logo, CTAs & Quick Action Navigation (Matching Reference Design) */}
      {(headerBanners.length > 0 || event.logoUrl) && (
      <section className="container-wide mt-12 md:mt-20 py-10 md:py-14 border-b border-[hsl(var(--border))]">
        {/* Centered 2-Column Unit with Balanced Margins & Matched Heights */}
        <div className="max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-10">
          {/* Left Column: Banner Carousel (1500x500 aspect ratio, refined to 1060px width x 353px height) */}
          <div className="w-full lg:flex-1 max-w-[1060px]">
            <HeaderBannerCarousel
              banners={headerBanners}
              title={event.title}
              location={event.venue || event.location || ''}
            />
          </div>

          {/* Right Column: Logo and Side-by-Side Action Buttons (Height matches banner) */}
          <div className="flex flex-col items-center justify-center text-center shrink-0">
            {/* Circular Logo */}
            {event.logoUrl && (
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 rounded-full border-4 border-[#0f4c81]/30 bg-white shadow-xl flex items-center justify-center p-4 overflow-hidden group shrink-0">
                <img
                  src={mediaUrl(event.logoUrl)}
                  alt={event.title}
                  className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Quick Action Navigation Buttons - Side by Side */}
            <div className="flex flex-row items-center justify-center gap-3 w-full mt-5 flex-wrap sm:flex-nowrap">
              <Link
                href="/submit-abstract"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border-2 border-[#155e75]/40 cursor-pointer whitespace-nowrap"
              >
                <ChevronsRight size={18} className="text-[#38bdf8]" />
                <span>SUBMIT ABSTRACT</span>
              </Link>

              <button
                type="button"
                onClick={() => createCalendarReminder(event)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#262626] hover:bg-black text-white font-medium text-xs shadow hover:shadow-md transition-all cursor-pointer whitespace-nowrap"
                title="Add to Calendar"
              >
                <Calendar size={14} className="text-white/80" />
                <span>Reminder to Join !!</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Featured Speakers Section (Before FAQs) */}
      {featuredSpeakers.length > 0 && (
        <section className="container-wide py-14 md:py-20 border-b border-[hsl(var(--border))]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="section-eyebrow">Speakers</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
                Featured Speakers
              </h2>
              <p className="mt-2 text-sm md:text-base text-[hsl(var(--muted-foreground))] max-w-xl">
                Learn from world-renowned keynote experts and pioneering practitioners leading the sessions
              </p>
            </div>
            <Link
              href="/speakers"
              className="inline-flex items-center gap-2 self-start md:self-auto px-5 py-2.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--primary)/0.08)] hover:border-[hsl(var(--primary)/0.4)] text-[hsl(var(--foreground))] font-semibold text-sm transition-all shadow-sm group cursor-pointer shrink-0"
            >
              <span>View All Speakers</span>
              {speakersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]">
                  {speakersCount}
                </span>
              )}
              <ArrowRight size={16} className="text-[hsl(var(--primary))] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredSpeakers.map((speaker, idx) => (
              <div
                key={speaker.name || idx}
                onClick={() => setSelectedSpeaker(speaker)}
                className="group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-6 shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary)/.5)] transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Lanyard Notch / ID Badge Slot */}
                <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--border))] mb-4 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

                {/* Top-Right Keynote Badge */}
                {speaker.isKeynote && (
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
                  {speaker.isKeynote && (
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
                  <p className="text-sm font-semibold text-[hsl(var(--primary))] mt-1.5 line-clamp-1 w-full px-1">
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

                {/* Footer */}
                <div className="mt-auto pt-4 w-full flex items-center justify-between border-t border-[hsl(var(--border)/.6)] text-xs">
                  <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1">
                    View Profile <ExternalLink size={11} className="opacity-70" />
                  </span>
                  {(speaker.linkedin || speaker.twitter || speaker.website) && (
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
            ))}
          </div>

          {/* Bottom View All CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/speakers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>View All Speakers</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions Section */}
      {faqs.length > 0 && (
      <section className="container-wide py-16 md:py-24">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="section-eyebrow justify-center">FAQ</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm md:text-base text-[hsl(var(--muted-foreground))]">
            Find answers to common questions about participation, registration, and attendance
          </p>
        </div>

        <div className="max-w-4xl mx-auto divide-y divide-[hsl(var(--border))] border-t border-b border-[hsl(var(--border))]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item border-0">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="faq-question cursor-pointer py-5 px-1 hover:text-[hsl(var(--primary))] transition-colors"
                aria-expanded={openFaqIndex === idx}
              >
                <span className="font-semibold text-base md:text-lg pr-4">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-[hsl(var(--muted-foreground))] shrink-0 transition-transform duration-200 ${
                    openFaqIndex === idx ? 'rotate-180 text-[hsl(var(--primary))]' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="faq-answer px-1 pb-5 pt-1 text-sm md:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
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
    </>
  );
}
