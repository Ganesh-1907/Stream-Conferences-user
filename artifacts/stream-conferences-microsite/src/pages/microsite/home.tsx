import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import {
  CalendarDays, Clock3, MapPin, Download, Users, ArrowUpRight, FileText,
  Timer, Award, Store, Sparkles, ChevronLeft, ChevronRight, ChevronsRight,
  Calendar, Megaphone, FileEdit, ListOrdered
} from 'lucide-react';
import type { EventData } from './layout';

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
      <div className="relative w-full aspect-[2.6/1] min-h-[200px] md:min-h-[250px] max-h-[340px] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-[hsl(var(--border))] group bg-black/5">
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
  const banner = mediaUrl(event.bannerUrl || '');
  const startDate = event.startDate || event.eventDate;
  const fees = Array.isArray(event.fees) ? event.fees : [];
  const speakersCount = Array.isArray(event.speakers) ? event.speakers.length : 0;
  const programDays = Array.isArray(event.program) ? event.program.length : 0;

  const isExpired = startDate ? new Date(startDate).getTime() < Date.now() : false;

  const headerBanners = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(event.headerBanners) && event.headerBanners.length > 0) {
      list.push(...event.headerBanners.map((u) => mediaUrl(u)));
    }
    if (event.bannerUrl && !event.bannerUrl.endsWith('.pdf')) {
      const bUrl = mediaUrl(event.bannerUrl);
      if (!list.includes(bUrl)) list.push(bUrl);
    }
    const fallbacks = [
      mediaUrl('/uploads/amsterdam_banner.png'),
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    ];
    for (const fb of fallbacks) {
      if (list.length < 3 && !list.includes(fb)) {
        list.push(fb);
      }
    }
    return list;
  }, [event.headerBanners, event.bannerUrl]);

  const quickLinks = [
    {
      title: 'Abstracts Submission',
      icon: FileText,
      href: '/submit-abstract',
      bg: 'bg-[#e11d48]',
      hoverBg: 'hover:bg-[#be123c]',
      hasNew: false,
    },
    {
      title: 'Registration',
      icon: FileEdit,
      href: '/register',
      bg: 'bg-[#708238]',
      hoverBg: 'hover:bg-[#58672c]',
      hasNew: true,
    },
    {
      title: 'Scientific Program',
      icon: ListOrdered,
      href: '/program',
      bg: 'bg-[#ea580c]',
      hoverBg: 'hover:bg-[#c2410c]',
      hasNew: true,
    },
    {
      title: 'Organizing Committee',
      icon: Users,
      href: '/speakers',
      bg: 'bg-[#84cc16]',
      hoverBg: 'hover:bg-[#65a30d]',
      hasNew: false,
    },
    {
      title: 'Call for Abstracts',
      icon: Megaphone,
      href: '/submit-abstract',
      bg: 'bg-[#2563eb]',
      hoverBg: 'hover:bg-[#1d4ed8]',
      hasNew: false,
    },
    {
      title: 'Brochure & Contact Details',
      icon: Download,
      href: event.brochureUrl ? mediaUrl(event.brochureUrl) : '/contact',
      isExternal: Boolean(event.brochureUrl),
      bg: 'bg-[#9333ea]',
      hoverBg: 'hover:bg-[#7e22ce]',
      hasNew: false,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden hero-grad text-[hsl(var(--primary-foreground))]">
        {banner && <img src={banner} alt={event.title} className="absolute inset-0 h-full w-full object-cover opacity-15" />}
        <div className="absolute inset-0 hero-grid-b" />
        <div className="absolute inset-0 hero-vignette" />
        <div className="relative container-wide py-20 md:py-28 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-center">
            <div>
              <span className="badge-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
                {event.eventType === 'conference' ? 'International Conference' : 'Live Webinar'}
              </span>
              <h1 className="mt-6 max-w-3xl font-['Space_Grotesk'] text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl text-balance">
                {event.title}
              </h1>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-base text-white/85">
                {formatDateRange(event) && (
                  <span className="inline-flex items-center gap-2"><CalendarDays size={16} className="text-[hsl(var(--accent))]" />{formatDateRange(event)}</span>
                )}
                {(event.startTime || event.endTime) && (
                  <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-[hsl(var(--accent))]" />{event.startTime || '—'} – {event.endTime || '—'}</span>
                )}
                {(event.venue || event.location) && (
                  <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-[hsl(var(--accent))]" />{event.venue || event.location}</span>
                )}
                {event.speaker && (
                  <span className="inline-flex items-center gap-2"><Users size={16} className="text-[hsl(var(--accent))]" />Speaker: {event.speaker}</span>
                )}
              </div>
              {event.theme && (
                <p className="mt-6 max-w-xl text-base leading-7 text-white/75 line-clamp-3">{event.theme}</p>
              )}
              {(() => {
                const cd = useCountdown(startDate);
                if (!cd) return null;
                return (
                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/60"><Timer size={15} />{cd.expired ? 'Event is live!' : 'Happening in'}</span>
                    {!cd.expired && (
                      <div className="flex gap-3">
                        {[
                          { v: cd.days, l: 'Days' },
                          { v: cd.hours, l: 'Hrs' },
                          { v: cd.mins, l: 'Min' },
                          { v: cd.secs, l: 'Sec' },
                        ].map((s) => (
                          <div key={s.l} className="flex flex-col items-center rounded-xl border border-white/15 bg-white/5 backdrop-blur px-4 py-2 min-w-[60px]">
                            <span className="text-2xl font-bold tabular-nums text-white">{String(s.v).padStart(2, '0')}</span>
                            <span className="text-[10px] uppercase tracking-wider text-white/50">{s.l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/register" className="btn-main btn-grad rounded-xl px-7 py-4 text-sm">
                  Register Now <ArrowUpRight size={17} />
                </Link>
                <Link href="/submit-abstract" className="btn-main rounded-xl border border-white/30 bg-white/5 px-7 py-4 text-sm text-white hover:bg-white/10">
                  Submit Abstract <FileText size={17} />
                </Link>
                {event.brochureUrl && (
                  <a href={mediaUrl(event.brochureUrl)} target="_blank" rel="noreferrer" className="btn-main rounded-xl border border-white/30 bg-white/5 px-7 py-4 text-sm text-white hover:bg-white/10">
                    <Download size={17} /> Brochure
                  </a>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
                <p className="font-mono text-[11px] uppercase tracking-[.2em] text-white/60">Event at a glance</p>
                <div className="mt-6 grid grid-cols-2 gap-5">
                  {startDate && (
                    <div>
                      <p className="text-xs text-white/60">Date</p>
                      <p className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-white">{new Date(startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  )}
                  {(event.venue || event.location) && (
                    <div>
                      <p className="text-xs text-white/60">Venue</p>
                      <p className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-white">{event.venue || event.location}</p>
                    </div>
                  )}
                  {fees.length > 0 && (
                    <div>
                      <p className="text-xs text-white/60">Registrations</p>
                      <p className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-white">{fees.length} categories</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-white/60">{event.eventType === 'conference' ? 'Sessions' : 'Format'}</p>
                    <p className="mt-1 font-['Space_Grotesk'] text-xl font-bold text-white">{programDays || (event.eventType === 'webinar' ? 'Live' : 'In-person')}</p>
                  </div>
                </div>
                {speakersCount > 0 && (
                  <div className="mt-6 flex items-center gap-3 border-t border-white/12 pt-5">
                    <div className="flex -space-x-2">
                      {(event.speakers || []).slice(0, 4).map((s, i) => (
                        s.avatar
                          ? <img key={i} src={mediaUrl(s.avatar)} alt={s.name} className="h-9 w-9 rounded-full border-2 border-[hsl(216,60%,16%)] object-cover" />
                          : <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[hsl(216,60%,16%)] bg-white/20 text-xs font-bold">{s.name.charAt(0)}</span>
                      ))}
                    </div>
                    <p className="text-xs text-white/70"><span className="font-bold text-white">{speakersCount}</span> speakers</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {startDate && (
              <div className="stat-card text-center">
                <div className="stat-num">{new Date(startDate).toLocaleDateString(undefined, { day: '2-digit' })}</div>
                <div className="stat-label">{new Date(startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
              </div>
            )}
            <div className="stat-card text-center">
              <div className="stat-num">{fees.length || '—'}</div>
              <div className="stat-label">Fee Categories</div>
            </div>
            <div className="stat-card text-center">
              <div className="stat-num">{speakersCount || '—'}</div>
              <div className="stat-label">Speakers</div>
            </div>
            <div className="stat-card text-center">
              <div className="stat-num">{programDays || (event.eventType === 'webinar' ? '1' : '—')}</div>
              <div className="stat-label">Days</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Banner Carousel, Logo, CTAs & Quick Action Navigation (Matching Reference Design) */}
      <section className="container-wide py-12 md:py-16 border-b border-[hsl(var(--border))]">
        {/* Header Title & Date/Mode */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f4c81] dark:text-cyan-400 mb-1.5 block">
              Official Conference Overview
            </span>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1e3a8a] dark:text-blue-300 max-w-3xl">
              {event.title}
            </h2>
          </div>
          <div className="md:text-right shrink-0 bg-muted/20 border border-foreground/5 p-3.5 rounded-2xl">
            <p className="font-bold text-sm md:text-base text-[#65a30d] dark:text-lime-400">
              {formatDateRange(event) || 'November 02-04, 2026'}
            </p>
            <p className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {event.venue || event.location || (event.eventType === 'webinar' ? 'Virtual Conference' : 'Hybrid Conference')}
            </p>
          </div>
        </div>

        {/* 2-Column Grid: Left Carousel, Right Logo & CTAs */}
        <div className="grid lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Left Column: Banner Carousel */}
          <div>
            <HeaderBannerCarousel
              banners={headerBanners}
              title={event.title}
              location={event.venue || event.location || ''}
            />
          </div>

          {/* Right Column: Date, Logo, and Action Buttons (Matching Screenshot) */}
          <div className="flex flex-col items-center justify-center text-center">
            {/* Date & Format above logo */}
            <div className="mb-2">
              <p className="font-bold text-sm md:text-base text-[#65a30d] dark:text-lime-400">
                {formatDateRange(event) || 'November 02-04, 2026'}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {event.venue || event.location || (event.eventType === 'webinar' ? 'Virtual Conference' : 'Hybrid Conference')}
              </p>
            </div>

            {/* Circular Logo (Matching Screenshot) */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-[#0f4c81]/30 bg-white shadow-xl flex items-center justify-center p-3 my-2 overflow-hidden group">
              {event.logoUrl ? (
                <img
                  src={mediaUrl(event.logoUrl)}
                  alt={event.title}
                  className="w-full h-full object-contain rounded-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0f4c81] to-[#0d9488] flex flex-col items-center justify-center text-white p-3 text-center">
                  <Award size={36} />
                  <span className="text-[11px] font-bold mt-1 line-clamp-2 uppercase tracking-tight">{event.title}</span>
                </div>
              )}
            </div>

            {/* Quick Action Navigation Buttons beside Logo */}
            <div className="flex flex-col items-center gap-2.5 w-full mt-2">
              <Link
                href="/submit-abstract"
                className="inline-flex items-center justify-center gap-2 w-full max-w-[260px] px-6 py-2.5 rounded-full bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border-2 border-[#155e75]/40 cursor-pointer"
              >
                <ChevronsRight size={18} className="text-[#38bdf8]" />
                <span>SUBMIT YOUR ABSTRACT</span>
              </Link>

              <button
                type="button"
                onClick={() => createCalendarReminder(event)}
                className="inline-flex items-center justify-center gap-2 w-full max-w-[220px] px-5 py-2 rounded-full bg-[#262626] hover:bg-black text-white font-medium text-xs shadow hover:shadow-md transition-all cursor-pointer"
                title="Add to Calendar"
              >
                <Calendar size={14} className="text-white/80" />
                <span>Reminder to Join !!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator (Matching "EXPIRED" / "REGISTRATIONS OPEN") */}
        <div className="mt-12 text-center">
          {isExpired ? (
            <div className="font-['Space_Grotesk'] text-3xl md:text-4xl font-extrabold tracking-widest text-slate-800 dark:text-slate-100 uppercase">
              EXPIRED
            </div>
          ) : (
            <div className="font-['Space_Grotesk'] text-2xl md:text-3xl font-extrabold tracking-wider text-[#0f4c81] dark:text-blue-400 uppercase">
              REGISTRATIONS OPEN
            </div>
          )}
        </div>

        {/* Quick Links Header & Navigation Grid (Matching Screenshot) */}
        <div className="mt-6 flex flex-col items-center">
          <span className="inline-block bg-[#dc2626] text-white text-xs font-bold uppercase tracking-widest px-5 py-1.5 rounded-md shadow-sm mb-6">
            QUICK LINKS
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-6xl">
            {quickLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noreferrer' : undefined}
                className={`relative flex flex-col items-center justify-center text-center p-5 rounded-xl text-white ${item.bg} ${item.hoverBg} shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 group min-h-[110px] cursor-pointer`}
              >
                {item.hasNew && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#ef4444] border border-white/40 text-white text-[9px] font-black uppercase tracking-wider rounded shadow-sm">
                    New
                  </span>
                )}
                <item.icon size={28} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold leading-tight line-clamp-2">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="container-wide py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {event.description && (
            <Link href="/about" className="block rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary)/.5)] hover:shadow-lg transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">About</p>
              <p className="text-base text-[hsl(var(--muted-foreground))] line-clamp-3">{event.description.substring(0, 150)}...</p>
            </Link>
          )}
          {event.speakers && event.speakers.length > 0 && (
            <Link href="/speakers" className="block rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary)/.5)] hover:shadow-lg transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--secondary))] mb-2">Speakers</p>
              <p className="text-base text-[hsl(var(--muted-foreground))]">{event.speakers.length} speakers featured</p>
            </Link>
          )}
          {event.fees && event.fees.length > 0 && (
            <Link href="/fees" className="block rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 hover:border-[hsl(var(--primary)/.5)] hover:shadow-lg transition-all">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent))] mb-2">Registration</p>
              <p className="text-base text-[hsl(var(--muted-foreground))]">{event.fees.length} fee categories available</p>
            </Link>
          )}
        </div>
      </section>

      {/* Sponsors & Exhibitors Section */}
      <section className="container-wide pb-16">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted)/.4)] p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="section-eyebrow">Sponsors & Exhibitors</span>
              <h2 className="mt-3 text-2xl md:text-4xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
                Showcase Your Organization at {event.title}
              </h2>
              <p className="mt-3 text-sm md:text-base text-[hsl(var(--muted-foreground))] leading-relaxed">
                Connect with leading researchers, clinicians, and industry authorities. Maximize your reach through our tailored sponsorship tiers and premier exhibition space.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/sponsors" className="btn-main btn-primary text-xs py-3 px-6">
                View All Packages <ArrowUpRight size={15} />
              </Link>
              <Link href="/sponsors#enquire" className="btn-main btn-quiet text-xs py-3 px-6">
                Enquire Now
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Elite Sponsor', desc: '10 Poster Awards, 3 Workshop Slots, 2 Booths (3x3), 4 Passes, 20% Future Waiver', highlight: true },
              { title: 'Gold Sponsor', desc: '5 Poster Awards, 2 Workshop Slots, 1 Booth (3x3), 3 Passes, 15% Future Waiver', highlight: false },
              { title: 'Silver Sponsor', desc: '3 Poster Awards, 1 Workshop Slot, 1 Booth (3x3), 2 Passes, 10% Future Waiver', highlight: false },
              { title: 'Exhibition', desc: 'Tailor-made 3x3 sqm Booth, 1 Pass, Delegate Bags Insert, 5% Future Waiver', highlight: false },
            ].map((tier, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  tier.highlight
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--card))] shadow-sm'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono uppercase font-bold tracking-wider ${tier.highlight ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--secondary))]'}`}>
                    Tier {idx + 1}
                  </span>
                  {tier.highlight && <Sparkles size={14} className="text-[hsl(var(--primary))]" />}
                </div>
                <h3 className="mt-2 text-lg font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
                  {tier.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                  {tier.desc}
                </p>
              </div>
            ))}
          </div>

          {((event.partners && event.partners.length > 0) || (event.sponsors && event.sponsors.length > 0) || (event.exhibitors && event.exhibitors.length > 0)) && (
            <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3">
                Confirmed Sponsors & Exhibitors:
              </p>
              <div className="flex flex-wrap gap-2">
                {((event.partners && event.partners.length > 0) ? event.partners : (event.sponsors || event.exhibitors || [])).map((p, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-semibold text-[hsl(var(--foreground))]">
                    <Store size={13} className="text-[hsl(var(--primary))]" /> {p.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
