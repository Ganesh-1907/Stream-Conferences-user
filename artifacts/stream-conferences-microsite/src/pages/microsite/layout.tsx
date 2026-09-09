import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Mail, Phone, Globe, ExternalLink, ChevronDown,
  Menu, X, FileText, MapPin, MessageSquare,
  Sun, Moon, Layers, Presentation, Users, CalendarDays,
  Award, Building, FileCheck, HelpCircle, BookOpen, Download,
  History, ArrowRight,
} from 'lucide-react';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export interface EventData {
  _id: string;
  eventId?: string;
  eventType: 'conference' | 'webinar';
  title: string;
  slug?: string;
  subdomain?: string;
  description?: string;
  theme?: string;
  themeColor?: string;
  primaryColor?: string;
  colorTheme?: string;
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
  headerBanners?: string[];
  fees?: { type: string; dateLabel: string; usd: number; gbp: number; eur: number }[];
  tracks?: { title: string; description?: string; image?: string; referenceLinks?: { label: string; url: string }[] }[];
  organizerContact?: { name?: string; email?: string; phone?: string; website?: string; address?: string };
  itinerary?: { time: string; title: string; description?: string; speaker?: string; track?: string; type?: string }[];
  speakers?: { name: string; degree?: string; designation?: string; organization?: string; bio?: string; avatar?: string; linkedin?: string; twitter?: string; website?: string; topic?: string; isKeynote?: boolean }[];
  program?: { dayNumber: number; date?: string; title?: string; description?: string; sessions: any[] }[];
  faqs?: { question: string; answer: string; category?: string; order?: number }[];
  partners?: { title: string; order?: number }[];
  sponsors?: { title: string; order?: number }[];
  exhibitors?: { title: string; order?: number }[];
  guidelines?: string;
  scientificProgramUrl?: string;
  termsAndConditions?: string;
  venueDetails?: { name?: string; address?: string; city?: string; state?: string; country?: string; pincode?: string; description?: string; images?: string[]; mapUrl?: string; directions?: string; parking?: string; accommodation?: string };
  organizingCommittee?: { name?: string; image?: string; degree?: string; specialization?: string; country?: string; biography?: string; researchArea?: string }[];
  cohorts?: Cohort[];
  currentCohort?: Cohort | null;
  activeCohort?: Cohort | null;
}

export interface Cohort {
  _id: string;
  courseType?: 'conference' | 'webinar';
  courseId?: string;
  cohortId?: string;
  year: number;
  batchNo: number;
  title?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  isCurrent?: boolean;
  label?: string;
  subdomain?: string | null;
  assignedMentor?: string | null;
  content?: Record<string, any>;
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

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  show: boolean;
  isExternal?: boolean;
}

export function buildNavItems(event: EventData): NavItem[] {
  const items: NavItem[] = [
    { id: 'about', label: 'About', path: '/about', icon: <Layers size={16} />, show: Boolean(event.description) },
    { id: 'program', label: 'Program', path: '/program', icon: <Presentation size={16} />, show: Boolean(event.program?.length) },
    { id: 'speakers', label: 'Speakers', path: '/speakers', icon: <Users size={16} />, show: Boolean(event.speakers?.length) },
    { id: 'itinerary', label: 'Itinerary', path: '/itinerary', icon: <CalendarDays size={16} />, show: Boolean(event.itinerary?.length) },
    { id: 'sponsors', label: 'Sponsors/Exhibitors', path: '/sponsors', icon: <Award size={16} />, show: true },
    { id: 'fees', label: 'Fees', path: '/fees', icon: <FileText size={16} />, show: Boolean(event.fees?.length) },
    { id: 'tracks', label: 'Tracks', path: '/tracks', icon: <Layers size={16} />, show: Boolean(event.tracks?.length) },
    { id: 'faq', label: 'FAQ', path: '/faq', icon: <HelpCircle size={16} />, show: Boolean(event.faqs?.length) },
    { id: 'guidelines', label: 'Guidelines', path: '/guidelines', icon: <BookOpen size={16} />, show: Boolean(event.guidelines) },
    { id: 'venue', label: 'Venue', path: '/venue', icon: <MapPin size={16} />, show: Boolean(event.venueDetails?.name || event.venue || event.location) },
    { id: 'contact', label: 'Contact', path: '/contact', icon: <MessageSquare size={16} />, show: Boolean(event.organizerContact?.email || event.organizerContact?.phone) },
    { id: 'brochure', label: 'Brochure', path: '/brochure', icon: <Download size={16} />, show: Boolean(event.brochureUrl) },
    { id: 'terms', label: 'Terms', path: '/terms', icon: <FileCheck size={16} />, show: true },
    { id: 'organizing-committee', label: 'Committee', path: '/organizing-committee', icon: <Users size={16} />, show: Boolean(event.organizingCommittee?.length) },
  ];
  return items.filter((s) => s.show);
}

