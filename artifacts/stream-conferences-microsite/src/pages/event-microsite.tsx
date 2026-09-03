import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Download,
  Users,
  ArrowUpRight,
  Check,
  Mail,
  Phone,
  FileText,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  Map,
  Building,
  HelpCircle,
  BookOpen,
  FileCheck,
  Award,
  Presentation,
  MessageSquare,
  Globe,
  Linkedin,
  Twitter,
  Sun,
  Moon,
  Image,
  Layers,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';
const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';

const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  track?: string;
  type?: 'session' | 'break' | 'keynote' | 'panel' | 'workshop' | 'networking';
}

interface Speaker {
  name: string;
  designation?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  topic?: string;
  isKeynote?: boolean;
}

interface ProgramDay {
  dayNumber: number;
  date?: string;
  title?: string;
  description?: string;
  sessions: ItineraryItem[];
}

interface FAQ {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

interface Sponsor {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'supporter';
  order?: number;
}

interface Exhibitor {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  contactEmail?: string;
  order?: number;
}

interface VenueDetails {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
  images?: string[];
  mapUrl?: string;
  directions?: string;
  parking?: string;
  accommodation?: string;
}

interface EventData {
  _id: string;
  eventId?: string;
  eventType: 'conference' | 'webinar';
  title: string;
  slug?: string;
  subdomain?: string;
  description?: string;
  day?: string;
  month?: string;
  location?: string;
  venue?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  eventDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  speaker?: string;
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  fees?: { label: string; amount: number }[];
  tracks?: { title: string; description?: string; image?: string; referenceLinks?: { label: string; url: string }[] }[];
  organizerContact?: { name?: string; email?: string; phone?: string; website?: string; address?: string };

