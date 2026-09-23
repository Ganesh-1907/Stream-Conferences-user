import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays, Clock3, MapPin, Download, Users, ArrowUpRight, ArrowRight, FileText,
  Timer, Award, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown,
  Calendar, Megaphone, FileEdit, ListOrdered, Sparkles, Layers,
  GraduationCap, Building2, Presentation, ExternalLink, Linkedin, Twitter, Globe, Check
} from 'lucide-react';
import type { EventData } from './layout';
import { SPEAKER_CATEGORIES, getSpeakerCategoryKey } from './speakers';
import { PartnerLogoCard } from '@/components/partner-logo-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNameInitials, formatTime12h } from '@/lib/utils';

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
    const id = setInterval(() => setNow(Date.now()), 1000);
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

function createGoogleCalendarReminder(event: EventData) {
  const title = encodeURIComponent(event.title || 'Conference');
  const details = encodeURIComponent(event.description || event.theme || '');
  const location = encodeURIComponent(event.venue || event.location || '');
  const startD = event.startDate || event.eventDate;
  const start = startD ? new Date(startD).toISOString().replace(/-|:|\.\d+/g, '') : '';
  const end = event.endDate ? new Date(event.endDate).toISOString().replace(/-|:|\.\d+/g, '') : start;
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  window.open(googleUrl, '_blank');
}