function MicrositeHeader({ event, navItems }: { event: EventData; navItems: NavItem[] }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { dark, toggle } = useTheme();

  const isActive = (path: string) => location === path;

  const navLinkCls = (path: string) => {
    const base = 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ';
    return isActive(path)
      ? base + 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-xs'
      : base + 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]';
  };

  const mobileLinkCls = (path: string) => {
    const base = 'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ';
    return isActive(path)
      ? base + 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-xs'
      : base + 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]';
  };

  // Program dropdown items: Itinerary (/program), Speakers, Tracks, Committee, FAQ, Terms
  const programItems: NavItem[] = [
    {
      id: 'itinerary',
      label: 'Itinerary',
      path: (event.program && event.program.length > 0) ? '/program' : (event.itinerary && event.itinerary.length > 0 ? '/itinerary' : '/program'),
      icon: <CalendarDays size={16} />,
      show: true,
    },
    {
      id: 'speakers',
      label: 'Speakers',
      path: '/speakers',
      icon: <Users size={16} />,
      show: true,
    },
    {
      id: 'tracks',
      label: 'Tracks',
      path: '/tracks',
      icon: <Layers size={16} />,
      show: true,
    },
    {
      id: 'organizing-committee',
      label: 'Committee',
      path: '/organizing-committee',
      icon: <Users size={16} />,
      show: true,
    },
    {
      id: 'faq',
      label: 'FAQ',
      path: '/faq',
      icon: <HelpCircle size={16} />,
      show: true,
    },
    {
      id: 'terms',
      label: 'Terms',
      path: '/terms',
      icon: <FileCheck size={16} />,
      show: true,
    },
  ];

  // More dropdown items: Sponsors/Exhibitors, Venue, Guidelines, Contact
  const moreItems: NavItem[] = [
    {
      id: 'sponsors',
      label: 'Sponsors/Exhibitors',
      path: '/sponsors',
      icon: <Award size={16} />,
      show: true,
    },
    {
      id: 'venue',
      label: 'Venue',
      path: '/venue',
      icon: <MapPin size={16} />,
      show: true,
    },
    {
      id: 'guidelines',
      label: 'Guidelines',
      path: '/guidelines',
      icon: <BookOpen size={16} />,
      show: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact',
      icon: <MessageSquare size={16} />,
      show: true,
    },
  ];

  // Add Scientific Program if available
  if (event?.scientificProgramUrl) {
    moreItems.splice(2, 0, {
      id: 'scientific-program',
      label: 'Scientific Program',
      path: `${SERVER_ORIGIN}${event.scientificProgramUrl}`,
      icon: <Download size={16} />,
      show: true,
      isExternal: true,
    });
  }

  const isProgramActive = programItems.some((item) => isActive(item.path)) || location === '/program' || location === '/itinerary';
  const isMoreActive = moreItems.some((item) => isActive(item.path));

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.88)] backdrop-blur-lg">
      <div className="container-wide flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          {event?.logoUrl && <img src={mediaUrl(event.logoUrl)} alt={event.title} className="h-10 w-10 rounded-xl object-cover shadow-lg" />}
          <span className="truncate font-['Space_Grotesk'] font-bold tracking-tight text-sm md:text-base">{event?.title || 'Event'}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          <Link href="/" className={navLinkCls('/')}>
            <Globe size={16} />Home
          </Link>

          <Link href="/about" className={navLinkCls('/about')}>
            <Layers size={16} />About
          </Link>

          {/* Program Dropdown (Itinerary, Speakers, Tracks, Committee, FAQ, Terms) */}
          <div className="relative group">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isProgramActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-xs'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
              }`}
            >
              <Presentation size={16} />
              <span>Program</span>
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute left-0 top-full pt-1.5 hidden group-hover:block z-50 w-52">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl py-1 backdrop-blur-lg">
                {programItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                      isActive(item.path)
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/fees" className={navLinkCls('/fees')}>
            <FileText size={16} />Fees
          </Link>

          {/* More Dropdown (Sponsors/Exhibitors, Venue, Guidelines, Contact) */}
          {moreItems.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isMoreActive
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold shadow-xs'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                <span>More</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute right-0 top-full pt-1.5 hidden group-hover:block z-50 w-52">
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl py-1 backdrop-blur-lg">
                  {moreItems.map((item) => (
                    item.isExternal ? (
                      <a
                        key={item.id}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.path}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                          isActive(item.path)
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/brochure" className={navLinkCls('/brochure')}>
              <Download size={16} />Brochure
            </Link>
            <Link href="/submit-abstract" className={navLinkCls('/submit-abstract')}>
              <FileText size={16} />Submit Abstract
            </Link>
            <Link href="/register" className={navLinkCls('/register')}>
              <FileText size={16} />Register
            </Link>
            <div className="w-px h-6 bg-[hsl(var(--border))] mx-1.5" />
          </div>
          <button type="button" onClick={toggle} aria-label="Toggle theme" className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] py-4 max-h-[75vh] overflow-y-auto">
          <nav className="container-wide space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/')}>
              <Globe size={16} />Home
            </Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/about')}>
              <Layers size={16} />About
            </Link>

            {/* Program Section */}
            <div className="pt-2 pb-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-bold">Program</p>
              <div className="mt-1 space-y-1 pl-2 border-l-2 border-[hsl(var(--border))] ml-3">
                {programItems.map((item) => (
                  <Link key={item.id} href={item.path} onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls(item.path)}>
                    {item.icon}{item.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/fees" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/fees')}>
              <FileText size={16} />Fees
            </Link>

            {/* More Section */}
            {moreItems.length > 0 && (
              <div className="pt-2 pb-1">
                <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-bold">More</p>
                <div className="mt-1 space-y-1 pl-2 border-l-2 border-[hsl(var(--border))] ml-3">
                  {moreItems.map((item) => (
                    item.isExternal ? (
                      <a key={item.id} href={item.path} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls(item.path)}>
                        {item.icon}{item.label}
                      </a>
                    ) : (
                      <Link key={item.id} href={item.path} onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls(item.path)}>
                        {item.icon}{item.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-[hsl(var(--border))] my-2" />
            <Link href="/brochure" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/brochure')}><Download size={16} />Brochure</Link>
            <Link href="/submit-abstract" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/submit-abstract')}><FileText size={16} />Submit Abstract</Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/register')}><FileText size={16} />Register</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
function PersistentContactFooter({ event }: { event: EventData }) {
  const contact = event.organizerContact;
  if (!contact || (!contact.email && !contact.phone && !contact.website)) return null;

  return (
    <section className="border-t border-[hsl(var(--border))] bg-gradient-to-b from-transparent via-[hsl(var(--card)/0.3)] to-[hsl(var(--card)/0.6)] py-10 md:py-14">
      <div className="container-wide">
        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-8 lg:gap-14 items-center">
          {/* Left Side: Eyebrow, Heading, Description & Assurance Badges */}
          <div>
            <span className="section-eyebrow">Contact</span>
            <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
              Get in Touch
            </h2>
            <p className="mt-3 text-base md:text-lg text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
              Have questions regarding registration, abstract submissions, or venue logistics?
              Our organizers are available to assist you.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Quick Response Guarantee</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))] shadow-sm">
                <Building size={13} className="text-[hsl(var(--primary))]" />
                <span>Dedicated Organizer Desk</span>
              </div>
            </div>
          </div>

          {/* Right Side Box: Email, Phone, Website, Address & Send Message Button */}
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-xl shadow-black/5 hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden">
            {/* Subtle decorative glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl pointer-events-none" />

            <div className="relative space-y-3">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Email Address</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] truncate transition-colors">
                      {contact.email}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Telephone</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition-colors">
                      {contact.phone}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-3 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Official Website</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate transition-colors">
                      {contact.website}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {/* Send Message Button inside the Box */}
              <div className="pt-1.5">
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.88)] text-[hsl(var(--primary-foreground))] font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-white/15 cursor-pointer group"
                >
                  <MessageSquare size={16} className="transition-transform group-hover:scale-110 text-white/90" />
                  <span>Send a Message</span>
                  <ArrowRight size={14} className="ml-1 opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviousCohortsStrip({ event }: { event: EventData }) {
  const previousCohorts = useMemo(() => {
    const list = Array.isArray(event?.cohorts) ? event.cohorts : [];
    if (list.length === 0) return [];
    const byYear = new Map<number, Cohort[]>();
    list.forEach((c) => {
      const items = byYear.get(c.year) || [];
      items.push(c);
      byYear.set(c.year, items);
    });
    return Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, items]) => ({ year, items: items.sort((a, b) => a.batchNo - b.batchNo) }));
  }, [event?.cohorts]);

  if (previousCohorts.length === 0) return null;

  const search = typeof window !== 'undefined' ? window.location.search : '';

  return (
    <section aria-label="Previous Cohorts" className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 sm:py-3 transition-colors">
      <div className="container-wide flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Title & Subtitle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
            <History size={14} className="shrink-0" />
            <span>Previous Cohorts:</span>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))] hidden md:inline">
            Past year &amp; batch launches
          </span>
        </div>

        {/* Right: Year & Batch Pills in one line */}
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          {previousCohorts.map(({ year, items }) => (
            <div key={year} className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[hsl(var(--foreground))] mr-0.5">{year}:</span>
              <div className="flex items-center gap-1.5">
                {items.map((c) => {
                  const targetHref = c.isCurrent ? `/${search}` : `/${year}/b${c.batchNo}${search}`;
                  const isCurrentActive = event?.activeCohort
                    ? event.activeCohort._id === c._id
                    : c.isCurrent;
                  return (
                    <a
                      key={c._id}
                      href={targetHref}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        isCurrentActive
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))] shadow-xs font-bold'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))]'
                      }`}
                    >
                      <span>Batch {c.batchNo}</span>
                      {c.isCurrent && (
                        <span className="rounded-full bg-[hsl(var(--primary))] px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider text-white">
                          Current
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MicrositeFooter({ event, navItems }: { event: EventData; navItems: NavItem[] }) {
  return (
    <footer className="relative overflow-hidden border-t border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white py-12">
      <div className="absolute inset-0 hero-grid-b opacity-60" />
      <div className="relative container-wide">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              {event?.logoUrl && <img src={mediaUrl(event.logoUrl)} alt={event.title} className="h-10 w-10 rounded-xl object-cover" />}
              <h3 className="font-['Space_Grotesk'] text-lg font-bold">{event?.title}</h3>
            </div>
            {event?.organizerContact?.name && <p className="mt-3 text-base text-white/70">{event.organizerContact.name}</p>}
            {event?.organizerContact?.address && <p className="mt-1 text-base text-white/70">{event.organizerContact.address}</p>}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navigate</h4>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="block text-base text-white/70 hover:text-white">Home</Link>
              {navItems.map((item) => (
                <Link key={item.id} href={item.path} className="block text-base text-white/70 hover:text-white">{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-base text-white/70">
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
  );
}

function parseColorToHsl(colorInput?: string): { h: number; s: number; l: number } | null {
  if (!colorInput || typeof colorInput !== 'string') return null;
  const cleaned = colorInput.trim();
  if (!cleaned) return null;

  const THEME_PRESETS: Record<string, string> = {
    blue: '#0f4c81',
    navy: '#1e3a8a',
    ocean: '#0e7490',
    cyan: '#0891b2',
    teal: '#0f766e',
    emerald: '#047857',
    green: '#15803d',
    ruby: '#991b1b',
    red: '#b91c1c',
    purple: '#581c87',
    violet: '#6d28d9',
    slate: '#334155',
  };

  const hexVal = THEME_PRESETS[cleaned.toLowerCase()] || (cleaned.startsWith('#') ? cleaned : (cleaned.match(/^[0-9a-fA-F]{3,6}$/) ? `#${cleaned}` : null));
  if (hexVal) {
    let hex = hexVal.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h = Math.round(h * 60);
      }
      return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
    }
  }

  // Check HSL match like "208 79% 34%" or "hsl(208, 79%, 34%)"
  const hslMatch = cleaned.match(/(?:hsl\()?(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?\)?/);
  if (hslMatch) {
    return {
      h: parseInt(hslMatch[1], 10),
      s: parseInt(hslMatch[2], 10),
      l: parseInt(hslMatch[3], 10),
    };
  }

  return null;
}

export function MicrositeLayout({ event, navItems, children }: { event: EventData; navItems: NavItem[]; children: ReactNode }) {
  const [location] = useLocation();
  const hideContactFooter = location === '/contact' || location === '/submit-abstract';

  // Dynamically inject admin selected color theme into root CSS variables
  useEffect(() => {
    const rawColor = event?.themeColor || event?.primaryColor || event?.colorTheme;
    const hsl = parseColorToHsl(rawColor);
    const root = document.documentElement;

    if (hsl) {
      const { h, s, l } = hsl;
      const primaryHsl = `${h} ${s}% ${l}%`;
      const primaryFgHsl = l > 65 ? '222 47% 11%' : '0 0% 100%';
      const ringHsl = `${h} ${s}% ${l}%`;
      const secondaryHsl = `${(h + 8) % 360} ${Math.min(s + 5, 95)}% ${Math.min(Math.max(l + 12, 35), 58)}%`;
      const accentHsl = `${(h + 15) % 360} ${Math.min(s + 10, 95)}% ${Math.min(Math.max(l + 15, 40), 55)}%`;

      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--primary-foreground', primaryFgHsl);
      root.style.setProperty('--ring', ringHsl);
      root.style.setProperty('--sidebar', primaryHsl);
      root.style.setProperty('--sidebar-primary', secondaryHsl);
      root.style.setProperty('--secondary', secondaryHsl);
      root.style.setProperty('--accent', accentHsl);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
    };
  }, [event?.themeColor, event?.primaryColor, event?.colorTheme]);

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
      <MicrositeHeader event={event} navItems={navItems} />
      <main className="flex-1">{children}</main>
      {!hideContactFooter && <PersistentContactFooter event={event} />}
      <PreviousCohortsStrip event={event} />
      <MicrositeFooter event={event} navItems={navItems} />
    </div>
  );
}