  itinerary?: ItineraryItem[];
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  sponsors?: Sponsor[];
  exhibitors?: Exhibitor[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
}

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

function useTheme() {
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('stream-theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

interface SectionDef { id: string; label: string; icon: any; show: boolean; }

function buildSections(event: EventData): SectionDef[] {
  const program = Array.isArray(event.program) ? event.program : [];
  const speakers = Array.isArray(event.speakers) ? event.speakers : [];
  const itinerary = Array.isArray(event.itinerary) ? event.itinerary : [];
  const sponsors = Array.isArray(event.sponsors) ? event.sponsors : [];
  const exhibitors = Array.isArray(event.exhibitors) ? event.exhibitors : [];
  const faqs = Array.isArray(event.faqs) ? event.faqs : [];
  const fees = Array.isArray(event.fees) ? event.fees : [];
  const tracks = Array.isArray(event.tracks) ? event.tracks : [];
  const venue = event.venueDetails || {};

  const list: SectionDef[] = [
    { id: 'about', label: 'About', icon: <Layers size={16} />, show: Boolean(event.description) },
    { id: 'program', label: 'Program', icon: <Presentation size={16} />, show: program.length > 0 },
    { id: 'speakers', label: 'Speakers', icon: <Users size={16} />, show: speakers.length > 0 },
    { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays size={16} />, show: itinerary.length > 0 },
    { id: 'sponsors', label: 'Sponsors', icon: <Award size={16} />, show: sponsors.length > 0 },
    { id: 'exhibitors', label: 'Exhibitors', icon: <Building size={16} />, show: exhibitors.length > 0 },
    { id: 'resources', label: 'Brochure & Logo', icon: <Image size={16} />, show: Boolean(event.brochureUrl || event.logoUrl || event.bannerUrl) },
    { id: 'fees', label: 'Fees', icon: <FileText size={16} />, show: fees.length > 0 },
    { id: 'tracks', label: 'Tracks', icon: <Layers size={16} />, show: tracks.length > 0 },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} />, show: faqs.length > 0 },
    { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={16} />, show: Boolean(event.guidelines) },
    { id: 'venue', label: 'Venue', icon: <MapPin size={16} />, show: Boolean(venue.name || venue.address || venue.city || venue.mapUrl || event.venue || event.location) },
    { id: 'contact', label: 'Contact', icon: <MessageSquare size={16} />, show: Boolean(event.organizerContact && (event.organizerContact.email || event.organizerContact.phone)) },
  ];
  return list.filter((s) => s.show);
}

function Section({ id, eyebrow, title, subtitle, children, first = false }: { id: string; eyebrow: string; title: string; subtitle?: string; children: React.ReactNode; first?: boolean }) {
  return (
    <section id={id} className={`scroll-mt-24 ${first ? '' : 'border-t border-[hsl(var(--border))]'}`}>
      <div className="container-wide py-10 md:py-14">
        <div className="flex items-center gap-3 mb-2">
          <span className="section-eyebrow">{eyebrow}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

// ============ HERO ============
function Hero({ event }: { event: EventData }) {
  const banner = mediaUrl(event.bannerUrl || '');
  const startDate = event.startDate || event.eventDate;
  const fees = Array.isArray(event.fees) ? event.fees : [];
  const speakersCount = Array.isArray(event.speakers) ? event.speakers.length : 0;
  const programDays = Array.isArray(event.program) ? event.program.length : 0;

  return (
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
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/85">
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
            {event.description && (
              <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/75 line-clamp-3">{event.description.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim()}</p>
            )}
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
  );
}

// ============ SECTION: About ============
function AboutSection({ event }: { event: EventData }) {
  if (!event.description) return null;
  return (
    <Section id="about" eyebrow="About" title="About the event" first>
      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))] whitespace-pre-wrap leading-relaxed">{event.description}</div>
    </Section>
  );
}

// ============ SECTION: Program ============
function ProgramSection({ event }: { event: EventData }) {
  const program = event.program || [];
  const [activeDay, setActiveDay] = useState(1);
  if (program.length === 0) return null;
  const currentDay = program.find((d) => d.dayNumber === activeDay) || program[0];

  return (
    <Section id="program" eyebrow="Program" title="Conference program" subtitle="Explore the schedule, sessions and events">
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        {program.map((day) => (
          <button
            key={day.dayNumber}
            onClick={() => setActiveDay(day.dayNumber)}
            className={`px-5 py-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeDay === day.dayNumber
                ? 'bg-[hsl(var(--primary))] text-white'
                : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <span className="block">Day {day.dayNumber}</span>
            {day.title && <span className="block text-xs mt-0.5 opacity-80">{day.title}</span>}
            {day.date && <span className="block text-xs mt-0.5 opacity-60">{new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
          </button>
        ))}
      </div>

      {currentDay && (
        <div>
          {currentDay.description && (
            <p className="text-[hsl(var(--muted-foreground))] mb-6 italic">{currentDay.description}</p>
          )}
          <div>
            {currentDay.sessions.map((session, idx) => (
              <div key={idx} className="session-item">
                <div className="flex items-start gap-4">
                  <div className="session-time min-w-[90px]">{session.time}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="session-title">{session.title}</h3>
                      {session.type && <span className="session-badge">{session.type}</span>}
                    </div>
                    {session.description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{session.description}</p>}
                    <div className="session-meta">
                      {session.speaker && <span>{session.speaker}</span>}
                      {session.track && <span>{session.track}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

// ============ SECTION: Speakers ============
function SpeakersSection({ event }: { event: EventData }) {
  const speakers = event.speakers || [];
  if (speakers.length === 0) return null;
  const keynoteSpeakers = speakers.filter((s) => s.isKeynote);
  const otherSpeakers = speakers.filter((s) => !s.isKeynote);

  const SpeakerCard = ({ speaker, isKeynote = false }: { speaker: Speaker; isKeynote?: boolean }) => (
    <div className="speaker-item">
      {speaker.avatar ? (
        <img src={mediaUrl(speaker.avatar)} alt={speaker.name} className="speaker-avatar" />
      ) : (
        <div className="speaker-avatar-placeholder">{speaker.name.charAt(0)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="speaker-name">{speaker.name}</h3>
          {isKeynote && <span className="session-badge bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] text-white">Keynote</span>}
        </div>
        {speaker.designation && <p className="speaker-role">{speaker.designation}</p>}
        {speaker.organization && <p className="speaker-org">{speaker.organization}</p>}
        {speaker.topic && <span className="speaker-topic"><Presentation size={12} />{speaker.topic}</span>}
        {speaker.bio && <p className="speaker-bio line-clamp-2">{speaker.bio}</p>}
        <div className="speaker-socials">
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Linkedin size={16} /></a>
          )}
          {speaker.twitter && (
            <a href={speaker.twitter} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Twitter size={16} /></a>
          )}
          {speaker.website && (
            <a href={speaker.website} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Globe size={16} /></a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Section id="speakers" eyebrow="Speakers" title="Meet our speakers" subtitle="Esteemed speakers and keynote presenters">
      {keynoteSpeakers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award size={18} className="text-[hsl(var(--accent))]" />
            Keynote Speakers
          </h3>
          <div>
            {keynoteSpeakers.map((speaker) => <SpeakerCard key={speaker.name} speaker={speaker} isKeynote />)}
          </div>
        </div>
      )}
      {otherSpeakers.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4">Speakers</h3>
          <div>
            {otherSpeakers.map((speaker) => <SpeakerCard key={speaker.name} speaker={speaker} />)}
          </div>
        </div>
      )}
    </Section>
  );
}

// ============ SECTION: Itinerary ============
function ItinerarySection({ event }: { event: EventData }) {
  const itinerary = event.itinerary || [];
  if (itinerary.length === 0) return null;

  return (
    <Section id="itinerary" eyebrow="Itinerary" title="Detailed schedule" subtitle="A day-by-day guide to the event">
      <div>
        {itinerary.map((item, idx) => (
          <div key={idx} className="timeline-item">
            <div className="flex items-center gap-3">
              <span className="session-time">{item.time}</span>
              {item.type && <span className="session-badge">{item.type}</span>}
            </div>
            <h3 className="session-title mt-1">{item.title}</h3>
            {item.description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{item.description}</p>}
            <div className="session-meta">
              {item.speaker && <span>{item.speaker}</span>}
              {item.track && <span>{item.track}</span>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============ SECTION: Sponsors & Exhibitors ============
function SponsorGrid({ items }: { items: Sponsor[] }) {
  return (
    <div className="partner-grid">
      {items.map((s) => (
        <a key={s.name} href={s.website || '#'} target={s.website ? '_blank' : undefined} rel={s.website ? 'noopener noreferrer' : undefined} className="partner-item">
          {s.logo ? (
            <img src={mediaUrl(s.logo)} alt={s.name} className="partner-logo" />
          ) : (
            <div className="partner-logo flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">{s.name.charAt(0)}</div>
          )}
          <p className="partner-name">{s.name}</p>
          {s.description && <p className="partner-desc line-clamp-2">{s.description}</p>}
        </a>
      ))}
    </div>
  );
}

function PartnersSection({ event }: { event: EventData }) {
  const sponsors = event.sponsors || [];
  const exhibitors = event.exhibitors || [];
  const tierOrder = ['platinum', 'gold', 'silver', 'bronze', 'supporter'];
  const tierColors: Record<string, string> = {
    platinum: 'from-slate-300 to-slate-400',
    gold: 'from-yellow-400 to-yellow-500',
    silver: 'from-gray-300 to-gray-400',
    bronze: 'from-orange-300 to-orange-400',
    supporter: 'from-blue-200 to-blue-300',
  };
  const groupedSponsors = sponsors.reduce((acc, sponsor) => {
    const tier = sponsor.tier || 'supporter';
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  return (
    <>
      {sponsors.length > 0 && (
        <Section id="sponsors" eyebrow="Partners" title="Our sponsors" subtitle="Thank you to our valued sponsors">
          {tierOrder.map((tier) => {
            const tierSponsors = groupedSponsors[tier];
            if (!tierSponsors || tierSponsors.length === 0) return null;
            return (
              <div key={tier} className="mb-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-4 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${tierColors[tier]}`} />
                  {tier} Sponsors
                </h3>
                <SponsorGrid items={tierSponsors} />
              </div>
            );
          })}
        </Section>
      )}

      {exhibitors.length > 0 && (
        <Section id="exhibitors" eyebrow="Exhibitors" title="Exhibitors" subtitle="Explore the exhibitors at the event">
          <div className="partner-grid">
            {exhibitors.map((exhibitor) => (
              <a key={exhibitor.name} href={exhibitor.website || '#'} target={exhibitor.website ? '_blank' : undefined} rel={exhibitor.website ? 'noopener noreferrer' : undefined} className="partner-item">
                {exhibitor.logo ? (
                  <img src={mediaUrl(exhibitor.logo)} alt={exhibitor.name} className="partner-logo" />
                ) : (
                  <div className="partner-logo flex items-center justify-center text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] bg-clip-text text-transparent">{exhibitor.name.charAt(0)}</div>
                )}
                <p className="partner-name">{exhibitor.name}</p>
                {exhibitor.description && <p className="partner-desc line-clamp-2">{exhibitor.description}</p>}
              </a>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

// ============ SECTION: Resources (Brochure & Logo) ============
function ResourcesSection({ event }: { event: EventData }) {
  const has = Boolean(event.brochureUrl || event.logoUrl || event.bannerUrl);
  if (!has) return null;

  const items: { label: string; url?: string; icon: any }[] = [
    { label: 'Event Brochure', url: event.brochureUrl || '', icon: <FileText size={18} /> },
    { label: 'Event Logo', url: event.logoUrl || '', icon: <Image size={18} /> },
    { label: 'Banner', url: event.bannerUrl || '', icon: <Image size={18} /> },
  ].filter((i) => i.url);

  if (items.length === 0) return null;

  return (
    <Section id="resources" eyebrow="Resources" title="Brochure & logo" subtitle="Download the official event assets">
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <a key={item.label} href={mediaUrl(item.url || '')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary) / .5)] hover:bg-[hsl(var(--primary) / .05)] transition-colors">
            <span className="text-[hsl(var(--primary))]">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
            <Download size={14} className="text-[hsl(var(--muted-foreground))]" />
          </a>
        ))}
      </div>
    </Section>
  );
}

