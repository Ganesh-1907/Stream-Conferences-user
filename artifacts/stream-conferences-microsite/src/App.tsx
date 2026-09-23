import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getNameInitials, formatTime12h } from '@/lib/utils';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
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
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Microscope,
  Moon,
  Network,
  Palette,
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
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { LiveChatWidget } from '@/components/live-chat-widget';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { EventMicrosite } from '@/pages/event-microsite';

const queryClient = new QueryClient();

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';
const ROOT_DOMAIN = import.meta.env.VITE_ROOT_DOMAIN || '';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

interface DetectedSubdomain {
  subdomain: string;
  customBase?: string;
}

// Build the public microsite URL for an event based on its subdomain/eventId.
const subdomainUrl = (item: any, path = ''): string => {
  const sub = item?.subdomain || item?.eventId || item?.slug || (item as any)?._id || item?.id;
  if (!sub) return '';
  const root = ROOT_DOMAIN.toLowerCase();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (!root || root === 'localhost' || root === '127.0.0.1') {
    const typePath = item?.type === 'Webinar' || item?.eventType === 'webinar' ? 'webinar' : 'conference';
    return `${window.location.origin}/${typePath}/${encodeURIComponent(sub)}${cleanPath}`;
  }

  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  return `${protocol}//${sub}.${root}${cleanPath}`;
};

function detectSubdomainInfo(hostname: string, pathname: string, search: string): DetectedSubdomain | null {
  try {
    const params = new URLSearchParams(search);
    const querySub = params.get('subdomain') || params.get('event');
    if (querySub) {
      return { subdomain: querySub.trim().toLowerCase() };
    }
  } catch {
    /* ignore */
  }

  // Check path-based microsite routes: /conference/:id, /webinar/:id, /events/:id, /event/:id
  const match = pathname.match(/^\/(conference|webinar|events|event)\/([^/]+)/i);
  if (match) {
    const sub = decodeURIComponent(match[2]).trim().toLowerCase();
    const customBase = `/${match[1]}/${match[2]}`;
    return { subdomain: sub, customBase };
  }

  // Check hostname subdomains: e.g. scc00006.streamconferences.com or icmlhs.localhost
  const root = ROOT_DOMAIN.toLowerCase();
  const host = hostname.toLowerCase().split(':')[0];
  if (host.endsWith('.localhost')) {
    const sub = host.slice(0, host.length - '.localhost'.length);
    if (sub && sub !== 'www') return { subdomain: sub };
  }
  if (root && host !== root && host.endsWith('.' + root)) {
    const sub = host.slice(0, host.length - root.length - 1);
    if (sub && sub !== 'www') return { subdomain: sub };
  }

  return null;
}

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