function downloadIcsCalendarReminder(event: EventData) {
  const title = event.title || 'Conference';
  const description = (event.description || event.theme || '').replace(/<[^>]*>?/gm, '');
  const location = event.venue || event.location || '';
  const startD = event.startDate || event.eventDate;
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const start = formatDate(startD) || new Date().toISOString().replace(/-|:|\.\d+/g, '');
  const end = formatDate(event.endDate) || start;

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Stream Conferences//Event Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `SUMMARY:${title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${description.replace(/\n/g, ' ')}`,
    `LOCATION:${location.replace(/\n/g, ' ')}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reminder.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarMenuOpen(false);
      }
    }
    if (calendarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [calendarMenuOpen]);

  const featuredSpeakers = useMemo(() => {
    const list = Array.isArray(event.speakers) ? [...event.speakers] : [];
    list.sort((a, b) => {
      const keyA = getSpeakerCategoryKey(a);
      const keyB = getSpeakerCategoryKey(b);
      const idxA = SPEAKER_CATEGORIES.findIndex((c) => c.key === keyA);
      const idxB = SPEAKER_CATEGORIES.findIndex((c) => c.key === keyB);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });
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
      {/* Full-Bleed Edge-to-Edge Dynamic Theme Hero Section with Ambient Glow (Plain Color) */}
      <section className="relative w-full hero-slant-bg text-white pt-20 sm:pt-24 md:pt-28 pb-10 sm:pb-14 border-b border-white/10 overflow-hidden flex flex-col justify-between min-h-screen">
        {/* Ambient Center & Corner Soft Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-white/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-wide relative z-10 space-y-7 my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column: Info, Countdown & Action CTAs */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Type Badge */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md border border-white/30 shadow-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {event.eventType === 'conference' ? 'Annual Scientific Summit' : 'Live Webinar Series'}
                </span>
              </div>

              {/* Main Title, Theme & Cohort */}
              <div className="space-y-2 flex flex-col items-center lg:items-start w-full">
                <h1 className="display text-3xl sm:text-5xl md:text-6xl font-black leading-tight text-white tracking-tight drop-shadow-md text-center lg:text-left">
                  {event.title}
                </h1>
                {event.theme && (
                  <p className="text-base sm:text-xl md:text-2xl font-extrabold text-white tracking-wide italic drop-shadow-sm text-center lg:text-left">
                    Theme: {event.theme}
                  </p>
                )}

              </div>

              {/* Meta Info Line */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm sm:text-base md:text-lg font-bold text-white text-center lg:text-left">
                {formatDateRange(event) && <span>{formatDateRange(event)}</span>}
                {(event.startTime || event.endTime) && (
                  <>
                    <span>·</span>
                    <span>{formatTime12h(event.startTime) || '—'} – {formatTime12h(event.endTime) || '—'}</span>
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
                <div className="space-y-2 pt-1 flex flex-col items-center lg:items-start w-full">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-white/90 block font-bold text-center lg:text-left">Conference Starts In</span>
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
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
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
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

            {/* Right Column: 3D Circular Logo Card & Reminder Button */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-8 sm:space-y-10 text-center">
              {/* 3D Circular Card containing the Logo */}
              {event.logoUrl ? (
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full ring-8 sm:ring-12 ring-white/30 bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.45)] flex items-center justify-center p-6 sm:p-7 lg:p-8 overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-[0_35px_80px_-10px_rgba(0,0,0,0.55)] group shrink-0">
                  <img
                    src={mediaUrl(event.logoUrl)}
                    alt={event.title}
                    className="w-full h-full object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full ring-8 sm:ring-12 ring-white/30 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.45)] flex items-center justify-center p-6 shrink-0 text-white text-6xl font-extrabold font-['Space_Grotesk']">
                  {getNameInitials(event.title, 'SC')}
                </div>
              )}

              {/* Action Button: Reminder to Join !! (White Theme with Dropdown) */}
              <div ref={calendarRef} className="pt-2 sm:pt-4 relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setCalendarMenuOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-white text-[hsl(var(--primary))] font-extrabold text-sm uppercase tracking-wider shadow-2xl hover:bg-white/90 hover:scale-105 transition-all transform cursor-pointer border border-white/40 whitespace-nowrap"
                  title="Add to Calendar"
                >
                  <Calendar size={18} className="text-[hsl(var(--primary))]" />
                  <span>Reminder to Join !!</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${calendarMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {calendarMenuOpen && (
                  <div className="absolute right-0 sm:left-0 mt-2 w-56 sm:w-60 rounded-2xl bg-white shadow-2xl border border-gray-200 py-1.5 z-50 overflow-hidden">
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                      Select Calendar Platform
                    </div>

                    {/* Google Calendar Option */}
                    <button
                      type="button"
                      onClick={() => {
                        createGoogleCalendarReminder(event);
                        setCalendarMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-gray-900 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#4285F4" fillOpacity="0.1"/>
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <rect x="7" y="13" width="4" height="4" rx="1" fill="#EA4335" />
                          <rect x="13" y="13" width="4" height="4" rx="1" fill="#FBBC04" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">Google Calendar</span>
                        <span className="text-[10px] font-medium text-gray-500">Opens in web browser</span>
                      </div>
                    </button>

                    {/* Apple / Mac Calendar Option */}
                    <button
                      type="button"
                      onClick={() => {
                        downloadIcsCalendarReminder(event);
                        setCalendarMenuOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-gray-900 hover:bg-slate-100 hover:text-black flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.68-.82 1.14-1.96.99-3.09-.98.04-2.18.66-2.88 1.47-.63.73-1.18 1.89-1.03 3.01 1.09.09 2.22-.55 2.92-1.39z"/>
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">Apple / Mac Calendar</span>
                        <span className="text-[10px] font-medium text-gray-500">Opens Mac Calendar app</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Registrations Ticker Bar & Rectangular Glass Quick Nav Tab Cards */}
          <div className="pt-6 border-t border-white/20 flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-black/40 border border-white/30 text-emerald-300 text-xs sm:text-sm font-mono font-extrabold tracking-widest uppercase backdrop-blur-md shadow-lg">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>REGISTRATIONS OPEN</span>
            </div>

            {/* Rectangular Glass Tab Cards Row */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 max-w-6xl">
              {quickLinks.map((ql) => {
                const IconComponent = ql.icon;
                return (
                  <Link
                    key={ql.title}
                    href={ql.href}
                    className="relative group w-32 sm:w-36 md:w-40 py-4 px-4 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white border border-white/30 hover:border-white/50 backdrop-blur-md transition-all transform hover:-translate-y-1 cursor-pointer shadow-lg text-center"
                  >
                    {ql.hasNew && (
                      <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-black uppercase shadow-md border border-amber-300">
                        NEW
                      </span>
                    )}
                    <IconComponent size={28} className="text-white group-hover:scale-110 transition-transform" />
                    <span className="text-base sm:text-lg font-extrabold text-white tracking-wide">{ql.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>


      {/* Centered Banner Carousel Section */}
      {headerBanners.length > 0 && (
        <section className="container-wide py-8 md:py-10 border-b border-[hsl(var(--border))]">
          <div className="max-w-[1220px] w-full mx-auto flex flex-col items-center justify-center">
            <div className="w-full">
              <HeaderBannerCarousel
                banners={headerBanners}
                title={event.title}
                location={event.venue || event.location || ''}
              />
            </div>
          </div>
        </section>
      )}

      {/* Welcome Message Banner Section */}
      {(event.welcomeBannerTitle || event.welcomeBannerDescription) && (
        <section className="container-wide py-8">
          <div className="rounded-3xl border border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--secondary)/0.08)] p-6 sm:p-8 shadow-lg">
            {event.welcomeBannerTitle && (
              <h2 className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-[hsl(var(--primary))] mb-3">
                {event.welcomeBannerTitle}
              </h2>
            )}
            {event.welcomeBannerDescription && (
              <div
                className="prose dark:prose-invert max-w-none text-base text-[hsl(var(--foreground))] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: event.welcomeBannerDescription }}
              />
            )}
          </div>
        </section>
      )}

      {/* Featured Speakers Section */}
      {featuredSpeakers.length > 0 ? (
        <section className="container-wide py-14 md:py-20 border-b border-[hsl(var(--border))]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
                Speakers
              </p>
              <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
                Featured Speakers
              </h2>
              <p className="mt-3 w-full text-base sm:text-lg font-medium leading-relaxed text-[hsl(var(--muted-foreground))] max-w-xl">
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
            {featuredSpeakers.map((speaker, idx) => {
              const categoryKey = getSpeakerCategoryKey(speaker);
              const categoryConfig = SPEAKER_CATEGORIES.find((c) => c.key === categoryKey) || SPEAKER_CATEGORIES[1];
              const isKeynote = categoryKey === 'keynote';

              return (
                <div
                  key={speaker.name || idx}
                  onClick={() => setSelectedSpeaker(speaker)}
                  className="card-lift group relative flex flex-col items-center text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-5 shadow-sm cursor-pointer overflow-hidden"
                >
                  <div className="w-10 h-1.5 rounded-full bg-[hsl(var(--border))] mb-3 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${categoryConfig.badgeClass} shadow-sm`}>
                      {isKeynote && <Award size={12} />}
                      {categoryConfig.label}
                    </span>
                  </div>

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

                  <h3 className="font-['Space_Grotesk'] font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1 w-full px-1">
                    {speaker.name}
                  </h3>

                  <div className="mt-3 pt-3 w-full flex items-center justify-center border-t border-[hsl(var(--border)/.6)] text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] font-semibold text-xs group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all shadow-xs">
                      View Profile <ExternalLink size={12} />
                    </span>
                  </div>

                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.4)] to-transparent absolute bottom-0 left-0" />
                </div>
            );
          })}
          </div>

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
      ) : (
        <section className="container-wide py-14 border-b border-[hsl(var(--border))] text-center">
          <div className="max-w-2xl mx-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 sm:p-10 shadow-lg space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center mx-auto">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
              Keynote Speakers & Panelists To Be Announced Soon
            </h3>
            <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
              Stay tuned! Our distinguished lineup of global leaders, keynote speakers, and pioneering researchers for {event.title} will be announced shortly.
            </p>
          </div>
        </section>
      )}

      {/* Top 5 Tracks Section */}
      {Array.isArray(event.tracks) && event.tracks.length > 0 && (
        <section className="container-wide py-14 border-b border-[hsl(var(--border))]">
          <div className="mb-8">
            <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
              Tracks
            </p>
            <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
              Conference Tracks & Scientific Themes
            </h2>
            <p className="mt-3 w-full text-base sm:text-lg font-medium leading-relaxed text-[hsl(var(--muted-foreground))]">
              Explore key research tracks presented at {event.title}
            </p>
          </div>

          <div className="w-full space-y-8">
            {event.tracks.slice(0, 5).map((track, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 pb-8 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
                {/* Left Side: Track Image or Number Badge */}
                {track.image ? (
                  <img
                    src={mediaUrl(track.image)}
                    alt={track.title}
                    className="w-full sm:w-56 md:w-64 h-44 sm:h-44 md:h-48 shrink-0 rounded-2xl object-cover border border-[hsl(var(--border))] shadow-md bg-[hsl(var(--card))]"
                  />
                ) : (
                  <div className="w-full sm:w-56 md:w-64 h-44 sm:h-44 md:h-48 shrink-0 rounded-2xl bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.18)] flex items-center justify-center text-4xl sm:text-5xl font-black text-[hsl(var(--primary))] font-['Space_Grotesk'] shadow-sm">
                    {(i + 1).toString().padStart(2, '0')}
                  </div>
                )}

                {/* Right Side: Title, Clamped Description, Read More Button & Links */}
                <div className="flex-1 pt-1 space-y-3">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-[hsl(var(--foreground))] font-['Space_Grotesk'] leading-snug">
                    {track.title}
                  </h3>
                  {track.description && (
                    <div
                      className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3 text-justify"
                      dangerouslySetInnerHTML={{ __html: track.description }}
                    />
                  )}

                  <div className="pt-2 flex items-center gap-4 flex-wrap">
                    <Link
                      href={`/tracks?track=${i}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-xs cursor-pointer"
                    >
                      Read More <ArrowRight size={14} />
                    </Link>

                    {Array.isArray(track.referenceLinks) && track.referenceLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {track.referenceLinks.map((link: any, li: number) => (
                          <a
                            key={li}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors shadow-xs"
                          >
                            <ExternalLink size={12} /> {link.label || (link as any).title || link.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <Link
              href="/tracks"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>View All Tracks ({event.tracks.length})</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Media Partners Section (Directly Above FAQs) */}
      {Array.isArray(event.mediaPartners) && event.mediaPartners.length > 0 && (
        <section className="container-wide py-12 border-b border-[hsl(var(--border))]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
                Collaboration
              </p>
              <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
                Media Partners
              </h2>
              <p className="mt-3 w-full text-base sm:text-lg font-medium leading-relaxed text-[hsl(var(--muted-foreground))]">
                Official press and publishing collaborators supporting {event.title}
              </p>
            </div>
            <Link
              href="/media-partners"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--foreground))] font-semibold text-xs transition-all shadow-sm shrink-0"
            >
              <span>View All Media Partners</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 items-start">
            {event.mediaPartners.slice(0, 5).map((partner, idx) => (
              <div key={idx} className="w-56 sm:w-64 md:w-72 shrink-0">
                <PartnerLogoCard item={partner} defaultType={`Media Partner ${idx + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Frequently Asked Questions Section */}
      {faqs.length > 0 && (
      <section className="container-wide py-16 md:py-24">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <p className="display w-full text-center text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
            FAQ
          </p>
          <h2 className="mt-2.5 w-full text-center text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 w-full text-base sm:text-lg font-medium leading-relaxed text-[hsl(var(--muted-foreground))]">
            Find answers to common questions about participation, registration, and attendance
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden bg-[hsl(var(--card))] shadow-xs hover:-translate-y-1 hover:shadow-lg ${
                  isOpen
                    ? 'border-[hsl(var(--secondary)/0.8)] shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.18)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--secondary)/0.8)] hover:shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.15)]'
                }`}
              >
                <div
                  className="flex w-full items-center justify-between gap-5 p-5 sm:p-6 text-left font-bold text-base sm:text-lg select-none"
                  aria-expanded={isOpen}
                >
                  <span className="group-hover:text-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[hsl(var(--secondary))] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                    }`}
                  />
                </div>
                {isOpen && (
                  <div className="border-t border-[hsl(var(--border))] px-6 pb-6 pt-4 text-base sm:text-lg leading-8 text-[hsl(var(--foreground)/.85)] bg-[hsl(var(--muted)/.15)]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* Speaker Details Modal Popup */}
      <Dialog open={Boolean(selectedSpeaker)} onOpenChange={(open) => !open && setSelectedSpeaker(null)}>
        {selectedSpeaker && (
          <DialogContent className="sm:max-w-3xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] p-6 sm:p-8">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedSpeaker.name}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-2">
              {/* Left Column: Circle Avatar & Designation Down below */}
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

                {/* Designation Down to Profile Image */}
                {selectedSpeaker.designation && (
                  <div className="pt-1">
                    <span className="inline-block text-xs sm:text-sm font-semibold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] border border-[hsl(var(--primary)/.2)] px-3 py-1 rounded-full">
                      {selectedSpeaker.designation}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Key : Value Format List */}
              <div className="flex-1 w-full space-y-3.5 text-left">
                {/* Name */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                  <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Name :</span>
                  <span className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] font-['Space_Grotesk']">{selectedSpeaker.name}</span>
                </div>

                {/* Category / Role */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                  <span className="font-bold text-[hsl(var(--muted-foreground))] w-32 shrink-0">Category :</span>
                  <span className="font-semibold text-[hsl(var(--foreground))]">
                    {SPEAKER_CATEGORIES.find((c) => c.key === getSpeakerCategoryKey(selectedSpeaker))?.label || 'Speaker'}
                  </span>
                </div>

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
        )}
      </Dialog>
    </>
  );
}
