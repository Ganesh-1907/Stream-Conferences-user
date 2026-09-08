import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Mail, Phone, Globe, ExternalLink, ChevronDown,
  Menu, X, FileText, MapPin, MessageSquare,
  Sun, Moon, Layers, Presentation, Users, CalendarDays,
  Award, Building, Image, FileCheck, HelpCircle, BookOpen, Download,
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
  fees?: { label: string; amount: number }[];
  tracks?: { title: string; description?: string; image?: string; referenceLinks?: { label: string; url: string }[] }[];
  organizerContact?: { name?: string; email?: string; phone?: string; website?: string; address?: string };
  itinerary?: { time: string; title: string; description?: string; speaker?: string; track?: string; type?: string }[];
  speakers?: { name: string; designation?: string; organization?: string; bio?: string; avatar?: string; linkedin?: string; twitter?: string; website?: string; topic?: string; isKeynote?: boolean }[];
  program?: { dayNumber: number; date?: string; title?: string; description?: string; sessions: any[] }[];
  faqs?: { question: string; answer: string; category?: string; order?: number }[];
  partners?: { title: string; order?: number }[];
  sponsors?: { title: string; order?: number }[];
  exhibitors?: { title: string; order?: number }[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: { name?: string; address?: string; city?: string; state?: string; country?: string; pincode?: string; description?: string; images?: string[]; mapUrl?: string; directions?: string; parking?: string; accommodation?: string };
  organizingCommittee?: { name?: string; image?: string; degree?: string; specialization?: string; country?: string; biography?: string; researchArea?: string }[];
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
}

export function buildNavItems(event: EventData): NavItem[] {
  const items: NavItem[] = [
    { id: 'about', label: 'About', path: '/about', icon: <Layers size={16} />, show: Boolean(event.description) },
    { id: 'program', label: 'Program', path: '/program', icon: <Presentation size={16} />, show: Boolean(event.program?.length) },
    { id: 'speakers', label: 'Speakers', path: '/speakers', icon: <Users size={16} />, show: Boolean(event.speakers?.length) },
    { id: 'itinerary', label: 'Itinerary', path: '/itinerary', icon: <CalendarDays size={16} />, show: Boolean(event.itinerary?.length) },
    { id: 'sponsors', label: 'Sponsors/Exhibitors', path: '/sponsors', icon: <Award size={16} />, show: true },
    { id: 'resources', label: 'Resources', path: '/resources', icon: <Image size={16} />, show: Boolean(event.brochureUrl || event.logoUrl || event.bannerUrl) },
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
    return isActive(path) ? base + 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : base + 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]';
  };

  const mobileLinkCls = (path: string) => {
    const base = 'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ';
    return isActive(path) ? base + 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : base + 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]';
  };

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
          {navItems.slice(0, 6).map((item) => (
            <Link key={item.id} href={item.path} className={navLinkCls(item.path)}>
              {item.icon}{item.label}
            </Link>
          ))}
          {navItems.length > 6 && (
            <div className="relative group">
              <button type="button" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                More <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl py-1">
                {navItems.slice(6).map((item) => (
                  <Link key={item.id} href={item.path} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]">
                    {item.icon}{item.label}
                  </Link>
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
            <Link href="/register" className={navLinkCls('/register')}>
              <FileText size={16} />Register
            </Link>
            <Link href="/submit-abstract" className={navLinkCls('/submit-abstract')}>
              <FileText size={16} />Submit Abstract
            </Link>
          </div>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] py-4 max-h-[70vh] overflow-y-auto">
          <nav className="container-wide space-y-1">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls('/')}>
              <Globe size={16} />Home
            </Link>
            {navItems.map((item) => (
              <Link key={item.id} href={item.path} onClick={() => setMobileMenuOpen(false)} className={mobileLinkCls(item.path)}>
                {item.icon}{item.label}
              </Link>
            ))}
            <div className="h-px bg-[hsl(var(--border))] my-2" />
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><FileText size={16} />Register</Link>
            <Link href="/submit-abstract" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><FileText size={16} />Submit Abstract</Link>
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
    <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.15)] py-10">
      <div className="container-wide">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <span className="section-eyebrow">Contact</span>
            <h3 className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">Get in Touch</h3>
            <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Have questions? Reach out to the organizers.</p>
            <div className="mt-4 space-y-2">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                  <Mail size={16} className="text-[hsl(var(--primary))]" />{contact.email}
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                  <Phone size={16} className="text-[hsl(var(--primary))]" />{contact.phone}
                </a>
              )}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                  <Globe size={16} className="text-[hsl(var(--primary))]" />{contact.website}
                </a>
              )}
              {contact.address && (
                <div className="flex items-start gap-2 text-base text-[hsl(var(--muted-foreground))]">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />{contact.address}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Link href="/contact" className="btn-main btn-primary rounded-xl px-8 py-3 text-sm">
              <MessageSquare size={16} className="mr-2 inline" />Send a Message
            </Link>
          </div>
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

export function MicrositeLayout({ event, navItems, children }: { event: EventData; navItems: NavItem[]; children: ReactNode }) {
  const [location] = useLocation();
  const hideContactFooter = location === '/contact' || location === '/submit-abstract';
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
      <MicrositeHeader event={event} navItems={navItems} />
      <main className="flex-1">{children}</main>
      {!hideContactFooter && <PersistentContactFooter event={event} />}
      <MicrositeFooter event={event} navItems={navItems} />
    </div>
  );
}
