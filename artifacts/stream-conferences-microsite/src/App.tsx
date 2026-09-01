import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  Globe2,
  GraduationCap,
  HeartPulse,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Moon,
  Network,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
  X,
  Youtube,
  Building2,
  Camera,
  ExternalLink,
  ChevronLeft,
  Handshake,
  Store,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { LiveChatWidget } from '@/components/live-chat-widget';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

const getStartAndEndDates = (eventDateStr?: string, dayRangeStr?: string) => {
  if (!eventDateStr) return { start: null, end: null };
  const start = new Date(eventDateStr);
  if (isNaN(start.getTime())) return { start: null, end: null };
  
  let end = new Date(start);
  if (dayRangeStr) {
    const parts = dayRangeStr.split(/[-–—]/).map(p => p.trim());
    if (parts.length > 1) {
      const endDay = parseInt(parts[1], 10);
      if (!isNaN(endDay)) {
        if (endDay >= start.getDate()) {
          end.setDate(endDay);
        } else {
          end.setMonth(start.getMonth() + 1);
          end.setDate(endDay);
        }
      }
    }
  }
  return { start, end };
};

const conferenceName = 'International Conference on Medical, Life & Health Sciences';
const conferenceCode = 'ICMLHS 2027';
const eventDate = 'March 12–14, 2027';
const eventVenue = 'Boston, Massachusetts · USA';
const tracks = [
  { title: 'Medical & Clinical Sciences', text: 'Evidence that moves care forward.', icon: HeartPulse },
  { title: 'Pharmaceutical & Life Sciences', text: 'From molecules to meaningful outcomes.', icon: Microscope },
  { title: 'Engineering & Technology', text: 'Systems built for a changing world.', icon: Network },
  { title: 'Academic & Research', text: 'Methods, rigor, and the next question.', icon: GraduationCap },
  { title: 'Science & Medical Technologies', text: 'The tools behind better discovery.', icon: Sparkles },
];
const schedule: Record<string, { time: string; title: string; speaker: string; tag: string }[]> = {
  'Day 01': [
    { time: '08:00', title: 'Registration & Welcome Coffee', speaker: 'Conference Secretariat', tag: 'Atrium' },
    { time: '09:30', title: 'Opening Keynote: The Velocity of Translation', speaker: 'Prof. Marcus Vance · Boston Research Institute', tag: 'Main Stage' },
    { time: '11:15', title: 'Interactive Technical Sessions', speaker: 'Scientific Advisory Board', tag: 'Tracks A–C' },
    { time: '13:00', title: 'Strategic Networking Lunch', speaker: 'All delegates', tag: 'Harbor Hall' },
    { time: '15:00', title: 'Specialized Symposiums & Workshops', speaker: 'Dr. Amina Rahman & Prof. James T. Cole', tag: 'Rooms 1–4' },
  ],
  'Day 02': [
    { time: '08:45', title: 'Morning Briefing: What We Learned', speaker: 'Prof. Charles Sterling · Chairperson', tag: 'Main Stage' },
    { time: '10:00', title: 'Peer-Reviewed Oral Presentations', speaker: 'Selected presenters', tag: 'Tracks A–E' },
    { time: '12:30', title: 'Research Dissemination Forum', speaker: 'Publishing partners', tag: 'Forum Room' },
    { time: '14:30', title: 'Poster Session & Live Q&A', speaker: 'Poster presenters', tag: 'Gallery' },
    { time: '17:00', title: 'Industry / Academia Exchange', speaker: 'Partner delegates', tag: 'Harbor Hall' },
  ],
  'Day 03': [
    { time: '09:00', title: 'Clinical Translation Roundtables', speaker: 'Dr. Lucia Santos & Dr. Mei Kwan', tag: 'Rooms 1–3' },
    { time: '10:45', title: 'Future Systems: Closing Plenary', speaker: 'Dr. Elena Morris · Scientific Director', tag: 'Main Stage' },
    { time: '12:30', title: 'Awards & Emerging Scholar Recognition', speaker: 'Organizing Committee', tag: 'Main Stage' },
    { time: '14:00', title: 'Closing Ceremony', speaker: 'Prof. Charles Sterling · Chairperson', tag: 'Main Stage' },
  ],
};
const faqs = [
  ['Who is eligible to submit an abstract?', 'Abstract submissions are open to researchers, clinical physicians, academicians, industry professionals, postdoctoral fellows, and students from around the world. We welcome all career stages and multidisciplinary sectors aligned with our tracks.'],
  ['Can I submit more than one abstract?', 'Yes. You may submit multiple abstracts. Each accepted abstract must have a unique registered author to present the work and avoid scheduling conflicts.'],
  ['Is there an abstract submission fee?', 'No. Submitting an abstract for review by our Scientific Advisory Board is completely free. Registration fees apply only after acceptance.'],
  ['What is the word limit and structure?', 'Abstracts must be 250–350 words, excluding the title, author list, and affiliations. Use Background/Objectives, Methods, Results, and Conclusion/Significance.'],
  ['How are abstracts evaluated?', 'All submissions undergo double-blind peer review by experts on our Scientific Advisory Board. Criteria include rigor, originality, track relevance, clarity, and potential impact.'],
  ['When will I be notified of the decision?', 'Notifications are sent via email within 5 to 7 business days following submission. Please check your spam or junk folder if you do not receive an update.'],
  ['Do I need to register before submitting?', 'No. Submit first. You only need to register after receiving your formal acceptance notification.'],
  ['What if I cannot attend in person?', 'We offer a Virtual Presentation option. Remote presenters may participate live online or submit a pre-recorded session.'],
  ['What if I need a visa?', 'Once your abstract is accepted and registration is complete, the organizing committee will issue an Official Acceptance & Visa Invitation Letter.'],
];
const galleryItems = [
  ['Keynote stage', 'Ideas with a clear line of sight to impact.', 'stage'],
  ['Technical exchange', 'Peer-reviewed work, tested in public.', 'exchange'],
  ['Poster conversations', 'The best questions often start beside the stage.', 'poster'],
  ['Networking forum', 'New collaborations begin between sessions.', 'network'],
  ['Emerging scholars', 'A platform for the next generation of authorities.', 'scholars'],
  ['Publishing desk', 'Research made permanent and discoverable.', 'publishing'],
];
const testimonials = [
  {
    quote: 'The strongest value was the quality of the conversations between disciplines. I left with a collaboration, not just a stack of notes.',
    name: 'Dr. Elena Morris',
    role: 'Translational medicine researcher',
    location: 'London · United Kingdom',
  },
  {
    quote: 'Stream Conferences creates the rare kind of room where early-career researchers feel heard and senior experts remain genuinely curious.',
    name: 'Prof. Daniel Okafor',
    role: 'Professor of biomedical engineering',
    location: 'Lagos · Nigeria',
  },
  {
    quote: 'The program was focused, welcoming, and practical. Every session made it easier to see how research could move into real-world care.',
    name: 'Maya Chen',
    role: 'Digital health strategy lead',
    location: 'Singapore · Asia',
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
];

type Status = 'upcoming' | 'past';
type EventItem = {
  id: string;
  eventId?: string;
  day: string;
  month: string;
  type: 'Conference' | 'Webinar';
  title: string;
  location: string;
  date: Status;
  eventDate?: string;
  slug?: string;
  speaker?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  logoUrl?: string;
  bannerUrl?: string;
  brochureUrl?: string;
  fees?: { label: string; amount: number }[];
  organizerContact?: { name: string; email: string; phone: string };
  tracks?: { title: string; description: string; image: string; referenceLinks: { label: string; url: string }[] }[];
};

const events: EventItem[] = [
  { id: 'med-27', day: '12–14', month: 'MAR 27', type: 'Conference', title: 'International Conference on Medical, Life & Health Sciences', location: 'Boston, Massachusetts · Hybrid', date: 'upcoming', eventDate: '2027-03-12', slug: 'icmlhs-2027' },
  { id: 'ai-27', day: '08–09', month: 'MAY 27', type: 'Conference', title: 'Applied Intelligence & Emerging Technologies Forum', location: 'Singapore · In person', date: 'upcoming', eventDate: '2027-05-08', slug: 'applied-intelligence-2027' },
  { id: 'web-26', day: '22', month: 'OCT 26', type: 'Webinar', title: 'Precision systems: turning data into better decisions', location: 'Online · 14:00 UTC', date: 'upcoming', eventDate: '2026-10-22', slug: 'precision-systems', speaker: 'Dr. Amina Rao' },
  { id: 'climate-26', day: '04', month: 'DEC 26', type: 'Webinar', title: 'Engineering resilient cities under pressure', location: 'Online · 16:00 UTC', date: 'upcoming', eventDate: '2026-12-04', slug: 'resilient-cities', speaker: 'Prof. Daniel Okafor' },
  { id: 'past-25', day: '18–20', month: 'NOV 25', type: 'Conference', title: 'Global Forum on Research Translation', location: 'Copenhagen · Hybrid', date: 'past', eventDate: '2025-11-18', slug: 'global-forum-2025' },
  { id: 'past-web', day: '07', month: 'JUN 25', type: 'Webinar', title: 'The evidence gap: building trust in public health', location: 'Online · 13:00 UTC', date: 'past', eventDate: '2025-06-07', slug: 'evidence-gap', speaker: 'Dr. Leila Morgan' },
];

function EventList({ initial: initialStatus = 'upcoming', onlyType }: { initial?: Status; onlyType?: 'Conference' | 'Webinar' }) {
  const { events: eventsList } = useContext(APIContext);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'All' | 'Conference' | 'Webinar'>(onlyType ?? 'All');
  
  const visible = useMemo(() => {
    return eventsList.filter((e) => {
      const matchStatus = e.date === status;
      const matchType = !onlyType ? (type === 'All' || e.type === type) : e.type === onlyType;
      const matchQuery = `${e.title} ${e.location} ${e.speaker ?? ''}`.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchType && matchQuery;
    });
  }, [eventsList, status, query, type, onlyType]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex p-1 bg-[hsl(var(--muted))] rounded-full border border-[hsl(var(--border))]">
            {(['upcoming', 'past'] as Status[]).map((tab) => (
              <button
                type="button"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  status === tab
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
                key={tab}
                onClick={() => setStatus(tab)}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past archive'}
              </button>
            ))}
          </div>
          
          {!onlyType && (
            <div className="inline-flex p-1 bg-[hsl(var(--muted))] rounded-full border border-[hsl(var(--border))]">
              {(['All', 'Conference', 'Webinar'] as const).map((tab) => (
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    type === tab
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  key={tab}
                  onClick={() => setType(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex items-center w-full sm:w-64">
          <Search size={15} className="absolute left-3 text-[hsl(var(--muted-foreground))] pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${onlyType?.toLowerCase() ?? 'events'}...`}
            className="w-full pl-9 pr-4 py-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-full text-sm focus:outline-none focus:border-[hsl(var(--secondary))] transition-colors"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {visible.length ? (
          visible.map((e) => (
            <article className="card-lift flex gap-5 items-center p-5 border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-2xl" key={e.id}>
              {e.logoUrl ? (
                <img src={mediaUrl(e.logoUrl)} alt={`${e.title} logo`} className="shrink-0 w-16 h-16 rounded-xl border border-[hsl(var(--border))] bg-white object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-center">
                  <b className="text-xl font-bold tracking-tight display leading-none">{e.day}</b>
                  <span className="text-[9px] font-bold tracking-widest uppercase mt-1 label leading-none">{e.month}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] label mb-2 leading-none">
                  {e.type}
                </span>
                <h3 className="display text-base md:text-lg font-bold leading-tight text-[hsl(var(--foreground))]">
                  {e.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{e.location}</span>
                  {e.speaker && (
                    <>
                      <span>·</span>
                      <span className="truncate font-medium">{e.speaker}</span>
                    </>
                  )}
                </div>
                {e.eventDate && (() => {
                  const { start, end } = getStartAndEndDates(e.eventDate, e.day);
                  const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                  const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                  return (
                    <>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                        <CalendarDays size={12} className="shrink-0" />
                        <span>{startFormatted}{endFormatted ? ` – ${endFormatted}` : ''}</span>
                      </div>
                      {(e.startTime || e.endTime) && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <Clock3 size={12} className="shrink-0" />
                          <span>{e.startTime || '—'} – {e.endTime || '—'}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
                <Link href={`/${e.type === 'Conference' ? 'conference' : 'webinar'}/${encodeURIComponent(e.eventId || e.slug || e.id)}`} className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3.5 py-2 text-xs font-bold hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] transition-colors" aria-label={`View details for ${e.title}`}>
                  Details
                </Link>
                <Link href={`/submit-abstract?event=${encodeURIComponent(e.eventId || e.slug || e.id)}`} className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-3.5 py-2 text-xs font-bold hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] transition-colors" aria-label={`Submit abstract for ${e.title}`}>
                  Submit Abstract
                </Link>
                <Link target="_blank" rel="noopener noreferrer" href={`/register?event=${encodeURIComponent(e.eventId || e.slug || e.id)}`} className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3.5 py-2 text-xs font-bold hover:opacity-90 transition-opacity" aria-label={`Register for ${e.title}`}>
                  Register <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center w-full">
            <CircleHelp className="mx-auto text-[hsl(var(--secondary))]" />
            <p className="mt-4 font-bold">No events match that search</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try searching for something else or clearing filters.</p>
          </div>
        )}
      </div>
    </>
  );
}


function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  const target = new Date('2027-03-12T09:00:00-05:00').getTime();
  const distance = Math.max(0, target - now);
  const totalSeconds = Math.floor(distance / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    concluded: now > new Date('2027-03-14T18:00:00-05:00').getTime(),
    live: now >= target && now <= new Date('2027-03-14T18:00:00-05:00').getTime(),
  };
}

interface APIContextType {
  conferences: any[];
  webinars: any[];
  blogs: any[];
  events: EventItem[];
  insightsList: any[];
  mediaPartners: any[];
  collaborators: any[];
  exhibitors: any[];
  mentors: any[];
  people: any[];
  venues: any[];
  loading: boolean;
  error: boolean;
}

const APIContext = createContext<APIContextType>({
  conferences: [],
  webinars: [],
  blogs: [],
  events: [],
  insightsList: [],
  mediaPartners: [],
  collaborators: [],
  exhibitors: [],
  mentors: [],
  people: [],
  venues: [],
  loading: false,
  error: false
});

function APIProvider({ children }: { children: ReactNode }) {
  const [conferences, setConferences] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [mediaPartners, setMediaPartners] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [confRes, webRes, blogRes, mpRes, collabRes, exhRes, mentorsRes, peopleRes, venuesRes] = await Promise.all([
          fetch(`${API_BASE}/conferences`),
          fetch(`${API_BASE}/webinars`),
          fetch(`${API_BASE}/blogs`),
          fetch(`${API_BASE}/media-partners`),
          fetch(`${API_BASE}/collaborators`),
          fetch(`${API_BASE}/exhibitors`),
          fetch(`${API_BASE}/mentors`),
          fetch(`${API_BASE}/people`),
          fetch(`${API_BASE}/venues`)
        ]);
        
        if (!confRes.ok || !webRes.ok || !blogRes.ok || !mpRes.ok || !collabRes.ok || !exhRes.ok || !mentorsRes.ok || !peopleRes.ok || !venuesRes.ok) {
          throw new Error('API fetch failed');
        }

        const confData = await confRes.json();
        const webData = await webRes.json();
        const blogData = await blogRes.json();
        const mpData = await mpRes.json();
        const collabData = await collabRes.json();
        const exhData = await exhRes.json();
        const mentorsData = await mentorsRes.json();
        const peopleData = await peopleRes.json();
        const venuesData = await venuesRes.json();

        if (active) {
          setConferences(confData);
          setWebinars(webData);
          setBlogs(blogData);
          setMediaPartners(mpData);
          setCollaborators(collabData);
          setExhibitors(exhData);
          setMentors(mentorsData);
          setPeople(peopleData);
          setVenues(venuesData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching dynamic data:', err);
        if (active) {
          setError(true);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const eventsList = useMemo(() => {
    const normalizedConfs: EventItem[] = conferences.map((c: any) => ({
      id: c._id || c.id,
      eventId: c.eventId,
      day: c.day,
      month: c.month,
      type: 'Conference',
      title: c.title,
      location: c.location,
      date: c.eventDate ? (new Date(c.eventDate).getTime() >= Date.now() ? 'upcoming' : 'past') : c.date,
      eventDate: c.eventDate,
      slug: c.slug,
      description: c.description,
      startTime: c.startTime,
      endTime: c.endTime,
      logoUrl: c.logoUrl,
      bannerUrl: c.bannerUrl,
      brochureUrl: c.brochureUrl,
      fees: c.fees,
      organizerContact: c.organizerContact,
      tracks: c.tracks
    }));

    const normalizedWebs: EventItem[] = webinars.map((w: any) => ({
      id: w._id || w.id,
      eventId: w.eventId,
      day: w.day,
      month: w.month,
      type: 'Webinar',
      title: w.title,
      location: w.location,
      date: w.eventDate ? (new Date(w.eventDate).getTime() >= Date.now() ? 'upcoming' : 'past') : w.date,
      eventDate: w.eventDate,
      slug: w.slug,
      speaker: w.speaker,
      description: w.description,
      startTime: w.startTime,
      endTime: w.endTime,
      logoUrl: w.logoUrl,
      bannerUrl: w.bannerUrl,
      brochureUrl: w.brochureUrl,
      fees: w.fees,
      organizerContact: w.organizerContact,
      tracks: w.tracks
    }));

    const merged = [...normalizedConfs, ...normalizedWebs];
    if (merged.length === 0) {
      return events;
    }
    return merged;
  }, [conferences, webinars]);

  const insightsList = useMemo(() => {
    return [...blogs]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .map((b: any) => ({
        id: b._id || b.id,
        label: b.label || 'FIELD NOTE',
        title: b.title,
        copy: b.copy,
        content: b.content,
        bannerUrl: mediaUrl(b.bannerUrl || ''),
        announcedBy: b.announcedBy,
        createdAt: b.createdAt
      }));
  }, [blogs]);

  return (
    <APIContext.Provider value={{ conferences, webinars, blogs, events: eventsList, insightsList, mediaPartners, collaborators, exhibitors, mentors, people, venues, loading, error }}>
      {children}
    </APIContext.Provider>
  );
}

function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const [subnav, setSubnav] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuGroups = [
    {
      id: 'conference-info',
      label: 'Conference Info',
      items: [
        ['/about', 'About Stream', 'Learn about our mission, vision and values'],
        ['/program', 'Program Overview', 'Scientific track details and conference lenses'],
        ['/speakers', 'OCM & Speakers', 'Meet our organizing committee and faculty'],
        ['/venue', 'Venues', 'Explore the venues available for our events']
      ]
    },
    {
      id: 'events-webinars',
      label: 'Events & Webinars',
      items: [
        ['/conferences', 'Conferences Calendar', 'Browse upcoming and past scientific conferences'],
        ['/webinars', 'Webinars Calendar', 'Join our digital panels and online clinical seminars'],
        ['/gallery', 'Event Gallery', 'Photos and highlights of scientific convocations']
      ]
    },
    {
      id: 'media-support',
      label: 'Media & Support',
      items: [
        ['/blog', 'Insights Blog', 'Latest news, field notes, and medical updates'],
        ['/media-partners', 'Media Partners', 'Organizations amplifying our conversations'],
        ['/collaborators', 'Collaborators', 'Institutions and partners working with us'],
        ['/exhibitors', 'Exhibitors', 'Companies showcasing their work with us'],
        ['/sponsors', 'Exhibitor & Sponsor', 'Partnership tiers and exhibition guidelines'],
        ['/guidelines', 'Presenter Guidelines', 'A/V formats, poster specifications and checklists'],
        ['/brochure', 'Brochure PDF', 'Download the complete delegate handbook'],
        ['/faq', 'FAQs', 'Answers to common submission and queries'],
        ['/terms', 'Terms & Conditions', 'Registration guidelines and cancellation policies'],
        ['/contact', 'Contact Us', 'Get in touch with our global secretariat desk']
      ]
    }
  ];

  useEffect(() => {
    const onScroll = () => setSubnav(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.localStorage.setItem('stream-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [location]);
  useEffect(() => {
    const handleGlobalClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);
  const toggleTheme = () => setDark((value) => !value);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.92)] backdrop-blur-xl">
        <div className="container-wide flex h-[74px] items-center justify-between gap-6">
          <Link href="/" className="group flex shrink-0 items-center gap-3" data-testid="link-home-logo">
            <img src="/logo.jpg" className="h-10 w-10 rounded-[11px] object-cover shadow-lg shadow-[hsl(var(--primary)/.16)]" alt="SC" />
            <span className="leading-tight">
              <span className="display block text-[15px] font-bold tracking-[-.02em]">Stream<span className="text-[hsl(var(--secondary))]">Conferences</span></span>
              <span className="label block mt-1 text-[9px] text-[hsl(var(--muted-foreground))]">An event by Stream Conferences</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            <Link href="/" className={`text-[13.5px] font-semibold transition-colors hover:text-[hsl(var(--secondary))] ${location === '/' ? 'text-[hsl(var(--secondary))]' : ''}`} data-testid="link-nav-home">Home</Link>
            {menuGroups.map((group) => {
              const isOpen = openDropdown === group.id;
              return (
                <div
                  key={group.id}
                  className="relative py-4"
                  onMouseEnter={() => setOpenDropdown(group.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(isOpen ? null : group.id);
                    }}
                    className={`flex items-center gap-1 text-[13.5px] font-semibold transition-colors hover:text-[hsl(var(--secondary))] ${isOpen || group.items.some(([href]) => location === href) ? 'text-[hsl(var(--secondary))]' : ''}`}
                    aria-expanded={isOpen}
                    data-testid={`button-nav-group-${group.id}`}
                  >
                    {group.label}
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 z-50 ${
                        group.id === 'conference-info' ? 'w-[280px]' :
                        group.id === 'media-support' ? 'w-[520px]' :
                        'w-[280px]'
                      }`}
                      data-testid={`dropdown-nav-group-${group.id}`}
                    >
                      <div
                        className={`grid gap-1.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 shadow-2xl shadow-[hsl(var(--primary)/.13)] ${
                          group.id === 'conference-info' ? 'grid-cols-1' :
                          group.id === 'media-support' ? 'grid-cols-2' :
                          'grid-cols-1'
                        }`}
                      >
                        {group.items.map(([href, label, desc]) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group/item flex flex-col gap-1 rounded-xl p-2.5 transition-colors hover:bg-[hsl(var(--muted)/.65)] ${location === href ? 'bg-[hsl(var(--muted)/.45)] text-[hsl(var(--secondary))]' : ''}`}
                            data-testid={`link-nav-item-${label.toLowerCase().replaceAll(' ', '-')}`}
                          >
                            <div className="flex items-center justify-between text-[13px] font-bold text-[hsl(var(--foreground))] transition-colors group-hover/item:text-[hsl(var(--secondary))]">
                              <span className={location === href ? 'text-[hsl(var(--secondary))]' : ''}>{label}</span>
                              <ChevronRight size={13} className="opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                            </div>
                            {desc && (
                              <span className="text-[11px] leading-snug text-[hsl(var(--muted-foreground))]">
                                {desc}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]" aria-label={dark ? 'Use light theme' : 'Use dark theme'} data-testid="button-theme-toggle">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
            <button type="button" onClick={() => setMenuOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] lg:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 lg:hidden max-h-[80vh] overflow-y-auto">
          <nav className="container-wide grid gap-6" aria-label="Mobile">
            <Link href="/" className="flex items-center justify-between border-b border-[hsl(var(--border)/.65)] py-2 text-sm font-bold" data-testid="link-mobile-home">Home<ArrowRight size={15} className="text-[hsl(var(--secondary))]" /></Link>
            {menuGroups.map((group) => (
              <div key={group.id} className="grid gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{group.label}</p>
                <div className="grid gap-1 pl-2">
                  {group.items.map(([href, label]) => (
                    <Link key={href} href={href} className="flex items-center justify-between py-2 text-[13px] font-semibold text-[hsl(var(--foreground))] border-b border-[hsl(var(--border)/.3)] last:border-0" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}>
                      {label}
                      <ArrowRight size={13} className="text-[hsl(var(--secondary))]" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>}
      </header>
      {subnav && <div className="sticky top-[74px] z-30 hidden border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md md:block">
        <div className="container-wide flex h-11 items-center justify-between">
          <span className="label text-[9px] text-[hsl(var(--primary-foreground)/.65)]">{conferenceCode} · Quick access</span>
          <div className="flex items-center gap-5 text-[11px] font-bold uppercase tracking-[.12em]">
            <Link href="/program" data-testid="link-subnav-program">Program</Link><a href="#speakers" data-testid="link-subnav-speakers">Speakers</a><Link href="/venue" data-testid="link-subnav-venue">Venues</Link>
          </div>
        </div>
      </div>}
    </>
  );
}

function Footer() {
  return <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
    <div className="container-wide grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr]">
      <div><div className="flex items-center gap-3"><img src="/logo.jpg" className="h-10 w-10 rounded-[11px] object-cover" alt="SC" /><span className="display text-lg font-bold">Stream Conferences</span></div><p className="mt-5 max-w-sm text-sm leading-7 text-[hsl(var(--primary-foreground)/.68)]">Connecting minds, advancing science. A high-credibility global platform for research, clinical practice, and industry.</p><a href="https://streamconferences.com" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--accent))]" data-testid="link-parent-brand">An event by Stream Conferences <ArrowUpRight size={15} /></a></div>
      <div><p className="label text-[hsl(var(--accent))]">Explore</p><div className="mt-5 grid gap-3 text-sm text-[hsl(var(--primary-foreground)/.72)]"><Link href="/about" data-testid="link-footer-about">About Stream Conferences</Link><Link href="/program" data-testid="link-footer-program">Program</Link><Link href="/speakers" data-testid="link-footer-speakers">OCM & Speakers</Link><Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link><Link href="/blog" data-testid="link-footer-blog">Blog</Link><Link href="/venue" data-testid="link-footer-venue">Venues</Link><Link href="/brochure" data-testid="link-footer-brochure">Brochure</Link></div></div>
      <div><p className="label text-[hsl(var(--accent))]">Delegate desk</p><div className="mt-5 grid gap-3 text-sm text-[hsl(var(--primary-foreground)/.72)]"><a href="mailto:info@streamconferences.com" data-testid="link-footer-email">info@streamconferences.com</a><a href="mailto:abstracts@streamconferences.com" data-testid="link-footer-abstracts">abstracts@streamconferences.com</a><Link href="/contact" data-testid="link-footer-contact">Contact the secretariat</Link></div></div>
    </div>
    <div className="container-wide flex flex-col justify-between gap-3 border-t border-[hsl(var(--primary-foreground)/.15)] py-5 text-[11px] text-[hsl(var(--primary-foreground)/.55)] sm:flex-row"><span>© 2027 Stream Conferences. All rights reserved.</span><span>ICMLHS 2027 · Boston, USA</span></div>
  </footer>;
}

function Layout({ children }: { children: ReactNode }) {
  return <div className="site-grain min-h-[100dvh]"><SiteHeader />{children}<Footer /><LiveChatWidget /></div>;
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-on-scroll ${visible ? 'is-visible' : ''} ${className}`}>{children}</div>;
}

function SectionTitle({ eyebrow, title, body, light = false }: { eyebrow: string; title: string; body?: string; light?: boolean }) {
  return <div className={light ? 'text-[hsl(var(--primary-foreground))]' : ''}><p className={`label ${light ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>{eyebrow}</p><h2 className="display mt-4 max-w-4xl text-3xl font-bold leading-[1.08] tracking-[-.045em] md:text-5xl">{title}</h2>{body && <p className={`mt-5 max-w-2xl text-base leading-7 ${light ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>{body}</p>}</div>;
}

function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string; bgImage?: string }) {
  return (
    <section className="page-intro bg-grid">
      <div className="container-wide pt-12 pb-10 md:pt-16 md:pb-12 lg:pt-20 lg:pb-16 reveal">
        <div>
          <div className="label text-[hsl(var(--accent))]">{eyebrow}</div>
          <h1 className="page-title mt-5">{title}</h1>
          <p className="page-copy">{body}</p>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  return <div className="overflow-hidden border-y border-[hsl(var(--primary-foreground)/.15)] bg-[hsl(var(--secondary))] py-3 text-[hsl(var(--secondary-foreground))]"><div className="flex w-max gap-8 whitespace-nowrap" style={{ animation: 'ticker 28s linear infinite' }}><span className="label text-[10px]">Connecting Minds · Advancing Science</span><span>/</span><span className="label text-[10px]">Uniting Academia, Industry & Clinical Excellence</span><span>/</span><span className="label text-[10px]">Connecting Minds · Advancing Science</span><span>/</span><span className="label text-[10px]">Uniting Academia, Industry & Clinical Excellence</span></div></div>;
}

function Countdown() {
  const countdown = useCountdown();
  const items = [['days', countdown.days], ['hours', countdown.hours], ['minutes', countdown.minutes], ['seconds', countdown.seconds]];
  return <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))] py-14 text-[hsl(var(--primary-foreground))]"><div className="container-wide text-center"><p className="label text-[hsl(var(--accent))]">The summit begins in</p>{countdown.live || countdown.concluded ? <h2 className="display mt-5 text-4xl font-bold">{countdown.live ? 'Conference is live' : 'Conference concluded'}</h2> : <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(([label, value]) => <div key={label as string} className="rounded-xl border border-[hsl(var(--primary-foreground)/.15)] bg-[hsl(var(--primary-foreground)/.06)] px-4 py-5"><strong className="display block text-4xl font-bold tracking-[-.06em] text-[hsl(var(--accent))] md:text-5xl">{String(value).padStart(2, '0')}</strong><span className="label mt-2 block text-[9px] text-[hsl(var(--primary-foreground)/.6)]">{label}</span></div>)}</div>}<p className="mt-6 text-sm text-[hsl(var(--primary-foreground)/.55)]">March 12–14, 2027 · Boston, Massachusetts</p></div></section>;
}

function TrackGrid() {
  return <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{tracks.map(({ title, text, icon: Icon }, index) => <Reveal key={title} className={index === 0 ? 'lg:-translate-y-3' : ''}><div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5" data-testid={`card-track-${index}`}><Icon className="text-[hsl(var(--secondary))]" size={23} strokeWidth={1.8} /><h3 className="display mt-7 text-lg font-bold leading-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p><span className="mt-8 block text-[hsl(var(--accent))]"><ArrowUpRight size={18} /></span></div></Reveal>)}</div>;
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];
  const move = (direction: number) => setActive((current) => (current + direction + testimonials.length) % testimonials.length);
  return <section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" aria-label="Delegate testimonials">
    <div className="container-wide grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
      <div><p className="label text-[hsl(var(--accent))]">From the delegate community</p><h2 className="display mt-5 max-w-md text-4xl font-bold leading-[1.03] tracking-[-.05em] md:text-6xl">A room people remember.</h2><p className="mt-6 max-w-md text-base leading-7 text-[hsl(var(--primary-foreground)/.65)]">The conference experience is designed to stay useful long after the final session.</p></div>
      <div className="relative rounded-[22px] border border-[hsl(var(--primary-foreground)/.18)] bg-[hsl(var(--primary-foreground)/.06)] p-7 md:p-10">
        <span className="display text-6xl leading-none text-[hsl(var(--accent))]">“</span>
        <blockquote className="display mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-.03em] md:text-4xl">“{testimonial.quote}”</blockquote>
        <div className="mt-8 flex flex-col gap-5 border-t border-[hsl(var(--primary-foreground)/.15)] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-bold">{testimonial.name}</p><p className="mt-1 text-sm text-[hsl(var(--primary-foreground)/.62)]">{testimonial.role}</p><p className="mt-1 label text-[9px] text-[hsl(var(--accent))]">{testimonial.location}</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] hover:border-[hsl(var(--accent))]" aria-label="Previous testimonial" data-testid="button-testimonial-previous"><ChevronLeft size={17} /></button>
            <button type="button" onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--primary-foreground)/.28)] hover:border-[hsl(var(--accent))]" aria-label="Next testimonial" data-testid="button-testimonial-next"><ChevronRight size={17} /></button>
          </div>
        </div>
        <div className="mt-6 flex gap-2" role="tablist" aria-label="Choose testimonial">{testimonials.map((item, index) => <button key={item.name} type="button" onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-10 bg-[hsl(var(--accent))]' : 'w-5 bg-[hsl(var(--primary-foreground)/.3)]'}`} aria-label={`Show testimonial ${index + 1}`} aria-selected={index === active} role="tab" data-testid={`button-testimonial-dot-${index}`} />)}</div>
      </div>
    </div>
  </section>;
}

function GallerySlider() {
  const [active, setActive] = useState(0);
  
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % galleryItems.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="section-pad border-y border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)]" aria-label="Inside the exchange">
      <div className="container-wide">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10">
          <SectionTitle 
            eyebrow="Inside the exchange" 
            title="Ideas are better in the room." 
            body="A visual pulse of Stream Conferences: peer exchanges, technical questions, and strategic networking."
          />
          <Link href="/gallery" className="btn-main btn-quiet shrink-0" data-testid="link-slider-gallery">
            View full gallery <ArrowRight size={16} />
          </Link>
        </div>
        <div className="reveal relative overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-xl">
          <div 
            className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] w-full overflow-hidden rounded-[16px] transition-all duration-700 ease-in-out"
            style={{ 
              backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(15, 23, 42, 0.1) 100%), url(${galleryImages[active]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end text-white">
              <span className="label text-[hsl(var(--accent))] text-[10px] mb-2">0{active + 1} / 0{galleryItems.length}</span>
              <h3 className="display text-2xl font-bold leading-tight md:text-3xl text-white">{galleryItems[active][0]}</h3>
              <p className="mt-2 text-sm text-slate-200 max-w-md">{galleryItems[active][1]}</p>
            </div>
            <div className="absolute right-6 top-6 flex gap-2">
              {galleryItems.map((_, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => setActive(i)} 
                  className={`h-2 rounded-full transition-all duration-300 ${active === i ? 'w-8 bg-[hsl(var(--accent))]' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Show slide ${i + 1}`}
                  data-testid={`button-slider-dot-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const { conferences, webinars, insightsList, mentors } = useContext(APIContext);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const displayConferences = useMemo(() => {
    const upcoming = conferences.filter((c: any) => {
      if (c.eventDate) {
        return new Date(c.eventDate).getTime() >= Date.now();
      }
      return c.date === 'upcoming';
    });
    return upcoming.length > 0 ? upcoming.slice(0, 3) : conferences.slice(0, 3);
  }, [conferences]);

  const displayWebinars = useMemo(() => {
    const upcoming = webinars.filter((w: any) => {
      if (w.eventDate) {
        return new Date(w.eventDate).getTime() >= Date.now();
      }
      return w.date === 'upcoming';
    });
    return upcoming.length > 0 ? upcoming.slice(0, 3) : webinars.slice(0, 3);
  }, [webinars]);

  return <Layout>
    <main>
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <div className="hero-grid absolute inset-0 opacity-75" />
        <div className="container-wide relative grid min-h-[680px] items-center gap-12 pb-16 pt-20 md:grid-cols-[1fr_1fr] md:pb-24 md:pt-28">
          <div className="reveal"><img src="/logo.jpg" className="h-20 w-20 rounded-2xl object-cover mb-8 border border-[hsl(var(--primary-foreground)/.15)] shadow-xl" alt="Stream Conferences Logo" /><div className="flex items-center gap-3"><span className="label rounded-full border border-[hsl(var(--accent)/.55)] px-3 py-1.5 text-[hsl(var(--accent))]">Annual Scientific Summit</span><span className="label text-[hsl(var(--primary-foreground)/.5)]">SC / 27</span></div><h1 className="display mt-7 max-w-4xl text-balance text-5xl font-bold leading-[.94] tracking-[-.07em] md:text-8xl">The science of <span className="text-[hsl(var(--accent))]">moving forward.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[hsl(var(--primary-foreground)/.68)]">The International Conference on Medical, Life & Health Sciences brings the people who discover, test, build, and deliver better futures into one serious global conversation.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/conferences" className="btn-main border border-[hsl(var(--primary-foreground)/.28)] text-[hsl(var(--primary-foreground))] hover:border-[hsl(var(--accent))]" data-testid="link-hero-conferences">Events Calendar <ArrowRight size={16} /></Link></div></div>
          <div className="reveal reveal-delay-2 relative"><div className="float-mark relative ml-auto max-w-[500px] w-full overflow-hidden rounded-[22px] border border-[hsl(var(--primary-foreground)/.2)] bg-[hsl(var(--primary-foreground)/.07)] p-3 backdrop-blur-sm"><div className="relative aspect-[4/5] overflow-hidden rounded-[16px]"><img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85" alt="Audience gathered at a conference presentation" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.95)] via-[hsl(var(--primary)/.15)] to-transparent" /><div className="absolute inset-x-5 top-5 flex items-center justify-between"><span className="label rounded-full bg-[hsl(var(--primary)/.72)] px-3 py-1.5 text-[9px] text-[hsl(var(--accent))]">Field note / 001</span><Microscope size={19} className="text-[hsl(var(--accent))]" /></div><div className="absolute inset-x-5 bottom-5"><p className="display text-2xl font-bold leading-tight">“Research becomes real when disciplines stop working in parallel.”</p><div className="mt-5 flex items-center justify-between text-xs text-[hsl(var(--primary-foreground)/.68)]"><span>ICMLHS 2027</span><span>Boston / USA</span></div></div></div></div></div>
        </div>
      </section>
      
      {/* Upcoming Conferences Section */}
      <section className="section-pad bg-[hsl(var(--card))]" id="upcoming-events-conferences">
        <div className="container-wide">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10">
            <SectionTitle 
              eyebrow="Upcoming conferences" 
              title="Conclaves of global scale." 
              body="Announcing the premier global gatherings for science, engineering, and academia." 
            />
            <Link href="/conferences" className="btn-main btn-quiet shrink-0" data-testid="link-home-view-conferences">
              All Conferences <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayConferences.map((item, index) => {
              const registerHref = `/register?event=${encodeURIComponent(item.eventId || item.slug || item._id)}`;
              const detailsHref = `/conference/${encodeURIComponent(item.eventId || item.slug || item._id)}`;
              return (
                <div key={item._id || item.id || index} className="card-lift flex flex-col justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden h-full" data-testid={`card-home-conference-${index}`}>
                  <div className="relative aspect-[16/9] w-full bg-[hsl(var(--muted)/.25)] border-b border-[hsl(var(--border))] overflow-hidden">
                    {item.bannerUrl || item.logoUrl ? (
                      <img 
                        src={mediaUrl(item.bannerUrl || item.logoUrl)} 
                        alt={`${item.title} banner`} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center">
                        <Building2 className="text-[hsl(var(--primary-foreground))] opacity-65" size={40} />
                      </div>
                    )}
                    <span className="absolute right-3 top-3 inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[hsl(var(--primary)/.85)] text-[hsl(var(--primary-foreground))] backdrop-blur-[2px] label">
                      CONFERENCE
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="display text-lg font-bold leading-snug text-[hsl(var(--foreground))] line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <MapPin size={13} className="shrink-0 text-[hsl(var(--accent))]" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        {item.eventDate && (() => {
                          const { start, end } = getStartAndEndDates(item.eventDate, item.day);
                          const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          return (
                            <>
                              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                <CalendarDays size={13} className="shrink-0 text-[hsl(var(--secondary))]" />
                                <span>{startFormatted}{endFormatted ? ` – ${endFormatted}` : ''}</span>
                              </div>
                              {(item.startTime || item.endTime) && (
                                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                  <Clock3 size={13} className="shrink-0 text-[hsl(var(--secondary))]" />
                                  <span>{item.startTime || '—'} – {item.endTime || '—'}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[hsl(var(--border))]">
                      <Link 
                        href={detailsHref} 
                        className="flex-1 text-center py-3 px-3 rounded-full text-sm font-bold border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] transition-colors"
                        data-testid={`btn-home-conf-details-${index}`}
                      >
                        Details
                      </Link>
                      <Link 
                        target="_blank"
                        rel="noopener noreferrer"
                        href={registerHref} 
                        className="flex-1 text-center py-3 px-3 rounded-full text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                        data-testid={`btn-home-conf-register-${index}`}
                      >
                        Register Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Ticker />
      
      {/* Upcoming Webinars Section */}
      <section className="section-pad bg-[hsl(var(--muted)/.35)]" id="upcoming-events-webinars">
        <div className="container-wide">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10">
            <SectionTitle 
              eyebrow="Upcoming webinars" 
              title="Live webinars & online briefings." 
              body="Connect and exchange ideas with experts and peers on research and clinical practice." 
            />
            <Link href="/webinars" className="btn-main btn-quiet shrink-0" data-testid="link-home-view-webinars">
              All Webinars <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayWebinars.map((item, index) => {
              const registerHref = `/register?event=${encodeURIComponent(item.eventId || item.slug || item._id)}`;
              const detailsHref = `/webinar/${encodeURIComponent(item.eventId || item.slug || item._id)}`;
              return (
                <div key={item._id || item.id || index} className="card-lift flex flex-col justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden h-full" data-testid={`card-home-webinar-${index}`}>
                  <div className="relative aspect-[16/9] w-full bg-[hsl(var(--muted)/.25)] border-b border-[hsl(var(--border))] overflow-hidden">
                    {item.bannerUrl || item.logoUrl ? (
                      <img 
                        src={mediaUrl(item.bannerUrl || item.logoUrl)} 
                        alt={`${item.title} banner`} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center">
                        <Users className="text-[hsl(var(--primary-foreground))] opacity-65" size={40} />
                      </div>
                    )}
                    <span className="absolute right-3 top-3 inline-block text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[hsl(var(--accent)/.85)] text-[hsl(var(--accent-foreground))] backdrop-blur-[2px] label">
                      WEBINAR
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="display text-lg font-bold leading-snug text-[hsl(var(--foreground))] line-clamp-2">
                        {item.title}
                      </h3>
                      <div className="mt-4 space-y-2">
                        {item.speaker && (
                          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                            <Users size={13} className="shrink-0 text-[hsl(var(--accent))]" />
                            <span className="truncate">{item.speaker}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                          <MapPin size={13} className="shrink-0 text-[hsl(var(--muted-foreground))]" />
                          <span className="truncate">{item.location || 'Online'}</span>
                        </div>
                        {item.eventDate && (() => {
                          const { start, end } = getStartAndEndDates(item.eventDate, item.day);
                          const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          return (
                            <>
                              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                <CalendarDays size={13} className="shrink-0 text-[hsl(var(--secondary))]" />
                                <span>{startFormatted}{endFormatted ? ` – ${endFormatted}` : ''}</span>
                              </div>
                              {(item.startTime || item.endTime) && (
                                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                                  <Clock3 size={13} className="shrink-0 text-[hsl(var(--secondary))]" />
                                  <span>{item.startTime || '—'} – {item.endTime || '—'}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[hsl(var(--border))]">
                      <Link 
                        href={detailsHref} 
                        className="flex-1 text-center py-3 px-3 rounded-full text-sm font-bold border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] transition-colors"
                        data-testid={`btn-home-webinar-details-${index}`}
                      >
                        Details
                      </Link>
                      <Link 
                        target="_blank"
                        rel="noopener noreferrer"
                        href={registerHref} 
                        className="flex-1 text-center py-3 px-3 rounded-full text-sm font-bold bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                        data-testid={`btn-home-webinar-register-${index}`}
                      >
                        Register Now
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad" id="speakers"><div className="container-wide"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionTitle eyebrow="People to follow" title="The room is part of the research." body="A deliberately mixed faculty of clinical authorities, technical pioneers, and emerging scholars." /><Link href="/speakers" className="btn-main btn-quiet shrink-0" data-testid="link-home-speakers">Meet the speakers <ArrowUpRight size={16} /></Link></div><div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-5">{mentors.slice(0, 5).map((mentor, i) => <SpeakerCard key={mentor.username} person={mentor} index={i + 1} />)}</div></div></section>
      <TestimonialCarousel />
      <GallerySlider />
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--primary))] py-16 text-[hsl(var(--primary-foreground))]"><div className="container-wide flex flex-col items-start justify-between gap-10 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--accent))]">Media partners</p><p className="display mt-4 text-2xl font-bold">Amplifying work that deserves to travel.</p></div><div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm font-bold text-[hsl(var(--primary-foreground)/.55)] sm:grid-cols-4"><span>JOURNAL OF TRANSLATIONAL MEDICINE</span><span>SCIENCEWIRE</span><span>HEALTH / REVIEW</span><span>TECHNICA</span></div></div></section>
      {insightsList.length > 0 && (
        <section className="section-pad"><div className="container-wide grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><SectionTitle eyebrow="From the Stream Conferences blog" title="Notes for the in-between." /><Link href="/blog" className="btn-main btn-quiet mt-8" data-testid="link-home-insights">Read the blog <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-3">{insightsList.slice(0, 3).map((insight, index) => <div key={insight.id || insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full"><div className="p-5 flex-1"><div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-[hsl(var(--muted)/.25)] flex items-center justify-center relative">{insight.bannerUrl ? <img src={insight.bannerUrl} alt={insight.title} className="h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center"><BookOpen className="text-[hsl(var(--primary-foreground))] opacity-65" size={32} /></div>}</div><span className="label text-[hsl(var(--accent))] text-[9px]">{insight.label}</span><h3 className="display mt-3 text-lg font-bold leading-tight line-clamp-2">{insight.title}</h3><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))] line-clamp-3">{insight.copy}</p></div><div className="px-5 pb-5 pt-0"><Link href={`/blog/${encodeURIComponent(insight.id)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition" data-testid={`link-home-blog-${index}`}>Read field note <ArrowRight size={13} /></Link></div></div>)}</div></div></section>
      )}
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.38)] py-10"><div className="container-wide flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--secondary))]">Stay close to the conversation</p><p className="mt-2 text-sm font-semibold">Follow <span className="text-[hsl(var(--secondary))]">#ICMLHS2027</span> across the summit.</p></div><div className="flex gap-2"><a href="https://www.linkedin.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="LinkedIn" data-testid="link-social-linkedin"><Linkedin size={17} /></a><a href="https://x.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="X" data-testid="link-social-x"><X size={17} /></a><a href="https://www.youtube.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="YouTube" data-testid="link-social-youtube"><Youtube size={17} /></a></div></div></section>
      <section className="bg-[hsl(var(--accent))] py-10 text-[hsl(var(--accent-foreground))]"><div className="container-wide flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--accent-foreground)/.65)]">Delegate secretariat</p><p className="display mt-2 text-2xl font-bold">Have a question before you arrive?</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><a href="mailto:info@streamconferences.com" className="flex items-center gap-2 font-semibold" data-testid="link-home-email"><Mail size={16} /> info@streamconferences.com</a><span className="flex items-center gap-2"><Phone size={16} /> +1 (617) 555-0199</span></div></div><Link href="/contact" className="btn-main border border-[hsl(var(--accent-foreground)/.35)]" data-testid="link-home-contact">Contact us <ArrowUpRight size={16} /></Link></div></section>
    </main>
  </Layout>;
}

function SpeakerCard({ person, index }: { person: any; index: number }) {
  const displayName = person.fullName || person.username;
  const role = person.title || '';
  const isOrganizer = person.role === 'admin';
  const label = isOrganizer ? 'Committee Member' : 'Invited speaker';
  return (
    <div className="card-lift flex flex-col justify-between overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-speaker-${index}`}>
      <div>
        <div className="flex justify-center pt-8 pb-2">
          {person.avatar ? (
            <img src={mediaUrl(person.avatar)} alt={displayName} className="h-32 w-32 rounded-full object-cover border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)]" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))]"><Users size={44} /></div>
          )}
        </div>
        <div className="p-5 pb-0 text-center">
          <p className="label text-[hsl(var(--secondary))]">{label}</p>
          <h3 className="display mt-3 text-xl font-bold text-[hsl(var(--foreground))]">{displayName}</h3>
          {role && <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{role}</p>}
        </div>
      </div>
      <div className="p-5 pt-0 text-center">
        <Link href={`/mentors/${person.username}?from=speakers`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition group" data-testid={`link-details-${index}`}>
          View details <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

function SpeakersPage() {
  const { people } = useContext(APIContext);
  const organizers = people.filter((p: any) => p.role === 'admin');
  const speakers = people.filter((p: any) => p.role === 'mentor');

  return (
    <Layout>
      <PageHero 
        bgImage="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80" 
        eyebrow="The human network" 
        title="People who make the questions sharper." 
        body="Meet the world-class organizing committee and invited faculty shaping the scientific agenda for ICMLHS 2027." 
      />
      <main className="section-pad">
        <div className="container-wide">
          <SectionTitle 
            eyebrow="Organizing committee" 
            title="The people behind the platform." 
            body="A working committee that protects rigor while making the room generous to new ideas." 
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {organizers.length > 0 ? (
              organizers.map((person, i) => <SpeakerCard key={person.username} person={person} index={i + 4} />)
            ) : (
              <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted)/.03)]">
                <p>No organizing committee members yet.</p>
              </div>
            )}
          </div>
          <div className="my-24 border-t border-[hsl(var(--border))] pt-16">
            <SectionTitle 
              eyebrow="Keynote & invited speakers" 
              title="Voices worth making time for." 
              body="Each session is designed to reward attention with a useful next move." 
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {speakers.length > 0 ? (
                speakers.map((person, i) => <SpeakerCard key={person.username} person={person} index={i + 7} />)
              ) : (
                <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted)/.03)]">
                  <p>No speakers have added their profiles yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function AboutPage() {
  const values = [
    ['Scientific Integrity & Rigor', 'We hold empirical truth to the highest standard. Every abstract, paper, and presentation hosted across our stages undergoes uncompromising peer review, ensuring that all shared intelligence is grounded in methodological excellence and transparency.'],
    ['Action-Driven Innovation', 'Knowledge achieves its true value only when translated into real-world impact. We bridge academic theory and industrial application, moving lab-scale breakthroughs toward clinical treatments and scalable technological infrastructure.'],
    ['Multidisciplinary Synergy', 'Humanity’s most formidable challenges transcend singular disciplines. We align clinical authorities, technical pioneers, and corporate strategists to generate unexpected insights and borderless innovation.'],
    ['Global Inclusivity & Intellectual Accessibility', 'Scientific advancement is a global imperative. Our borderless platform elevates pioneering work from every continent and gives early-career scholars and seasoned authorities equal access to recognition and strategic networks.'],
  ];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1200&q=80" eyebrow="The organization behind the room" title="Connecting minds. Advancing science." body="Stream Conferences is an established global architect of elite scientific, technical, research, engineering, academic, and medical summits." /><main><section className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><SectionTitle eyebrow="About Stream Conferences" title="A platform built to close the gap between discovery and delivery." body="Stream Conferences was established to solve a systemic inefficiency that stalls modern research: the expanding void between theoretical discovery and real-world execution." /></div><div className="grid gap-5 text-base leading-8 text-[hsl(var(--muted-foreground))]"><p>In today’s hyper-accelerated innovation landscape, traditional conference models—plagued by passive presentations and institutional siloing—are no longer equipped to drive meaningful scientific velocity.</p><p>We redefine the international summit experience through focused, result-driven frameworks that convert intellectual capital into immediate market momentum. We deliberately cultivate environments where data scientists, clinical physicians, biotech innovators, and systems engineers converge to solve high-stakes global challenges.</p></div></div></section><section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><div className="container-wide"><SectionTitle light eyebrow="What guides the work" title="Four values behind every stage, review, and connection." /><div className="mt-12 grid gap-4 md:grid-cols-2">{values.map(([title, body], i) => <div key={title} className="rounded-2xl border border-[hsl(var(--primary-foreground)/.16)] bg-[hsl(var(--primary-foreground)/.06)] p-7"><span className="label text-[hsl(var(--accent))]">0{i + 1}</span><h2 className="display mt-8 text-2xl font-bold">{title}</h2><p className="mt-4 text-sm leading-7 text-[hsl(var(--primary-foreground)/.68)]">{body}</p></div>)}</div></div></section><section className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-2"><div><SectionTitle eyebrow="Vision" title="The definitive benchmark for scientific-industrial convergence." body="We are building a borderless research ecosystem where breakthrough science seamlessly transitions into commercial technology and clinical practice." /></div><div><SectionTitle eyebrow="Mission" title="Move knowledge into the world." /><ul className="mt-8 grid gap-5">{['Accelerate technology transfer from university-led research into commercial pipelines and clinical application.', 'Foster multidisciplinary synergy across Medicine, Pharma, Health Science, Life Science, Engineering, and Technology.', 'Elevate emerging scholars through visibility and direct mentorship alongside recognized industry leaders.', 'Uphold academic excellence across every keynote, technical panel, symposium, and peer-reviewed publication.'].map((item, i) => <li key={item} className="flex gap-4 border-b border-[hsl(var(--border))] pb-5 text-sm leading-6"><span className="mono text-[hsl(var(--accent))]">0{i + 1}</span>{item}</li>)}</ul></div></div></section><section className="section-pad bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><SectionTitle eyebrow="Who we gather" title="A premier delegation of decision-makers and innovators." /><div className="grid gap-3 sm:grid-cols-2">{['Clinical & Academic Leaders', 'Industry Innovators', 'Research & Advisory Authorities', 'Next-Gen Researchers'].map((item, i) => <div key={item} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><Building2 size={20} className="text-[hsl(var(--secondary))]" /><h3 className="display mt-6 text-lg font-bold">{item}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Physicians, executives, editors, strategists, doctoral candidates, and outstanding young scientists.</p></div>)}</div></div></section><section className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[1.2fr_.8fr]"><div><SectionTitle eyebrow="The conference experience" title="More than a presentation schedule." body="Keynote addresses, interactive technical sessions, specialized symposiums, workshops, and strategic networking are designed to create the next collaboration beyond the stage." /></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7"><p className="label text-[hsl(var(--secondary))]">Research dissemination</p><p className="mt-5 text-sm leading-7 text-[hsl(var(--muted-foreground))]">Presented research secures permanent global reach through publishing alliances. Accepted abstracts and manuscripts are published in official digital proceedings with dedicated DOI/ISBN assignment where applicable.</p></div></div></section></main></Layout>;
}

function GalleryPage() {
  const [selected, setSelected] = useState<number | null>(null);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" eyebrow="The conference in motion" title="A room built for exchange." body="A visual archive of the people, moments, and working sessions that make Stream Conferences more than a program." /><main className="section-pad"><div className="container-wide"><div className="mb-12 flex items-end justify-between gap-6"><SectionTitle eyebrow="Event gallery" title="See the work between the sessions." body="A curated selection of event moments, technical sessions, poster forums, and academic exchanges." /><Camera className="hidden text-[hsl(var(--accent))] md:block" size={38} /></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{galleryItems.map(([title, body], i) => <button key={title} onClick={() => setSelected(i)} className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-[hsl(var(--border))] text-left text-[hsl(var(--primary-foreground))] shadow-md transition-all hover:scale-[1.02] duration-300" style={{ backgroundImage: `linear-gradient(to top, rgba(24, 39, 63, 0.9) 0%, rgba(24, 39, 63, 0.3) 60%, rgba(24, 39, 63, 0.1) 100%), url(${galleryImages[i]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} data-testid={`gallery-item-${i}`}><div className="absolute inset-0 bg-[hsl(var(--primary)/.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" /><div className="relative flex h-full flex-col justify-end p-6"><span className="label text-[hsl(var(--accent))] text-[9px] mb-2">0{i + 1}</span><h2 className="display text-2xl font-bold leading-tight">{title}</h2><p className="mt-2 text-xs text-[hsl(var(--primary-foreground)/.85)] max-w-xs">{body}</p><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--accent))] group-hover:translate-x-1 transition-transform duration-300">View large photo <ArrowRight size={13} /></span></div></button>)}</div></div></main>{selected !== null && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setSelected(null)}><div className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-[hsl(var(--card))] shadow-2xl" onClick={(e) => e.stopPropagation()}><button type="button" className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors" onClick={() => setSelected(null)}><X size={18} /></button><img src={galleryImages[selected]} alt={galleryItems[selected][0]} className="w-full max-h-[70vh] object-cover" /><div className="bg-[hsl(var(--card))] p-6 border-t border-[hsl(var(--border))]"><span className="label text-[hsl(var(--accent))]">0{selected + 1} · {galleryItems[selected][0]}</span><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{galleryItems[selected][1]}</p></div></div></div>}</Layout>;
}

function SuccessState({ title, body, reset, testId }: { title: string; body: string; reset?: () => void; testId: string }) {
  return <div className="flex flex-col justify-center rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-8" data-testid={testId}><div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Check size={24} /></div><h3 className="display mt-6 text-3xl font-bold">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-[hsl(var(--primary-foreground)/.7)]">{body}</p>{reset && <button type="button" onClick={reset} className="mt-7 self-start text-sm font-bold text-[hsl(var(--accent))]" data-testid="button-reset-form">Submit another response</button>}</div>;
}

function ThankYouPage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'registration';
  const eventTitle = params.get('eventTitle') || '';

  const content = {
    registration: {
      eyebrow: 'Registration confirmed',
      title: 'Thank you for registering!',
      body: 'Your registration and payment have been successfully recorded. A confirmation email with receipt and event details has been sent to the email provided.'
    },
    abstract: {
      eyebrow: 'Abstract received',
      title: 'Thank you for your submission!',
      body: 'Your abstract PDF has been uploaded successfully. Our Scientific Advisory Board will review it and a confirmation will be sent to the email provided.'
    }
  }[type] || {
    eyebrow: 'Confirmed',
    title: 'Thank you!',
    body: 'Your submission has been recorded successfully.'
  };

  const confetti = Array.from({ length: 12 });

  return (
    <Layout>
      <main className="section-pad">
        <div className="container-wide max-w-2xl">
          <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-8 py-16 text-center shadow-sm">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {confetti.map((_, i) => (
                <span
                  key={i}
                  className="absolute bottom-0 h-2.5 w-2.5 rounded-full"
                  style={{
                    left: `${(i / 12) * 100}%`,
                    background: i % 3 === 0 ? 'hsl(var(--accent))' : i % 3 === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))',
                    animation: `float-up ${2.6 + (i % 5) * 0.4}s ease-out ${i * 0.12}s infinite`
                  }}
                />
              ))}
            </div>

            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[hsl(var(--accent)/.12)]" style={{ animation: 'pop-in .6s cubic-bezier(.2,.8,.2,1) both' }}>
              <svg viewBox="0 0 52 52" className="h-11 w-11" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="none" stroke="hsl(var(--accent) / .25)" strokeWidth="3" />
                <path
                  d="M15 27 L23 35 L38 19"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'check-draw .5s .35s ease-out forwards' }}
                />
              </svg>
            </div>

            <p className="label mt-8 text-[hsl(var(--secondary))] reveal reveal-delay-1">{content.eyebrow}</p>
            <h1 className="display mt-4 text-3xl font-bold tracking-[-.04em] text-[hsl(var(--foreground))] md:text-4xl reveal reveal-delay-2">{content.title}</h1>
            {eventTitle && <p className="mt-3 text-sm font-semibold text-[hsl(var(--accent))] reveal reveal-delay-2">{eventTitle}</p>}
            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))] reveal reveal-delay-3">{content.body}</p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 reveal reveal-delay-3">
              <Link href="/" className="btn-main btn-primary" data-testid="link-thank-you-home">Back to home <ArrowUpRight size={16} /></Link>
              <Link href="/contact" className="btn-main btn-quiet" data-testid="link-thank-you-contact">Contact us</Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function ProgramPage() {
  return (
    <Layout>
      <PageHero 
        eyebrow="Program architecture" 
        title="A clear route through complex work." 
        body="The full program is organized around translation: what we know, what we can test, and what we can build together." 
      />
      <main className="section-pad">
        <div className="container-wide">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['01', 'Orient', 'Keynotes and plenaries set the questions, contexts, and stakes for the day.'], 
              ['02', 'Interrogate', 'Technical sessions and symposia test evidence in public, with room for disagreement.'], 
              ['03', 'Connect', 'Roundtables and networking forums create the next collaboration beyond the stage.']
            ].map(([n, title, body]) => (
              <div key={n} className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] shadow-md">
                <span className="label text-[hsl(var(--accent))]">{n}</span>
                <h2 className="display mt-12 text-3xl font-bold">{title}</h2>
                <p className="mt-4 text-sm leading-7 text-[hsl(var(--primary-foreground)/.68)]">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-24">
            <SectionTitle eyebrow="At a glance" title="Sessions that respect your attention." />
            <div className="mt-10 grid gap-3 max-w-3xl">
              {[
                'Opening Keynote · The Velocity of Translation', 
                'Clinical Translation Roundtables', 
                'Research Dissemination Forum', 
                'Poster Session & Live Q&A', 
                'Future Systems · Closing Plenary'
              ].map((item, i) => (
                <div key={item} className="flex items-center gap-4 border-b border-[hsl(var(--border))] py-5">
                  <span className="mono text-xs text-[hsl(var(--accent))] font-bold">0{i + 1}</span>
                  <p className="font-bold text-[hsl(var(--foreground))]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function BrochurePage() {
  const { toast } = useToast();
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80" eyebrow="The delegate edition" title="Take the summit with you." body="A concise field guide to ICMLHS 2027: tracks, program architecture, venue notes, and the details that help you make the most of three days in Boston." /><main className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div className="relative mx-auto aspect-[.72] w-full max-w-[360px] overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] shadow-2xl shadow-[hsl(var(--primary)/.2)]"><div className="absolute right-[-50px] top-[-20px] h-48 w-48 rounded-full border border-[hsl(var(--accent)/.55)]" /><span className="label text-[hsl(var(--accent))]">Stream Conferences / 2027</span><div className="mt-24"><p className="label text-[9px] text-[hsl(var(--primary-foreground)/.55)]">International conference on</p><h2 className="display mt-3 text-4xl font-bold leading-[.95] tracking-[-.05em]">Medical, Life &<br />Health Sciences</h2></div><div className="absolute bottom-8 left-8 right-8 flex justify-between border-t border-[hsl(var(--primary-foreground)/.2)] pt-4 text-[10px]"><span>ICMLHS 2027</span><span>Boston / USA</span></div></div><div><SectionTitle eyebrow="Conference brochure" title="Everything you need, before you arrive." body="Use the brochure to align your team, plan your sessions, and share the invitation with collaborators." /><ul className="mt-8 grid gap-4">{['Five interdisciplinary tracks with clear submission routes', 'Three-day program architecture and delegate experience', 'Speaker, venue, travel, and registration overview', 'Publishing and proceedings pathway with DOI/ISBN note'].map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check size={18} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" />{item}</li>)}</ul><button type="button" onClick={() => toast({ title: "Brochure Compiled", description: "The official conference brochure PDF has been generated and is downloading." })} className="btn-main btn-primary mt-9" data-testid="button-download-brochure"><Download size={16} /> Download brochure (PDF)</button><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Official brochure edition · PDF version including full track details and registration terms.</p></div></div></main></Layout>;
}

function VenuePage() {
  const { venues } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1501979392350-f8c5b058a5c6?auto=format&fit=crop&w=1200&q=80" eyebrow="Our spaces" title="Venues for the conversation." body="Explore the venues available for our conferences and webinars." /><main className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Venues" title="Where we gather." body="A curated list of the spaces hosting our events." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{venues.length > 0 ? venues.map((venue) => <div key={venue._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center gap-3"><MapPin size={20} className="text-[hsl(var(--secondary))]" /><h3 className="display text-xl font-bold">{venue.name}</h3></div>{venue.address && <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{venue.address}</p>}{venue.locationUrl && <a href={venue.locationUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition">View location <ExternalLink size={14} /></a>}</div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p>No venues have been added yet.</p></div>}</div></div></main></Layout>;
}

function SponsorsPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80" eyebrow="Build the room with us" title="Put your work in the conversation." body="Sponsorship and exhibition at ICMLHS 2027 places your organization alongside the researchers and practitioners shaping what comes next." /><main><section className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Partnership architecture" title="Choose your level of visibility." body="Select from the partnership tiers designed to align your organization with leading research." /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[['Platinum', 'Lead the room', ['Main stage recognition', 'Keynote introduction', 'Premium exhibition footprint']], ['Gold', 'Shape the exchange', ['Session recognition', 'Exhibition footprint', 'Delegate invitations']], ['Silver', 'Join the network', ['Logo visibility', 'Exhibition table', 'Delegate invitations']], ['Exhibitor', 'Show the work', ['Dedicated table', 'Listing in event guide', 'Passes included']]].map(([tier, lead, benefits]) => <div key={String(tier)} className={`rounded-2xl border p-6 ${tier === 'Platinum' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}><p className={`label ${tier === 'Platinum' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>{tier}</p><h3 className="display mt-4 text-2xl font-bold">{lead}</h3><ul className="mt-8 grid gap-3">{(benefits as string[]).map((benefit) => <li key={benefit} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />{benefit}</li>)}</ul></div>)}</div></div></section><section className="section-pad border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><SectionTitle eyebrow="Partner desk" title="Start a useful conversation." body="Send an initial brief to partners@streamconferences.com. Our partnership team will respond within 24–48 business hours." />{sent ? <SuccessState title="Brief received" body="Thanks. The partnership desk has received your request and will contact you shortly." reset={() => setSent(false)} testId="status-sponsor-success" /> : <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><input required className="form-field" placeholder="Company name" aria-label="Company name" data-testid="input-sponsor-company" /><input required className="form-field" placeholder="Contact name" aria-label="Contact name" data-testid="input-sponsor-contact" /><div className="grid gap-4 sm:grid-cols-2"><input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-sponsor-email" /><input className="form-field" placeholder="Phone number" aria-label="Phone number" data-testid="input-sponsor-phone" /></div><select className="form-field" defaultValue="" aria-label="Tier of interest" data-testid="select-sponsor-tier"><option value="" disabled>Tier of interest</option><option>Platinum</option><option>Gold</option><option>Silver</option><option>Exhibitor</option></select><textarea className="form-field min-h-28" placeholder="Tell us what you want to make possible" aria-label="Message" data-testid="input-sponsor-message" /><button type="submit" className="btn-main btn-primary" data-testid="button-submit-sponsor">Send partnership brief <Send size={16} /></button></form>}</div></section></main></Layout>;
}

function RegisterPage() {
  const [location, navigate] = useLocation();
  const eventSlug = new URLSearchParams(window.location.search).get('event') || '';
  const registerUrl = `${window.location.origin}${window.location.pathname}?event=${encodeURIComponent(eventSlug)}`;
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(1);
  const [consent, setConsent] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [presentingAbstract, setPresentingAbstract] = useState('No');
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [mockPayment, setMockPayment] = useState<{ paymentId: string; signature: string } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(Boolean(eventSlug));
  const [openAccordion, setOpenAccordion] = useState<string | null>('datetime');

  const prices = [['Student', '$245', '$320'], ['Academic', '$395', '$480'], ['Industry Delegate', '$520', '$640'], ['Virtual Attendee', '$145', '$190']];

  const { conferences, webinars } = useContext(APIContext);
  
  const fullEvent = useMemo(() => {
    if (!eventInfo) return null;
    const pool = eventInfo.eventType === 'webinar' ? webinars : conferences;
    return pool.find((e: any) => e.slug === eventInfo.eventSlug || e._id === eventInfo.eventId || e.eventId?.toLowerCase() === eventInfo.eventCustomId?.toLowerCase());
  }, [eventInfo, conferences, webinars]);

  const eventPrices = useMemo(() => {
    if (fullEvent?.fees && fullEvent.fees.length > 0) {
      return fullEvent.fees.map((f: any) => [f.label, `₹${f.amount}`, `₹${Math.round(f.amount * 1.2)}`]);
    }
    return [['Student', '₹20000', '₹26000'], ['Academic', '₹32000', '₹39000'], ['Industry Delegate', '₹42000', '₹52000'], ['Virtual Attendee', '₹12000', '₹15000']];
  }, [fullEvent]);

  useEffect(() => {
    setName(`${firstName} ${lastName}`.trim());
  }, [firstName, lastName]);

  useEffect(() => {
    setPhone(`${countryCode} ${phoneNum}`.trim());
  }, [countryCode, phoneNum]);

  useEffect(() => {
    let active = true;
    if (eventSlug) {
      fetch(`${API_BASE}/registrations/link/${encodeURIComponent(eventSlug)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { if (active) { setEventInfo(data); setEventLoading(false); } })
        .catch(() => { if (active) setEventLoading(false); });
    }
    return () => { active = false; };
  }, [eventSlug]);

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, signature })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        navigate(`/thank-you?type=registration&eventTitle=${encodeURIComponent(eventInfo?.eventTitle || '')}`);
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
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
        name: 'Stream Conferences',
        description: `${category} Registration`,
        order_id: order.id,
        modal: { ondismiss: () => setPaying(false) },
        handler: (response: any) => {
          verifyPayment(order.id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#0e7490' }
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

  const handleNextStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(2);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent) {
      setError('You must agree to the declaration before continuing.');
      return;
    }
    setError('');
    try {
      const regRes = await fetch(`${API_BASE}/registrations/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          institution,
          country,
          category,
          presentingAbstract,
          eventId: eventInfo?.eventId,
          eventType: eventInfo?.eventType,
          eventSlug: eventInfo?.eventSlug || eventSlug
        })
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.error || 'Registration failed');
      }
      const regData = await regRes.json();

      const orderRes = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          category,
          registrationId: regData._id,
          eventId: eventInfo?.eventId,
          eventType: eventInfo?.eventType || (eventInfo?.eventTitle ? 'conference' : undefined),
          eventTitle: eventInfo?.eventTitle,
          eventSlug: eventInfo?.eventSlug || eventSlug
        })
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Payment order creation failed');
      }
      const orderData = await orderRes.json();

      setPaymentOrderId(orderData.order.id);
      setPaymentAmount(orderData.order.amount / 100);

      if (orderData.mock) {
        setMockPayment(orderData.mock);
        setPendingOrder(null);
      } else {
        setPendingOrder(orderData.order);
        setMockPayment(null);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
    }
  };

  const copyRegisterLink = () => {
    navigator.clipboard?.writeText(registerUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setName('');
    setEmail('');
    setPhoneNum('');
    setPhone('');
    setInstitution('');
    setCountry('');
    setCategory('');
    setPresentingAbstract('No');
    setPaymentOrderId('');
    setPendingOrder(null);
    setMockPayment(null);
    setPaymentAmount(0);
    setPaying(false);
    setError('');
    setSent(false);
  };

  const paymentPending = paymentOrderId && !sent;

  return (
    <Layout>
      {/* Title Header */}
      <div className="py-12 bg-[hsl(var(--muted)/.15)] border-b border-[hsl(var(--border))]">
        <div className="container-wide max-w-6xl text-center md:flex md:flex-col md:items-center md:gap-4">
          <div className="flex flex-col items-center">
            <span className="label text-[10px] uppercase tracking-wider text-[hsl(var(--secondary))]">
              Event Registration Gateway
            </span>
            <h1 className="display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-[hsl(var(--foreground))] text-center">
              {eventInfo ? eventInfo.eventTitle : "Register for Stream Conferences"}
            </h1>
          </div>
          {eventInfo && (
            <div className="flex gap-2 justify-center shrink-0">
              <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))] align-middle inline-flex items-center">
                {eventInfo.eventType}
              </span>
            </div>
          )}
        </div>
      </div>

      {eventLoading && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Loading event details…
        </div>
      )}

      {/* Main Registration Layout */}
      {eventInfo ? (
        <main className="bg-[hsl(var(--muted)/.15)] py-12">
          <div className="container-wide max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
              {/* Left Column: Form or Success / Payment panel */}
              <div className="space-y-6">
                {sent ? (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
                    <SuccessState 
                      title="Registration & payment complete" 
                      body="Your registration and payment have been successfully recorded. A confirmation email with receipt and event details has been sent to the email provided." 
                      reset={handleReset} 
                      testId="status-register-success" 
                    />
                  </div>
                ) : paymentPending ? (
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6" data-testid="panel-register-payment">
                    <div>
                      <p className="label text-[hsl(var(--accent))]">Step 2 · Payment</p>
                      <h3 className="display mt-2 text-2xl font-bold">Complete your registration</h3>
                      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
                        Registration recorded for <strong>{name}</strong> as <strong>{category}</strong> for <strong>{eventInfo.eventTitle}</strong>.
                      </p>
                    </div>

                    <div className="rounded-xl bg-[hsl(var(--muted)/.4)] p-4 border border-[hsl(var(--border))] flex justify-between items-center">
                      <span className="text-sm font-medium">Amount due</span>
                      <span className="mono text-xl font-bold text-[hsl(var(--secondary))]">₹{paymentAmount.toFixed(2)}</span>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <button 
                      type="button" 
                      onClick={handlePayNow} 
                      disabled={paying} 
                      className="w-full btn-main btn-primary py-3" 
                      data-testid="button-complete-payment"
                    >
                      {paying ? 'Processing payment...' : `Pay Now · ₹${paymentAmount.toFixed(2)}`} <ArrowUpRight size={16} />
                    </button>
                    
                    <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                      You will be redirected to the secure Razorpay checkout to complete payment. All major cards, UPI and net banking accepted.
                    </p>
                  </div>
                ) : step === 1 ? (
                  <form onSubmit={handleNextStep} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
                    <div>
                      <p className="label text-[hsl(var(--accent))]">Step 1 of 2</p>
                      <div className="rounded-xl bg-[hsl(var(--accent)/.08)] px-4 py-3 text-sm text-[hsl(var(--accent))] font-medium flex items-center justify-between mt-2">
                        <span>Delegate Personal Information</span>
                        <span>⚡ Quick Form</span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">First Name *</label>
                        <input 
                          required 
                          className="form-field w-full" 
                          placeholder="First name" 
                          aria-label="First name" 
                          data-testid="input-register-firstname" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Last Name *</label>
                        <input 
                          required 
                          className="form-field w-full" 
                          placeholder="Last name" 
                          aria-label="Last name" 
                          data-testid="input-register-lastname" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Email Address *</label>
                        <input 
                          required 
                          type="email" 
                          className="form-field w-full" 
                          placeholder="Email address" 
                          aria-label="Email address" 
                          data-testid="input-register-email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Phone Number *</label>
                        <div className="flex gap-2">
                          <select 
                            className="form-field shrink-0" 
                            style={{ width: '96px', minWidth: '96px' }}
                            value={countryCode} 
                            onChange={(e) => setCountryCode(e.target.value)}
                            aria-label="Country Code"
                          >
                            <option>+91</option>
                            <option>+1</option>
                            <option>+44</option>
                            <option>+33</option>
                            <option>+65</option>
                            <option>+61</option>
                          </select>
                          <input 
                            required 
                            type="tel" 
                            className="form-field" 
                            style={{ flex: 1, minWidth: 0, width: '100%' }}
                            placeholder="Mobile number" 
                            aria-label="Phone number" 
                            data-testid="input-register-phone" 
                            value={phoneNum} 
                            onChange={(e) => setPhoneNum(e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
                        <input 
                          required 
                          className="form-field w-full" 
                          placeholder="Institution or company" 
                          aria-label="Institution" 
                          data-testid="input-register-institution" 
                          value={institution} 
                          onChange={(e) => setInstitution(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Country *</label>
                        <input 
                          required 
                          className="form-field w-full" 
                          placeholder="Country of residence" 
                          aria-label="Country" 
                          data-testid="input-register-country" 
                          value={country} 
                          onChange={(e) => setCountry(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Presenting Abstract? *</label>
                        <select 
                          className="form-field w-full" 
                          value={presentingAbstract} 
                          onChange={(e) => setPresentingAbstract(e.target.value)} 
                          aria-label="Presenting abstract" 
                          data-testid="select-presenting-abstract"
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer select-none">
                        <input type="checkbox" className="mt-0.5 rounded border-[hsl(var(--border))] text-[hsl(var(--secondary))] focus:ring-[hsl(var(--secondary))]" />
                        <span>Billing to Company / Organization</span>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs text-[hsl(var(--muted-foreground))] cursor-pointer select-none">
                        <input type="checkbox" className="mt-0.5 rounded border-[hsl(var(--border))] text-[hsl(var(--secondary))] focus:ring-[hsl(var(--secondary))]" defaultChecked />
                        <span>I would like to receive updates on products, services, news and surveys.</span>
                      </label>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      className="w-full btn-main btn-primary py-3 mt-4" 
                      data-testid="button-next-step"
                    >
                      Continue <ArrowRight className="ml-1 inline" size={16} />
                    </button>
                    
                    <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                      Your data is protected. By continuing, you agree to our Terms & Conditions.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
                    <div>
                      <p className="label text-[hsl(var(--accent))]">Step 2 of 2</p>
                      <h3 className="display mt-2 text-2xl font-bold">Confirm your Registration Details</h3>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Type of fee *</label>
                      <div className="grid gap-3">
                        {eventPrices.map(([catName, _, price]: string[]) => (
                          <label key={catName} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] cursor-pointer hover:border-[hsl(var(--accent))] transition-colors">
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name="feeCategory" 
                                value={catName} 
                                checked={category === catName} 
                                onChange={() => setCategory(catName)} 
                                required 
                                className="h-4 w-4 text-[hsl(var(--accent))] focus:ring-[hsl(var(--accent))]"
                              />
                              <span className="text-sm font-medium">{catName}</span>
                            </div>
                            <span className="text-sm font-bold">{price}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Declaration</label>
                      <label className="flex items-start gap-3 cursor-pointer p-4 bg-[hsl(var(--muted)/.3)] rounded-xl border border-[hsl(var(--border))]">
                        <input 
                          type="checkbox" 
                          checked={consent}
                          onChange={(e) => {
                            setConsent(e.target.checked);
                            if (e.target.checked) setError('');
                          }}
                          className="mt-1 h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--secondary))] focus:ring-[hsl(var(--secondary))]" 
                        />
                        <span className="text-xs leading-5 text-[hsl(var(--foreground))]">
                          I have read and agree to the <a href="#" className="text-[hsl(var(--accent))] hover:underline">Health Declaration</a>, <a href="#" className="text-[hsl(var(--accent))] hover:underline">Program Participant Agreement</a> and <a href="#" className="text-[hsl(var(--accent))] hover:underline">Privacy Policy</a>.*
                        </span>
                      </label>
                    </div>

                    {error && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                        {error}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button" 
                        onClick={() => { setStep(1); setError(''); }}
                        className="btn-main border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] w-1/3 justify-center py-3"
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        disabled={paying}
                        className="btn-main btn-primary flex-1 justify-center py-3" 
                        data-testid="button-submit-registration"
                      >
                        {paying ? 'Processing...' : 'Proceed to payment'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Column: Sticky Event Details & Accordion */}
              <div className="space-y-6 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
                  {/* Header */}
                  <div>
                    <span className={`inline-block mb-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      eventInfo.eventType === 'webinar' 
                        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' 
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    }`}>
                      {eventInfo.eventType}
                    </span>
                    <h2 className="display text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                      {eventInfo.eventTitle}
                    </h2>
                  </div>

                  {/* Simple list info */}
                  {fullEvent && (() => {
                    const { start, end } = getStartAndEndDates(fullEvent.eventDate, fullEvent.day);
                    const startFormatted = start ? start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                    const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                    return (
                      <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                        <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                          <CalendarDays className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={16} />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Date</p>
                            <p className="text-xs mt-0.5">{startFormatted} {endFormatted ? `– ${endFormatted}` : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                          <MapPin className="mt-0.5 text-[hsl(var(--accent))] shrink-0" size={16} />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Location</p>
                            <p className="text-xs mt-0.5">{fullEvent.location || 'Online / Virtual'}</p>
                          </div>
                        </div>

                        {fullEvent.speaker && (
                          <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                            <Users className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={16} />
                            <div>
                              <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Speaker / Faculty</p>
                              <p className="text-xs mt-0.5">{fullEvent.speaker}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Accordion List */}
                  {fullEvent && (
                    <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
                      {/* Accordion Item: Date & Time */}
                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'datetime' ? null : 'datetime')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Date & Time details</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'datetime' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'datetime' && (() => {
                          const { start, end } = getStartAndEndDates(fullEvent.eventDate, fullEvent.day);
                          const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          return (
                            <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                              <p><span className="font-medium text-[hsl(var(--foreground))]">Start Date:</span> {startFormatted}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">End Date:</span> {endFormatted || startFormatted}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">Start Time:</span> {fullEvent.startTime || '—'}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">End Time:</span> {fullEvent.endTime || '—'}</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Accordion Item: Organizer */}
                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'organizer' ? null : 'organizer')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Organizer Contact</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'organizer' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'organizer' && (
                          <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Name:</span> {fullEvent.organizerContact?.name || 'Scientific Coordination Desk'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Email:</span> {fullEvent.organizerContact?.email || 'secretariat@streamconferences.com'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Phone:</span> {fullEvent.organizerContact?.phone || '+1 (617) 555-0199'}</p>
                          </div>
                        )}
                      </div>

                      {/* Accordion Item: Course Fees */}
                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'fees' ? null : 'fees')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Fee details & plans</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'fees' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'fees' && (
                          <div className="mt-2 pl-1 space-y-2 text-xs text-[hsl(var(--muted-foreground))]">
                            {eventPrices.map(([catLabel, earlyPrice, regularPrice]: string[]) => (
                              <div key={catLabel} className="flex justify-between items-center border-b border-[hsl(var(--border))]/30 pb-1.5 last:border-0 last:pb-0">
                                <div>
                                  <span className="font-medium text-[hsl(var(--foreground))]">{catLabel}</span>
                                  <span className="block text-[10px] text-[hsl(var(--muted-foreground))]">Early bird</span>
                                </div>
                                <div className="text-right">
                                  <span className="mono font-bold text-[hsl(var(--secondary))]">{earlyPrice}</span>
                                  <span className="block text-[10px] mono line-through opacity-60">{regularPrice}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Accordion Item: Venue / Contact */}
                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'venue' ? null : 'venue')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Venue & Timezone</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'venue' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'venue' && (
                          <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Venue:</span> {fullEvent.location || 'Online'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Timezone:</span> local timezone as scheduled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Copy link button */}
                  <button 
                    type="button" 
                    onClick={copyRegisterLink} 
                    className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.02)] transition-all"
                  >
                    {copied ? 'Copied ✓' : 'Copy Registration Link'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main>
          {/* General non-event fallback registration layout */}
          <section className="section-pad">
            <div className="container-wide">
              <SectionTitle eyebrow="Registration categories" title="A clear route in." />
              <div className="mt-10 overflow-x-auto rounded-2xl border border-[hsl(var(--border))]">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                    <tr>
                      <th className="p-5 font-semibold">Category</th>
                      <th className="p-5 font-semibold">Early-bird Rate</th>
                      <th className="p-5 font-semibold">Regular Rate</th>
                      <th className="p-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(([category, early, regular]) => (
                      <tr key={category} className="border-t border-[hsl(var(--border))]">
                        <td className="p-5 font-bold">{category}</td>
                        <td className="p-5 mono text-[hsl(var(--secondary))]">{early}</td>
                        <td className="p-5 mono">{regular}</td>
                        <td className="p-5 text-right">
                          <button 
                            type="button" 
                            onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })} 
                            className="font-bold text-[hsl(var(--secondary))]" 
                            data-testid={`button-register-${category.toLowerCase().replaceAll(' ', '-')}`}
                          >
                            Choose <ArrowRight className="ml-1 inline" size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {['Conference kit', 'Proceedings access', 'Networking meals', 'Certificate of attendance'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                    <Check size={17} className="text-[hsl(var(--secondary))]" />
                    {item}
                    <span className="text-xs text-[hsl(var(--muted-foreground))]"> · Included</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" id="registration-form">
            <div className="container-wide grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <SectionTitle light eyebrow="Registration desk" title="Tell us how you will join." body="Select your registration type and fill in delegate information. Upon submission, you will be redirected to our secure payment gateway." />
              {sent ? (
                <SuccessState title="Registration & payment complete" body="Your registration and payment have been successfully recorded. A confirmation email with receipt and event details has been sent to the email provided." reset={handleReset} testId="status-register-success" />
              ) : paymentPending ? (
                <div className="grid gap-4 rounded-2xl border border-[hsl(var(--primary-foreground)/.17)] bg-[hsl(var(--primary-foreground)/.06)] p-6" data-testid="panel-register-payment">
                  <p className="label text-[hsl(var(--accent))]">Step 2 · Payment</p>
                  <h3 className="display mt-2 text-2xl font-bold">Complete your registration</h3>
                  <p className="mt-3 text-sm text-[hsl(var(--primary-foreground)/.7)]">
                    Registration recorded for <strong>{name}</strong> as <strong>{category}</strong>. Amount due: <strong>₹{paymentAmount.toFixed(2)}</strong>
                  </p>
                  {error && <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">{error}</div>}
                  <button type="button" onClick={handlePayNow} disabled={paying} className="btn-main btn-primary mt-5" data-testid="button-complete-payment">
                    {paying ? 'Processing payment...' : `Pay Now · ₹${paymentAmount.toFixed(2)}`} <ArrowUpRight size={16} />
                  </button>
                  <p className="text-xs text-[hsl(var(--primary-foreground)/.5)]">You will be redirected to the secure Razorpay checkout to complete payment. All major cards, UPI and net banking accepted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[hsl(var(--primary-foreground)/.17)] bg-[hsl(var(--primary-foreground)/.06)] p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input required className="form-field" placeholder="Full name" aria-label="Full name" data-testid="input-register-name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-register-email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input className="form-field" placeholder="Phone number" aria-label="Phone number" data-testid="input-register-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <input required className="form-field" placeholder="Institution / organization" aria-label="Institution" data-testid="input-register-institution" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                  </div>
                  <input required className="form-field" placeholder="Country" aria-label="Country" data-testid="input-register-country" value={country} onChange={(e) => setCountry(e.target.value)} />
                  <select required className="form-field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Registration category" data-testid="select-registration-category">
                    <option value="" disabled>Registration category</option>
                    {prices.map(([category]) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <select className="form-field" value={presentingAbstract} onChange={(e) => setPresentingAbstract(e.target.value)} aria-label="Presenting abstract" data-testid="select-presenting-abstract">
                    <option value="No">Presenting abstract? No</option>
                    <option value="Yes">Presenting abstract? Yes</option>
                  </select>
                  {error && <div className="rounded-lg border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">{error}</div>}
                  <button type="submit" className="btn-main btn-primary mt-2" data-testid="button-submit-registration">Continue to payment <ArrowUpRight size={16} /></button>
                  <p className="text-xs text-[hsl(var(--primary-foreground)/.5)]">Payment details are processed securely. All major credit cards accepted.</p>
                </form>
              )}
            </div>
          </section>
        </main>
      )}
    </Layout>
  );
}


function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => faqs.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80" eyebrow="Delegate desk" title="The questions worth answering early." body="Find practical guidance on eligibility, submission, review, presentation formats, registration, and joining from abroad." /><main className="section-pad"><div className="container-wide max-w-4xl"><div className="relative mb-10"><Search className="absolute left-4 top-3.5 text-[hsl(var(--muted-foreground))]" size={18} /><input className="form-field pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the delegate desk" aria-label="Search FAQs" data-testid="input-faq-search" /></div><div className="grid gap-3">{filtered.map(([question, answer], index) => { const actualIndex = faqs.findIndex(([item]) => item === question); const isOpen = open === actualIndex; return <div key={question} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><button type="button" onClick={() => setOpen(isOpen ? null : actualIndex)} className="flex w-full items-center justify-between gap-5 p-5 text-left font-bold" aria-expanded={isOpen} data-testid={`button-faq-${actualIndex}`}><span>{question}</span><ChevronDown size={18} className={`shrink-0 text-[hsl(var(--secondary))] transition-transform ${isOpen ? 'rotate-180' : ''}`} /></button>{isOpen && <div className="border-t border-[hsl(var(--border))] px-5 pb-5 pt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]" data-testid={`text-faq-answer-${actualIndex}`}>{answer}</div>}</div>; })}</div>{filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><CircleHelp className="mx-auto text-[hsl(var(--secondary))]" /><p className="mt-4 font-bold">No matching questions</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try a shorter search, or email the scientific coordination team.</p></div>}<div className="mt-16 rounded-2xl bg-[hsl(var(--muted))] p-7"><p className="label text-[hsl(var(--secondary))]">Need further assistance?</p><p className="mt-3 max-w-2xl text-sm leading-7">For questions regarding abstract guidelines or technical issues, contact <a href="mailto:abstracts@streamconferences.com" className="font-bold text-[hsl(var(--secondary))]" data-testid="link-faq-email">abstracts@streamconferences.com</a>.</p><Link href="/contact" className="btn-main btn-quiet mt-6" data-testid="link-faq-contact">Contact us <ArrowUpRight size={16} /></Link></div></div></main></Layout>;
}

function GuidelinesPage() {
  const sections = [['Presentation day checklist', ['Arrive 30 minutes before your session.', 'Check in at the speaker desk and confirm your file.', 'Keep a backup copy on a USB drive and in cloud storage.', 'Stay for questions and support the presenters after you.']], ['Poster presentation specifications', ['A0 or A1 portrait orientation.', 'Export at print-ready resolution with accessible type sizes.', 'Include title, authors, affiliations, methods, results, and contact.', 'Mounting boards and pins are provided by the secretariat at the venue.']], ['AV & room support', ['HDMI presentation connection and confidence monitor.', 'Session chair, handheld microphone, and venue Wi-Fi.', 'Technical rehearsal windows published in the final program.', 'Tell the speaker desk about accessibility requirements early.']], ['Code of conduct', ['Be generous with questions and precise with critique.', 'Respect consent, privacy, and intellectual property.', 'No harassment, discrimination, or commercial promotion.', 'Raise concerns with the organizing committee promptly.']]];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" eyebrow="Practical notes" title="Arrive ready to contribute." body="A short field guide for presenters and delegates to optimize their conference experience and presentation sessions." /><main className="section-pad"><div className="container-wide grid gap-4 md:grid-cols-2">{sections.map(([title, items], i) => <div key={String(title)} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7" data-testid={`card-guideline-${i}`}><span className="label text-[hsl(var(--accent))]">0{i + 1}</span><h2 className="display mt-7 text-2xl font-bold">{title}</h2><ul className="mt-6 grid gap-3">{(items as string[]).map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check size={16} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" />{item}</li>)}</ul></div>)}</div></main></Layout>;
}

function TermsPage() {
  const sections = [['Registration & payment terms', 'Registration rates, inclusions, taxes, and payment processing details are finalized in the official prospectus. A registration is confirmed only after successful payment and written confirmation.'], ['Cancellation & refund policy', 'Cancellation requests must be made in writing. Full refunds (less standard administration fees) are available up to 30 days prior to the conference. Transfers to alternate delegates are permitted.'], ['Abstract & publication rights', 'Authors retain ownership of their work while granting the conference a non-exclusive right to display accepted material in conference materials and official digital proceedings. DOI and ISBN assignment are subject to editorial review.'], ['Code of conduct', 'All delegates are expected to participate with respect, integrity, and professional care. Harassment, discrimination, intimidation, and unauthorized commercial promotion are not permitted.'], ['Liability', 'Attendees participate at their own risk. The organizers are not responsible for loss, travel disruption, or personal injury beyond the protections required by applicable law.'], ['Force majeure', 'If circumstances beyond reasonable control affect the event, the organizers may reschedule, change format, or cancel the event. Final remedies and notices will be defined in the reviewed policy.']];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80" eyebrow="The fine print" title="Terms & conditions." body="Official terms of attendance, cancellation policies, intellectual property rights, and code of conduct standards for all delegates." /><main className="section-pad"><div className="container-wide max-w-4xl"><div className="mb-10 rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)] p-5 text-sm leading-6"><ShieldCheck className="mr-2 inline text-[hsl(var(--secondary))]" size={18} /> Official delegate terms for the 2027 International Conference on Medical, Life & Health Sciences.</div><div className="grid gap-8">{sections.map(([title, text], i) => <section key={title} className="border-b border-[hsl(var(--border))] pb-8"><p className="label text-[hsl(var(--secondary))]">0{i + 1}</p><h2 className="display mt-3 text-2xl font-bold">{title}</h2><p className="mt-4 text-sm leading-8 text-[hsl(var(--muted-foreground))]">{text}</p></section>)}</div></div></main></Layout>;
}

function ContactPage() {
  const [location] = useLocation();
  const eventSlug = new URLSearchParams(window.location.search).get('event') || '';
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(eventSlug ? 'Event Enquiry' : 'General');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/contacts/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, conference: conferenceName, message, eventSlug: eventSlug || undefined })
      });
      if (res.ok) {
        setSent(true);
      } else {
        const err = await res.json();
        console.error('Contact submission failed:', err.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Contact submission failed:', err);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('General');
    setMessage('');
    setSent(false);
  };

  const departments = [['General & Delegate Inquiries', 'info@streamconferences.com', 'Upcoming events, registration, and general information.'], ['Abstract Submissions & Speaker Desk', 'abstracts@streamconferences.com', 'Abstract guidelines, status, formats, and reviews.'], ['Publishing & Research Indexing', 'publishing@streamconferences.com', 'Proceedings, DOI assignments, and journal partnerships.'], ['Sponsorships & Strategic Partnerships', 'partners@streamconferences.com', 'Sponsorship and exhibit opportunities.']];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80" eyebrow="The secretariat" title="Get in touch with Stream Conferences." body="Whether you are presenting groundbreaking research, planning attendance, exploring publishing, or discussing sponsorship, our team is here to assist. We aim to respond within 24–48 business hours." /><main><section className="section-pad"><div className="container-wide"><div className="grid gap-4 md:grid-cols-2">{departments.map(([title, email, body], i) => <div key={email} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6" data-testid={`card-contact-${i}`}><Mail className="text-[hsl(var(--secondary))]" size={21} /><h2 className="display mt-6 text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p><a href={`mailto:${email}`} className="mt-5 inline-block text-sm font-bold text-[hsl(var(--secondary))]" data-testid={`link-contact-email-${i}`}>{email}</a></div>)}</div></div></section><section className="section-pad bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><SectionTitle eyebrow="Global headquarters" title="A team with a reachable desk." body="Stream Conferences Secretariat · 100 Federal Street, Boston, MA 02110, USA" /><div className="mt-7 grid gap-3 text-sm"><p className="flex items-center gap-3"><Phone size={17} className="text-[hsl(var(--secondary))]" /> +1 (617) 555-0199</p><p className="flex items-center gap-3"><Clock3 size={17} className="text-[hsl(var(--secondary))]" /> Monday–Friday · 9:00 AM–6:00 PM EST</p></div></div>{sent ? <SuccessState title="Message sent" body="Thank you. Our coordination team has received your message and will respond within 24–48 business hours." reset={handleReset} testId="status-contact-success" /> : <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="grid gap-4 sm:grid-cols-2"><input required className="form-field" placeholder="Full name" aria-label="Full name" data-testid="input-contact-name" value={name} onChange={(e) => setName(e.target.value)} /><input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-contact-email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><input className="form-field" placeholder="Phone number" aria-label="Phone number" data-testid="input-contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /><select className="form-field" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Inquiry type" data-testid="select-contact-inquiry"><option>General</option><option>Abstract Submission</option><option>Publishing</option><option>Sponsorship</option></select><input className="form-field" defaultValue={conferenceName} aria-label="Conference name" data-testid="input-contact-conference" /><textarea required className="form-field min-h-32" placeholder="How can we help?" aria-label="Message" data-testid="input-contact-message" value={message} onChange={(e) => setMessage(e.target.value)} /><button type="submit" className="btn-main btn-primary" data-testid="button-submit-contact">Send us a message <Send size={16} /></button></form>}</div></section></main></Layout>;
}

function EventDetailsPage({ type }: { type: 'conference' | 'webinar' }) {
  const { slug = '' } = useParams<{ slug: string }>();
  const { conferences, webinars } = useContext(APIContext);
  const pool = type === 'conference' ? conferences : webinars;
  const item = pool.find((e: any) => e.slug === slug || e._id === slug || e.eventId?.toLowerCase() === slug.toLowerCase());
  const [copied, setCopied] = useState(false);

  if (!item) {
    return (
      <Layout>
        <main className="section-pad">
          <div className="container-wide">
            <SectionTitle eyebrow="Not found" title="This event could not be found." body="It may have been removed or the link is incorrect." />
            <Link href="/" className="btn-main btn-quiet mt-6">← Back home</Link>
          </div>
        </main>
      </Layout>
    );
  }

  const banner = mediaUrl(item.bannerUrl || '');
  const logo = mediaUrl(item.logoUrl || '');
  const brochure = mediaUrl(item.brochureUrl || '');
  const registerHref = `/register?event=${encodeURIComponent(item.eventId || item.slug || item._id)}`;
  const fees: { label: string; amount: number }[] = Array.isArray(item.fees) ? item.fees : [];

  return (
    <Layout>
      {/* Banner */}
      <div className="relative overflow-hidden min-h-[320px] bg-black">
        <img 
          src={banner || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"} 
          alt={item.title} 
          className="absolute inset-0 h-full w-full object-cover opacity-45" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
        <div className="relative container-wide py-16 md:py-24">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-block rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">{type}</span>
            <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${item.date === 'upcoming' ? 'bg-green-500/90 text-white' : 'bg-black/50 text-white'}`}>{item.date}</span>
          </div>
          {logo && <img src={logo} alt={`${item.title} logo`} className="mb-4 h-16 w-auto object-contain" />}
          <h1 className="display text-3xl md:text-5xl font-bold tracking-[-.04em] text-white max-w-3xl">{item.title}</h1>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/85">
            {item.eventDate && (() => {
              const { start, end } = getStartAndEndDates(item.eventDate, item.day);
              const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
              const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
              return (
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />{startFormatted}{endFormatted ? ` – ${endFormatted}` : ''}</span>
              );
            })()}
            {item.startTime || item.endTime ? <span className="inline-flex items-center gap-1.5"><Clock3 size={15} />{item.startTime || '—'} – {item.endTime || '—'}</span> : null}
            <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{item.location}</span>
            {item.speaker ? <span className="inline-flex items-center gap-1.5"><Users size={15} />Speaker: {item.speaker}</span> : null}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link target="_blank" rel="noopener noreferrer" href={registerHref} className="btn-main btn-primary" aria-label={`Register for ${item.title}`}>Register Now <ArrowUpRight size={16} /></Link>
            <Link href={`/contact?event=${encodeURIComponent(item.slug || item._id)}`} className="btn-main btn-primary">Enquire <ArrowUpRight size={16} /></Link>
            {brochure && <a href={brochure} target="_blank" rel="noreferrer" className="btn-main btn-primary"><Download size={15} /> Brochure</a>}
            <button
              type="button"
              onClick={() => { navigator.clipboard?.writeText(window.location.origin + registerHref); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="btn-main btn-primary"
              data-testid="button-copy-event-link"
            >
              {copied ? 'Copied ✓' : 'Copy registration link'}
            </button>
          </div>
        </div>
      </div>

      <main className="section-pad">
        <div className="container-wide grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-12">
            {item.description && (
              <div>
                <SectionTitle eyebrow="About" title="The session." />
                <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
            
            <div>
              <SectionTitle eyebrow="Registration" title="Participation Fees." />
              <div className="mt-6 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[hsl(var(--muted)/.5)] text-[hsl(var(--muted-foreground))]">
                    <tr>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px]">Category</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-[11px] text-right">Fee Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {fees.length ? fees.map((f, i) => (
                      <tr key={i} className="hover:bg-[hsl(var(--muted)/.2)]">
                        <td className="px-6 py-4 font-bold">{f.label}</td>
                        <td className="px-6 py-4 text-right font-bold text-[hsl(var(--secondary))]">₹{Number(f.amount).toLocaleString('en-IN')}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-center text-[hsl(var(--muted-foreground))]">Registration fees will be announced soon.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {(Array.isArray(item.tracks) && item.tracks.length > 0) && (
              <div>
                <SectionTitle eyebrow="Scientific tracks" title="Explore the tracks." body="Follow the thematic areas covered by this event." />
                <div className="mt-6 grid gap-4">
                  {item.tracks.map((track: any, i: number) => (
                    <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                      <div className="flex items-start gap-4">
                        {track.image && <img src={mediaUrl(track.image)} alt={track.title} className="h-16 w-16 rounded-xl object-cover shrink-0 border border-[hsl(var(--border))]" />}
                        <div className="flex-1">
                          <h3 className="display text-xl font-bold">{track.title}</h3>
                          {track.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{track.description}</p>}
                        </div>
                      </div>
                      {Array.isArray(track.referenceLinks) && track.referenceLinks.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-[hsl(var(--border))] pt-4">
                          {track.referenceLinks.map((link: any, li: number) => (
                            <a
                              key={li}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] transition-colors"
                            >
                              <ExternalLink size={12} /> {link.label || link.url}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Event Details Sidebar */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h3 className="display text-lg font-bold">Event Details</h3>
              <div className="mt-5 space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
                {item.eventDate && (() => {
                  const { start, end } = getStartAndEndDates(item.eventDate, item.day);
                  return (
                    <>
                      {start && (
                        <div className="flex items-start gap-3">
                          <CalendarDays size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))]">Start Date</p>
                            <p>{start.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      )}
                      {end && start && end.getTime() !== start.getTime() && (
                        <div className="flex items-start gap-3">
                          <CalendarDays size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))]">End Date</p>
                            <p>{end.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                {item.startTime && (
                  <div className="flex items-start gap-3">
                    <Clock3 size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">Start Time</p>
                      <p>{item.startTime}</p>
                    </div>
                  </div>
                )}
                {item.endTime && (
                  <div className="flex items-start gap-3">
                    <Clock3 size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">End Time</p>
                      <p>{item.endTime}</p>
                    </div>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">Venue</p>
                      <p>{item.location}</p>
                    </div>
                  </div>
                )}
              </div>
              <Link target="_blank" rel="noopener noreferrer" href={registerHref} className="btn-main btn-primary mt-6 w-full justify-center">Register Now <ArrowUpRight size={16} /></Link>
            </div>

            {/* Organizer contact */}
            {(item.organizerContact?.name || item.organizerContact?.email) && (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                <h3 className="display text-lg font-bold">Organizer Contact</h3>
                <div className="mt-4 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {item.organizerContact?.name && <p className="font-semibold text-[hsl(var(--foreground))]">{item.organizerContact.name}</p>}
                  {item.organizerContact?.email && <p className="inline-flex items-center gap-2"><Mail size={14} />{item.organizerContact.email}</p>}
                  {item.organizerContact?.phone && <p className="inline-flex items-center gap-2"><Phone size={14} />{item.organizerContact.phone}</p>}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h3 className="display text-lg font-bold">Next Steps</h3>
              <ul className="mt-4 space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />Register to secure your place</li>
                <li className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />Reach out for any questions</li>
              </ul>
              <Link href={`/register?event=${encodeURIComponent(item.slug || item._id)}`} className="btn-main btn-primary mt-5 w-full justify-center">Register Now <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function BlogPage() {
  const { insightsList } = useContext(APIContext);

  return (
    <Layout>
      <PageHero 
        bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80" 
        eyebrow="The editorial desk" 
        title="Notes for the curious." 
        body="Field notes, proceedings, and useful context from the conversations we host." 
      />
      <main className="section-pad">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {insightsList.length > 0 ? insightsList.map((insight, index) => (
              <div key={insight.id || insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full">
                <div className="p-5 flex-1">
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
                    <img src={insight.bannerUrl} alt={insight.title} className="h-full w-full object-cover" />
                  </div>
                  <span className="label text-[hsl(var(--accent))] text-[9px]">{insight.label}</span>
                  <h3 className="display mt-3 text-lg font-bold leading-tight">{insight.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{insight.copy}</p>
                </div>
                <div className="px-5 pb-5 pt-0">
                  <Link href={`/blog/${encodeURIComponent(insight.id)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition" data-testid={`link-blog-read-${index}`}>
                    Read field note <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]">
                <p>No blog posts have been published yet. Please check back later.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

function BlogDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { insightsList } = useContext(APIContext);
  const insight = insightsList.find((i: any) => String(i.id) === String(slug));

  if (!insight) {
    return (
      <Layout>
        <main className="section-pad">
          <div className="container-wide max-w-xl text-center">
            <SectionTitle eyebrow="Not found" title="This field note could not be found." />
            <Link href="/blog" className="btn-main btn-quiet mt-8 group inline-flex items-center gap-2">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to blog
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const authorName = insight.announcedBy || 'Stream Conferences';
  const published = insight.createdAt ? new Date(insight.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const authorInitials = authorName.trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Layout>
      <main className="section-pad">
        <div className="container-wide max-w-3xl">
          {/* Back Button Container */}
          <div className="mb-6">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to blog
            </Link>
          </div>

          {/* Label / Category Pill */}
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--accent)/.12)] px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-[hsl(var(--accent))] border border-[hsl(var(--accent)/.25)]">
              {insight.label}
            </span>
          </div>

          {/* Title */}
          <h1 className="display text-balance text-3xl font-bold leading-tight tracking-[-.04em] md:text-5xl text-[hsl(var(--foreground))]">
            {insight.title}
          </h1>

          {/* Author & Meta Info Row */}
          <div className="mt-6 flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))] pb-6">
            <div className="h-8 w-8 rounded-full bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] flex items-center justify-center font-bold text-xs border border-[hsl(var(--secondary)/.2)]">
              {authorInitials || 'SC'}
            </div>
            <div>
              <span className="font-semibold text-[hsl(var(--foreground))]">{authorName}</span>
              {published && <span className="mx-2 text-[hsl(var(--muted-foreground)/.5)]">·</span>}
              {published && <span>{published}</span>}
            </div>
          </div>

          {/* Banner Image */}
          {insight.bannerUrl && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--border))] shadow-lg">
              <img src={insight.bannerUrl} alt={insight.title} className="h-full w-full object-cover max-h-[420px]" />
            </div>
          )}

          {/* Intro Copy */}
          {insight.copy && (
            <p className="mt-8 text-lg font-medium leading-relaxed text-[hsl(var(--foreground))] border-l-4 border-[hsl(var(--accent))] pl-4 italic bg-[hsl(var(--muted)/.15)] py-4 pr-4 rounded-r-xl">
              {insight.copy}
            </p>
          )}

          {/* Main Content */}
          <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none">
            {insight.content ? (
              <div className="whitespace-pre-wrap text-base leading-8 text-[hsl(var(--muted-foreground))]">{insight.content}</div>
            ) : (
              <p className="text-base leading-8 text-[hsl(var(--muted-foreground))]">No full content has been published for this note yet.</p>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}

function AbstractSubmissionPage() {
  const [location, navigate] = useLocation();
  const eventSlug = new URLSearchParams(window.location.search).get('event') || '';
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(Boolean(eventSlug));
  const [openAccordion, setOpenAccordion] = useState<string | null>('datetime');

  const { conferences, webinars } = useContext(APIContext);

  const fullEvent = useMemo(() => {
    if (!eventInfo) return null;
    const pool = eventInfo.eventType === 'webinar' ? webinars : conferences;
    return pool.find((e: any) => e.slug === eventInfo.eventSlug || e._id === eventInfo.eventId || e.eventId?.toLowerCase() === eventInfo.eventCustomId?.toLowerCase());
  }, [eventInfo, conferences, webinars]);

  useEffect(() => {
    let active = true;
    if (eventSlug) {
      fetch(`${API_BASE}/registrations/link/${encodeURIComponent(eventSlug)}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { if (active) { setEventInfo(data); setEventLoading(false); } })
        .catch(() => { if (active) setEventLoading(false); });
    }
    return () => { active = false; };
  }, [eventSlug]);

  const copyLink = () => {
    const url = `${window.location.origin}/submit-abstract?event=${encodeURIComponent(eventSlug)}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      fd.append('phone', `${countryCode} ${phoneNum}`.trim());
      fd.append('institution', institution);
      fd.append('country', country);
      fd.append('abstractFile', abstractFile);
      fd.append('eventSlug', eventSlug || '');
      if (eventInfo) {
        fd.append('eventId', eventInfo.eventId);
        fd.append('eventType', eventInfo.eventType);
      }
      const res = await fetch(`${API_BASE}/abstracts/submit`, {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Abstract submission failed');
      }
      navigate(`/thank-you?type=abstract&eventTitle=${encodeURIComponent(eventInfo?.eventTitle || '')}`);
    } catch (err: any) {
      console.error('Abstract submission failed:', err);
      setError(err.message || 'Abstract submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNum('');
    setInstitution('');
    setCountry('');
    setAbstractFile(null);
    setError('');
    setSubmitted(false);
  };

  return (
    <Layout>
      {/* Title Header */}
      <div className="py-12 bg-[hsl(var(--muted)/.15)] border-b border-[hsl(var(--border))]">
        <div className="container-wide max-w-6xl text-center md:flex md:flex-col md:items-center md:gap-4">
          <div className="flex flex-col items-center">
            <span className="label text-[10px] uppercase tracking-wider text-[hsl(var(--secondary))]">
              Event Registration Gateway
            </span>
            <h1 className="display text-3xl md:text-4xl font-extrabold tracking-tight mt-2 text-[hsl(var(--foreground))] text-center">
              {eventInfo ? eventInfo.eventTitle : "Submit Abstract for Stream Conferences"}
            </h1>
          </div>
          <div className="flex gap-2 justify-center shrink-0 flex-wrap">
            <span className="rounded-full bg-[hsl(var(--accent))] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))] align-middle inline-flex items-center">
              Submit Abstract
            </span>
            {eventInfo && (
              <span className="rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary-foreground))] align-middle inline-flex items-center">
                {eventInfo.eventType}
              </span>
            )}
          </div>
        </div>
      </div>

      {eventLoading && (
        <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] py-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Loading event details…
        </div>
      )}

      <main className="bg-[hsl(var(--muted)/.15)] py-12">
        <div className="container-wide max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] items-start">
            {/* Left Column: Form or Success panel */}
            <div className="space-y-6">
              {submitted ? (
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
                  <SuccessState 
                    title="Abstract received" 
                    body="Thank you. Your abstract PDF has been uploaded and a confirmation will be sent to the email provided." 
                    reset={handleReset} 
                    testId="status-abstract-success" 
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
                  <div>
                    <p className="label text-[hsl(var(--accent))]">Abstract Submission</p>
                    <div className="rounded-xl bg-[hsl(var(--accent)/.08)] px-4 py-3 text-sm text-[hsl(var(--accent))] font-medium flex items-center justify-between mt-2">
                      <span>Submitter Information</span>
                      <span>PDF Required</span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">First Name *</label>
                      <input 
                        required 
                        className="form-field w-full" 
                        placeholder="First name" 
                        aria-label="First name" 
                        data-testid="input-abstract-firstname" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Last Name *</label>
                      <input 
                        required 
                        className="form-field w-full" 
                        placeholder="Last name" 
                        aria-label="Last name" 
                        data-testid="input-abstract-lastname" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Email Address *</label>
                      <input 
                        required 
                        type="email" 
                        className="form-field w-full" 
                        placeholder="Email address" 
                        aria-label="Email address" 
                        data-testid="input-abstract-email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Phone Number *</label>
                      <div className="flex gap-2">
                        <select 
                          className="form-field shrink-0" 
                          style={{ width: '96px', minWidth: '96px' }}
                          value={countryCode} 
                          onChange={(e) => setCountryCode(e.target.value)}
                          aria-label="Country Code"
                        >
                          <option>+91</option>
                          <option>+1</option>
                          <option>+44</option>
                          <option>+33</option>
                          <option>+65</option>
                          <option>+61</option>
                        </select>
                        <input 
                          required 
                          type="tel" 
                          className="form-field" 
                          style={{ flex: 1, minWidth: 0, width: '100%' }}
                          placeholder="Mobile number" 
                          aria-label="Phone number" 
                          data-testid="input-abstract-phone" 
                          value={phoneNum} 
                          onChange={(e) => setPhoneNum(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
                      <input 
                        required 
                        className="form-field w-full" 
                        placeholder="Institution or company" 
                        aria-label="Institution" 
                        data-testid="input-abstract-institution" 
                        value={institution} 
                        onChange={(e) => setInstitution(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Country *</label>
                      <input 
                        required 
                        className="form-field w-full" 
                        placeholder="Country of residence" 
                        aria-label="Country" 
                        data-testid="input-abstract-country" 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Abstract (PDF) *</label>
                    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.25)] p-5">
                      <input 
                        required 
                        type="file" 
                        accept="application/pdf,.pdf" 
                        className="w-full text-sm text-[hsl(var(--muted-foreground))] file:mr-4 file:rounded-full file:border-0 file:bg-[hsl(var(--primary))] file:px-4 file:py-2 file:text-xs file:font-bold file:text-[hsl(var(--primary-foreground))] hover:file:opacity-90"
                        aria-label="Abstract PDF upload" 
                        data-testid="input-abstract-file" 
                        onChange={(e) => setAbstractFile(e.target.files?.[0] || null)} 
                      />
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                        {abstractFile ? `Selected: ${abstractFile.name}` : 'Upload your abstract document as a PDF (max 20 MB).'}
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full btn-main btn-primary py-3 mt-2" 
                    data-testid="button-submit-abstract"
                  >
                    {submitting ? 'Submitting...' : 'Submit Abstract'} <Send size={16} />
                  </button>

                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                    By submitting, you confirm the work is original and ethically compliant.
                  </p>
                </form>
              )}
            </div>

            {/* Right Column: Sticky Event Details & Accordion */}
            {eventInfo && (
              <div className="space-y-6 lg:sticky lg:top-6">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
                  <div>
                    <span className={`inline-block mb-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      eventInfo.eventType === 'webinar' 
                        ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' 
                        : 'bg-green-500/10 text-green-600 border border-green-500/20'
                    }`}>
                      {eventInfo.eventType}
                    </span>
                    <h2 className="display text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
                      {eventInfo.eventTitle}
                    </h2>
                  </div>

                  {fullEvent && (() => {
                    const { start, end } = getStartAndEndDates(fullEvent.eventDate, fullEvent.day);
                    const startFormatted = start ? start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                    const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
                    return (
                      <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
                        <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                          <CalendarDays className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={16} />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Date</p>
                            <p className="text-xs mt-0.5">{startFormatted} {endFormatted ? `– ${endFormatted}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                          <MapPin className="mt-0.5 text-[hsl(var(--accent))] shrink-0" size={16} />
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Location</p>
                            <p className="text-xs mt-0.5">{fullEvent.location || 'Online / Virtual'}</p>
                          </div>
                        </div>
                        {fullEvent.speaker && (
                          <div className="flex items-start gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                            <Users className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={16} />
                            <div>
                              <p className="font-semibold text-[hsl(var(--foreground))] text-xs">Speaker / Faculty</p>
                              <p className="text-xs mt-0.5">{fullEvent.speaker}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {fullEvent && (
                    <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'datetime' ? null : 'datetime')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Date & Time details</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'datetime' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'datetime' && (() => {
                          const { start, end } = getStartAndEndDates(fullEvent.eventDate, fullEvent.day);
                          const startFormatted = start ? start.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          const endFormatted = (end && start && end.getTime() !== start.getTime()) ? end.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
                          return (
                            <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                              <p><span className="font-medium text-[hsl(var(--foreground))]">Start Date:</span> {startFormatted}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">End Date:</span> {endFormatted || startFormatted}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">Start Time:</span> {fullEvent.startTime || '—'}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">End Time:</span> {fullEvent.endTime || '—'}</p>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'organizer' ? null : 'organizer')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Organizer Contact</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'organizer' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'organizer' && (
                          <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Name:</span> {fullEvent.organizerContact?.name || 'Scientific Coordination Desk'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Email:</span> {fullEvent.organizerContact?.email || 'secretariat@streamconferences.com'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Phone:</span> {fullEvent.organizerContact?.phone || '+1 (617) 555-0199'}</p>
                          </div>
                        )}
                      </div>

                      <div className="border-b border-[hsl(var(--border))]/60 pb-3">
                        <button
                          type="button"
                          onClick={() => setOpenAccordion(openAccordion === 'venue' ? null : 'venue')}
                          className="w-full flex items-center justify-between font-semibold text-xs text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors"
                        >
                          <span className="uppercase tracking-wider">Venue & Timezone</span>
                          <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'venue' ? 'rotate-180' : ''}`} />
                        </button>
                        {openAccordion === 'venue' && (
                          <div className="mt-2 pl-1 space-y-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Venue:</span> {fullEvent.location || 'Online'}</p>
                            <p><span className="font-medium text-[hsl(var(--foreground))]">Timezone:</span> local timezone as scheduled</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={copyLink} 
                    className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.02)] transition-all"
                  >
                    {copied ? 'Copied ✓' : 'Copy Submission Link'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}



function ConferencesPage() {
  return (
    <Layout>
      <PageHero 
        bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" 
        eyebrow="The conference calendar" 
        title="Meetings with a point of view." 
        body="Find your next place to present, listen, challenge, and leave with better work." 
      />
      <main className="section-pad">
        <div className="container-wide">
          <SectionTitle eyebrow="Conferences" title="Upcoming & past conferences." body="Browse the active schedules and historical details of our global gatherings." />
          <div className="mt-10">
            <EventList onlyType="Conference" />
          </div>
        </div>
      </main>
    </Layout>
  );
}

function WebinarsPage() {
  return (
    <Layout>
      <PageHero 
        bgImage="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80" 
        eyebrow="Live online exchange" 
        title="A focused room for the right questions." 
        body="Shorter, sharper sessions for researchers, practitioners, and peers across the world." 
      />
      <main className="section-pad">
        <div className="container-wide">
          <SectionTitle eyebrow="Webinars" title="Upcoming & archived webinars." body="Sharper briefings for researchers and professionals connecting across the globe." />
          <div className="mt-10">
            <EventList onlyType="Webinar" />
          </div>
        </div>
      </main>
    </Layout>
  );
}

function MediaPartnersPage() {
  const { mediaPartners } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80" eyebrow="The amplification network" title="Media partners." body="Organizations that carry our conversations further and keep our community informed." /><main className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Media partners" title="Voices that help the work travel." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{mediaPartners.length > 0 ? mediaPartners.map((partner) => <div key={partner._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{partner.logo ? <img src={mediaUrl(partner.logo)} alt={partner.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Building2 size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg font-bold">{partner.name}</h3>{partner.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{partner.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p>No media partners have been added yet.</p></div>}</div></div></main></Layout>;
}

function CollaboratorsPage() {
  const { collaborators } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" eyebrow="Working together" title="Collaborators." body="Institutions, partners, and research groups advancing the summit with us." /><main className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Collaborators" title="The network behind the room." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{collaborators.length > 0 ? collaborators.map((collaborator) => <div key={collaborator._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{collaborator.logo ? <img src={mediaUrl(collaborator.logo)} alt={collaborator.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Handshake size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg font-bold">{collaborator.name}</h3>{collaborator.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{collaborator.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p>No collaborators have been added yet.</p></div>}</div></div></main></Layout>;
}

function ExhibitorsPage() {
  const { exhibitors } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" eyebrow="On the floor" title="Exhibitors." body="Organizations showcasing the tools, services, and ideas shaping their fields." /><main className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Exhibitors" title="What's on show." /><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{exhibitors.length > 0 ? exhibitors.map((exhibitor) => <div key={exhibitor._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{exhibitor.logo ? <img src={mediaUrl(exhibitor.logo)} alt={exhibitor.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Store size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg font-bold">{exhibitor.name}</h3>{exhibitor.description && <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{exhibitor.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p>No exhibitors have been added yet.</p></div>}</div></div></main></Layout>;
}

function MentorDetailsPage() {
  const { username = '' } = useParams<{ username: string }>();
  const { people } = useContext(APIContext);
  const mentor = people.find((m) => m.username === username);
  const backHref = '/speakers';
  const backLabel = 'Back to speakers';

  if (!mentor) {
    return (
      <Layout>
        <main className="section-pad">
          <div className="container-wide max-w-xl text-center">
            <SectionTitle eyebrow="Not found" title="This profile could not be found." />
            <Link href={backHref} className="btn-main btn-quiet mt-8 group inline-flex items-center gap-2">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> {backLabel}
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="section-pad">
        <div className="container-wide">
          {/* Back Button Container */}
          <div className="mb-6">
            <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition-colors group">
              <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" /> {backLabel}
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 self-start shadow-md">
              <div className="flex flex-col items-center text-center">
                {mentor.avatar ? (
                  <img src={mediaUrl(mentor.avatar)} alt={mentor.fullName || mentor.username} className="h-28 w-28 rounded-full object-cover border border-[hsl(var(--border))] mb-5 shadow-inner" />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-5 border border-[hsl(var(--border))]">
                    <Users size={40} />
                  </div>
                )}
                <h1 className="display text-2xl font-bold text-[hsl(var(--foreground))]">{mentor.fullName || mentor.username}</h1>
                {mentor.title && <p className="mt-2 text-sm font-semibold text-[hsl(var(--secondary))]">{mentor.title}</p>}
              </div>

              <div className="mt-8 pt-6 border-t border-[hsl(var(--border))] space-y-4 text-sm text-[hsl(var(--muted-foreground))]">
                {mentor.email && (
                  <p className="flex items-center gap-3">
                    <Mail size={16} className="text-[hsl(var(--secondary))]" />
                    <span className="truncate">{mentor.email}</span>
                  </p>
                )}
                {mentor.location && (
                  <p className="flex items-center gap-3">
                    <MapPin size={16} className="text-[hsl(var(--secondary))]" />
                    <span>{mentor.location}</span>
                  </p>
                )}
                {mentor.linkedin && (
                  <a href={mentor.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[hsl(var(--secondary))] transition-colors group">
                    <Linkedin size={16} className="text-[hsl(var(--secondary))] transition-transform group-hover:scale-110" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {mentor.website && (
                  <a href={mentor.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-[hsl(var(--secondary))] transition-colors group">
                    <Globe2 size={16} className="text-[hsl(var(--secondary))] transition-transform group-hover:scale-110" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {Array.isArray(mentor.expertise) && mentor.expertise.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
                  <p className="label text-[hsl(var(--secondary))] mb-3">Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill: string, i: number) => (
                      <span key={i} className="rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-semibold border border-[hsl(var(--border))]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div className="space-y-10">
              {mentor.bio && (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 md:p-8 shadow-sm">
                  <SectionTitle eyebrow="About" title="Profile." />
                  <p className="mt-5 text-base leading-8 text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">{mentor.bio}</p>
                </div>
              )}

              {Array.isArray(mentor.education) && mentor.education.length > 0 && (
                <div>
                  <SectionTitle eyebrow="Education" title="Academic background." />
                  <div className="mt-6 grid gap-4">
                    {mentor.education.map((edu: any, i: number) => (
                      <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-bold text-lg text-[hsl(var(--foreground))]">{edu.degree || 'Degree'}</p>
                          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{edu.institution}</p>
                        </div>
                        {edu.year && (
                          <span className="rounded-full bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] px-3 py-1 text-xs font-bold self-start sm:self-auto border border-[hsl(var(--secondary)/.2)]">
                            {edu.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(mentor.experiences) && mentor.experiences.length > 0 && (
                <div>
                  <SectionTitle eyebrow="Experience" title="Professional journey." />
                  <div className="mt-6 grid gap-4">
                    {mentor.experiences.map((exp: any, i: number) => (
                      <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <p className="font-bold text-lg text-[hsl(var(--foreground))]">{exp.title || 'Role'}</p>
                            <p className="mt-1 text-sm font-semibold text-[hsl(var(--secondary))]">{exp.organization}</p>
                          </div>
                          {exp.duration && (
                            <span className="rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-3 py-1 text-xs font-bold self-start sm:self-auto border border-[hsl(var(--border))]">
                              {exp.duration}
                            </span>
                          )}
                        </div>
                        {exp.description && (
                          <p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border)/.5)] pt-4">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(mentor.certifications) && mentor.certifications.length > 0 && (
                <div>
                  <SectionTitle eyebrow="Certifications" title="Credentials." />
                  <div className="mt-6 grid gap-4">
                    {mentor.certifications.map((cert: any, i: number) => (
                      <div key={i} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div>
                          <p className="font-bold text-lg text-[hsl(var(--foreground))]">{cert.name || 'Certification'}</p>
                          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{cert.issuer}</p>
                        </div>
                        {cert.year && (
                          <span className="rounded-full bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))] px-3 py-1 text-xs font-bold self-start sm:self-auto border border-[hsl(var(--accent)/.2)]">
                            {cert.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/about" component={AboutPage} /><Route path="/submit-abstract" component={AbstractSubmissionPage} /><Route path="/program" component={ProgramPage} /><Route path="/speakers" component={SpeakersPage} /><Route path="/gallery" component={GalleryPage} /><Route path="/blog" component={BlogPage} /><Route path="/blog/:slug" component={BlogDetailPage} /><Route path="/conferences" component={ConferencesPage} /><Route path="/conference/:slug" component={() => <EventDetailsPage type="conference" />} /><Route path="/webinars" component={WebinarsPage} /><Route path="/webinar/:slug" component={() => <EventDetailsPage type="webinar" />} /><Route path="/brochure" component={BrochurePage} /><Route path="/venue" component={VenuePage} /><Route path="/sponsors" component={SponsorsPage} /><Route path="/media-partners" component={MediaPartnersPage} /><Route path="/collaborators" component={CollaboratorsPage} /><Route path="/exhibitors" component={ExhibitorsPage} /><Route path="/mentors/:username" component={MentorDetailsPage} /><Route path="/register" component={RegisterPage} /><Route path="/thank-you" component={ThankYouPage} /><Route path="/terms" component={TermsPage} /><Route path="/faq" component={FAQPage} /><Route path="/guidelines" component={GuidelinesPage} /><Route path="/contact" component={ContactPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><APIProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></APIProvider></TooltipProvider></QueryClientProvider>;
}

export default App;