// ============ SECTION: Fees ============
function FeesSection({ event }: { event: EventData }) {
  const fees = Array.isArray(event.fees) ? event.fees : [];
  if (fees.length === 0) return null;
  return (
    <Section id="fees" eyebrow="Registration" title="Participation fees" subtitle="Choose your registration category">
      <div className="space-y-4">
        {fees.map((f, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-[hsl(var(--border))] last:border-0">
            <div>
              <p className="font-semibold text-[hsl(var(--foreground))]">{f.label}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Per delegate</p>
            </div>
            <div className="text-right">
              <p className="font-['Space_Grotesk'] text-2xl font-bold text-[hsl(var(--primary))]">₹{Number(f.amount).toLocaleString('en-IN')}</p>
              <Link href="/register" className="text-sm text-[hsl(var(--primary))] font-medium hover:underline">Register →</Link>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============ SECTION: Tracks ============
function TracksSection({ event }: { event: EventData }) {
  const tracks = Array.isArray(event.tracks) ? event.tracks : [];
  if (tracks.length === 0) return null;
  return (
    <Section id="tracks" eyebrow="Themes" title="Conference tracks" subtitle="The thematic tracks to explore">
      <div className="space-y-6">
        {tracks.map((track, i) => (
          <div key={i} className="flex gap-4 pb-6 border-b border-[hsl(var(--border))] last:border-0 last:pb-0">
            {track.image ? (
              <img src={mediaUrl(track.image)} alt={track.title} className="w-16 h-16 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 shrink-0 rounded-xl bg-[hsl(var(--primary) / .1)] flex items-center justify-center text-xl font-bold text-[hsl(var(--primary))]">{(i + 1).toString().padStart(2, '0')}</div>
            )}
            <div>
              <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">{track.title}</h3>
              {track.description && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{track.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============ SECTION: FAQ ============
function FAQSection({ event }: { event: EventData }) {
  const faqs = event.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (faqs.length === 0) return null;
  const sortedFaqs = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <Section id="faq" eyebrow="FAQ" title="Frequently asked questions" subtitle="Find answers to common questions">
      <div>
        {sortedFaqs.map((faq, idx) => (
          <div key={idx} className="faq-item">
            <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="faq-question">
              <span>{faq.question}</span>
              <ChevronDown size={18} className={`text-[hsl(var(--muted-foreground))] transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============ SECTION: Guidelines ============
function GuidelinesSection({ event }: { event: EventData }) {
  if (!event.guidelines) return null;
  return (
    <Section id="guidelines" eyebrow="Guidelines" title="Important guidelines" subtitle="Everything participants need to know">
      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: event.guidelines }} />
    </Section>
  );
}

// ============ SECTION: Venue ============
function VenueSection({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};
  const has = Boolean(venue.name || venue.address || venue.city || venue.mapUrl || event.venue || event.location || venue.description || venue.directions);
  if (!has) return null;

  return (
    <Section id="venue" eyebrow="Venue" title="Event location" subtitle="Getting there, accommodation and directions">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-[hsl(var(--foreground))]">
              <Building size={18} className="text-[hsl(var(--primary))]" />
              {venue.name || event.venue || 'Venue'}
            </h3>
            {(venue.address || event.venueAddress || event.location) && (
              <div className="mt-2 flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p>{venue.address || event.venueAddress}</p>
                  {venue.city && <p>{venue.city}{venue.state && `, ${venue.state}`}{venue.country && `, ${venue.country}`}</p>}
                  {venue.pincode && <p>PIN: {venue.pincode}</p>}
                  {!venue.city && event.location && <p>{event.location}</p>}
                </div>
              </div>
            )}
            {venue.description && <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{venue.description}</p>}
          </div>

          {venue.directions && (
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2"><Map size={16} className="text-[hsl(var(--primary))]" />How to Reach</h4>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{venue.directions}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {venue.parking && (
              <div>
                <h4 className="font-semibold text-sm">Parking</h4>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{venue.parking}</p>
              </div>
            )}
            {venue.accommodation && (
              <div>
                <h4 className="font-semibold text-sm">Accommodation</h4>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{venue.accommodation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(venue.mapUrl || event.venueMapUrl) ? (
            <div className="rounded-xl overflow-hidden border border-[hsl(var(--border))]">
              <iframe src={venue.mapUrl || event.venueMapUrl} width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center border border-[hsl(var(--border))] rounded-xl">
              <Map size={48} className="text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-[hsl(var(--muted-foreground))]">Map will be available soon</p>
            </div>
          )}
          {venue.images && venue.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {venue.images.map((img, idx) => <img key={idx} src={mediaUrl(img)} alt={`Venue ${idx + 1}`} className="rounded-lg object-cover w-full h-32" />)}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ============ SECTION: Contact ============
function ContactSection({ event }: { event: EventData }) {
  const contact = event.organizerContact;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section id="contact" eyebrow="Contact" title="Contact us" subtitle="Get in touch with the organizers">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-bold text-lg mb-4">Organizer Contact</h3>
          {contact?.name && <p className="font-semibold text-[hsl(var(--foreground))]">{contact.name}</p>}
          <div className="mt-3 space-y-2">
            {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Mail size={16} />{contact.email}</a>}
            {contact?.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Phone size={16} />{contact.phone}</a>}
            {contact?.website && <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Globe size={16} />{contact.website}</a>}
            {contact?.address && <div className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"><MapPin size={16} className="mt-0.5" />{contact.address}</div>}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4">Send a Message</h3>
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-[hsl(var(--primary) / .1)] flex items-center justify-center text-[hsl(var(--primary))]"><Check size={24} /></div>
              <p className="mt-4 font-semibold">Message sent successfully!</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-xs font-semibold">Name *</label><input required className="form-field mt-1.5 w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><label className="text-xs font-semibold">Email *</label><input required type="email" className="form-field mt-1.5 w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              </div>
              <div><label className="text-xs font-semibold">Subject *</label><input required className="form-field mt-1.5 w-full" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
              <div><label className="text-xs font-semibold">Message *</label><textarea required rows={4} className="form-field mt-1.5 w-full resize-none" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} /></div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-main btn-primary disabled:opacity-50">{submitting ? 'Sending...' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

// ============ TERMS SECTION ============
function TermsSection({ event }: { event: EventData }) {
  if (!event.termsAndConditions) return null;
  return (
    <Section id="terms" eyebrow="Terms" title="Terms & Conditions" subtitle="Please read the terms and conditions carefully">
      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: event.termsAndConditions }} />
    </Section>
  );
}

// ============ SINGLE PAGE ============
function EventPage({ event }: { event: EventData }) {
  return (
    <>
      <Hero event={event} />
      <div className="container-wide py-8">
        <div className="flex gap-8">
          {/* Left Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-[80px] h-fit">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-1 shadow-sm">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Conference Information</p>
              <SidebarLinks event={event} />
            </div>

            {/* Quick Links */}
            <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-1 shadow-sm">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Quick Links</p>
              <Link href="/register" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary) / .1)]">
                <FileText size={16} />Register Now
              </Link>
              <Link href="/submit-abstract" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary) / .1)]">
                <FileText size={16} />Submit Abstract
              </Link>
              {event?.brochureUrl && (
                <a href={mediaUrl(event.brochureUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent) / .1)]">
                  <Download size={16} />Brochure
                </a>
              )}
            </div>

            {/* Event Date Card */}
            <div className="mt-4 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Event Date</p>
                <p className="mt-2 font-['Space_Grotesk'] text-xl font-bold">
                  {formatDateRange(event) || 'TBA'}
                </p>
                {(event.venue || event.location) && (
                  <p className="mt-2 text-xs opacity-80 flex items-center gap-1">
                    <MapPin size={12} />{event.venue || event.location}
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Sections */}
          <main className="flex-1 min-w-0 space-y-0">
            <AboutSection event={event} />
            <ProgramSection event={event} />
            <SpeakersSection event={event} />
            <ItinerarySection event={event} />
            <PartnersSection event={event} />
            <ResourcesSection event={event} />
            <FeesSection event={event} />
            <TracksSection event={event} />
            <FAQSection event={event} />
            <GuidelinesSection event={event} />
            <VenueSection event={event} />
            <ContactSection event={event} />
            <TermsSection event={event} />
          </main>
        </div>
      </div>
    </>
  );
}

function SidebarLinks({ event }: { event: EventData }) {
  const [activeSection, setActiveSection] = useState('');
  const [location] = useLocation();
  const [, navigate] = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    const sections = ['about', 'program', 'speakers', 'itinerary', 'sponsors', 'exhibitors', 'resources', 'fees', 'tracks', 'faq', 'guidelines', 'venue', 'contact', 'terms'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    if (location !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'about', label: 'About', icon: <Layers size={16} />, show: Boolean(event.description) },
    { id: 'program', label: 'Program', icon: <Presentation size={16} />, show: Boolean(event.program?.length) },
    { id: 'speakers', label: 'Speakers', icon: <Users size={16} />, show: Boolean(event.speakers?.length) },
    { id: 'itinerary', label: 'Itinerary', icon: <CalendarDays size={16} />, show: Boolean(event.itinerary?.length) },
    { id: 'sponsors', label: 'Sponsors', icon: <Award size={16} />, show: Boolean(event.sponsors?.length) },
    { id: 'exhibitors', label: 'Exhibitors', icon: <Building size={16} />, show: Boolean(event.exhibitors?.length) },
    { id: 'resources', label: 'Brochure', icon: <Image size={16} />, show: Boolean(event.brochureUrl || event.logoUrl) },
    { id: 'fees', label: 'Fees', icon: <FileText size={16} />, show: Boolean(event.fees?.length) },
    { id: 'tracks', label: 'Tracks', icon: <Layers size={16} />, show: Boolean(event.tracks?.length) },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={16} />, show: Boolean(event.faqs?.length) },
    { id: 'guidelines', label: 'Guidelines', icon: <BookOpen size={16} />, show: Boolean(event.guidelines) },
    { id: 'venue', label: 'Venue', icon: <MapPin size={16} />, show: Boolean(event.venue || event.venueDetails?.name) },
    { id: 'contact', label: 'Contact', icon: <MessageSquare size={16} />, show: Boolean(event.organizerContact?.email) },
    { id: 'terms', label: 'Terms', icon: <FileCheck size={16} />, show: Boolean(event.termsAndConditions) },
  ];

  return (
    <div className="space-y-1">
      {navItems.filter(item => item.show).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => scrollTo(item.id)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === item.id
              ? 'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white shadow-sm'
              : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============ SHELL ============
function EventShell({ children, event, sections }: { children: React.ReactNode; event: EventData | null; sections: SectionDef[] }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { dark, toggle } = useTheme();
  const [, navigate] = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (location !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollTop = () => {
    setMobileMenuOpen(false);
    if (location !== '/') navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sidebarLink = (def: SectionDef) => (
    <button
      type="button"
      onClick={() => scrollTo(def.id)}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        activeSection === def.id
          ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] shadow-sm'
          : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
      }`}
    >
      {def.icon}
      <span>{def.label}</span>
    </button>
  );

  const actionLink = (path: string, label: string, icon: React.ReactNode) => (
    <Link href={path} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
      {icon}{label}
    </Link>
  );

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] backdrop-blur-lg">
        <div className="container-wide flex items-center justify-between gap-4 py-3">
          <button type="button" onClick={scrollTop} className="flex items-center gap-3 min-w-0">
            {event?.logoUrl && <img src={mediaUrl(event.logoUrl)} alt={event.title} className="h-10 w-10 rounded-xl object-cover shadow-lg" />}
            <span className="truncate font-['Space_Grotesk'] font-bold tracking-tight text-sm md:text-base">{event?.title || 'Event'}</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <button type="button" onClick={scrollTop} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
              <Globe size={16} />Home
            </button>
            {sections.slice(0, 6).map((def) => (
              <button
                key={def.id}
                type="button"
                onClick={() => scrollTo(def.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === def.id
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {def.icon}{def.label}
              </button>
            ))}
            {sections.length > 6 && (
              <div className="relative group">
                <button type="button" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                  More <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl py-1">
                  {sections.slice(6).map((def) => (
                    <button
                      key={def.id}
                      type="button"
                      onClick={() => scrollTo(def.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                    >
                      {def.icon}{def.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={toggle} aria-label="Toggle theme" className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden lg:flex items-center gap-1">
              <div className="w-px h-6 bg-[hsl(var(--border))] mx-1" />
              {actionLink('/register', 'Register', <FileText size={16} />)}
              {actionLink('/submit-abstract', 'Submit Abstract', <FileText size={16} />)}
            </div>
            <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] py-4 max-h-[70vh] overflow-y-auto">
            <nav className="container-wide space-y-1">
              <button type="button" onClick={scrollTop} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"><Globe size={16} />Home</button>
              {sections.map((def) => (
                <button key={def.id} type="button" onClick={() => scrollTo(def.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === def.id
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                }`}>
                  {def.icon}{def.label}
                </button>
              ))}
              <div className="h-px bg-[hsl(var(--border))] my-2" />
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><FileText size={16} />Register</Link>
              <Link href="/submit-abstract" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><FileText size={16} />Submit Abstract</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Content - Hero is full width, then sidebar + content */}
      <main className="flex-1">{children}</main>

      <footer className="relative overflow-hidden border-t border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white py-12">
        <div className="absolute inset-0 hero-grid-b opacity-60" />
        <div className="relative container-wide">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                {event?.logoUrl && <img src={mediaUrl(event.logoUrl)} alt={event.title} className="h-10 w-10 rounded-xl object-cover" />}
                <h3 className="font-['Space_Grotesk'] text-lg font-bold">{event?.title}</h3>
              </div>
              {event?.organizerContact?.name && <p className="mt-3 text-sm text-white/70">{event.organizerContact.name}</p>}
              {event?.organizerContact?.address && <p className="mt-1 text-sm text-white/70">{event.organizerContact.address}</p>}
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={scrollTop} className="block text-left text-sm text-white/70 hover:text-white">Home</button>
                {sections.map((def) => (
                  <button key={def.id} type="button" onClick={() => scrollTo(def.id)} className="block text-left text-sm text-white/70 hover:text-white">{def.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-white/70">
                {event?.organizerContact?.email && <a href={`mailto:${event.organizerContact.email}`} className="flex items-center gap-2 hover:text-white"><Mail size={15} />{event.organizerContact.email}</a>}
                {event?.organizerContact?.phone && <p className="flex items-center gap-2"><Phone size={15} />{event.organizerContact.phone}</p>}
                {event?.organizerContact?.website && <a href={event.organizerContact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><ExternalLink size={15} />Website</a>}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/15 text-center text-xs text-white/55">
            <p>Powered by Stream Conferences</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EventRegister({ event }: { event: EventData }) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState(event.fees?.[0]?.label || '');
  const [presentingAbstract, setPresentingAbstract] = useState('No');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [mockPayment, setMockPayment] = useState<any>(null);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [location, navigate] = useLocation();

  const categories = useMemo(() => {
    if (event.fees?.length) return event.fees.map((f) => f.label);
    return ['Student', 'Academic', 'Industry Delegate', 'Virtual Attendee'];
  }, [event.fees]);

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, signature }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        navigate(`/thank-you?type=registration&eventTitle=${encodeURIComponent(event.title)}`);
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch (err) {
      setError('Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  const openRazorpayCheckout = (order: any) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: event.title,
        description: `${category} Registration`,
        order_id: order.id,
        modal: { ondismiss: () => setPaying(false) },
        handler: (response: any) => verifyPayment(order.id, response.razorpay_payment_id, response.razorpay_signature),
        prefill: { name: `${firstName} ${lastName}`.trim(), email, contact: phone },
        theme: { color: '#0e7490' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => {
      setError('Failed to load payment gateway');
      setPaying(false);
    };
    document.body.appendChild(script);
  };

  const handlePayNow = () => {
    setError('');
    if (mockPayment) {
      setPaying(true);
      verifyPayment(paymentOrderId, mockPayment.paymentId, mockPayment.signature);
      return;
    }
    if (pendingOrder) {
      setPaying(true);
      openRazorpayCheckout(pendingOrder);
    }
  };

  const submitRegistration = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const name = `${firstName} ${lastName}`.trim();
    try {
      const regRes = await fetch(`${API_BASE}/registrations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, institution, country, category, presentingAbstract,
          eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain || event.eventId,
        }),
      });
      if (!regRes.ok) throw new Error((await regRes.json()).error || 'Registration failed');
      const regData = await regRes.json();

      const orderRes = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, category, registrationId: regData._id,
          eventId: event._id, eventType: event.eventType, eventTitle: event.title, eventSlug: event.slug || event.subdomain || event.eventId,
        }),
      });
      if (!orderRes.ok) throw new Error((await orderRes.json()).error || 'Payment order creation failed');
      const orderData = await orderRes.json();

      setPaymentOrderId(orderData.order.id);
      if (orderData.mock) {
        setMockPayment(orderData.mock);
        setPendingOrder(null);
      } else {
        setPendingOrder(orderData.order);
        setMockPayment(null);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  if (step === 1) {
    return (
      <div className="container-wide max-w-3xl py-12">
        <SimpleHeader eyebrow="Registration" title="Register" subtitle={event.title} />
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="mt-8 space-y-4 glass-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs font-semibold">First name *</label><input required className="form-field mt-1.5 w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div><label className="text-xs font-semibold">Last name *</label><input required className="form-field mt-1.5 w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-semibold">Email *</label><input required type="email" className="form-field mt-1.5 w-full" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="text-xs font-semibold">Phone</label><input className="form-field mt-1.5 w-full" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs font-semibold">Institution *</label><input required className="form-field mt-1.5 w-full" value={institution} onChange={(e) => setInstitution(e.target.value)} /></div>
            <div><label className="text-xs font-semibold">Country *</label><input required className="form-field mt-1.5 w-full" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-semibold">Category *</label><select className="form-field mt-1.5 w-full" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-semibold">Presenting abstract?</label><select className="form-field mt-1.5 w-full" value={presentingAbstract} onChange={(e) => setPresentingAbstract(e.target.value)}><option value="No">No</option><option value="Yes">Yes</option></select></div>
          <button type="submit" className="btn-main btn-primary">Continue</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container-wide max-w-3xl py-12">
      <SimpleHeader eyebrow="Payment" title="Confirm & pay" subtitle="Review your registration details" />
      <div className="mt-6 glass-card p-6">
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><strong className="text-[hsl(var(--foreground))]">{firstName} {lastName}</strong> · {category} · {institution}, {country}</p>
        <label className="mt-5 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
          <span>I agree to the event terms and the declaration of the information provided.</span>
        </label>
        {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => setStep(1)} className="btn-main btn-quiet">Back</button>
          {pendingOrder || mockPayment ? (
            <button type="button" disabled={paying} onClick={handlePayNow} className="btn-main btn-primary">{paying ? 'Processing...' : 'Pay now'}</button>
          ) : (
            <button type="button" disabled={!consent} onClick={submitRegistration} className="btn-main btn-primary disabled:opacity-50">Confirm registration</button>
          )}
        </div>
      </div>
    </div>
  );
}

function EventAbstract({ event }: { event: EventData }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [location, navigate] = useLocation();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!abstractFile) {
      setError('Please upload your abstract as a PDF file.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('firstName', firstName);
      fd.append('lastName', lastName);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('institution', institution);
      fd.append('country', country);
      fd.append('abstractFile', abstractFile);
      fd.append('eventId', event._id);
      fd.append('eventType', event.eventType);
      fd.append('eventSlug', event.slug || event.subdomain || event.eventId || '');
      const res = await fetch(`${API_BASE}/abstracts/submit`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Abstract submission failed');
      navigate(`/thank-you?type=abstract&eventTitle=${encodeURIComponent(event.title)}`);
    } catch (err: any) {
      setError(err.message || 'Abstract submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-wide max-w-3xl py-12">
      <SimpleHeader eyebrow="Abstract" title="Submit an abstract" subtitle={event.title} />
      <form onSubmit={submit} className="mt-8 space-y-4 glass-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-semibold">First name *</label><input required className="form-field mt-1.5 w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
          <div><label className="text-xs font-semibold">Last name *</label><input required className="form-field mt-1.5 w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
        </div>
        <div><label className="text-xs font-semibold">Email *</label><input required type="email" className="form-field mt-1.5 w-full" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="text-xs font-semibold">Phone</label><input className="form-field mt-1.5 w-full" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-xs font-semibold">Institution</label><input className="form-field mt-1.5 w-full" value={institution} onChange={(e) => setInstitution(e.target.value)} /></div>
          <div><label className="text-xs font-semibold">Country</label><input className="form-field mt-1.5 w-full" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
        </div>
        <div><label className="text-xs font-semibold">Abstract PDF *</label><input required type="file" accept=".pdf" className="form-field mt-1.5 w-full" onChange={(e) => setAbstractFile(e.target.files?.[0] || null)} /></div>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-main btn-primary disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit abstract'}</button>
      </form>
    </div>
  );
}

function SimpleHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="relative overflow-hidden hero-grad text-[hsl(var(--primary-foreground))] -mx-[calc((100vw-100%)/2)]">
      <div className="absolute inset-0 hero-grid-b" />
      <div className="absolute inset-0 hero-vignette" />
      <div className="relative container-wide py-14 md:py-20">
        <span className="badge-pill"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))] animate-pulse" />{eyebrow}</span>
        <h1 className="mt-5 max-w-4xl font-['Space_Grotesk'] text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl text-balance">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-white/75">{subtitle}</p>}
      </div>
    </div>
  );
}

function EventThankYou({ event }: { event: EventData }) {
  const content = {
    registration: { title: 'Registration Confirmed', body: 'Your registration has been received. Please check your email for further instructions.' },
    abstract: { title: 'Abstract Submitted', body: 'Your abstract has been received. Our committee will review it and get back to you.' },
  };
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const type = (params.get('type') || 'registration') as keyof typeof content;
  const c = content[type] || content.registration;

  return (
    <div className="container-wide max-w-2xl py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Check size={28} /></div>
      <h1 className="mt-6 text-3xl font-bold">{c.title}</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))]">{c.body}</p>
      <Link href="/" className="btn-main btn-primary mt-8">Back to event</Link>
    </div>
  );
}

function EventNotFound({ subdomain }: { subdomain: string }) {
  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold">Event not found</h1>
      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">There is no active event at <span className="font-mono">{subdomain}</span>.</p>
    </div>
  );
}

export function EventMicrosite({ subdomain }: { subdomain: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    fetch(`${API_BASE}/events/by-subdomain/${encodeURIComponent(subdomain)}`)
      .then((r) => {
        if (r.status === 404) {
          if (active) { setNotFound(true); setEvent(null); }
          return null;
        }
        return r.ok ? r.json() : Promise.reject(new Error('Failed to load event'));
      })
      .then((data) => {
        if (active && data) setEvent(data);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [subdomain]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">Loading event…</div>;
  }

  if (notFound || !event) {
    return <EventNotFound subdomain={subdomain} />;
  }

  const sections = buildSections(event);

  return (
    <WouterRouter base="/">
      <EventShell event={event} sections={sections}>
        <Switch>
          <Route path="/" component={() => <EventPage event={event} />} />
          <Route path="/register" component={() => <EventRegister event={event} />} />
          <Route path="/submit-abstract" component={() => <EventAbstract event={event} />} />
          <Route path="/thank-you" component={() => <EventThankYou event={event} />} />
          <Route component={() => <EventPage event={event} />} />
        </Switch>
      </EventShell>
    </WouterRouter>
  );
}
