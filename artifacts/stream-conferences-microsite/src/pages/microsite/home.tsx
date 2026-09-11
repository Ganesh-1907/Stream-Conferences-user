import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays, Clock3, MapPin, Download, Users, ArrowUpRight, ArrowRight, FileText,
  Timer, Award, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown,
  Calendar, Megaphone, FileEdit, ListOrdered, Sparkles, Layers,
  GraduationCap, Building2, Presentation, ExternalLink, Linkedin, Twitter, Globe, Check
} from 'lucide-react';
import type { EventData } from './layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNameInitials } from '@/lib/utils';

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

        {/* Pagination Dots INSIDE Carousel (Matching user request) */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === current
                    ? 'w-3 h-3 bg-[#65a30d]'
                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HomePage({ event }: { event: EventData }) {
  const startDate = event.startDate || event.eventDate;
  const cd = useCountdown(startDate);
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
      title: 'Speakers',
      icon: Users,
      href: '/speakers',
      hasNew: true,
    },
    {
      title: 'Venue',
      icon: MapPin,
      href: '/venue',
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
      title: 'Brochure',
      icon: Download,
      href: '/brochure',
    },
  ];

  const heroImage = headerBanners[0] || (event.bannerUrl && !event.bannerUrl.endsWith('.pdf') ? mediaUrl(event.bannerUrl) : '') || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

  return (
    <>
      {/* Full-Bleed Edge-to-Edge Dynamic Theme Hero Section with Ambient Glow & Grid Lines (Matching Selected Admin Theme) */}
      <section className="relative w-full hero-slant-bg text-white py-6 md:py-8 border-b border-white/10 overflow-hidden flex flex-col justify-between min-h-[calc(100vh-64px)]">
        {/* Glowing Grid Lines Overlay Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* Ambient Lighting Glow Spots */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[450px] h-[450px] bg-amber-400/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-white/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-wide relative z-10 space-y-7 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column: Info, Countdown & Action CTAs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Type Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 shadow-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {event.eventType === 'conference' ? 'Annual Scientific Summit' : 'Live Webinar Series'}
                </span>
              </div>

              {/* Main Title & Cohort */}
              <div className="space-y-2">
                <h1 className="display text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white tracking-tight drop-shadow-md">
                  {event.title}
                </h1>
                {event.activeCohort && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/25 shadow-sm">
                    <span>{event.activeCohort.isCurrent ? 'Current Cohort' : 'Cohort'}</span>
                    <span>·</span>
                    <span>{event.activeCohort.label || `${event.activeCohort.year} Batch ${event.activeCohort.batchNo}`}</span>
                  </div>
                )}
              </div>

              {/* Meta Info Line */}
              <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base md:text-lg font-bold text-white">
                {formatDateRange(event) && <span>{formatDateRange(event)}</span>}
                {(event.startTime || event.endTime) && (
                  <>
                    <span>·</span>
                    <span>{event.startTime || '—'} – {event.endTime || '—'}</span>
                  </>
                )}
                {(event.venue || event.location) && (
                  <>
                    <span>·</span>
                    <span>{event.venue || event.location}</span>
                  </>
                )}
              </div>

              {/* Countdown Timer Row */}
              {cd && !cd.expired && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white/90 block font-bold">Conference Starts In</span>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {[
                      { v: cd.days, l: 'D' },
                      { v: cd.hours, l: 'H' },
                      { v: cd.mins, l: 'M' },
                      { v: cd.secs, l: 'S' },
                    ].map((s) => (
                      <div key={s.l} className="flex items-baseline gap-1.5 px-4 py-2 rounded-xl bg-black/40 border border-white/30 text-white backdrop-blur-md font-mono shadow-lg">
                        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold">{s.v}</span>
                        <span className="text-xs font-bold opacity-80 uppercase">{s.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[hsl(var(--primary))] font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-2xl hover:bg-white/90 hover:scale-105 transition-all transform cursor-pointer border border-white/40"
                >
                  <span>REGISTER NOW</span>
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/submit-abstract"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base uppercase tracking-wider backdrop-blur-md border border-white/35 transition-all cursor-pointer shadow-lg"
                >
                  <span>SUBMIT ABSTRACT</span>
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right Column: Glassmorphism Event Overview Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/30 bg-white/15 backdrop-blur-xl p-5 sm:p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/20 pb-3 relative z-10">
                  <span className="text-base font-bold uppercase tracking-wider text-white">Event Overview</span>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm">
                    Registrations Open
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-3 sm:p-3.5 border border-white/20 shadow-sm flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-white/90 block mb-0.5 font-bold">Date</span>
                    <p className="text-sm sm:text-base font-black text-white leading-snug break-words">{formatDateRange(event) || 'TBA'}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 sm:p-3.5 border border-white/20 shadow-sm flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-white/90 block mb-0.5 font-bold">Location</span>
                    <p className="text-sm sm:text-base font-black text-white leading-snug break-words capitalize">{event.venue || event.location || 'TBA'}</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 sm:p-3.5 border border-white/20 shadow-sm flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-white/90 block mb-0.5 font-bold">Format</span>
                    <p className="text-sm sm:text-base font-black text-white leading-snug">Hybrid Summit</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 sm:p-3.5 border border-white/20 shadow-sm flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider text-white/90 block mb-0.5 font-bold">Proceedings</span>
                    <p className="text-sm sm:text-base font-black text-white leading-snug">DOI / ISBN</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/20 text-sm sm:text-base font-bold text-white relative z-10">
                  <div className="flex items-center gap-2.5">
                    <Check size={18} className="text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Peer-reviewed scientific proceedings</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check size={18} className="text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Accepted abstracts receive permanent DOI assignment</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check size={18} className="text-emerald-400 shrink-0 stroke-[3]" />
                    <span>Global delegation & keynote technical forums</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between relative z-10">
                  <Link href="/fees" className="text-sm sm:text-base font-extrabold text-white hover:underline inline-flex items-center gap-1.5">
                    <span>View Fee Structure</span>
                    <ChevronsRight size={16} />
                  </Link>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/15 border border-white/25">
                    Peer-Reviewed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Registrations Ticker Bar & Rectangular Glass Quick Nav Tab Cards */}
          <div className="pt-6 border-t border-white/20 flex flex-col items-center gap-4">
            <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-mono font-extrabold tracking-widest uppercase backdrop-blur-md shadow-md">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>REGISTRATIONS OPEN</span>
            </div>

            {/* Rectangular Glass Tab Cards Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-6xl">
              {quickLinks.map((ql) => {
                const IconComponent = ql.icon;
                return (
                  <Link
                    key={ql.title}
                    href={ql.href}
                    className="relative group w-28 sm:w-32 md:w-36 py-3.5 px-3 flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-xl transition-all transform hover:-translate-y-1 cursor-pointer shadow-xl text-center"
                  >
                    {ql.hasNew && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-black uppercase shadow-md border border-amber-300">
                        NEW
                      </span>
                    )}
                    <IconComponent size={24} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-extrabold text-white tracking-wide">{ql.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Interactive Banner Carousel, Logo & Action Navigation Section */}
      {(headerBanners.length > 0 || event.logoUrl) && (
        <section className="container-wide py-10 md:py-14 border-b border-[hsl(var(--border))]">
          {/* Centered 2-Column Unit with Balanced Left/Right Spacing */}
          <div className="max-w-[1440px] w-full mx-auto flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8">
            {/* Left Column: Banner Carousel (Aspect 1500:500) */}
            {headerBanners.length > 0 && (
              <div className="w-full lg:flex-1 max-w-[1060px] flex flex-col justify-center">
                <HeaderBannerCarousel
                  banners={headerBanners}
                  title={event.title}
                  location={event.venue || event.location || ''}
                />
              </div>
            )}

            {/* Right Column: Glassmorphic Container matching Banner Height */}
            <div className="w-full lg:w-[380px] shrink-0 rounded-2xl md:rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-5 shadow-xl flex flex-col items-center justify-between space-y-4">
              {/* Header Badge */}
              <div className="w-full flex items-center justify-center">
                <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.25)] shadow-sm">
                  Official Event Portal
                </span>
              </div>

              {/* Conference-Specific Circular Logo (No text clipping) */}
              {event.logoUrl ? (
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full ring-4 ring-[hsl(var(--primary)/0.35)] bg-white shadow-2xl flex items-center justify-center p-4 overflow-hidden group shrink-0 transition-all duration-300 hover:scale-105">
                  <img
                    src={mediaUrl(event.logoUrl)}
                    alt={event.title}
                    className="w-full h-full object-contain max-h-full"
                  />
                </div>
              ) : (
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full ring-4 ring-[hsl(var(--primary)/0.35)] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-2xl flex items-center justify-center p-4 shrink-0 text-white text-3xl font-extrabold font-['Space_Grotesk']">
                  {getNameInitials(event.title, 'SC')}
                </div>
              )}

              {/* Action Buttons - Side by Side Below Logo */}
              <div className="flex flex-row items-center justify-center gap-2.5 w-full flex-wrap sm:flex-nowrap pt-1">
                <Link
                  href="/submit-abstract"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border border-white/20 cursor-pointer whitespace-nowrap"
                >
                  <ChevronsRight size={16} />
                  <span>SUBMIT ABSTRACT</span>
                </Link>

                <button
                  type="button"
                  onClick={() => createCalendarReminder(event)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-800 dark:bg-black hover:bg-slate-900 text-white font-bold text-xs shadow hover:shadow-md transition-all border border-slate-700 cursor-pointer whitespace-nowrap"
                  title="Add to Calendar"
                >
                  <Calendar size={14} className="text-emerald-400" />
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
                      {getNameInitials(speaker.name, 'S')}
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
    </>
  );
}