const formatEventDateRange = (eventDateStr?: string, dayRangeStr?: string) => {
  if (!eventDateStr) return '';
  const { start, end } = getStartAndEndDates(eventDateStr, dayRangeStr);
  if (!start) return eventDateStr;

  const startMonth = start.toLocaleDateString(undefined, { month: 'short' });
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  if (!end || start.getTime() === end.getTime()) {
    return `${startMonth} ${startDay}, ${startYear}`;
  }

  const endMonth = end.toLocaleDateString(undefined, { month: 'short' });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  if (startYear === endYear) {
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} – ${endDay}, ${startYear}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
  }

  return `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
};

const formatLocation = (loc?: string) => {
  if (!loc) return '';
  return loc.replace(/\s*·\s*(In person|Hybrid|Online|Virtual)/gi, '').trim();
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
  // Eligibility & Submissions
  ['Who is eligible to submit an abstract?', 'Abstract submissions are open to researchers, clinical physicians, academicians, industry professionals, postdoctoral fellows, and students from around the world. We welcome submissions across all career stages and multidisciplinary sectors aligned with our conference tracks.'],
  ['Can I submit more than one abstract?', 'Yes. You may submit multiple abstracts. However, each accepted abstract must have a unique registered author to present the work at the conference to avoid scheduling conflicts.'],
  ['Is there an abstract submission fee?', 'No. Submitting an abstract for review by our Scientific Advisory Board is completely free. Registration fees apply only after your abstract has been accepted for presentation.'],
  // Format & Submission Process
  ['What is the word limit and structure for the abstract?', 'Abstracts must be between 250 and 350 words (excluding title, author list, and affiliations). They should follow a structured format including Background/Objectives, Methods, Results, and Conclusion/Significance.'],
  ['Can I submit an abstract that has already been published?', 'No. We require original research that has not been published or accepted for publication in a peer-reviewed journal prior to the date of the conference.'],
  ['Can I edit my abstract after submitting it?', 'You can request modifications to your submitted abstract prior to the final submission deadline by contacting our team with your Submission ID. Revisions requested after the deadline will be subject to editorial review.'],
  // Review & Acceptance
  ['How are abstracts evaluated?', 'All submissions undergo a double-blind peer review by experts on our Scientific Advisory Board. Evaluation criteria include scientific rigor, originality, relevance to the track, clarity of methodology, and potential impact.'],
  ['When and how will I be notified of the decision?', 'Notifications of acceptance or rejection are sent via email within 5 to 7 business days following your submission. Please ensure your contact details are accurate and check your spam/junk folder if you have not received an update.'],
  ['Will accepted abstracts be published?', 'Yes. All accepted and presented abstracts will be published in the official Conference Proceedings digital book, complete with an assigned DOI/ISBN where applicable.'],
  // Presentation & Registration
  ['Do I need to register for the conference right away to submit?', 'No. You do not need to register before submitting your abstract. You only need to register after receiving your formal acceptance notification.'],
  ['What happens if I cannot attend the conference in person?', 'We offer a dedicated Virtual Presentation option. Remote presenters can participate live online or submit a pre-recorded session, allowing their work to be included in the proceedings and presented to the global audience.'],
  ['What if I need a visa to attend in person?', 'Once your abstract is accepted and your conference registration is completed, our organizing committee will issue an Official Acceptance & Visa Invitation Letter to support your visa application.'],
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
  type: 'Conference';
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
  subjectImageUrl?: string;
  bannerUrl?: string;
  brochureUrl?: string;
  fees?: { type: string; dateLabel: string; deadline?: string | Date; usd: number; gbp: number; eur: number }[];
  organizerContact?: { name: string; email: string; phone: string };
  tracks?: { title: string; description: string; image: string; referenceLinks: { label: string; url: string }[] }[];
};

const events: EventItem[] = [
  { id: 'med-27', day: '12–14', month: 'MAR 27', type: 'Conference', title: 'International Conference on Medical, Life & Health Sciences', location: 'Boston, Massachusetts', date: 'upcoming', eventDate: '2027-03-12', slug: 'icmlhs-2027' },
  { id: 'ai-27', day: '08–09', month: 'MAY 27', type: 'Conference', title: 'Applied Intelligence & Emerging Technologies Forum', location: 'Singapore', date: 'upcoming', eventDate: '2027-05-08', slug: 'applied-intelligence-2027' },
  { id: 'past-25', day: '18–20', month: 'NOV 25', type: 'Conference', title: 'Global Forum on Research Translation', location: 'Copenhagen', date: 'past', eventDate: '2025-11-18', slug: 'global-forum-2025' },
];

function EventList({ initial: initialStatus = 'upcoming' }: { initial?: Status }) {
  const [location] = useLocation();
  const { events: eventsList } = useContext(APIContext);

  const getStatusFromUrl = (): Status => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('status') === 'past') return 'past';
      if (sp.get('status') === 'upcoming') return 'upcoming';
    }
    return initialStatus;
  };

  const [status, setStatus] = useState<Status>(getStatusFromUrl);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const syncStatusFromUrl = () => {
      if (typeof window !== 'undefined') {
        const sp = new URLSearchParams(window.location.search);
        const s = sp.get('status');
        if (s === 'past') {
          setStatus('past');
        } else if (s === 'upcoming') {
          setStatus('upcoming');
        } else {
          setStatus(initialStatus);
        }
      }
    };

    syncStatusFromUrl();

    window.addEventListener('popstate', syncStatusFromUrl);
    const timer = setInterval(syncStatusFromUrl, 100);

    return () => {
      window.removeEventListener('popstate', syncStatusFromUrl);
      clearInterval(timer);
    };
  }, [location, initialStatus]);
  
  const visible = useMemo(() => {
    return eventsList.filter((e) => {
      const matchStatus = e.date === status;
      const matchQuery = `${e.title} ${e.location} ${e.speaker ?? ''}`.toLowerCase().includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [eventsList, status, query]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-1 bg-[hsl(var(--muted))] rounded-full border border-[hsl(var(--border))] shadow-sm">
            {(['upcoming', 'past'] as Status[]).map((tab) => (
              <button
                type="button"
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  status === tab
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md scale-[1.02]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
                key={tab}
                onClick={() => {
                  setStatus(tab);
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.set('status', tab);
                    window.history.pushState({}, '', url.toString());
                  }
                }}
              >
                {tab === 'upcoming' ? 'Upcoming Conferences' : 'Past Archive'}
              </button>
            ))}
          </div>
        </div>

        {/* Right End: High-Contrast Search Bar on SAME row */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--secondary))] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conferences..."
            className="w-full pl-10 pr-10 py-2.5 border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-full text-sm font-medium shadow-xs focus:outline-none focus:border-[hsl(var(--secondary))] focus:ring-2 focus:ring-[hsl(var(--secondary)/.2)] transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground)/0.2)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visible.length ? (
          visible.map((e, index) => {
            const detailsHref = subdomainUrl(e) || `/conference/${encodeURIComponent(e.eventId || e.slug || (e as any)._id || e.id)}`;
            const dateBadgeText = formatEventDateRange(e.eventDate, e.day);

            return (
              <Reveal key={e.id || (e as any)._id || index} direction="up" delay={(index % 4) * 80}>
                <a 
                  href={detailsHref} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift flex flex-col justify-between rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden h-full group cursor-pointer" 
                  data-testid={`card-event-${index}`}
                >
                  <div className="relative aspect-[16/9] w-full bg-white dark:bg-slate-900/60 border-b border-[hsl(var(--border))] overflow-hidden flex items-center justify-center">
                    {e.subjectImageUrl ? (
                      <img 
                        src={mediaUrl(e.subjectImageUrl)} 
                        alt={`${e.title} subject`} 
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : e.logoUrl ? (
                      <img 
                        src={mediaUrl(e.logoUrl)} 
                        alt={`${e.title} logo`} 
                        className="h-full w-full object-contain p-2.5 group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : e.bannerUrl ? (
                      <img 
                        src={mediaUrl(e.bannerUrl)} 
                        alt={`${e.title} banner`} 
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300">
                        <Building2 className="text-[hsl(var(--primary-foreground))] opacity-75 group-hover:scale-110 transition-transform duration-300" size={40} />
                      </div>
                    )}
                    {dateBadgeText && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] group-hover:bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] px-3 py-1 text-xs font-extrabold shadow-md tracking-wide transition-colors duration-300">
                          <CalendarDays size={13} className="shrink-0" />
                          {dateBadgeText}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="display text-xl sm:text-2xl font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                        {e.title}
                      </h3>
                      {e.location && (
                        <div className="mt-4 flex items-center gap-2.5 text-base font-semibold text-[hsl(var(--foreground)/.88)] group-hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                          <MapPin size={16} className="shrink-0 text-[hsl(var(--secondary))] group-hover:scale-110 transition-transform duration-300" />
                          <span className="truncate">{formatLocation(e.location)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              </Reveal>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center w-full">
            <CircleHelp className="mx-auto text-[hsl(var(--secondary))]" />
            <p className="mt-4 font-bold">No events match that search</p>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try searching for something else or clearing filters.</p>
          </div>
        )}
      </div>
    </>
  );
}


function useCountdown(targetDate?: string | Date) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  if (!targetDate) return null;
  const target = new Date(targetDate).getTime();
  if (isNaN(target)) return null;
  const distance = Math.max(0, target - now);
  const totalSeconds = Math.floor(distance / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    concluded: now > target + 86400000 * 2,
    live: now >= target && now <= target + 86400000 * 2,
  };
}

interface APIContextType {
  conferences: any[];
  blogs: any[];
  events: EventItem[];
  insightsList: any[];
  mediaPartners: any[];
  collaborators: any[];
  exhibitors: any[];
  mentors: any[];
  people: any[];
  venues: any[];
  mainBrochure: { title: string; fileUrl: string; fileName?: string; description?: string } | null;
  loading: boolean;
  error: boolean;
}

const APIContext = createContext<APIContextType>({
  conferences: [],
  blogs: [],
  events: [],
  insightsList: [],
  mediaPartners: [],
  collaborators: [],
  exhibitors: [],
  mentors: [],
  people: [],
  venues: [],
  mainBrochure: null,
  loading: false,
  error: false
});

function APIProvider({ children }: { children: ReactNode }) {
  const [conferences, setConferences] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [mediaPartners, setMediaPartners] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [mainBrochure, setMainBrochure] = useState<{ title: string; fileUrl: string; fileName?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [confRes, blogRes, mpRes, collabRes, exhRes, mentorsRes, peopleRes, venuesRes, brochureRes] = await Promise.all([
          fetch(`${API_BASE}/conferences`),
          fetch(`${API_BASE}/blogs`),
          fetch(`${API_BASE}/media-partners`),
          fetch(`${API_BASE}/collaborators`),
          fetch(`${API_BASE}/exhibitors`),
          fetch(`${API_BASE}/mentors`),
          fetch(`${API_BASE}/people`),
          fetch(`${API_BASE}/venues`),
          fetch(`${API_BASE}/brochure/main`).catch(() => null)
        ]);
        
        if (!confRes.ok || !blogRes.ok || !mpRes.ok || !collabRes.ok || !exhRes.ok || !mentorsRes.ok || !peopleRes.ok || !venuesRes.ok) {
          throw new Error('API fetch failed');
        }

        const confData = await confRes.json();
        const blogData = await blogRes.json();
        const mpData = await mpRes.json();
        const collabData = await collabRes.json();
        const exhData = await exhRes.json();
        const mentorsData = await mentorsRes.json();
        const peopleData = await peopleRes.json();
        const venuesData = await venuesRes.json();
        const brochureData = brochureRes && brochureRes.ok ? await brochureRes.json() : null;

        if (active) {
          setConferences(confData);
          setBlogs(blogData);
          setMediaPartners(mpData);
          setCollaborators(collabData);
          setExhibitors(exhData);
          setMentors(mentorsData);
          setPeople(peopleData);
          setVenues(venuesData);
          setMainBrochure(brochureData);
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
      subjectImageUrl: c.subjectImageUrl,
      bannerUrl: c.bannerUrl,
      brochureUrl: c.brochureUrl,
      fees: c.fees,
      organizerContact: c.organizerContact,
      tracks: c.tracks
    }));

    const hasPastConf = normalizedConfs.some((e) => e.date === 'past');
    const mockPastEvents = events.filter((e) => e.date === 'past');
    const extraPast: EventItem[] = [];
    if (!hasPastConf) {
      extraPast.push(...mockPastEvents.filter((e) => e.type === 'Conference'));
    }

    if (normalizedConfs.length === 0) {
      return events.filter((e) => e.type === 'Conference');
    }
    return [...normalizedConfs, ...extraPast];
  }, [conferences]);

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
    <APIContext.Provider value={{ conferences, blogs, events: eventsList, insightsList, mediaPartners, collaborators, exhibitors, mentors, people, venues, mainBrochure, loading, error }}>
      {children}
    </APIContext.Provider>
  );
}

function SiteHeader() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(() => typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const colorThemes = [
    { id: 'conference-blue', label: 'Conference Blue', swatch: '#2563a8', primary: '213 63% 40%', secondary: '199 89% 48%', accent: '201 96% 40%' },
    { id: 'royal-navy', label: 'Royal Navy', swatch: '#1b365d', primary: '216 55% 23%', secondary: '199 75% 40%', accent: '201 80% 45%' },
    { id: 'ocean-teal', label: 'Ocean Teal', swatch: '#147d82', primary: '183 72% 29%', secondary: '172 62% 40%', accent: '174 72% 45%' },
    { id: 'emerald', label: 'Emerald', swatch: '#16734b', primary: '153 64% 27%', secondary: '142 55% 38%', accent: '158 68% 42%' },
    { id: 'ruby-red', label: 'Ruby Red', swatch: '#9f263d', primary: '348 62% 38%', secondary: '4 72% 48%', accent: '348 78% 50%' },
    { id: 'deep-violet', label: 'Deep Violet', swatch: '#54328c', primary: '262 48% 37%', secondary: '280 58% 48%', accent: '270 72% 55%' },
    { id: 'charcoal', label: 'Charcoal', swatch: '#343b46', primary: '216 16% 24%', secondary: '215 22% 38%', accent: '210 78% 52%' },
  ] as const;
  const [colorTheme, setColorTheme] = useState(() => {
    if (typeof window === 'undefined') return 'royal-navy';
    return window.localStorage.getItem('stream-color-theme') || 'royal-navy';
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const menuGroups = [
    {
      id: 'conferences',
      label: 'Conferences',
      items: [
        ['/conferences?status=upcoming', 'Upcoming Conferences'],
        ['/conferences?status=past', 'Past Conferences']
      ]
    },
    {
      id: 'media',
      label: 'Media',
      items: [
        ['/blog', 'Blogs'],
        ['/sponsors', 'Sponsors'],
        ['/gallery', 'Gallery'],
        ['/brochure', 'Brochure']
      ]
    },
    {
      id: 'guidelines',
      label: 'Guidelines',
      items: [
        ['/abstract-submission-guidelines', 'Abstract Submission Guidelines'],
        ['/guidelines', 'Program Guidelines'],
        ['/faq', 'FAQS'],
        ['/terms', 'Terms & Conditions'],
        ['/contact', 'Contact']
      ]
    }
  ];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.localStorage.setItem('stream-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    const selected = colorThemes.find((theme) => theme.id === colorTheme) || colorThemes[1];
    const root = document.documentElement;
    root.style.setProperty('--primary', selected.primary);
    root.style.setProperty('--ring', selected.primary);
    root.style.setProperty('--secondary', selected.secondary);
    root.style.setProperty('--accent', selected.accent);
    root.style.setProperty('--sidebar', selected.primary);
    root.style.setProperty('--sidebar-primary', selected.secondary);
    window.localStorage.setItem('stream-color-theme', selected.id);
  }, [colorTheme]);
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [location]);
  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenDropdown(null);
      setColorPickerOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);
  const toggleTheme = () => setDark((value) => !value);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        location === '/'
          ? scrolled
            ? 'bg-[hsl(var(--primary))] backdrop-blur-xl border-b border-[hsl(var(--primary-foreground)/.15)] shadow-2xl py-2.5'
            : 'bg-transparent border-none py-4'
          : 'bg-[hsl(var(--primary))] backdrop-blur-xl border-b border-[hsl(var(--primary-foreground)/.15)] shadow-xl py-3'
      }`}>
        <div className="container-wide flex h-[76px] items-center justify-between gap-4">
          {/* Brand / Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-3.5" data-testid="link-home-logo">
            <img src="/logo.jpg" className="h-12 w-12 rounded-[14px] object-contain bg-white p-1 shadow-lg border border-white/30" alt="STREAM" />
            <span className="display block text-[24px] sm:text-[26px] font-black tracking-[-.02em] text-white leading-none">
              Stream<span className="text-[hsl(var(--accent))]">Conferences</span>
            </span>
          </Link>

          {/* Center Navigation Options: White floating pill navigation menu bar on all pages */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/40 dark:border-white/20 text-slate-800 dark:text-white" aria-label="Primary">
            <Link
              href="/"
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                location === '/'
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md font-black'
                  : 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              data-testid="link-nav-home"
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                location === '/about'
                  ? 'bg-[hsl(var(--primary))] text-white shadow-md font-black'
                  : 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
              data-testid="link-nav-about"
            >
              About
            </Link>
            {menuGroups.map((group) => {
              const isOpen = openDropdown === group.id;
              const isGroupActive = isOpen || group.items.some(([href]) => location.startsWith(href.split('?')[0]));
              return (
                <div
                  key={group.id}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(group.id)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(isOpen ? null : group.id);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
                      isGroupActive
                        ? 'bg-[hsl(var(--primary))] text-white shadow-md font-black'
                        : 'text-slate-800 dark:text-slate-100 hover:text-[hsl(var(--primary))] hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                    aria-expanded={isOpen}
                    data-testid={`button-nav-group-${group.id}`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 transition-all duration-200 z-50 min-w-[210px] w-max"
                      data-testid={`dropdown-nav-group-${group.id}`}
                    >
                      <div className="grid gap-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-2xl grid-cols-1">
                        {group.items.map(([href, label]) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setOpenDropdown(null)}
                            className={`group/item flex items-center justify-between gap-3 rounded-xl px-3.5 py-2 transition-colors hover:bg-[hsl(var(--muted)/.75)] ${location === href ? 'bg-[hsl(var(--muted)/.5)] text-[hsl(var(--secondary))]' : ''}`}
                            data-testid={`link-nav-item-${label.toLowerCase().replaceAll(' ', '-')}`}
                          >
                            <span className={`text-[13.5px] font-bold text-[hsl(var(--foreground))] transition-colors group-hover/item:text-[hsl(var(--secondary))] whitespace-nowrap ${location === href ? 'text-[hsl(var(--secondary))]' : ''}`}>{label}</span>
                            <ChevronRight size={14} className="opacity-0 -translate-x-1 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Header Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setColorPickerOpen((value) => !value);
                }}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/40 dark:border-white/20 bg-white/95 dark:bg-[#0f172a]/95 hover:bg-white dark:hover:bg-[#1e293b] text-slate-800 dark:text-white backdrop-blur-xl shadow-xl transition-all"
                aria-label="Choose color theme"
                aria-expanded={colorPickerOpen}
                data-testid="button-color-theme"
              >
                <Palette size={18} />
              </button>
              {colorPickerOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 shadow-2xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <p className="pb-2.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] text-center">COLOR THEME</p>
                  <div className="grid grid-cols-4 gap-3 place-items-center">
                    {colorThemes.map((theme) => {
                      const isSelected = colorTheme === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          title={theme.label}
                          aria-label={theme.label}
                          onClick={() => {
                            setColorTheme(theme.id);
                            setColorPickerOpen(false);
                          }}
                          className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-black/10 transition-transform hover:scale-110 focus:outline-none ${
                            isSelected ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--card))] scale-105' : 'hover:opacity-90'
                          }`}
                          style={{ backgroundColor: theme.swatch }}
                        >
                          {isSelected && <Check size={14} className="text-white drop-shadow-xs stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/40 dark:border-white/20 bg-white/95 dark:bg-[#0f172a]/95 hover:bg-white dark:hover:bg-[#1e293b] text-slate-800 dark:text-white backdrop-blur-xl shadow-xl transition-all"
              aria-label={dark ? 'Use light theme' : 'Use dark theme'}
              data-testid="button-theme-toggle"
            >
              {dark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
            </button>

            {/* Primary Action Button (Matching Build Your Vision "Start Project" style) */}
            <Link
              href="/conferences"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-[hsl(var(--primary))] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
            >
              Explore Events
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              data-testid="button-mobile-menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 lg:hidden max-h-[80vh] overflow-y-auto">
          <nav className="container-wide grid gap-6" aria-label="Mobile">
            <Link href="/" className="flex items-center justify-between border-b border-[hsl(var(--border)/.65)] py-2 text-sm font-bold" data-testid="link-mobile-home">Home<ArrowRight size={15} className="text-[hsl(var(--secondary))]" /></Link>
            <Link href="/about" className="flex items-center justify-between border-b border-[hsl(var(--border)/.65)] py-2 text-sm font-bold" data-testid="link-mobile-about">About<ArrowRight size={15} className="text-[hsl(var(--secondary))]" /></Link>
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
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--primary))] text-white">
      <div className="container-wide grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand & Social Icons */}
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" className="h-10 w-10 rounded-[11px] object-contain bg-white p-1" alt="STREAM" />
            <span className="display text-xl font-black text-white">Stream Conferences</span>
          </div>
          <p className="mt-3 max-w-xs text-sm font-bold leading-6 text-white">
            Connecting minds, advancing science.
          </p>

          {/* Integrated Social Icons */}
          <div className="mt-6">
            <p className="text-xs font-black uppercase tracking-wider text-white">
              Stay close to the conversation
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on X"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/30 bg-white/15 text-white hover:border-white hover:text-white hover:bg-white/30 transition-all"
                data-testid="link-footer-social-x"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on LinkedIn"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/30 bg-white/15 text-white hover:border-white hover:text-white hover:bg-white/30 transition-all"
                data-testid="link-footer-social-linkedin"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Subscribe on YouTube"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/30 bg-white/15 text-white hover:border-white hover:text-white hover:bg-white/30 transition-all"
                data-testid="link-footer-social-youtube"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on Instagram"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/30 bg-white/15 text-white hover:border-white hover:text-white hover:bg-white/30 transition-all"
                data-testid="link-footer-social-instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Explore & Media */}
        <div className="grid gap-6 content-start">
          <div>
            <p className="label text-white text-xs font-black uppercase tracking-wider">Explore</p>
            <div className="mt-3 grid gap-2.5 text-sm">
              <Link href="/" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-home">Home</Link>
              <Link href="/about" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-about">About</Link>
            </div>
          </div>
          <div>
            <p className="label text-white text-xs font-black uppercase tracking-wider">Media</p>
            <div className="mt-3 grid gap-2.5 text-sm">
              <Link href="/blog" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-blog">Blogs</Link>
              <Link href="/sponsors" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-sponsors">Sponsors</Link>
              <Link href="/gallery" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-gallery">Gallery</Link>
              <Link href="/brochure" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-brochure">Brochure</Link>
            </div>
          </div>
        </div>

        {/* Column 3: Conferences & Guidelines */}
        <div className="grid gap-6 content-start">
          <div>
            <p className="label text-white text-xs font-black uppercase tracking-wider">Conferences</p>
            <div className="mt-3 grid gap-2.5 text-sm">
              <Link href="/conferences?status=upcoming" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-upcoming">Upcoming Conferences</Link>
              <Link href="/conferences?status=past" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-past">Past Conferences</Link>
            </div>
          </div>
          <div>
            <p className="label text-white text-xs font-black uppercase tracking-wider">Guidelines</p>
            <div className="mt-3 grid gap-2.5 text-sm">
              <Link href="/abstract-submission-guidelines" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-abstract-guidelines">Abstract Submission Guidelines</Link>
              <Link href="/guidelines" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-guidelines">Program Guidelines</Link>
              <Link href="/terms" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-terms">Terms & Conditions</Link>
              <Link href="/faq" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-faq">FAQS</Link>
              <Link href="/contact" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-contact">Contact</Link>
            </div>
          </div>
        </div>

        {/* Column 4: Help desk only */}
        <div className="content-start">
          <p className="label text-white text-xs font-black uppercase tracking-wider">Help desk</p>
          <div className="mt-3 grid gap-2.5 text-sm">
            <a href="mailto:info@streamconferences.com" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-email">info@streamconferences.com</a>
            <a href="mailto:abstracts@streamconferences.com" className="text-white/70 font-normal hover:text-white hover:font-bold transition-all inline-block hover:translate-x-1" data-testid="link-footer-abstracts">abstracts@streamconferences.com</a>
          </div>
        </div>
      </div>

      <div className="container-wide flex flex-col justify-between gap-3 border-t border-white/20 py-5 text-xs font-medium text-white/80 sm:flex-row">
        <span>© 2027 Stream Conferences. All rights reserved.</span>
        <span>Developed by BYV</span>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

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
      // 1. Process all grid containers with card elements for side/directional animation
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
    <div className="site-grain min-h-[100dvh]">
      <SiteHeader />
      {children}
      <Footer />
      <LiveChatWidget />
    </div>
  );
}

function Reveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'fade';
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const dirClass =
    direction === 'left'
      ? 'reveal-from-left'
      : direction === 'right'
      ? 'reveal-from-right'
      : direction === 'fade'
      ? 'reveal-from-fade'
      : 'reveal-from-up';

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal-on-scroll ${dirClass} ${visible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, body, light = false, eyebrowClassName, titleClassName }: { eyebrow?: string; title?: string; body?: string; light?: boolean; eyebrowClassName?: string; titleClassName?: string }) {
  return (
    <div>
      {eyebrow && (
        <p className={eyebrowClassName || `display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase ${light ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>
          {eyebrow}
        </p>
      )}
      {title && (
        <h2 className={titleClassName || `mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug ${light ? 'text-white' : 'text-[hsl(var(--foreground))]'}`}>
          {title}
        </h2>
      )}
      {body && (
        <p className={`mt-3 w-full text-base sm:text-lg font-medium leading-relaxed ${light ? 'text-slate-200' : 'text-[hsl(var(--muted-foreground))]'}`}>
          {body}
        </p>
      )}
    </div>
  );
}

function PageHero({ eyebrow, title, body, variant = 'wave' }: { eyebrow: string; title: string; body: string; bgImage?: string; variant?: 'standard' | 'wave' }) {
  if (variant === 'wave') {
    return (
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] pt-36 pb-20 sm:pt-40 sm:pb-24 md:pt-44 md:pb-28 shadow-none">
        {/* Crystal-clear ambient background glow - zero overlapping line disturbance */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[hsl(var(--accent)/0.15)] via-transparent to-[hsl(var(--secondary)/0.18)] opacity-90" />

        {/* Hero Content */}
        <div className="container-wide relative z-10 reveal">
          <div className="w-full max-w-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-extrabold uppercase tracking-widest mb-4 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
              <span>{eyebrow}</span>
            </div>
            <h1 className="display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
            {body && (
              <p className="mt-4 text-base sm:text-lg text-white/90 leading-relaxed pl-4 border-l-2 border-[hsl(var(--accent))]">
                {body}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Razor-Sharp Organic SVG Wave Curve */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none z-10">
          <svg 
            className="relative block w-full h-14 sm:h-20 md:h-28 text-[hsl(var(--background))]" 
            viewBox="0 0 1440 160" 
            preserveAspectRatio="none" 
            fill="currentColor"
            shapeRendering="geometricPrecision"
          >
            <path d="M0,40 C320,145 640,90 960,35 C1160,15 1320,10 1440,20 L1440,160 L0,160 Z"></path>
          </svg>
        </div>
      </section>
    );
  }

  return (
    <section className="page-intro bg-grid">
      <div className="container-wide pt-28 pb-12 sm:pt-32 md:pt-36 md:pb-16 lg:pt-40 lg:pb-20 reveal">
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

function Countdown({ targetDate, locationStr }: { targetDate?: string; locationStr?: string }) {
  const countdown = useCountdown(targetDate);
  if (!countdown) return null;
  const items = [['days', countdown.days], ['hours', countdown.hours], ['minutes', countdown.minutes], ['seconds', countdown.seconds]];
  return <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))] py-14 text-[hsl(var(--primary-foreground))]"><div className="container-wide text-center"><p className="label text-[hsl(var(--accent))]">The summit begins in</p>{countdown.live || countdown.concluded ? <h2 className="display mt-5 text-4xl font-bold">{countdown.live ? 'Conference is live' : 'Conference concluded'}</h2> : <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{items.map(([label, value]) => <div key={label as string} className="rounded-xl border border-[hsl(var(--primary-foreground)/.15)] bg-[hsl(var(--primary-foreground)/.06)] px-4 py-5"><strong className="display block text-4xl font-bold tracking-[-.06em] text-[hsl(var(--accent))] md:text-5xl">{String(value).padStart(2, '0')}</strong><span className="label mt-2 block text-[9px] text-[hsl(var(--primary-foreground)/.6)]">{label}</span></div>)}</div>}{locationStr && <p className="mt-6 text-sm text-[hsl(var(--primary-foreground)/.55)]">{locationStr}</p>}</div></section>;
}

function TrackGrid() {
  return <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{tracks.map(({ title, text, icon: Icon }, index) => <Reveal key={title} className={index === 0 ? 'lg:-translate-y-3' : ''}><div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5" data-testid={`card-track-${index}`}><Icon className="text-[hsl(var(--secondary))]" size={23} strokeWidth={1.8} /><h3 className="display mt-7 text-lg sm:text-xl font-bold leading-tight">{title}</h3><p className="mt-3 text-base sm:text-lg leading-7 text-[hsl(var(--muted-foreground))] font-medium">{text}</p><span className="mt-8 block text-[hsl(var(--accent))]"><ArrowUpRight size={18} /></span></div></Reveal>)}</div>;
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];
  const move = (direction: number) => setActive((current) => (current + direction + testimonials.length) % testimonials.length);
  return <section className="pt-10 pb-10 bg-[hsl(var(--card))] text-[hsl(var(--foreground))]" aria-label="Delegate testimonials">
    <div className="container-wide grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
      <div>
        <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-[hsl(var(--secondary))] uppercase">
          From the delegate community
        </p>
        <h2 className="mt-2.5 max-w-md text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
          A room people remember.
        </h2>
        <p className="mt-3 max-w-md text-base leading-7 text-[hsl(var(--muted-foreground))]">
          The conference experience is designed to stay useful long after the final session.
        </p>
      </div>
      <div className="card-lift relative rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] p-7 md:p-10">
        <span className="display text-6xl leading-none text-[hsl(var(--secondary))]">“</span>
        <blockquote className="display mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-[-.03em] md:text-4xl text-[hsl(var(--foreground))]">“{testimonial.quote}”</blockquote>
        <div className="mt-8 flex flex-col gap-5 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="font-bold text-[hsl(var(--foreground))]">{testimonial.name}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{testimonial.role}</p><p className="mt-1 label text-[9px] text-[hsl(var(--secondary))]">{testimonial.location}</p></div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] transition-colors" aria-label="Previous testimonial" data-testid="button-testimonial-previous"><ChevronLeft size={17} /></button>
            <button type="button" onClick={() => move(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] transition-colors" aria-label="Next testimonial" data-testid="button-testimonial-next"><ChevronRight size={17} /></button>
          </div>
        </div>
        <div className="mt-6 flex gap-2" role="tablist" aria-label="Choose testimonial">{testimonials.map((item, index) => <button key={item.name} type="button" onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${index === active ? 'w-10 bg-[hsl(var(--secondary))]' : 'w-5 bg-[hsl(var(--muted-foreground)/.3)]'}`} aria-label={`Show testimonial ${index + 1}`} aria-selected={index === active} role="tab" data-testid={`button-testimonial-dot-${index}`} />)}</div>
      </div>
    </div>
  </section>;
}

function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const homeFaqs = faqs.slice(0, 5);

  return (
    <section className="pt-10 pb-12 bg-[hsl(var(--card))]">
      <div className="container-wide max-w-4xl">
        <div className="text-center mb-10">
          <SectionTitle
            eyebrow=""
            title="Frequently Asked Questions"
          />
          <p className="mt-3 text-base sm:text-lg text-[hsl(var(--muted-foreground))]">
            Here are common questions delegates ask before submitting or attending.
          </p>
        </div>

        <div className="grid gap-3">
          {homeFaqs.map(([question, answer], index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={question}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-5 p-5 text-left font-bold text-base sm:text-lg"
                  aria-expanded={isOpen}
                  data-testid={`button-home-faq-${index}`}
                >
                  <span>{question}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[hsl(var(--secondary))] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    className="border-t border-[hsl(var(--border))] px-6 pb-6 pt-4 text-base sm:text-lg leading-8 text-[hsl(var(--foreground)/.85)]"
                    data-testid={`text-home-faq-answer-${index}`}
                  >
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/faq"
            className="btn-main btn-quiet inline-flex items-center gap-2"
            data-testid="link-home-see-all-faqs"
          >
            See All FAQs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}


function GallerySlider() {
  const [active, setActive] = useState(0);
  const [items, setItems] = useState<{ title: string; description?: string; image: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/gallery`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setItems(
            data.map((item: any) => ({
              title: item.title,
              description: item.description || '',
              image: mediaUrl(item.image),
            }))
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const t = setInterval(() => setActive((a) => (a + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const activeItem = items[active] || { title: '', description: '', image: '' };

  return (
    <section className="pt-10 pb-6 bg-[hsl(var(--card))]" aria-label="Inside the exchange">
      <div className="container-wide">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-8">
          <SectionTitle 
            eyebrow="Inside the exchange" 
            title="Ideas are better in the room." 
            body="A visual pulse of Stream Conferences: peer exchanges, technical questions, and strategic networking."
          />
          <Link href="/gallery" className="btn-main btn-quiet shrink-0" data-testid="link-slider-gallery">
            View full gallery <ArrowRight size={16} />
          </Link>
        </div>
        <div className="reveal relative max-w-5xl mx-auto overflow-hidden rounded-[20px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 shadow-xl">
          <div 
            className="relative h-[320px] sm:h-[360px] md:h-[400px] lg:h-[420px] w-full overflow-hidden rounded-[14px] transition-all duration-700 ease-in-out"
            style={{ 
              backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, rgba(15, 23, 42, 0.1) 100%), url(${activeItem.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end text-white">
              <span className="label text-[hsl(var(--accent))] text-[10px] font-bold mb-1">0{active + 1} / 0{items.length || 1}</span>
              <h3 className="display text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white">{activeItem.title}</h3>
              <p className="mt-1.5 text-xs sm:text-sm md:text-base text-slate-200 max-w-lg font-medium">{activeItem.description}</p>
            </div>
            <div className="absolute right-5 top-5 flex gap-1.5">
              {items.map((_, i) => (
                <button 
                  key={i} 
                  type="button"
                  onClick={() => setActive(i)} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? 'w-6 bg-[hsl(var(--accent))]' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
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

const heroImages = [
  '/hero-1.jpg',
  '/hero-2.jpg',
  '/hero-3.jpg',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
];

function Home() {
  const { conferences, insightsList, mentors, mediaPartners, events: eventsList } = useContext(APIContext);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [heroImgIndex, setHeroImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const displayConferences = useMemo(() => {
    const upcoming = conferences.filter((c: any) => {
      if (c.eventDate) {
        return new Date(c.eventDate).getTime() >= Date.now();
      }
      return c.date === 'upcoming';
    });
    const pool = upcoming.length > 0 ? upcoming : conferences;
    if (pool.length >= 4) return pool.slice(0, 4);

    const fallbackConfs = (eventsList || []).filter((e: any) => e.type === 'Conference' || e.type === 'conference');
    const combined = [...pool];
    for (const f of fallbackConfs) {
      if (combined.length >= 4) break;
      const fId = (f as any)._id || f.id;
      if (!combined.some((item) => ((item as any)._id || item.id) === fId || item.title === f.title)) {
        combined.push(f);
      }
    }
    return combined.slice(0, 4);
  }, [conferences, eventsList]);

  return <Layout>
    <main>
      {/* Curved S-Wave Hero Section (Matching Reference Design) */}
      <section className="relative w-full min-h-[90vh] lg:min-h-screen overflow-hidden bg-slate-950 text-white flex flex-col justify-center">
        {/* Right Side Background Image Layer (Auto Rotating Carousel) */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-slate-900">
          {heroImages.map((srcUrl, i) => (
            <div
              key={srcUrl}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                i === heroImgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={srcUrl}
                alt={`Conference presentation ${i + 1}`}
                className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                onError={() => {
                  setHeroImgIndex((prev) => (prev + 1) % heroImages.length);
                }}
              />
            </div>
          ))}
          {/* Edge blend gradient for small screens */}
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-transparent lg:hidden" />
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          {/* Slide Indicators */}
          <div className="hidden lg:flex absolute bottom-8 right-8 z-30 items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setHeroImgIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === heroImgIndex ? 'w-6 bg-[hsl(var(--accent))]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Dual Curved Wave Dividers Overlay (Matching Reference Image) */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none w-full h-full">
          <svg
            viewBox="0 0 1440 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Left Solid Theme Background with Curved Wave Edge */}
            <path
              d="M 0 0 L 880 0 C 780 180 680 380 580 540 C 470 720 390 830 300 900 L 0 900 Z"
              fill="hsl(var(--primary))"
            />
            
            {/* Additional Dark Overlay Gradient over Primary Fill for Rich Depth */}
            <path
              d="M 0 0 L 880 0 C 780 180 680 380 580 540 C 470 720 390 830 300 900 L 0 900 Z"
              fill="url(#hero-wave-gradient)"
              opacity="0.25"
            />

            {/* Primary Theme Wave Ribbon Edge */}
            <path
              d="M 880 0 C 780 180 680 380 580 540 C 470 720 390 830 300 900 L 380 900 C 470 830 550 720 650 540 C 750 380 850 180 950 0 Z"
              fill="hsl(var(--primary))"
            />

            {/* Secondary Accent Ribbon Band (Gold/Yellow Ribbon in Reference Image) */}
            <path
              d="M 950 0 C 850 180 750 380 650 540 C 550 720 470 830 380 900 L 460 900 C 550 830 630 720 730 540 C 830 380 930 180 1030 0 Z"
              fill="hsl(var(--secondary))"
            />

            <defs>
              <linearGradient id="hero-wave-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Left Side Content Container */}
        <div className="relative z-20 w-full lg:w-[58%] min-h-[90vh] lg:min-h-screen px-6 sm:px-12 lg:px-16 pt-28 sm:pt-32 lg:pt-36 pb-20 lg:pb-24 flex flex-col justify-between">
          <div className="my-auto max-w-2xl">
            {/* Main Headline */}
            <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[56px] font-black uppercase leading-[1.1] tracking-tight text-white">
              <span className="block whitespace-nowrap">CONNECTING MINDS,</span>
              <span className="block whitespace-nowrap text-[hsl(var(--accent))]">ADVANCING SCIENCE.</span>
            </h1>

            {/* Description Paragraph */}
            <p className="mt-6 text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 font-medium max-w-xl">
              The International Conferences on Medical, Life & Health Sciences brings the people who discover, test, build, and deliver better futures into one serious global conversation.
            </p>

            {/* Action Buttons (Matching reference pill style) */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/conferences"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-950 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider shadow-2xl transition-all transform hover:-translate-y-0.5 border border-white/20 cursor-pointer"
                data-testid="link-hero-conferences"
              >
                <span>EVENTS CALENDAR</span>
                <ArrowRight size={17} className="text-[hsl(var(--accent))]" />
              </Link>
              <Link
                href="/conferences?status=upcoming"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer border border-white/25"
                data-testid="link-hero-upcoming-conferences"
              >
                <span>LIVE CONFERENCES</span>
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          {/* Bottom Quick Stats Counter Grid */}
          <div className="mt-8 pt-5 border-t border-white/20 grid grid-cols-3 gap-6 max-w-2xl">
            <div>
              <p className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight">
                {conferences.length > 0 ? `${conferences.length}+` : '20+'}
              </p>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-white/90 mt-2">
                CONFERENCES
              </p>
            </div>
            <div>
              <p className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight">
                {mentors.length > 0 ? `${mentors.length}+` : '30+'}
              </p>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-white/90 mt-2">
                GLOBAL MENTORS
              </p>
            </div>
            <div>
              <p className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none tracking-tight">
                {insightsList.length > 0 ? `${insightsList.length}+` : '15+'}
              </p>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-white/90 mt-2">
                PUBLICATIONS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About STREAM Conferences Introduction Section */}
      <section className="pt-12 pb-8 bg-[hsl(var(--background))]">
        <div className="container-wide w-full">
          <SectionTitle 
            title="About STREAM Conferences" 
            titleClassName="display w-full text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-[hsl(var(--secondary))] uppercase"
            /* title="Operating at the intersection of academic excellence and industry innovation." */
          />
          <div className="mt-8 grid gap-6 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))] w-full max-w-none text-justify">
            <p>
              STREAM Conferences is an established global architect of elite scientific, technical, research, engineering, academic, and medical summits. Operating at the dynamic intersection of rigorous scholarship and industrial execution, we engineer high-precision platforms designed to accelerate knowledge transfer, forge high-value cross-disciplinary synergies, and catalyse theoretical discoveries into transformative global solutions.
            </p>
            <p className="inline sm:block">
              We redefine the international summit experience through focused, result-driven frameworks that convert intellectual capital into immediate market momentum. We deliberately cultivate environments where data scientists, clinical physicians, biotech innovators, and systems engineers converge to solve high-stakes global challenges.......{' '}
              <Link
                href="/about"
                className="inline-flex items-center gap-1 ml-1.5 font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] hover:underline transition-colors align-baseline cursor-pointer"
              >
                <span>Read More</span>
                <ArrowRight size={15} />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Conferences Section */}
      <section className="pt-8 pb-8 bg-[hsl(var(--card))]" id="upcoming-events-conferences">
        <div className="container-wide">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end mb-10">
            <SectionTitle 
              title="Upcoming Conferences" 
              titleClassName="display w-full text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-[hsl(var(--secondary))] uppercase"
              /* title="Conclaves of global scale." */
              body="Announcing the premier global gatherings for science, engineering, and academia." 
            />
            <Link href="/conferences" className="btn-main btn-quiet shrink-0" data-testid="link-home-view-conferences">
              All Conferences <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {displayConferences.map((item, index) => {
              const detailsHref = subdomainUrl(item) || `/conference/${encodeURIComponent(item.eventId || item.slug || (item as any)._id || item.id)}`;
              const dateBadgeText = formatEventDateRange(item.eventDate, item.day);

              return (
                <a 
                  key={item._id || item.id || index} 
                  href={detailsHref} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-lift flex flex-col justify-between rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden h-full group cursor-pointer" 
                  data-testid={`card-home-conference-${index}`}
                >
                  <div className="relative aspect-[16/9] w-full bg-white dark:bg-slate-900/60 border-b border-[hsl(var(--border))] overflow-hidden flex items-center justify-center">
                    {item.subjectImageUrl ? (
                      <img 
                        src={mediaUrl(item.subjectImageUrl)} 
                        alt={`${item.title} subject`} 
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : item.logoUrl ? (
                      <img 
                        src={mediaUrl(item.logoUrl)} 
                        alt={`${item.title} logo`} 
                        className="h-full w-full object-contain p-2.5 group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : item.bannerUrl ? (
                      <img 
                        src={mediaUrl(item.bannerUrl)} 
                        alt={`${item.title} banner`} 
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center group-hover:opacity-100 transition-opacity duration-300">
                        <Building2 className="text-[hsl(var(--primary-foreground))] opacity-75 group-hover:scale-110 transition-transform duration-300" size={40} />
                      </div>
                    )}
                    {dateBadgeText && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] group-hover:bg-[hsl(var(--secondary))] text-[hsl(var(--primary-foreground))] px-3 py-1 text-xs font-extrabold shadow-md tracking-wide transition-colors duration-300">
                          <CalendarDays size={13} className="shrink-0" />
                          {dateBadgeText}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="display text-xl sm:text-[21px] font-black leading-snug text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                        {item.title}
                      </h3>
                      {item.location && (
                        <div className="mt-4 flex items-center gap-2.5 text-sm font-semibold text-[hsl(var(--foreground)/.88)] group-hover:text-[hsl(var(--secondary))] transition-colors duration-300">
                          <MapPin size={15} className="shrink-0 text-[hsl(var(--secondary))] group-hover:scale-110 transition-transform duration-300" />
                          <span className="truncate">{formatLocation(item.location)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>




      <TestimonialCarousel />
      <GallerySlider />
      {insightsList.length > 0 && (
        <section className="pt-10 pb-10 bg-[hsl(var(--card))]">
          <div className="container-wide grid gap-10 md:grid-cols-[.7fr_1.3fr] md:items-end">
            <div>
              <SectionTitle eyebrow="From the Stream Conferences blog" title="Notes for the in-between." />
              <Link href="/blog" className="btn-main btn-quiet mt-8" data-testid="link-home-insights">
                Read blogs <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {insightsList.slice(0, 3).map((insight, index) => (
                <div key={insight.id || insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full shadow-sm">
                  <div className="p-6 flex-1">
                    <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 bg-[hsl(var(--muted)/.25)] flex items-center justify-center relative">
                      {insight.bannerUrl ? (
                        <img src={mediaUrl(insight.bannerUrl)} alt={insight.title} className="h-full w-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center">
                          <BookOpen className="text-[hsl(var(--primary-foreground))] opacity-65" size={32} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">{insight.label}</span>
                    <h3 className="display mt-2 text-xl font-bold leading-snug line-clamp-2 text-[hsl(var(--foreground))]">{insight.title}</h3>
                    <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))] line-clamp-3">{insight.copy}</p>
                  </div>
                  <div className="px-6 pb-6 pt-0">
                    <Link href={`/blog/${encodeURIComponent(insight.id)}`} className="inline-flex items-center gap-1.5 text-base font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition" data-testid={`link-home-blog-${index}`}>
                      Read field note <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="bg-[hsl(var(--primary))] py-12 text-[hsl(var(--primary-foreground))]"><div className="container-wide flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--accent))]">Help desk</p><p className="display mt-2 text-2xl font-bold text-[hsl(var(--primary-foreground))]">Have a question before you arrive?</p><div className="mt-3 flex flex-wrap gap-4 text-sm text-[hsl(var(--primary-foreground)/.85)]"><a href="mailto:info@streamconferences.com" className="flex items-center gap-2 font-semibold hover:text-[hsl(var(--accent))]" data-testid="link-home-email"><Mail size={16} /> info@streamconferences.com</a><span className="flex items-center gap-2"><Phone size={16} /> +1 (617) 555-0199</span></div></div><Link href="/contact" className="btn-main bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-110 shadow-lg border-0" data-testid="link-home-contact">Contact us <ArrowUpRight size={16} /></Link></div></section>
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
        <div className="p-6 pb-0 text-center">
          <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">{label}</p>
          <h3 className="display mt-3 text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">{displayName}</h3>
          {role && <p className="mt-2 text-base leading-7 text-[hsl(var(--muted-foreground))]">{role}</p>}
        </div>
      </div>
      <div className="p-6 pt-0 text-center">
        <Link href={`/mentors/${person.username}?from=speakers`} className="mt-5 inline-flex items-center gap-1.5 text-base font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition group" data-testid={`link-details-${index}`}>
          View details <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
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
      <main className="pt-6 pb-16">
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
    ['Scientific Integrity & Rigor', 'We hold empirical truth to the highest standard. Every abstract, paper, and presentation hosted across our stages undergoes uncompromising peer review, ensuring that all shared intelligence is grounded in methodological excellence and absolute transparency.'],
    ['Action-Driven Innovation', 'Knowledge achieves its true value only when translated into real-world impact. We aggressively bridge academic theory and industrial application, expediting the passage of lab-scale breakthroughs into advanced clinical treatments and scalable technological infrastructure.'],
    ['Multidisciplinary Synergy', 'Humanity’s most formidable challenges transcend singular disciplines. We systematically dismantle sectoral barriers, aligning clinical authorities, technical pioneers, and corporate strategists to generate unexpected insights and borderless innovation.'],
    ['Global Inclusivity & Intellectual Accessibility', 'Scientific advancement is a global imperative. We sustain a borderless platform that elevates pioneering work from across all continents, guaranteeing early-career scholars, doctoral candidates, and seasoned authorities equal access to high-impact publishing, peer recognition, and strategic networks.'],
  ];

  const visionPoints = [
    'Create a connected international ecosystem where diverse minds, disciplines, and perspectives come together.',
    'Inspire new ideas, discoveries, and innovations that contribute to the advancement of science, technology, medicine, engineering, and academia.',
    'Encourage researchers, professionals, and emerging talents to learn, grow, share expertise, and pursue new possibilities.',
    'Foster a culture of collaboration and innovation that transforms knowledge and ideas into lasting contributions to society.',
  ];

  return (
    <Layout>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=1200&q=80"
        eyebrow="About STREAM Conferences"
        title="A platform built to close the gap between discovery and delivery."
        body="Uniting Academia, Industry, and Clinical Excellence on One Global Stage"
      />
      <main>
        {/* 1. About Section - Paragraphs (Full Width, Justified Text) */}
        <section className="pt-6 pb-6">
          <div className="container-wide w-full">
            <div className="grid gap-6 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))] w-full max-w-none text-justify">
              <p>
                STREAM Conferences is an established global architect of elite scientific, technical, research, engineering, academic, and medical summits. Operating at the dynamic intersection of rigorous scholarship and industrial execution, we engineer high-precision platforms designed to accelerate knowledge transfer, forge high-value cross-disciplinary synergies, and catalyse theoretical discoveries into transformative global solutions.
              </p>
              <p>
                We redefine the international summit experience through focused, result-driven frameworks that convert intellectual capital into immediate market momentum. We deliberately cultivate environments where data scientists, clinical physicians, biotech innovators, and systems engineers converge to solve high-stakes global challenges.
              </p>
              <p>Where pioneering ideas meet global expertise, STREAM Conferences creates a space for discovery, innovation, and meaningful exchange across Conference platforms fostering knowledge and Academia. We bring together leading researchers, scientists, academicians, healthcare professionals, engineers, technology experts, industry leaders, innovators, and emerging professionals to create meaningful opportunities for knowledge exchange and collaboration. Operating at the intersection of academic excellence and industry innovation.</p>
              <p>We create focused platforms where research, expertise, and real-world applications can come together. Our conferences are designed to encourage the exchange of groundbreaking research, emerging technologies, practical insights, and diverse perspectives across disciplines.</p>
              <p>We go beyond traditional conference formats by creating engaging, knowledge-driven environments that encourage meaningful discussions, interdisciplinary connections, and professional networking. Through keynote presentations, plenary sessions, technical talks, research presentations, panel discussions, workshops, and interactive forums, participants gain opportunities to present their work, discover emerging developments, and connect with peers and experts from around the world.</p>
              <p>Our conferences span diverse areas including Science, Technology, Research, Engineering, Academia, Medicine, and other emerging fields, enabling cross-disciplinary dialogue on some of the most important challenges and opportunities shaping the world today. By bringing complementary areas of expertise together, we aim to encourage collaboration that can transform innovative concepts and research findings into practical applications and impactful solutions.</p>
              <p>At STREAM Conferences, we believe that progress begins with connection. Every conference is designed to create a space where ideas can be shared, perspectives can be challenged, partnerships can be formed, and new possibilities can emerge. Our goal is to strengthen the global exchange of knowledge while supporting researchers, professionals, and innovators in contributing to the advancement of their fields.</p>
              <p>Through a growing international network of scientific and professional communities, STREAM Conferences strives to connect minds, facilitate knowledge transfer, encourage innovation, and contribute to meaningful progress across science, technology, healthcare, engineering, and academia.</p>
            </div>
          </div>
        </section>

        {/* 2. Vision Section (Full Width) */}
        <section className="pt-6 pb-6 bg-[hsl(var(--card))]">
          <div className="container-wide w-full">
            <SectionTitle eyebrow="Vision" title="Connecting minds and transforming global discovery." />
            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 w-full max-w-none">
              {visionPoints.map((point, i) => (
                <Reveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={Math.floor(i / 2) * 120} className="h-full">
                  <div className="card-lift group cursor-pointer flex items-start gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xs h-full">
                    <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] font-mono font-bold text-sm group-hover:bg-[hsl(var(--secondary))] group-hover:text-white transition-colors">
                      0{i + 1}
                    </span>
                    <p className="text-base sm:text-lg leading-7 text-[hsl(var(--foreground))] font-medium">
                      {point}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Mission Section (Full Width) */}
        <section className="pt-6 pb-6">
          <div className="container-wide w-full">
            <SectionTitle eyebrow="Mission" title="Move knowledge into the world." />
            <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2 w-full max-w-none">
              {[
                'Accelerate technology transfer from university-led research into commercial pipelines and clinical application.',
                'Foster multidisciplinary synergy across Medicine, Pharma, Health Science, Life Science, Engineering, and Technology.',
                'Elevate emerging scholars through visibility and direct mentorship alongside recognized industry leaders.',
                'Uphold academic excellence across every keynote, technical panel, symposium, and peer-reviewed publication.',
              ].map((item, i) => (
                <Reveal key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={Math.floor(i / 2) * 120} className="h-full">
                  <div className="card-lift group cursor-pointer flex items-start gap-4 p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xs h-full">
                    <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] font-mono font-bold text-sm group-hover:bg-[hsl(var(--secondary))] group-hover:text-white transition-colors">
                      0{i + 1}
                    </span>
                    <p className="text-base sm:text-lg leading-7 text-[hsl(var(--foreground))] font-medium">
                      {item}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 4. What Guides The Work (Full Width) */}
        <section className="pt-6 pb-6 bg-[hsl(var(--card))]">
          <div className="container-wide w-full">
            <SectionTitle eyebrow="What guides the work" title="Four values behind every stage, review, and connection." />
            <div className="mt-6 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-none">
              {values.map(([title, body], i) => (
                <Reveal key={title} direction="up" delay={i * 100} className="h-full">
                  <div className="card-lift flex flex-col justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-sm h-full">
                    <div>
                      <span className="font-mono text-[hsl(var(--secondary))] font-bold text-sm tracking-wider">0{i + 1}</span>
                      <h3 className="display mt-4 text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] leading-snug">{title}</h3>
                      <p className="mt-3 text-base sm:text-lg leading-7 text-[hsl(var(--muted-foreground))] font-medium">{body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Who We Gather (Full Width - 2 columns per row) */}
        <section className="pt-6 pb-6">
          <div className="container-wide w-full">
            <SectionTitle eyebrow="Who we gather" title="A premier delegation of decision-makers and innovators." />
            <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 w-full max-w-none">
              {['Clinical & Academic Leaders', 'Industry Innovators', 'Research & Advisory Authorities', 'Next-Gen Researchers'].map((item, i) => (
                <Reveal key={item} direction={i % 2 === 0 ? 'left' : 'right'} delay={Math.floor(i / 2) * 120} className="h-full">
                  <div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 h-full">
                    <Building2 size={24} className="text-[hsl(var(--secondary))]" />
                    <h3 className="display mt-6 text-lg sm:text-xl font-bold">{item}</h3>
                    <p className="mt-3 text-base sm:text-lg leading-7 text-[hsl(var(--muted-foreground))] font-medium">Physicians, executives, editors, strategists, doctoral candidates, and outstanding young scientists.</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Research Dissemination & Healthcare Publishing (Full Width - Spans container-wide with max-w-none) */}
        <section className="pt-6 pb-12 bg-[hsl(var(--card))]">
          <div className="container-wide w-full">
            <SectionTitle eyebrow="Publishing & Indexing" title="Research Dissemination & Healthcare Publishing" />
            <div className="mt-8 grid gap-5 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))] w-full max-w-none">
              <p>A fundamental pillar of Stream Conferences is ensuring that presented research secures permanent global reach. We move beyond ephemeral conversations, systematically documenting and indexing scientific discoveries through high-level publishing alliances across healthcare, medical, and technology sectors.</p>
              <p>High-impact submissions receive direct channels for peer-reviewed evaluation in reputed international journals. Furthermore, all accepted abstracts and manuscripts are published in official digital proceedings assigned dedicated DOIs—ensuring universal indexability, citation permanence, and international prestige for researchers at every stage of their trajectory.</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function GalleryPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [items, setItems] = useState<{ title: string; description?: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/gallery`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setItems(
            data.map((item: any) => ({
              title: item.title,
              description: item.description || '',
              image: mediaUrl(item.image),
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedItem = selected !== null ? items[selected] : null;

  return (
    <Layout>
      <PageHero
        variant="wave"
        eyebrow="The conference in motion"
        title="A room built for exchange."
        body="A visual archive of the people, moments, and working sessions that make Stream Conferences more than a program."
      />
      <main className="pt-6 pb-16">
        <div className="container-wide">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">No gallery images added yet.</p>
              <p className="text-sm mt-1">Gallery items uploaded in the Admin Panel will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-[hsl(var(--border))] text-left text-[hsl(var(--primary-foreground))] shadow-md transition-all hover:scale-[1.02] duration-300 cursor-pointer"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(24, 39, 63, 0.9) 0%, rgba(24, 39, 63, 0.3) 60%, rgba(24, 39, 63, 0.1) 100%), url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  data-testid={`gallery-item-${i}`}
                >
                  <div className="absolute inset-0 bg-[hsl(var(--primary)/.2)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex h-full flex-col justify-end p-6">
                    <span className="label text-[hsl(var(--accent))] text-[9px] mb-2">0{i + 1}</span>
                    <h2 className="display text-2xl font-bold leading-tight text-white drop-shadow-sm">{item.title}</h2>
                    {item.description && (
                      <p className="mt-2 text-xs text-slate-200 max-w-xs drop-shadow-xs">{item.description}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--accent))] group-hover:translate-x-1 transition-transform duration-300">
                      View large photo <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-[hsl(var(--card))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
              onClick={() => setSelected(null)}
            >
              <X size={18} />
            </button>
            <img src={selectedItem.image} alt={selectedItem.title} className="w-full max-h-[70vh] object-cover" />
            <div className="bg-[hsl(var(--card))] p-6 border-t border-[hsl(var(--border))]">
              <span className="label text-[hsl(var(--accent))]">
                0{selected! + 1} · {selectedItem.title}
              </span>
              {selectedItem.description && (
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
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
      <main className="pt-6 pb-16">
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
  const { mainBrochure } = useContext(APIContext);

  const handleDownload = () => {
    if (mainBrochure?.fileUrl) {
      const url = mediaUrl(mainBrochure.fileUrl);
      const a = document.createElement('a');
      a.href = url;
      a.download = mainBrochure.fileName || 'Stream-Conferences-Brochure.pdf';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Downloading Brochure", description: `Downloading ${mainBrochure.title || 'the official brochure'}...` });
    } else {
      toast({ title: "Brochure Not Available", description: "No official website brochure has been uploaded yet. Please try again later." });
    }
  };

  return (
    <Layout>
      <PageHero bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80" eyebrow="The delegate edition" title="Take the summit with you." body="A concise field guide to Stream Conferences: tracks, program architecture, venue notes, and the details that help you make the most of our events." />
      <main className="pt-6 pb-16">
        <div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className="card-lift relative mx-auto aspect-[.72] w-full max-w-[360px] overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] shadow-2xl shadow-[hsl(var(--primary)/.2)] cursor-pointer">
            <div className="absolute right-[-50px] top-[-20px] h-48 w-48 rounded-full border border-[hsl(var(--accent)/.55)]" />
            <span className="label text-[hsl(var(--accent))]">Stream Conferences</span>
            <div className="mt-24">
              <p className="label text-[9px] text-[hsl(var(--primary-foreground)/.55)]">Official Summit Brochure</p>
              <h2 className="display mt-3 text-4xl font-bold leading-[.95] tracking-[-.05em]">{mainBrochure?.title || 'Global Summits & Conferences'}</h2>
            </div>
            <div className="absolute bottom-8 left-8 right-8 flex justify-between border-t border-[hsl(var(--primary-foreground)/.2)] pt-4 text-[10px]">
              <span>Stream Conferences</span>
              <span>Global Summit</span>
            </div>
          </div>
          <div>
            <p className="display w-full text-left text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))]">
              Delegate Brochure
            </p>
            <h2 className="mt-2.5 w-full text-left text-base sm:text-lg md:text-xl font-bold leading-snug text-[hsl(var(--foreground))]">
              {mainBrochure?.title || 'Comprehensive Event Field Guide'}
            </h2>
            <p className="mt-6 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]">
              {mainBrochure?.description || 'Download the complete delegate field guide for Stream Conferences. Get detailed access to track taxonomies, keynote presentation schedules, delegate registration tiers, abstract submission timelines, and venue logistics across all upcoming global summits.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleDownload}
                className="btn-main card-lift border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] flex items-center gap-2 cursor-pointer shadow-md transition-colors"
                data-testid="button-download-brochure-page"
              >
                <Download size={18} className="text-[hsl(var(--secondary))]" /> Download Official Brochure (PDF)
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function VenuesPage() {
  const { venues } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1501979392350-f8c5b058a5c6?auto=format&fit=crop&w=1200&q=80" eyebrow="Our spaces" title="Venues for the conversation." body="Explore the venues available for our conferences." /><main className="pt-6 pb-16"><div className="container-wide"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{venues.length > 0 ? venues.map((venue) => <div key={venue._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center gap-3"><MapPin size={20} className="text-[hsl(var(--secondary))]" /><h3 className="display text-xl font-bold">{venue.name}</h3></div>{venue.address && <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{venue.address}</p>}{venue.locationUrl && <a href={venue.locationUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition">View location <ExternalLink size={14} /></a>}</div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p>No venues have been added yet.</p></div>}</div></div></main></Layout>;
}

function SponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchSponsors = async (pageNum: number) => {
    try {
      const res = await fetch(`${API_BASE}/sponsors/all?page=${pageNum}&limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      setSponsors((prev) => (pageNum === 1 ? data.sponsors : [...prev, ...data.sponsors]));
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load sponsors:', err);
    }
  };

  useEffect(() => {
    fetchSponsors(1).then(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (page > 1) {
      setLoadingMore(true);
      fetchSponsors(page).then(() => setLoadingMore(false));
    }
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, totalPages, loadingMore]);

  return (
    <Layout>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80"
        eyebrow="Build the room with us"
        title="Put your work in the conversation."
        body="Sponsorship and exhibition at STREAM Conferences places your organization alongside the researchers and practitioners shaping what comes next."
      />
      <main>
        {/* Dynamic Sponsors Grid from all events */}
        <section className="pt-6 pb-16">
          <div className="container-wide">
            <SectionTitle
              eyebrow="Our Partners"
              title="Sponsors across all events."
              body="Recognizing the organizations and industry leaders supporting our conferences."
            />

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-8">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-36 sm:h-40 rounded-2xl bg-[hsl(var(--muted)/.4)]" />
                    <div className="mt-2.5 h-4 w-3/4 mx-auto rounded bg-[hsl(var(--muted)/.4)]" />
                  </div>
                ))}
              </div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
                <Award size={40} className="mx-auto mb-4 opacity-40" />
                <p className="text-lg">No sponsors have been added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pt-8">
                {sponsors.map((sponsor, idx) => {
                  const displayName = sponsor.name || sponsor.title || `Sponsor ${idx + 1}`;
                  const logoUrl = sponsor.logo ? mediaUrl(sponsor.logo) : '';
                  return (
                    <div key={`${sponsor.sponsorId}-${idx}`} className="group flex flex-col items-center text-center">
                      <div className="card-lift relative w-full h-36 sm:h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 flex items-center justify-center overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt={displayName} className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-base rounded-xl gap-2 p-2">
                            <Award size={24} />
                            <span className="font-['Space_Grotesk'] line-clamp-1">{displayName}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="mt-2.5 text-sm sm:text-base font-extrabold text-[hsl(var(--foreground))] text-center line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors font-['Space_Grotesk']">
                        {displayName}
                      </h4>
                      {sponsor.eventTitle && (
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1">{sponsor.eventTitle}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
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
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const prices = [['Student', '$245', '$320'], ['Academic', '$395', '$480'], ['Industry Delegate', '$520', '$640'], ['Virtual Attendee', '$145', '$190']];

  const { conferences } = useContext(APIContext);
  
  const fullEvent = useMemo(() => {
    if (!eventInfo) return null;
    const pool = conferences;
    return pool.find((e: any) => e.slug === eventInfo.eventSlug || e._id === eventInfo.eventId || e.eventId?.toLowerCase() === eventInfo.eventCustomId?.toLowerCase());
  }, [eventInfo, conferences]);

  const eventPrices = useMemo(() => {
    if (fullEvent?.fees && fullEvent.fees.length > 0) {
      return fullEvent.fees.map((f: any) => [f.type, `$${f.usd}`, `$${Math.round(f.usd * 1.2)}`]);
    }
    return [['Student', '$200', '$260'], ['Academic', '$320', '$390'], ['Industry Delegate', '$420', '$520'], ['Virtual Attendee', '$120', '$150']];
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
                              <p><span className="font-medium text-[hsl(var(--foreground))]">Start Time:</span> {formatTime12h(fullEvent.startTime) || '—'}</p>
                              <p><span className="font-medium text-[hsl(var(--foreground))]">End Time:</span> {formatTime12h(fullEvent.endTime) || '—'}</p>
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
  const filtered = useMemo(
    () => faqs.filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <Layout>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
        eyebrow="Help desk"
        title="The questions worth answering early."
        body="Find practical guidance on eligibility, submission, review, presentation formats, registration, and joining from abroad."
      />
      <main className="pt-6 pb-16">
        <div className="container-wide max-w-4xl">
          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] pointer-events-none z-10" size={19} />
            <input
              className="form-field !pl-12 pr-10 py-3.5 text-base shadow-sm rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
              style={{ paddingLeft: '48px' }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the help desk"
              aria-label="Search FAQs"
              data-testid="input-faq-search"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted-foreground)/0.2)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="grid gap-4">
            {filtered.map(([question, answer]) => {
              const actualIndex = faqs.findIndex(([item]) => item === question);
              const isOpen = open === actualIndex;
              return (
                <div
                  key={question}
                  onClick={() => setOpen(isOpen ? null : actualIndex)}
                  className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden bg-[hsl(var(--card))] shadow-xs hover:-translate-y-1 hover:shadow-lg ${
                    isOpen
                      ? 'border-[hsl(var(--secondary)/0.8)] shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.18)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--secondary)/0.8)] hover:shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.15)]'
                  }`}
                >
                  <div
                    className="flex w-full items-center justify-between gap-5 p-5 sm:p-6 text-left font-bold text-base sm:text-lg select-none"
                    aria-expanded={isOpen}
                    data-testid={`button-faq-${actualIndex}`}
                  >
                    <span className="group-hover:text-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
                      {question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[hsl(var(--secondary))] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div
                      className="border-t border-[hsl(var(--border))] px-6 pb-6 pt-4 text-base sm:text-lg leading-8 text-[hsl(var(--foreground)/.85)] bg-[hsl(var(--muted)/.15)]"
                      data-testid={`text-faq-answer-${actualIndex}`}
                    >
                      {answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
              <CircleHelp className="mx-auto text-[hsl(var(--secondary))]" />
              <p className="mt-4 font-bold text-lg">No matching questions</p>
              <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">
                Try a shorter search, or email the scientific coordination team.
              </p>
            </div>
          )}

          <div className="card-lift mt-16 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm">
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">
              Need further assistance?
            </p>
            <p className="mt-3 max-w-2xl text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]">
              For questions regarding abstract guidelines or technical issues, contact{' '}
              <a
                href="mailto:abstracts@streamconferences.com"
                className="font-bold text-[hsl(var(--secondary))] hover:underline"
                data-testid="link-faq-email"
              >
                abstracts@streamconferences.com
              </a>
              .
            </p>
            <Link href="/contact" className="btn-main btn-quiet mt-6" data-testid="link-faq-contact">
              Contact us <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function AbstractSubmissionGuidelinesPage() {
  const tracks = [
    { letter: 'S', title: 'Sciences' },
    { letter: 'T', title: 'Technology' },
    { letter: 'R', title: 'Research' },
    { letter: 'E', title: 'Engineering' },
    { letter: 'A', title: 'Academic' },
    { letter: 'M', title: 'Medical' },
  ];

  const presentationFormats = [
    {
      title: 'Keynote / Plenary Talk',
      desc: 'Reserved for distinguished speakers and senior authorities (25–30 minutes).',
    },
    {
      title: 'Oral Presentation',
      desc: 'Standard research presentation (15–20 minutes, including Q&A).',
    },
    {
      title: 'Poster Presentation',
      desc: 'Visual display during dedicated poster sessions with live interactive Q&A.',
    },
    {
      title: 'Virtual / Online Presentation',
      desc: 'Recorded or live-streamed presentation for remote delegates.',
    },
  ];

  const formattingReqs = [
    {
      label: 'Title',
      text: 'Maximum 25 words. Concise, descriptive, and written in Title Case.',
    },
    {
      label: 'Author Details',
      text: 'Full names, institutional affiliations, city, country, and email address of the presenting author and co-authors. Mark the corresponding/presenting author with an asterisk (*).',
    },
    {
      label: 'Word Limit',
      text: '250 to 350 words (excluding title, authors, and affiliations).',
    },
    {
      label: 'Keywords',
      text: '3 to 6 relevant keywords separated by semicolons.',
    },
  ];

  const coreStructure = [
    {
      title: 'Background / Objectives',
      desc: 'Clearly state the research problem, context, and primary objective.',
    },
    {
      title: 'Methods / Methodology',
      desc: 'Describe the research design, dataset, experimental setup, or analytical framework.',
    },
    {
      title: 'Results / Findings',
      desc: 'Summarize the key quantitative or qualitative findings (avoid vague statements like "results will be discussed").',
    },
    {
      title: 'Conclusion / Significance',
      desc: 'Highlight the theoretical contribution, practical impact, or industrial application of the work.',
    },
  ];

  const terms = [
    {
      title: 'Originality',
      desc: 'Submissions must represent original research that has not been published or accepted for publication in a peer-reviewed journal prior to the event.',
    },
    {
      title: 'Ethics Approval',
      desc: 'Studies involving human participants or animal subjects must state compliance with ethical standards and institutional approvals.',
    },
    {
      title: 'Registration Requirement',
      desc: 'At least one author of an accepted abstract must register for the conference to present the work and have the abstract published in the official conference proceedings.',
    },
    {
      title: 'Commercial Bias',
      desc: 'Abstracts promoting commercial products, services, or proprietary marketing content without scientific merit will be rejected.',
    },
  ];

  const steps = [
    'Prepare your abstract using the standard Stream Conferences Abstract Template (.docx format).',
    'Access the online submission portal via the "Submit Abstract" button on the event webpage.',
    'Fill out the required author information and select your primary presentation track and format.',
    'Upload your abstract document and receive an automated confirmation email with your unique Submission ID.',
  ];

  return (
    <Layout>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
        eyebrow="Author & Presenter Portal"
        title="Abstract Submission Guidelines"
        body="Stream Conferences invites researchers, clinicians, academicians, and industry leaders to submit original abstracts for oral, poster, and virtual presentations at our upcoming global events. All submissions undergo a rigorous double-blind peer review by our Scientific Advisory Board to ensure high academic and professional standards."
      />
      <main className="pt-6 pb-16">
        <div className="container-wide w-full max-w-none">
          {/* Review turnaround notification banner */}
          <div className="card-lift cursor-pointer mb-10 rounded-2xl border border-[hsl(var(--secondary)/.3)] bg-[hsl(var(--secondary)/.08)] p-6 text-base sm:text-lg leading-8 flex items-center gap-4">
            <Clock className="text-[hsl(var(--secondary))] shrink-0" size={24} />
            <div>
              <span className="font-bold text-[hsl(var(--foreground))]">Review Turnaround: </span>
              <span className="text-[hsl(var(--muted-foreground))]">Notification of Acceptance is sent within <strong>5–7 business days</strong> after abstract submission.</span>
            </div>
          </div>

          <div className="grid gap-12">
            {/* 1. Submission Categories & Tracks */}
            <section className="border-b border-[hsl(var(--border))] pb-10">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))] mb-2">01</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl font-bold">Submission Categories & Tracks</h2>
              <p className="mt-3 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]">
                Abstracts are accepted across all major conference tracks:
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                {tracks.map((track) => (
                  <div key={track.letter} className="card-lift group cursor-pointer flex items-center gap-3.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-base font-semibold text-[hsl(var(--foreground))]">
                    <CheckCircle2 size={18} className="text-[hsl(var(--secondary))] shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:text-[hsl(var(--secondary))] transition-colors"><strong className="text-[hsl(var(--secondary))] font-bold">{track.letter}</strong> - {track.title}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Presentation Formats */}
            <section className="border-b border-[hsl(var(--border))] pb-10">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))] mb-2">02</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl font-bold">Presentation Formats</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {presentationFormats.map((pf) => (
                  <div key={pf.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg sm:text-xl text-[hsl(var(--foreground))]">{pf.title}</h3>
                      <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))]">{pf.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Abstract Formatting Requirements */}
            <section className="border-b border-[hsl(var(--border))] pb-10">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))] mb-2">03</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl font-bold">Abstract Formatting Requirements</h2>
              <p className="mt-3 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]">
                All abstracts must be written in clear, concise English and adhere to the following structure:
              </p>
              <div className="mt-6 grid gap-4">
                {formattingReqs.map((req) => (
                  <div key={req.label} className="card-lift rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-base leading-7">
                    <span className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))]">{req.label}: </span>
                    <span className="text-[hsl(var(--muted-foreground))]">{req.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[hsl(var(--muted))] p-7">
                <h3 className="font-bold text-lg sm:text-xl text-[hsl(var(--foreground))] mb-4">Core Structure</h3>
                <div className="grid gap-4">
                  {coreStructure.map((cs) => (
                    <div key={cs.title} className="card-lift rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-base leading-7">
                      <span className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))]">{cs.title}: </span>
                      <span className="text-[hsl(var(--muted-foreground))]">{cs.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Submission Terms & Conditions */}
            <section className="border-b border-[hsl(var(--border))] pb-10">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))] mb-2">04</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl font-bold">Submission Terms & Conditions</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {terms.map((t) => (
                  <div key={t.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
                    <h3 className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] flex items-center gap-2.5">
                      <FileText size={18} className="text-[hsl(var(--secondary))]" />
                      {t.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))]">{t.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. How to Submit */}
            <section className="pb-4">
              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))] mb-2">05</p>
              <h2 className="display mt-2 text-2xl sm:text-3xl font-bold">How to Submit</h2>
              <div className="mt-6 grid gap-4">
                {steps.map((step, idx) => (
                  <div key={idx} className="card-lift flex gap-4 items-start rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-base sm:text-lg leading-8">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-xs font-bold text-white mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[hsl(var(--foreground))]">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-[hsl(var(--muted))] p-8">
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">Technical Support & Inquiries</p>
                <p className="mt-2 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]">
                  For inquiries or technical support regarding abstract submissions, please contact{' '}
                  <a href="mailto:abstracts@streamconferences.com" className="font-bold text-[hsl(var(--secondary))] hover:underline">
                    abstracts@streamconferences.com
                  </a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function GuidelinesPage() {
  const sections = [['Presentation day checklist', ['Arrive 30 minutes before your session.', 'Check in at the speaker desk and confirm your file.', 'Keep a backup copy on a USB drive and in cloud storage.', 'Stay for questions and support the presenters after you.']], ['Poster presentation specifications', ['A0 or A1 portrait orientation.', 'Export at print-ready resolution with accessible type sizes.', 'Include title, authors, affiliations, methods, results, and contact.', 'Mounting boards and pins are provided by the secretariat at the venue.']], ['AV & room support', ['HDMI presentation connection and confidence monitor.', 'Session chair, handheld microphone, and venue Wi-Fi.', 'Technical rehearsal windows published in the final program.', 'Tell the speaker desk about accessibility requirements early.']], ['Code of conduct', ['Be generous with questions and precise with critique.', 'Respect consent, privacy, and intellectual property.', 'No harassment, discrimination, or commercial promotion.', 'Raise concerns with the organizing committee promptly.']]];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" eyebrow="Practical notes" title="Arrive ready to contribute." body="A short field guide for presenters and delegates to optimize their conference experience and presentation sessions." /><main className="pt-6 pb-16"><div className="container-wide grid gap-5 md:grid-cols-2">{sections.map(([title, items], i) => <div key={String(title)} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8" data-testid={`card-guideline-${i}`}><span className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">0{i + 1}</span><h2 className="display mt-4 text-2xl font-bold">{title}</h2><ul className="mt-6 grid gap-4">{(items as string[]).map((item) => <li key={item} className="flex gap-3 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))]"><Check size={18} className="mt-1.5 shrink-0 text-[hsl(var(--secondary))]" />{item}</li>)}</ul></div>)}</div></main></Layout>;
}

function TermsPage() {
  const sections = [['Registration & payment terms', 'Registration rates, inclusions, taxes, and payment processing details are finalized in the official prospectus. A registration is confirmed only after successful payment and written confirmation.'], ['Cancellation & refund policy', 'Cancellation requests must be made in writing. Full refunds (less standard administration fees) are available up to 30 days prior to the conference. Transfers to alternate delegates are permitted.'], ['Abstract & publication rights', 'Authors retain ownership of their work while granting the conference a non-exclusive right to display accepted material in conference materials and official digital proceedings. DOI and ISBN assignment are subject to editorial review.'], ['Code of conduct', 'All delegates are expected to participate with respect, integrity, and professional care. Harassment, discrimination, intimidation, and unauthorized commercial promotion are not permitted.'], ['Liability', 'Attendees participate at their own risk. The organizers are not responsible for loss, travel disruption, or personal injury beyond the protections required by applicable law.'], ['Force majeure', 'If circumstances beyond reasonable control affect the event, the organizers may reschedule, change format, or cancel the event. Final remedies and notices will be defined in the reviewed policy.']];
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80" eyebrow="The fine print" title="Terms & conditions." body="Official terms of attendance, cancellation policies, intellectual property rights, and code of conduct standards for all delegates." /><main className="pt-6 pb-16"><div className="container-wide w-full max-w-none"><div className="mb-10 rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.12)] p-6 text-base sm:text-lg leading-8"><ShieldCheck className="mr-2.5 inline text-[hsl(var(--secondary))]" size={20} /> Official delegate terms for the 2027 International Conference on Medical, Life & Health Sciences.</div><div className="grid gap-10">{sections.map(([title, text], i) => <section key={title} className="border-b border-[hsl(var(--border))] pb-8"><p className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">0{i + 1}</p><h2 className="display mt-2 text-2xl font-bold">{title}</h2><p className="mt-4 text-base sm:text-lg leading-8 text-[hsl(var(--muted-foreground))] text-justify">{text}</p></section>)}</div></div></main></Layout>;
}

function ContactPage() {
  const [location] = useLocation();
  const eventSlug = new URLSearchParams(window.location.search).get('event') || '';
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [inquiryType, setInquiryType] = useState('General');
  const [conferenceName, setConferenceName] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/contacts/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          country,
          subject: inquiryType,
          conference: conferenceName,
          message,
          eventSlug: eventSlug || undefined,
        }),
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
    setCountry('');
    setInquiryType('General');
    setConferenceName('');
    setMessage('');
    setSent(false);
  };

  const departments = [
    [
      'General & Delegate Inquiries',
      'info@streamconferences.com',
      'For questions regarding upcoming events, registration details, or general information.',
    ],
    [
      'Abstract Submissions & Speaker Desk',
      'abstracts@streamconferences.com',
      'For inquiries related to abstract guidelines, submission status, presentation formats, or scientific committee reviews.',
    ],
    [
      'Publishing & Research Indexing',
      'publishing@streamconferences.com',
      'For information regarding conference proceedings, DOI assignments, or journal publication partnerships.',
    ],
    [
      'Sponsorships & Strategic Partnerships',
      'partners@streamconferences.com',
      'For corporate organizations, institutions, and industry leaders seeking high-impact event sponsorship and exhibit opportunities.',
    ],
  ];

  return (
    <Layout>
      <PageHero
        bgImage="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
        eyebrow="Contact Us"
        title="Get in Touch with Stream Conferences"
        body="Whether you are looking to present groundbreaking research, inquire about conference registration, explore healthcare publishing opportunities, or discuss corporate sponsorship, our dedicated team is here to assist you. Reach out to the appropriate department below, and a representative will respond within 24 to 48 business hours."
      />
      <main>
        <section className="section-pad">
          <div className="container-wide">
            <h2 className="display text-2xl font-bold mb-6">Departmental Inquiries</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {departments.map(([title, email, body], i) => (
                <div
                  key={email}
                  className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
                  data-testid={`card-contact-${i}`}
                >
                  <Mail className="text-[hsl(var(--secondary))]" size={21} />
                  <h3 className="display mt-6 text-xl sm:text-2xl font-bold">{title}</h3>
                  <p className="mt-3 text-base sm:text-lg leading-7 text-[hsl(var(--muted-foreground))] font-medium">{body}</p>
                  <a
                    href={`mailto:${email}`}
                    className="mt-5 inline-block text-base sm:text-lg font-bold text-[hsl(var(--secondary))] hover:underline"
                    data-testid={`link-contact-email-${i}`}
                  >
                    {email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-pad bg-[hsl(var(--card))]">
          <div className="container-wide grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <SectionTitle
                eyebrow="Global Headquarters"
                title="Stream Conferences"
                body="100 Federal Street, Boston, MA 02110, USA"
              />
              <div className="mt-7 grid gap-3 text-sm">
                <p className="flex items-center gap-3">
                  <Phone size={17} className="text-[hsl(var(--secondary))]" /> +1 (617) 555-0199
                </p>
                <p className="flex items-center gap-3">
                  <Clock3 size={17} className="text-[hsl(var(--secondary))]" /> Monday – Friday: 9:00 AM – 6:00 PM (EST)
                </p>
              </div>
            </div>

            {sent ? (
              <SuccessState
                title="Message Sent"
                body="Have a quick question? Our coordination team has received your message and will get back to you promptly within 24 to 48 business hours."
                reset={handleReset}
                testId="status-contact-success"
              />
            ) : (
              <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xs">
                <div className="mb-2">
                  <h3 className="display text-xl font-bold">Send Us a Message</h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Have a quick question? Complete the form below, and our coordination team will get back to you promptly.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Full Name *</label>
                    <input
                      required
                      className="form-field w-full"
                      placeholder="e.g. Dr. Sarah Jenkins"
                      aria-label="Full Name"
                      data-testid="input-contact-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Email Address *</label>
                    <input
                      required
                      type="email"
                      className="form-field w-full"
                      placeholder="e.g. sarah.jenkins@example.com"
                      aria-label="Email Address"
                      data-testid="input-contact-email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Phone Number</label>
                    <input
                      className="form-field w-full"
                      placeholder="e.g. +1 555-0199"
                      aria-label="Phone Number"
                      data-testid="input-contact-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Country</label>
                    <input
                      className="form-field w-full"
                      placeholder="e.g. United States"
                      aria-label="Country"
                      data-testid="input-contact-country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Inquiry Type *</label>
                  <select
                    required
                    className="form-field w-full cursor-pointer bg-[hsl(var(--card))]"
                    aria-label="Inquiry Type"
                    data-testid="select-contact-inquiry-type"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                  >
                    <option value="General">General Inquiry</option>
                    <option value="Abstract Submission">Abstract Submission</option>
                    <option value="Publishing">Publishing & Research Indexing</option>
                    <option value="Sponsorship">Sponsorship & Strategic Partnerships</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Conference Name (if applicable)</label>
                  <input
                    className="form-field w-full"
                    placeholder="e.g. ICMLHS 2027"
                    aria-label="Conference Name"
                    data-testid="input-contact-conference"
                    value={conferenceName}
                    onChange={(e) => setConferenceName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-[hsl(var(--muted-foreground))]">Message *</label>
                  <textarea
                    required
                    className="form-field w-full min-h-32"
                    placeholder="Write your message or question here..."
                    aria-label="Message"
                    data-testid="input-contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-main btn-primary cursor-pointer mt-2" data-testid="button-submit-contact">
                  Send Us a Message <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}

function EventDetailsPage({ type = 'conference' }: { type?: 'conference' }) {
  const { slug = '' } = useParams<{ slug: string }>();
  const { conferences } = useContext(APIContext);
  const pool = conferences;
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
  const registerHref = subdomainUrl(item, '/register') || `/register?event=${encodeURIComponent(item.eventId || item.slug || item._id)}`;
  const fees: { type: string; dateLabel: string; usd: number; gbp: number; eur: number }[] = Array.isArray(item.fees) ? item.fees : [];

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
            {item.startTime || item.endTime ? <span className="inline-flex items-center gap-1.5"><Clock3 size={15} />{formatTime12h(item.startTime) || '—'} – {formatTime12h(item.endTime) || '—'}</span> : null}
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
              <div className="mt-6 w-full space-y-6">
                {(() => {
                  const feeGrouped = new Map<string, any[]>();
                  for (const f of fees) {
                    const key = f.type || 'General';
                    if (!feeGrouped.has(key)) feeGrouped.set(key, []);
                    feeGrouped.get(key)!.push(f);
                  }
                  return Array.from(feeGrouped.entries()).map(([type, items]) => (
                    <div key={type} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
                      <div className="px-6 py-3.5 bg-[#f0f4f9] dark:bg-slate-900/60 border-b border-[hsl(var(--border))]">
                        <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[hsl(var(--foreground))] uppercase tracking-wider">{type}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="bg-[hsl(var(--muted)/.4)] text-[hsl(var(--foreground))] font-bold text-xs uppercase tracking-wider border-b border-[hsl(var(--border))]">
                            <tr>
                              <th className="px-6 py-3.5 w-[40%]">HEADING</th>
                              <th className="px-6 py-3.5 text-center w-[20%]">EUR (€)</th>
                              <th className="px-6 py-3.5 text-center w-[20%]">USD ($)</th>
                              <th className="px-6 py-3.5 text-center w-[20%]">GBP (£)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[hsl(var(--border))]">
                            {items.map((f: any, i: number) => (
                              <tr key={i} className="hover:bg-[hsl(var(--muted)/.3)] transition-colors">
                                <td className="px-6 py-3.5 font-semibold text-[hsl(var(--foreground))]">{f.dateLabel || 'Standard'}</td>
                                <td className="px-6 py-3.5 text-center font-mono font-bold text-[hsl(var(--foreground))]">€{Number(f.eur || 0).toLocaleString()}</td>
                                <td className="px-6 py-3.5 text-center font-mono font-bold text-[hsl(var(--foreground))]">${Number(f.usd || 0).toLocaleString()}</td>
                                <td className="px-6 py-3.5 text-center font-mono font-bold text-[hsl(var(--foreground))]">£{Number(f.gbp || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {(Array.isArray(item.tracks) && item.tracks.length > 0) && (
              <div>
                <SectionTitle eyebrow="Scientific tracks" title="Explore the tracks." body="Follow the thematic areas covered by this event." />
                <div className="mt-6 grid gap-4">
                  {item.tracks.map((track: any, i: number) => (
                    <div key={i} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
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
                      <p>{formatTime12h(item.startTime)}</p>
                    </div>
                  </div>
                )}
                {item.endTime && (
                  <div className="flex items-start gap-3">
                    <Clock3 size={16} className="mt-0.5 shrink-0 text-[hsl(var(--secondary))]" />
                    <div>
                      <p className="font-semibold text-[hsl(var(--foreground))]">End Time</p>
                      <p>{formatTime12h(item.endTime)}</p>
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
              <a target="_blank" rel="noopener noreferrer" href={subdomainUrl(item, '/register') || `/register?event=${encodeURIComponent(item.slug || item._id)}`} className="btn-main btn-primary mt-5 w-full justify-center">Register Now <ArrowUpRight size={16} /></a>
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
      <main className="pt-6 pb-16">
        <div className="container-wide">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {insightsList.length > 0 ? insightsList.map((insight, index) => (
              <div key={insight.id || insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full shadow-sm">
                <div className="p-6 flex-1">
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-5 bg-[hsl(var(--muted)/.25)] flex items-center justify-center relative">
                    {insight.bannerUrl ? (
                      <img 
                        src={mediaUrl(insight.bannerUrl)} 
                        alt={insight.title} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] opacity-90 flex items-center justify-center">
                        <BookOpen className="text-[hsl(var(--primary-foreground))] opacity-65" size={32} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[.18em] text-[hsl(var(--secondary))]">{insight.label}</span>
                  <h3 className="display mt-3 text-xl font-bold leading-snug text-[hsl(var(--foreground))]">{insight.title}</h3>
                  <p className="mt-3 text-base leading-7 text-[hsl(var(--muted-foreground))]">{insight.copy}</p>
                </div>
                <div className="px-6 pb-6 pt-0">
                  <Link href={`/blog/${encodeURIComponent(insight.id)}`} className="inline-flex items-center gap-2 text-base font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--accent))] transition" data-testid={`link-blog-read-${index}`}>
                    Read field note <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]">
                <p className="text-base sm:text-lg">No blog posts have been published yet. Please check back later.</p>
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
  const authorInitials = getNameInitials(authorName, 'SC');

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




function ConferencesPage() {
  const [location] = useLocation();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const statusParam: Status = searchParams.get('status') === 'past' ? 'past' : 'upcoming';

  return (
    <Layout>
      <PageHero 
        bgImage="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80" 
        eyebrow="The conference calendar" 
        title="Meetings with a point of view." 
        body="Find your next place to present, listen, challenge, and leave with better work." 
      />
      <main className="pt-6 pb-16">
        <div className="container-wide">
          <EventList key={`${location}-${statusParam}-${typeof window !== 'undefined' ? window.location.search : ''}`} initial={statusParam} onlyType="Conference" />
        </div>
      </main>
    </Layout>
  );
}

function MediaPartnersPage() {
  const { mediaPartners } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80" eyebrow="The amplification network" title="Media partners." body="Organizations that carry our conversations further and keep our community informed." /><main className="pt-6 pb-16"><div className="container-wide"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{mediaPartners.length > 0 ? mediaPartners.map((partner) => <div key={partner._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{partner.logo ? <img src={mediaUrl(partner.logo)} alt={partner.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Building2 size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]">{partner.name}</h3>{partner.description && <p className="mt-2 text-base leading-7 text-[hsl(var(--muted-foreground))]">{partner.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p className="text-base sm:text-lg">No media partners have been added yet.</p></div>}</div></div></main></Layout>;
}

function CollaboratorsPage() {
  const { collaborators } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80" eyebrow="Working together" title="Collaborators." body="Institutions, partners, and research groups advancing the summit with us." /><main className="pt-6 pb-16"><div className="container-wide"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{collaborators.length > 0 ? collaborators.map((collaborator) => <div key={collaborator._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{collaborator.logo ? <img src={mediaUrl(collaborator.logo)} alt={collaborator.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Handshake size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]">{collaborator.name}</h3>{collaborator.description && <p className="mt-2 text-base leading-7 text-[hsl(var(--muted-foreground))]">{collaborator.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p className="text-base sm:text-lg">No collaborators have been added yet.</p></div>}</div></div></main></Layout>;
}

function ExhibitorsPage() {
  const { exhibitors } = useContext(APIContext);
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" eyebrow="On the floor" title="Exhibitors." body="Organizations showcasing the tools, services, and ideas shaping their fields." /><main className="pt-6 pb-16"><div className="container-wide"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{exhibitors.length > 0 ? exhibitors.map((exhibitor) => <div key={exhibitor._id} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 flex items-start gap-4">{exhibitor.logo ? <img src={mediaUrl(exhibitor.logo)} alt={exhibitor.name} className="h-14 w-14 rounded-xl object-contain border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] shrink-0" /> : <div className="h-14 w-14 rounded-xl bg-[hsl(var(--muted)/.4)] flex items-center justify-center text-[hsl(var(--muted-foreground))] shrink-0"><Store size={20} /></div>}<div className="min-w-0"><h3 className="display text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]">{exhibitor.name}</h3>{exhibitor.description && <p className="mt-2 text-base leading-7 text-[hsl(var(--muted-foreground))]">{exhibitor.description}</p>}</div></div>) : <div className="col-span-full py-16 text-center text-[hsl(var(--muted-foreground))]"><p className="text-base sm:text-lg">No exhibitors have been added yet.</p></div>}</div></div></main></Layout>;
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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return <RoutedErrorBoundary><ScrollToTop /><Switch><Route path="/" component={Home} /><Route path="/about" component={AboutPage} /><Route path="/abstract-submission-guidelines" component={AbstractSubmissionGuidelinesPage} /><Route path="/program" component={ProgramPage} /><Route path="/speakers" component={SpeakersPage} /><Route path="/gallery" component={GalleryPage} /><Route path="/blog" component={BlogPage} /><Route path="/blog/:slug" component={BlogDetailPage} /><Route path="/conferences" component={ConferencesPage} /><Route path="/brochure" component={BrochurePage} /><Route path="/venue" component={VenuesPage} /><Route path="/venues" component={VenuesPage} /><Route path="/sponsors" component={SponsorsPage} /><Route path="/media-partners" component={MediaPartnersPage} /><Route path="/collaborators" component={CollaboratorsPage} /><Route path="/exhibitors" component={ExhibitorsPage} /><Route path="/mentors/:username" component={MentorDetailsPage} /><Route path="/thank-you" component={ThankYouPage} /><Route path="/terms" component={TermsPage} /><Route path="/faq" component={FAQPage} /><Route path="/guidelines" component={GuidelinesPage} /><Route path="/contact" component={ContactPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  const detected = detectSubdomainInfo(window.location.hostname, window.location.pathname, window.location.search);
  if (detected) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <EventMicrosite subdomain={detected.subdomain} customBase={detected.customBase} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }
  return <QueryClientProvider client={queryClient}><TooltipProvider><APIProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></APIProvider></TooltipProvider></QueryClientProvider>;
}

export default App;
