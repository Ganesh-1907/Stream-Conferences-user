import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { LiveChatWidget } from '../../components/live-chat-widget';
import {
  Mail, Phone, Globe, ExternalLink, ChevronDown,
  Menu, X, FileText, MapPin, MessageSquare,
  Sun, Moon, Layers, Presentation, Users, CalendarDays,
  Award, Building, FileCheck, HelpCircle, BookOpen, Download,
  History, ArrowRight, Facebook, Twitter, Linkedin, Instagram, Youtube,
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
  welcomeBannerTitle?: string;
  welcomeBannerDescription?: string;
  socialLinks?: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string; youtube?: string };
  country?: string;
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
  subjectImageUrl?: string;
  headerBanners?: string[];
  fees?: { type: string; dateLabel: string; deadline?: string | Date; usd: number; gbp: number; eur: number }[];
  tracks?: { title: string; description?: string; image?: string; referenceLinks?: { label: string; url: string }[] }[];
  organizerContact?: { name?: string; email?: string; phone?: string; website?: string; address?: string; country?: string; socials?: any };
  speakers?: { name: string; degree?: string; designation?: string; organization?: string; bio?: string; avatar?: string; linkedin?: string; twitter?: string; website?: string; topic?: string; isKeynote?: boolean; category?: string }[];
  program?: { dayNumber: number; date?: string; title?: string; description?: string; sessions: any[] }[];
  faqs?: { question: string; answer: string; category?: string; order?: number }[];
  partners?: { title: string; order?: number }[];
  sponsors?: { name?: string; logo?: string; title?: string; order?: number }[];
  mediaPartners?: { name?: string; logo?: string }[];
  exhibitors?: { title: string; order?: number }[];
  guidelines?: string;
  scientificProgramUrl?: string;
  termsAndConditions?: string;
  venueDetails?: { name?: string; address?: string; city?: string; state?: string; country?: string; pincode?: string; description?: string; mainImage?: string; subImages?: string[]; images?: string[]; mapUrl?: string; directions?: string; parking?: string; accommodation?: string; nearestAirport?: string };
  organizingCommittee?: { name?: string; image?: string; degree?: string; specialization?: string; country?: string; biography?: string; researchArea?: string }[];
  itinerary?: any[];
  about?: string;
  terms?: string;
  privacy?: string;
  registerSteps?: any[];
  brochure?: any;
  feeLevels?: any[];
  gtmCode?: string;
  gaCode?: string;
  mcCode?: string;
  metaTitle?: string;
  metaDescription?: string;
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
    { id: 'sponsors', label: 'Sponsors/Exhibitors', path: '/sponsors', icon: <Award size={16} />, show: true },
    { id: 'fees', label: 'Fees', path: '/fees', icon: <FileText size={16} />, show: Boolean(event.fees?.length) },
    { id: 'tracks', label: 'Tracks', path: '/tracks', icon: <Layers size={16} />, show: Boolean(event.tracks?.length) },
    { id: 'media-partners', label: 'Media Partners', path: '/media-partners', icon: <Award size={16} />, show: Boolean(event.mediaPartners?.length) },
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
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let iconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    if (event?.logoUrl) {
      iconLink.href = mediaUrl(event.logoUrl);
    } else {
      iconLink.href = '/logo.jpg';
    }

    if (event?.title) {
      document.title = `${event.title} · Stream Conferences`;
    }
  }, [event?.logoUrl, event?.title]);

  const isActive = (path: string) => location === path;

  const isHomeTop = location === '/' && !scrolled;

  const navLinkCls = (path: string) => {
    const base = 'flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-bold transition-all rounded-full ';
    return isActive(path)
      ? base + 'bg-[hsl(var(--primary))] text-white font-black shadow-md'
      : base + 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10';
  };

  const mobileLinkCls = (path: string) => {
    const base = 'w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-base font-bold transition-all ';
    return isActive(path)
      ? base + 'bg-[hsl(var(--primary))] text-white font-black shadow-md'
      : base + 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10';
  };

  // Program dropdown items: Speakers, Tracks, Committee, FAQ, Terms
  const programItems: NavItem[] = [
    {
      id: 'speakers',
      label: 'Speakers',
      path: '/speakers',
      icon: <Users size={18} />,
      show: true,
    },
    {
      id: 'tracks',
      label: 'Tracks',
      path: '/tracks',
      icon: <Layers size={18} />,
      show: true,
    },
    {
      id: 'organizing-committee',
      label: 'Committee',
      path: '/organizing-committee',
      icon: <Users size={18} />,
      show: true,
    },
    {
      id: 'faq',
      label: 'FAQ',
      path: '/faq',
      icon: <HelpCircle size={18} />,
      show: true,
    },
    {
      id: 'terms',
      label: 'Terms',
      path: '/terms',
      icon: <FileCheck size={18} />,
      show: true,
    },
  ];

  // More dropdown items: Sponsors & Exhibitors, Media Partners, Venue, Guidelines, Contact
  const moreItems: NavItem[] = [
    {
      id: 'sponsors',
      label: 'Sponsors & Exhibitors',
      path: '/sponsors',
      icon: <Award size={18} />,
      show: true,
    },
    {
      id: 'media-partners',
      label: 'Media Partners',
      path: '/media-partners',
      icon: <Award size={18} />,
      show: true,
    },
    {
      id: 'venue',
      label: 'Venue',
      path: '/venue',
      icon: <MapPin size={18} />,
      show: true,
    },
    {
      id: 'guidelines',
      label: 'Guidelines',
      path: '/guidelines',
      icon: <BookOpen size={18} />,
      show: true,
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact',
      icon: <MessageSquare size={18} />,
      show: true,
    },
  ];

  const isProgramActive = programItems.some((item) => isActive(item.path)) || location === '/program';
  const isMoreActive = moreItems.some((item) => isActive(item.path));

  return (
    <header className={`z-40 transition-all duration-300 text-white ${
      !scrolled
        ? 'absolute top-0 left-0 right-0 bg-transparent border-b-0 shadow-none'
        : 'fixed top-0 left-0 right-0 bg-[hsl(var(--primary))]/95 border-b border-white/15 backdrop-blur-xl shadow-lg'
    }`}>
      <div className="container-wide flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
          <img src="/logo.jpg" alt="Stream Conferences" className="h-10 w-10 rounded-xl object-contain bg-white p-0.5 shadow-md border border-white/20 shrink-0" />
          <span className="truncate font-['Space_Grotesk'] font-black tracking-tight text-base md:text-xl text-white">Stream Conferences</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 bg-white/95 dark:bg-[#0f172a]/95 text-slate-800 dark:text-white shadow-xl backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-full p-1.5 mx-auto">
          <Link href="/" className={navLinkCls('/')}>
            <Globe size={18} />Home
          </Link>

          <Link href="/about" className={navLinkCls('/about')}>
            <Layers size={18} />About
          </Link>

          {/* Program Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm sm:text-base font-bold transition-all cursor-pointer ${
                isProgramActive
                  ? 'bg-[hsl(var(--primary))] text-white font-black shadow-md'
                  : 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <Presentation size={18} />
              <span>Program</span>
              <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div className="absolute left-0 top-full pt-1.5 hidden group-hover:block z-50 w-56">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/20 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-2xl py-1.5 backdrop-blur-xl transition-colors overflow-hidden">
                {programItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 text-base font-bold transition-colors ${
                      isActive(item.path)
                        ? 'bg-[hsl(var(--primary))] text-white font-extrabold'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/15'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link href="/brochure" className={navLinkCls('/brochure')}>
            <Download size={18} />Brochure
          </Link>

          <Link href="/submit-abstract" className={navLinkCls('/submit-abstract')}>
            <FileText size={18} />Submit Abstract
          </Link>

          <Link href="/register" className={navLinkCls('/register')}>
            <FileText size={18} />Register
          </Link>

          <Link href="/fees" className={navLinkCls('/fees')}>
            <FileText size={18} />Fees
          </Link>

          {/* Info Dropdown */}
          {moreItems.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm sm:text-base font-bold transition-all cursor-pointer ${
                  isMoreActive
                    ? 'bg-[hsl(var(--primary))] text-white font-black shadow-md'
                    : 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>Info</span>
                <ChevronDown size={16} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute right-0 top-full pt-1.5 hidden group-hover:block z-50 w-56">
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/20 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-2xl py-1.5 backdrop-blur-xl transition-colors overflow-hidden">
                  {moreItems.map((item) => (
                    item.isExternal ? (
                      <a
                        key={item.id}
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/15 transition-colors"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </a>
                    ) : (
                      <Link
                        key={item.id}
                        href={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 text-base font-bold transition-colors ${
                          isActive(item.path)
                            ? 'bg-[hsl(var(--primary))] text-white font-extrabold'
                            : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/90 dark:text-white/90 dark:hover:text-white dark:hover:bg-white/15'
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

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark/light theme"
            title={dark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#0f172a]/95 hover:bg-white dark:hover:bg-[#1e293b] border border-white/30 dark:border-white/20 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-xl transition-all cursor-pointer active:scale-95"
          >
            {dark ? (
              <>
                <Sun size={18} className="text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon size={18} className="text-slate-700" />
                <span>Dark</span>
              </>
            )}
          </button>

          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-white/20 transition-colors text-white">
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
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

            <Link href="/brochure" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/brochure')}>
              <Download size={16} />Brochure
            </Link>

            <Link href="/submit-abstract" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/submit-abstract')}>
              <FileText size={16} />Submit Abstract
            </Link>

            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/register')}>
              <FileText size={16} />Register
            </Link>

            <Link href="/fees" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/fees')}>
              <FileText size={16} />Fees
            </Link>

            <div className="pt-2 pb-1">
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--muted-foreground))] font-bold">Info</p>
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

            <div className="pt-3 border-t border-[hsl(var(--border))] space-y-2">
              <Link href="/brochure" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm">
                <Download size={16} />Download Brochure
              </Link>
              <Link href="/submit-abstract" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm">
                <FileText size={16} />Submit Abstract
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-black text-sm shadow-md">
                <FileText size={16} />Register Now
              </Link>
            </div>
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
            <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
              Contact
            </p>
            <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
              Get in Touch
            </h2>
            <p className="mt-3 text-base sm:text-lg font-medium text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
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
          <div className="card-lift rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-xl shadow-black/5 relative overflow-hidden">
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
  const socials = event?.socialLinks || event?.organizerContact?.socials;

  const navigateLinks = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'about', label: 'About', path: '/about', show: Boolean(event.description) },
    { id: 'fees', label: 'Fees', path: '/fees', show: Boolean(event.fees?.length) },
    { id: 'brochure', label: 'Brochure', path: '/brochure', show: Boolean(event.brochureUrl) },
    { id: 'submit-abstract', label: 'Submit Abstract', path: '/submit-abstract', show: true },
    { id: 'register', label: 'Register', path: '/register', show: true },
  ].filter((item) => item.show);

  const quickLinks = [
    { id: 'organizing-committee', label: 'Committee', path: '/organizing-committee', show: Boolean(event.organizingCommittee?.length) },
    { id: 'terms', label: 'Terms', path: '/terms', show: true },
    { id: 'sponsors', label: 'Sponsors/Exhibitors', path: '/sponsors', show: true },
    { id: 'venue', label: 'Venue', path: '/venue', show: Boolean(event.venueDetails?.name || event.venue || event.location) },
    { id: 'guidelines', label: 'Guidelines', path: '/guidelines', show: Boolean(event.guidelines) },
  ].filter((item) => item.show);

  return (
    <footer className="relative overflow-hidden border-t border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] text-white py-14">
      <div className="absolute inset-0 hero-grid-b opacity-60" />
      <div className="relative container-wide">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              {event?.logoUrl ? (
                <img src={mediaUrl(event.logoUrl)} alt={event?.title || "Conference Logo"} className="h-10 w-10 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shrink-0" />
              ) : (
                <img src="/logo.jpg" alt="Conference Logo" className="h-10 w-10 rounded-xl object-contain bg-white p-1 shrink-0" />
              )}
              <h3 className="font-['Space_Grotesk'] text-lg font-bold line-clamp-2 !text-white">{event?.title || 'Stream Conferences'}</h3>
            </div>
            {event?.organizerContact?.name && <p className="mt-3 text-base text-white/90">{event.organizerContact.name}</p>}
            {event?.organizerContact?.address && <p className="mt-1 text-base text-white/90">{event.organizerContact.address}</p>}

            {/* Social Media Links */}
            {socials && (socials.facebook || socials.twitter || socials.linkedin || socials.instagram || socials.youtube) && (
              <div className="flex items-center gap-2.5 mt-4 pt-2">
                {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors" title="Facebook"><Facebook size={15} /></a>}
                {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors" title="Twitter / X"><Twitter size={15} /></a>}
                {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors" title="LinkedIn"><Linkedin size={15} /></a>}
                {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors" title="Instagram"><Instagram size={15} /></a>}
                {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors" title="YouTube"><Youtube size={15} /></a>}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-semibold mb-4 !text-white text-base">Navigate</h4>
            <div className="space-y-2.5">
              {navigateLinks.map((item) => (
                <Link key={item.id} href={item.path} className="block text-base text-white/85 hover:text-white transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 !text-white text-base">Quick Links</h4>
            <div className="space-y-2.5">
              {quickLinks.map((item) => (
                <Link key={item.id} href={item.path} className="block text-base text-white/85 hover:text-white transition-colors">{item.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 !text-white text-base">Contact</h4>
            <div className="space-y-3 text-base text-white/85">
              {event?.organizerContact?.email && <a href={`mailto:${event.organizerContact.email}`} className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"><Mail size={15} />{event.organizerContact.email}</a>}
              {event?.organizerContact?.phone && <p className="flex items-center gap-2 text-white/85"><Phone size={15} />{event.organizerContact.phone}</p>}
              {(event?.organizerContact?.country || event?.country) && <p className="flex items-center gap-2 text-white/85"><MapPin size={15} />{event.organizerContact?.country || event.country}</p>}
              {event?.organizerContact?.website && <a href={event.organizerContact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/85 hover:text-white transition-colors"><ExternalLink size={15} />Website</a>}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/15 text-center text-xs text-white/75">
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

      // Mark light/dark theme mode for hero vignette adjustment
      if (l > 55) {
        root.setAttribute('data-theme-mode', 'light');
      } else {
        root.setAttribute('data-theme-mode', 'dark');
      }
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.removeAttribute('data-theme-mode');
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.removeAttribute('data-theme-mode');
    };
  }, [event?.themeColor, event?.primaryColor, event?.colorTheme]);

  // Scroll animations for microsite pages
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    const applyScrollAnimations = () => {
      // 1. Process all grid containers with card elements
      document.querySelectorAll('.grid').forEach((grid) => {
        const children = Array.from(grid.children);
        if (children.length < 2) return;

        children.forEach((child, index) => {
          const el = child as HTMLElement;
          if (el.classList.contains('reveal-on-scroll')) return;

          const isLeft = index % 2 === 0;
          el.classList.add('reveal-on-scroll');
          if (isLeft) {
            el.classList.add('reveal-from-left');
          } else {
            el.classList.add('reveal-from-right');
          }
          el.style.transitionDelay = `${(index % 4) * 80}ms`;
        });
      });

      // 2. Process all standalone .card-lift, cards, or section containers
      document.querySelectorAll('.card-lift, main section > div > div:not(.grid), .space-y-6 > div').forEach((el, index) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.classList.contains('reveal-on-scroll')) {
          htmlEl.classList.add('reveal-on-scroll', 'reveal-from-up');
          htmlEl.style.transitionDelay = `${(index % 3) * 60}ms`;
        }
      });

      // 3. Observe all unrevealed elements
      document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((el) => {
        observer.observe(el);
      });
    };

    applyScrollAnimations();
    const t1 = setTimeout(applyScrollAnimations, 100);
    const t2 = setTimeout(applyScrollAnimations, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      observer.disconnect();
    };
  }, [location]);

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col relative">
      <MicrositeHeader event={event} navItems={navItems} />
      <main className="flex-1">{children}</main>
      {!hideContactFooter && <PersistentContactFooter event={event} />}
      <PreviousCohortsStrip event={event} />
      <MicrositeFooter event={event} navItems={navItems} />
      <LiveChatWidget event={event} />
    </div>
  );
}
