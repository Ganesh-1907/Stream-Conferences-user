import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays, Clock3, MapPin, Download, Users, ArrowUpRight, ArrowRight, FileText,
  Timer, Award, ChevronLeft, ChevronRight, ChevronsRight, ChevronDown,
  Calendar, Megaphone, FileEdit, ListOrdered, Sparkles, Layers,
  GraduationCap, Building2, Presentation, ExternalLink, Linkedin, Twitter, Globe, Check
} from 'lucide-react';
import { SPEAKER_CATEGORIES, getSpeakerCategoryKey, getSpeakerCategoryConfig } from './speakers';
import type { EventData } from './layout';
import { PartnerLogoCard } from '@/components/partner-logo-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getNameInitials, formatTime12h } from '@/lib/utils';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const MAIN_WEBSITE_URL = import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://streamconferences.com';
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
    return list.slice(0, 5);
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

  const heroImage = headerBanners[0] || (event.bannerUrl && !event.bannerUrl.endsWith('.pdf') ? mediaUrl(event.bannerUrl) : '') || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop';

  return (
    <>
      {/* Full-Bleed Edge-to-Edge Dynamic Theme Hero Section with Ambient Glow & Wave Curve */}
      <section className="relative w-full hero-slant-bg text-white pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-16 sm:pb-20 md:pb-24 overflow-hidden flex flex-col justify-center">
        {/* Subtle Ambient Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-white/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="container-wide relative z-10 my-auto pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
            {/* Left Column: Title, Theme, and Action CTA Buttons (REGISTER NOW, SUBMIT ABSTRACT) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              {/* Main Title & Theme */}
              <div className="space-y-3 flex flex-col items-center lg:items-start w-full">
                <h1 className="display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] text-white tracking-tight drop-shadow-md text-center lg:text-left break-words max-w-full">
                  {event.title}
                </h1>
                {event.theme && (
                  <p className="text-sm sm:text-base md:text-lg font-medium text-white/90 text-center lg:text-left leading-relaxed max-w-2xl">
                    <span className="font-bold text-white uppercase tracking-wider text-xs sm:text-sm mr-1.5 opacity-90">Theme:</span>
                    {event.theme}
                  </p>
                )}
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white text-[hsl(var(--primary))] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:bg-white/95 hover:scale-105 transition-all transform cursor-pointer border border-white/40"
                >
                  <span>REGISTER NOW</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/submit-abstract"
                  className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm uppercase tracking-wider backdrop-blur-md border border-white/40 transition-all cursor-pointer shadow-md hover:scale-105"
                >
                  <span>SUBMIT ABSTRACT</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Column: Date, Venue, and Countdown Timer in a Taller, Prominent Glass Panel */}
            <div className="lg:col-span-5 w-full flex flex-col items-center lg:items-end lg:pr-2">
              <div className="w-full max-w-md rounded-2xl md:rounded-3xl bg-black/25 backdrop-blur-md border border-white/20 p-6 sm:p-7 md:p-8 shadow-2xl">
                {/* Date, Venue & Timer Rows with Enhanced Height and Spacing */}
                <div className="space-y-5 sm:space-y-6 text-left">
                  {formatDateRange(event) && (
                    <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-white/95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                        <CalendarDays size={18} className="text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70 font-semibold">Conference Dates</span>
                        <span className="font-bold text-white text-sm sm:text-base leading-snug">{formatDateRange(event)}</span>
                      </div>
                    </div>
                  )}

                  {(event.venue || event.location) && (
                    <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-white/95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70 font-semibold">Venue / Location</span>
                        <span className="font-bold text-white text-sm sm:text-base leading-snug">{event.venue || event.location}</span>
                      </div>
                    </div>
                  )}

                  {/* Countdown Timer Row */}
                  {cd && !cd.expired && (
                    <div className="flex items-center gap-3.5 text-xs sm:text-sm font-semibold text-white/95">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
                        <Clock3 size={18} className="text-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-white/70 font-semibold">Starts In</span>
                        <div className="flex items-center gap-1.5 sm:gap-2 pt-1">
                          {[
                            { v: cd.days, l: 'Days' },
                            { v: cd.hours, l: 'Hours' },
                            { v: cd.mins, l: 'Mins' },
                            { v: cd.secs, l: 'Secs' },
                          ].map((s) => (
                            <div
                              key={s.l}
                              className="flex flex-col items-center justify-center min-w-[46px] sm:min-w-[52px] px-2 py-1 rounded-xl bg-black/40 border border-white/20 text-white font-mono shadow-inner"
                            >
                              <span className="text-sm sm:text-base font-black leading-none text-white">
                                {String(s.v).padStart(2, '0')}
                              </span>
                              <span className="text-[8px] sm:text-[9px] font-semibold tracking-wider opacity-80 uppercase mt-0.5">
                                {s.l}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic & Distinct Organic SVG Wave Curve at Bottom of Hero */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg
            className="relative block w-full h-16 sm:h-20 md:h-24 lg:h-32 text-[hsl(var(--background))]"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            fill="currentColor"
            shapeRendering="geometricPrecision"
          >
            <path d="M0,65 C480,155 960,5 1440,65 L1440,160 L0,160 Z"></path>
          </svg>
        </div>
      </section>

      {/* Side-by-Side Carousel and Logo Section After the Wave */}
      <section className="container-wide pt-2 sm:pt-3 md:pt-4 pb-8 sm:pb-10 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center">
          {/* Carousel (Left 8 columns) */}
          <div className="lg:col-span-8 w-full flex flex-col justify-center">
            {headerBanners.length > 0 ? (
              <HeaderBannerCarousel
                banners={headerBanners}
                title={event.title}
                location={event.venue || event.location || ''}
              />
            ) : (
              <div className="relative w-full aspect-[1500/500] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-[hsl(var(--border))] bg-gradient-to-r from-emerald-600/20 to-teal-600/20 flex items-center justify-center p-6 text-center">
                <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                  {event.title}
                </p>
              </div>
            )}
          </div>

          {/* Direct Circular Logo & Reminder (Right 4 columns) */}
          <div className="lg:col-span-4 w-full flex flex-col items-center justify-center gap-4 sm:gap-5">
            {/* Direct Circular Logo Disc */}
            {event.logoUrl ? (
              <a
                href={MAIN_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 rounded-full ring-4 sm:ring-6 ring-[hsl(var(--primary)/0.25)] bg-[#FAF8F5] shadow-2xl flex items-center justify-center p-6 overflow-hidden transition-all duration-300 transform hover:scale-105 group shrink-0 cursor-pointer"
                title="Visit Stream Conferences"
                data-testid="link-hero-logo"
              >
                <img
                  src={mediaUrl(event.logoUrl)}
                  alt={event.title}
                  className="w-full h-full object-contain max-h-full max-w-full transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            ) : (
              <a
                href={MAIN_WEBSITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 rounded-full ring-4 sm:ring-6 ring-[hsl(var(--primary)/0.25)] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] shadow-2xl flex items-center justify-center p-6 shrink-0 text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold font-['Space_Grotesk'] transition-all duration-300 transform hover:scale-105 cursor-pointer"
                title="Visit Stream Conferences"
                data-testid="link-hero-logo"
              >
                {getNameInitials(event.title, 'SC')}
              </a>
            )}

            {/* Action Button: Reminder to Join !! with Dropdown */}
            <div ref={calendarRef} className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setCalendarMenuOpen((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-105 transition-all transform cursor-pointer whitespace-nowrap"
                title="Add to Calendar"
              >
                <Calendar size={16} />
                <span>Reminder to Join !!</span>
                <ChevronDown size={15} className={`transition-transform duration-200 ${calendarMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {calendarMenuOpen && (
                <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-56 sm:w-60 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-800 py-1.5 z-50 overflow-hidden text-left">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                    Select Calendar Platform
                  </div>

                  {/* Google Calendar Option */}
                  <button
                    type="button"
                    onClick={() => {
                      createGoogleCalendarReminder(event);
                      setCalendarMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-800"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#4285F4" fillOpacity="0.1"/>
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="7" y="13" width="4" height="4" rx="1" fill="#EA4335" />
                        <rect x="13" y="13" width="4" height="4" rx="1" fill="#FBBC04" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight">Google Calendar</span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">Opens in web browser</span>
                    </div>
                  </button>

                  {/* Apple / Mac Calendar Option */}
                  <button
                    type="button"
                    onClick={() => {
                      downloadIcsCalendarReminder(event);
                      setCalendarMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-sm font-bold text-gray-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.68-.82 1.14-1.96.99-3.09-.98.04-2.18.66-2.88 1.47-.63.73-1.18 1.89-1.03 3.01 1.09.09 2.22-.55 2.92-1.39z"/>
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white leading-tight">Apple / Mac Calendar</span>
                      <span className="text-[10px] font-medium text-gray-500 dark:text-slate-400">Opens Mac Calendar app</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Message Banner Section */}
      {(event.welcomeBannerTitle || event.welcomeBannerDescription) && (
        <section className="container-wide py-4 md:py-6">
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
        <section className="container-wide py-10 md:py-14 border-t border-[hsl(var(--border)/0.6)]">
          <div className="mb-6">
            <div>
              <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
                Speakers
              </p>
              <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
                Featured Speakers
              </h2>
              <p className="mt-3 w-full text-base sm:text-lg font-medium leading-relaxed text-[hsl(var(--muted-foreground))] max-w-none">
                Learn from world-renowned keynote experts and pioneering practitioners leading the sessions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 sm:gap-x-5 gap-y-10 sm:gap-y-12">
            {featuredSpeakers.map((speaker, idx) => {
              const categoryKey = getSpeakerCategoryKey(speaker);
              const categoryConfig = getSpeakerCategoryConfig(speaker);
              const isKeynote = categoryKey === 'keynote';

              return (
                <div
                  key={speaker.name || idx}
                  onClick={() => setSelectedSpeaker(speaker)}
                  className="card-lift group relative flex flex-col items-center justify-between text-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--card))]/90 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden min-h-[310px]"
                >
                  {/* Lanyard Notch / ID Badge Slot */}
                  <div className="w-12 h-1.5 rounded-full bg-[hsl(var(--border))] mb-3.5 group-hover:bg-[hsl(var(--primary)/.4)] transition-colors shadow-inner shrink-0" />

                  {/* Top Center Circular Image */}
                  <div className="relative mb-3.5 shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-[hsl(var(--border))] group-hover:ring-[hsl(var(--primary)/.5)] transition-all duration-300 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary)/.15)] to-[hsl(var(--secondary)/.15)] shadow-md flex items-center justify-center">
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
                    </div>
                    {isKeynote && (
                      <div
                        title="Keynote Speaker"
                        className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg border-2 border-[hsl(var(--card))] z-10"
                      >
                        <Award size={14} className="stroke-[2.5]" />
                      </div>
                    )}
                  </div>

                  {/* Speaker Name */}
                  <h3 className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 text-center w-full px-1 min-h-[2.5rem] flex items-center justify-center leading-snug">
                    {speaker.name}
                  </h3>

                  {/* Category Tag */}
                  <div className="mt-1.5 mb-2.5 flex items-center justify-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${categoryConfig.badgeClass} shadow-2xs`}>
                      {isKeynote && <Award size={11} className="shrink-0" />}
                      {categoryConfig.label}
                    </span>
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-auto pt-3 w-full flex items-center justify-center border-t border-[hsl(var(--border)/.6)] text-xs">
                    <span className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] font-semibold text-xs group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all shadow-xs">
                      View Profile <ExternalLink size={12} />
                    </span>
                  </div>

                  {/* Decorative ID bottom stripe */}
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/.4)] to-transparent absolute bottom-0 left-0" />
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
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
        <section className="container-wide py-10 md:py-14 border-t border-[hsl(var(--border)/0.6)] text-center">
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
        <section className="container-wide py-6 md:py-8">
          <div className="mb-5">
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

          <div className="mt-6 text-center">
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
        <section className="container-wide py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
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

          <MediaPartnersMarquee partners={event.mediaPartners} />
        </section>
      )}

      {/* Frequently Asked Questions Section */}
      {faqs.length > 0 && (
      <section className="container-wide py-8 md:py-10">
        <div className="mb-6 text-center max-w-2xl mx-auto">
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

function MediaPartnersMarquee({ partners }: { partners: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build a repeated list so that there are enough items to loop seamlessly across all viewports
  const repeatedList = useMemo(() => {
    if (!partners || partners.length === 0) return [];
    let list = [...partners];
    while (list.length < 8) {
      list = [...list, ...partners];
    }
    return list;
  }, [partners]);

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: dir === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative group/marquee w-full overflow-hidden py-4 sm:py-6">
      {/* Subtle fade edges for clean transition */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[hsl(var(--background))] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[hsl(var(--background))] to-transparent z-10" />

      {/* Manual Left/Right Scroll Arrows (Visible on hover) */}
      <button
        type="button"
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white shadow-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center opacity-0 group-hover/marquee:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-md"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white shadow-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center opacity-0 group-hover/marquee:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-md"
      >
        <ChevronRight size={20} />
      </button>

      {/* Infinite Scrolling Track */}
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto scrollbar-none py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="animate-marquee-infinite flex gap-6 sm:gap-8 items-center shrink-0 pr-6 sm:pr-8 py-2">
          {repeatedList.map((partner, idx) => (
            <div key={`m1-${idx}`} className="w-56 sm:w-64 md:w-72 shrink-0">
              <PartnerLogoCard item={partner} defaultType={`Media Partner ${idx + 1}`} />
            </div>
          ))}
        </div>
        <div className="animate-marquee-infinite flex gap-6 sm:gap-8 items-center shrink-0 pr-6 sm:pr-8 py-2" aria-hidden="true">
          {repeatedList.map((partner, idx) => (
            <div key={`m2-${idx}`} className="w-56 sm:w-64 md:w-72 shrink-0">
              <PartnerLogoCard item={partner} defaultType={`Media Partner ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
