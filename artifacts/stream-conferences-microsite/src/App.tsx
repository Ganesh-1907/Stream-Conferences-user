import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
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
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
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
const pastConferences = [
  { year: '2025', title: 'Global Summit on Clinical Translation', city: 'Singapore · Hybrid', focus: 'Clinical practice, translational medicine, and healthcare systems' },
  { year: '2024', title: 'International Forum on Life Science Innovation', city: 'Berlin · Germany', focus: 'Biotech, pharma, research publishing, and emerging scholars' },
  { year: '2023', title: 'World Congress of Engineering & Medical Technology', city: 'Dubai · UAE', focus: 'Engineering, medical devices, digital health, and applied science' },
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

const speakerImages: Record<string, string> = {
  'Dr. Amina Rahman': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'Prof. James T. Cole': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
  'Dr. Mei Kwan': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  'Dr. Lucia Santos': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  'Prof. Charles Sterling': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  'Dr. Marcus Vance': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
  'Sarah Jenkins': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
};

const blogImages = [
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
];

const insights = [
  { label: 'FIELD NOTE · 08 MIN', title: 'What happens when disciplines stop working in parallel?', copy: 'A working brief on shared language, better questions, and the collaborations waiting in the middle.' },
  { label: 'PROCEEDINGS', title: 'The evidence is in the exchange.', copy: 'Selected findings from our latest rooms.' },
  { label: 'JOURNAL', title: 'Signals worth following.', copy: 'A new editorial surface is taking shape.' },
];

type Status = 'upcoming' | 'past';
type EventItem = { id: string; day: string; month: string; type: 'Conference' | 'Webinar'; title: string; location: string; date: Status; speaker?: string };

const events: EventItem[] = [
  { id: 'med-27', day: '12–14', month: 'MAR 27', type: 'Conference', title: 'International Conference on Medical, Life & Health Sciences', location: 'Boston, Massachusetts · Hybrid', date: 'upcoming' },
  { id: 'ai-27', day: '08–09', month: 'MAY 27', type: 'Conference', title: 'Applied Intelligence & Emerging Technologies Forum', location: 'Singapore · In person', date: 'upcoming' },
  { id: 'web-26', day: '22', month: 'OCT 26', type: 'Webinar', title: 'Precision systems: turning data into better decisions', location: 'Online · 14:00 UTC', date: 'upcoming', speaker: 'Dr. Amina Rao' },
  { id: 'climate-26', day: '04', month: 'DEC 26', type: 'Webinar', title: 'Engineering resilient cities under pressure', location: 'Online · 16:00 UTC', date: 'upcoming', speaker: 'Prof. Daniel Okafor' },
  { id: 'past-25', day: '18–20', month: 'NOV 25', type: 'Conference', title: 'Global Forum on Research Translation', location: 'Copenhagen · Hybrid', date: 'past' },
  { id: 'past-web', day: '07', month: 'JUN 25', type: 'Webinar', title: 'The evidence gap: building trust in public health', location: 'Online · 13:00 UTC', date: 'past', speaker: 'Dr. Leila Morgan' },
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
              <div className="flex flex-col items-center justify-center shrink-0 w-16 h-16 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl text-center">
                <b className="text-xl font-bold tracking-tight display leading-none">{e.day}</b>
                <span className="text-[9px] font-bold tracking-widest uppercase mt-1 label leading-none">{e.month}</span>
              </div>
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
              </div>
              <Link href="/contact" className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] transition-colors" aria-label={`View ${e.title}`}>
                <ArrowDownRight size={16} />
              </Link>
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
  loading: boolean;
  error: boolean;
}

const APIContext = createContext<APIContextType>({
  conferences: [],
  webinars: [],
  blogs: [],
  events: [],
  insightsList: [],
  loading: false,
  error: false
});

function APIProvider({ children }: { children: ReactNode }) {
  const [conferences, setConferences] = useState<any[]>([]);
  const [webinars, setWebinars] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [confRes, webRes, blogRes] = await Promise.all([
          fetch('http://localhost:3000/api/conferences'),
          fetch('http://localhost:3000/api/webinars'),
          fetch('http://localhost:3000/api/blogs')
        ]);
        
        if (!confRes.ok || !webRes.ok || !blogRes.ok) {
          throw new Error('API fetch failed');
        }

        const confData = await confRes.json();
        const webData = await webRes.json();
        const blogData = await blogRes.json();

        if (active) {
          setConferences(confData);
          setWebinars(webData);
          setBlogs(blogData);
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
      day: c.day,
      month: c.month,
      type: 'Conference',
      title: c.title,
      location: c.location,
      date: c.date,
      description: c.description
    }));

    const normalizedWebs: EventItem[] = webinars.map((w: any) => ({
      id: w._id || w.id,
      day: w.day,
      month: w.month,
      type: 'Webinar',
      title: w.title,
      location: w.location,
      date: w.date,
      speaker: w.speaker,
      description: w.description
    }));

    const merged = [...normalizedConfs, ...normalizedWebs];
    if (merged.length === 0) {
      return events;
    }
    return merged;
  }, [conferences, webinars]);

  const insightsList = useMemo(() => {
    if (blogs.length === 0) {
      return insights;
    }
    return blogs.map((b: any) => ({
      label: b.label || 'FIELD NOTE',
      title: b.title,
      copy: b.copy,
      content: b.content
    }));
  }, [blogs]);

  return (
    <APIContext.Provider value={{ conferences, webinars, blogs, events: eventsList, insightsList, loading, error }}>
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
        ['/itinerary', 'Itinerary Schedule', 'Day-by-day speaker schedules and agenda'],
        ['/speakers', 'OCM & Speakers', 'Meet our organizing committee and faculty'],
        ['/venue', 'Venue & Travel', 'Seaport Convention Center details and travel info'],
        ['/submit-abstract', 'Submit Abstract', 'Send your original research paper for review']
      ]
    },
    {
      id: 'events-webinars',
      label: 'Events & Webinars',
      items: [
        ['/conferences', 'Conferences Calendar', 'Browse upcoming and past scientific conferences'],
        ['/webinars', 'Webinars Calendar', 'Join our digital panels and online clinical seminars'],
        ['/past-conferences', 'Past Editions', 'Summaries and proceedings of past convocations'],
        ['/gallery', 'Event Gallery', 'Photos and highlights of scientific convocations']
      ]
    },
    {
      id: 'media-support',
      label: 'Media & Support',
      items: [
        ['/blog', 'Insights Blog', 'Latest news, field notes, and medical updates'],
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
                      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 grid gap-1.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 shadow-2xl shadow-[hsl(var(--primary)/.13)] transition-all duration-200 ${
                        group.id === 'conference-info' ? 'w-[520px] grid-cols-2' :
                        group.id === 'media-support' ? 'w-[520px] grid-cols-2' :
                        'w-[280px] grid-cols-1'
                      }`}
                      data-testid={`dropdown-nav-group-${group.id}`}
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
            <a href="#program" data-testid="link-subnav-program">Program</a><a href="#speakers" data-testid="link-subnav-speakers">Speakers</a><Link href="/venue" data-testid="link-subnav-venue">Venue</Link><Link href="/submit-abstract" data-testid="link-subnav-submit-abstract">Submit Abstract <ArrowUpRight className="inline" size={13} /></Link>
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
      <div><p className="label text-[hsl(var(--accent))]">Explore</p><div className="mt-5 grid gap-3 text-sm text-[hsl(var(--primary-foreground)/.72)]"><Link href="/about" data-testid="link-footer-about">About Stream Conferences</Link><Link href="/program" data-testid="link-footer-program">Program</Link><Link href="/speakers" data-testid="link-footer-speakers">OCM & Speakers</Link><Link href="/gallery" data-testid="link-footer-gallery">Gallery</Link><Link href="/blog" data-testid="link-footer-blog">Blog</Link><Link href="/past-conferences" data-testid="link-footer-past-conferences">Past conferences</Link><Link href="/venue" data-testid="link-footer-venue">Venue</Link><Link href="/brochure" data-testid="link-footer-brochure">Brochure</Link></div></div>
      <div><p className="label text-[hsl(var(--accent))]">Delegate desk</p><div className="mt-5 grid gap-3 text-sm text-[hsl(var(--primary-foreground)/.72)]"><a href="mailto:info@streamconferences.com" data-testid="link-footer-email">info@streamconferences.com</a><a href="mailto:abstracts@streamconferences.com" data-testid="link-footer-abstracts">abstracts@streamconferences.com</a><Link href="/contact" data-testid="link-footer-contact">Contact the secretariat</Link></div></div>
    </div>
    <div className="container-wide flex flex-col justify-between gap-3 border-t border-[hsl(var(--primary-foreground)/.15)] py-5 text-[11px] text-[hsl(var(--primary-foreground)/.55)] sm:flex-row"><span>© 2027 Stream Conferences. All rights reserved.</span><span>ICMLHS 2027 · Boston, USA</span></div>
  </footer>;
}

function Layout({ children }: { children: ReactNode }) {
  return <div className="site-grain min-h-[100dvh]"><SiteHeader />{children}<Footer /></div>;
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
  return <div className={light ? 'text-[hsl(var(--primary-foreground))]' : ''}><p className={`label ${light ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>{eyebrow}</p><h2 className="display mt-4 max-w-2xl text-balance text-3xl font-bold leading-[1.08] tracking-[-.045em] md:text-5xl">{title}</h2>{body && <p className={`mt-5 max-w-2xl text-base leading-7 ${light ? 'text-[hsl(var(--primary-foreground)/.7)]' : 'text-[hsl(var(--muted-foreground))]'}`}>{body}</p>}</div>;
}

function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string; bgImage?: string }) {
  return (
    <section className="page-intro bg-grid">
      <div className="container-wide section-pad reveal">
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
            className="relative aspect-[16/9] w-full overflow-hidden rounded-[16px] transition-all duration-700 ease-in-out"
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
  const { insightsList } = useContext(APIContext);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  return <Layout>
    <main>
      <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
        <div className="hero-grid absolute inset-0 opacity-75" />
        <div className="container-wide relative grid min-h-[680px] items-center gap-12 pb-16 pt-20 md:grid-cols-[1fr_1fr] md:pb-24 md:pt-28">
          <div className="reveal"><img src="/logo.jpg" className="h-20 w-20 rounded-2xl object-cover mb-8 border border-[hsl(var(--primary-foreground)/.15)] shadow-xl" alt="Stream Conferences Logo" /><div className="flex items-center gap-3"><span className="label rounded-full border border-[hsl(var(--accent)/.55)] px-3 py-1.5 text-[hsl(var(--accent))]">Annual Scientific Summit</span><span className="label text-[hsl(var(--primary-foreground)/.5)]">SC / 27</span></div><h1 className="display mt-7 max-w-4xl text-balance text-5xl font-bold leading-[.94] tracking-[-.07em] md:text-8xl">The science of <span className="text-[hsl(var(--accent))]">moving forward.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[hsl(var(--primary-foreground)/.68)]">The International Conference on Medical, Life & Health Sciences brings the people who discover, test, build, and deliver better futures into one serious global conversation.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/submit-abstract" className="btn-main btn-primary" data-testid="link-hero-submit">Submit Abstract <ArrowUpRight size={16} /></Link><Link href="/conferences" className="btn-main border border-[hsl(var(--primary-foreground)/.28)] text-[hsl(var(--primary-foreground))] hover:border-[hsl(var(--accent))]" data-testid="link-hero-conferences">Events Calendar <ArrowRight size={16} /></Link></div></div>
          <div className="reveal reveal-delay-2 relative"><div className="float-mark relative ml-auto max-w-[500px] w-full overflow-hidden rounded-[22px] border border-[hsl(var(--primary-foreground)/.2)] bg-[hsl(var(--primary-foreground)/.07)] p-3 backdrop-blur-sm"><div className="relative aspect-[4/5] overflow-hidden rounded-[16px]"><img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85" alt="Audience gathered at a conference presentation" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.95)] via-[hsl(var(--primary)/.15)] to-transparent" /><div className="absolute inset-x-5 top-5 flex items-center justify-between"><span className="label rounded-full bg-[hsl(var(--primary)/.72)] px-3 py-1.5 text-[9px] text-[hsl(var(--accent))]">Field note / 001</span><Microscope size={19} className="text-[hsl(var(--accent))]" /></div><div className="absolute inset-x-5 bottom-5"><p className="display text-2xl font-bold leading-tight">“Research becomes real when disciplines stop working in parallel.”</p><div className="mt-5 flex items-center justify-between text-xs text-[hsl(var(--primary-foreground)/.68)]"><span>ICMLHS 2027</span><span>Boston / USA</span></div></div></div></div></div>
        </div>
      </section>
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="container-wide grid gap-6 py-7 md:grid-cols-[1.4fr_1fr_1fr]"><div><p className="label text-[hsl(var(--secondary))]">International Conference on</p><p className="display mt-2 text-lg font-bold">{conferenceName}</p></div><div className="flex items-center gap-3"><CalendarDays className="text-[hsl(var(--secondary))]" size={20} /><div><p className="label text-[9px] text-[hsl(var(--muted-foreground))]">Dates</p><p className="mt-1 text-sm font-semibold">{eventDate}</p></div></div><div className="flex items-center gap-3"><MapPin className="text-[hsl(var(--accent))]" size={20} /><div><p className="label text-[9px] text-[hsl(var(--muted-foreground))]">Venue</p><p className="mt-1 text-sm font-semibold">{eventVenue}</p></div></div></div></section>
      <section className="section-pad border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="container-wide grid gap-12 md:grid-cols-[1.3fr_0.7fr] md:items-center">
          <div className="reveal">
            <p className="label text-[hsl(var(--secondary))]">The Platform Philosophy</p>
            <h2 className="display mt-5 max-w-2xl text-4xl font-bold leading-[1.03] tracking-[-.05em] md:text-6xl">Not just another event. <span className="text-[hsl(var(--secondary))]">A better way to gather.</span></h2>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Stream is an independent conference platform for the people doing the work. We build precise, generous spaces for research to meet practice — across medicine, technology, engineering, and academia.</p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]"><strong>We care about the signal.</strong> Fewer filler panels, more useful questions, and programmes shaped around real problems.</p>
          </div>
          <div className="reveal reveal-delay-1 grid gap-4 grid-cols-3 md:grid-cols-1">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.25)] p-6">
              <strong className="display block text-4xl font-bold tracking-[-.06em] text-[hsl(var(--accent))] md:text-5xl">42</strong>
              <span className="label mt-2 block text-[9px] text-[hsl(var(--muted-foreground))]">Countries connected</span>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.25)] p-6">
              <strong className="display block text-4xl font-bold tracking-[-.06em] text-[hsl(var(--accent))] md:text-5xl">18k+</strong>
              <span className="label mt-2 block text-[9px] text-[hsl(var(--muted-foreground))]">Annual participants</span>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.25)] p-6">
              <strong className="display block text-4xl font-bold tracking-[-.06em] text-[hsl(var(--accent))] md:text-5xl">11+</strong>
              <span className="label mt-2 block text-[9px] text-[hsl(var(--muted-foreground))]">Years convening</span>
            </div>
          </div>
        </div>
      </section>
      <Countdown />
      <section className="section-pad bg-[hsl(var(--card))]" id="welcome"><div className="container-wide grid gap-12 md:grid-cols-[.7fr_1.3fr] md:items-center"><div className="reveal"><div className="relative aspect-[4/5] max-w-[320px] overflow-hidden rounded-[22px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg"><img src={speakerImages['Prof. Charles Sterling']} alt="Committee Chair" className="absolute inset-0 h-full w-full object-cover z-0" /><div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--primary)/.95)] via-[hsl(var(--primary)/.5)] to-transparent z-10" /><div className="relative z-20 flex h-full flex-col justify-between p-6"><span className="label text-[hsl(var(--accent))]">A welcome from the chair</span><div><p className="display text-2xl font-bold">Prof. Charles Sterling</p><p className="mt-1 text-sm text-[hsl(var(--primary-foreground)/.8)]">Chairperson · Boston Research Institute</p></div><span className="label text-[9px] text-[hsl(var(--primary-foreground)/.6)]">Scientific Committee · 2027</span></div></div></div><div className="reveal reveal-delay-1"><p className="label text-[hsl(var(--secondary))]">Welcome note</p><h2 className="display mt-5 max-w-2xl text-4xl font-bold leading-[1.03] tracking-[-.05em] md:text-6xl">A summit built for the handoff between <span className="text-[hsl(var(--secondary))]">insight</span> and impact.</h2><p className="mt-7 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Welcome to {conferenceCode}, a focused meeting place for researchers, clinicians, academicians, and industry delegates who believe the best work does not end at publication.</p><p className="mt-5 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">Across three days, we will examine the methods, technologies, and partnerships moving medical and life sciences forward. Come with a question. Leave with a sharper one—and the people to pursue it with.</p><div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-bold text-[hsl(var(--secondary))]"><span className="flex items-center gap-3"><Globe2 size={18} /> One global stage · many ways to contribute</span><Link href="/about" className="flex items-center gap-2 text-[hsl(var(--accent))]" data-testid="link-home-about">About Stream Conferences <ArrowUpRight size={15} /></Link></div></div></div></section>
      <Ticker />
      <section className="section-pad line-grid" id="program"><div className="container-wide"><SectionTitle eyebrow="Five lenses, one conversation" title="Conference tracks" body="Follow the question that matters to your work. Each track is designed to create useful friction between evidence and application." /><TrackGrid /></div></section>
      <section className="section-pad bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 md:grid-cols-[1fr_1.15fr] md:items-start"><div><SectionTitle eyebrow="Mark the milestones" title="The calendar, at a glance." body="A timeline of key benchmarks for authors, delegates, and presenting partners." /><Link href="/submit-abstract" className="btn-main btn-quiet mt-8" data-testid="link-home-dates">See submission guidelines <ArrowRight size={16} /></Link></div><div className="grid gap-3">{[['November 15, 2026', 'Early-bird abstract deadline', 'Submission'], ['January 10, 2027', 'Final abstract deadline', 'Submission'], ['Within 5–7 business days', 'Notification of acceptance', 'Review'], [eventDate, 'Conference days', 'In person · Boston']].map(([date, title, tag], index) => <div key={title} className="flex items-center gap-5 border-b border-[hsl(var(--border))] py-5" data-testid={`calendar-item-${index}`}><span className="label w-28 shrink-0 text-[10px] text-[hsl(var(--secondary))]">{tag}</span><div className="flex-1"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{date}</p></div><CalendarDays size={18} className="text-[hsl(var(--accent))]" /></div>)}</div></div></section>
      <section className="section-pad" id="speakers"><div className="container-wide"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionTitle eyebrow="People to follow" title="The room is part of the research." body="A deliberately mixed faculty of clinical authorities, technical pioneers, and emerging scholars." /><Link href="/speakers" className="btn-main btn-quiet shrink-0" data-testid="link-home-speakers">Meet the speakers <ArrowUpRight size={16} /></Link></div><div className="mt-12 grid gap-4 md:grid-cols-3"><SpeakerCard image={speakerImages['Dr. Amina Rahman']} name="Dr. Amina Rahman" role="Associate Professor of Clinical Systems" index={1} /><SpeakerCard image={speakerImages['Prof. James T. Cole']} name="Prof. James T. Cole" role="Director of Molecular Futures Laboratory" index={2} /><SpeakerCard image={speakerImages['Dr. Mei Kwan']} name="Dr. Mei Kwan" role="Principal Scientist in Health Technologies" index={3} /></div></div></section>
      <section className="section-pad border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)]"><div className="container-wide"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><SectionTitle eyebrow="A look back" title="The conversation has a history." body="Review outcomes and thematic focus areas from our previous global research exchange convocations." /><Link href="/past-conferences" className="btn-main btn-quiet shrink-0" data-testid="link-home-past-conferences">View past conferences <ArrowUpRight size={16} /></Link></div><div className="mt-10 grid gap-4 md:grid-cols-3">{pastConferences.map((item) => <div key={item.year} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><span className="label text-[hsl(var(--accent))]">{item.year} · Summit Proceedings</span><h3 className="display mt-8 text-xl font-bold leading-tight">{item.title}</h3><p className="mt-3 text-sm font-semibold text-[hsl(var(--secondary))]">{item.city}</p><p className="mt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.focus}</p></div>)}</div></div></section>
      <TestimonialCarousel />
      <GallerySlider />
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--primary))] py-16 text-[hsl(var(--primary-foreground))]"><div className="container-wide flex flex-col items-start justify-between gap-10 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--accent))]">Media partners</p><p className="display mt-4 text-2xl font-bold">Amplifying work that deserves to travel.</p></div><div className="grid grid-cols-2 gap-x-10 gap-y-5 text-sm font-bold text-[hsl(var(--primary-foreground)/.55)] sm:grid-cols-4"><span>JOURNAL OF TRANSLATIONAL MEDICINE</span><span>SCIENCEWIRE</span><span>HEALTH / REVIEW</span><span>TECHNICA</span></div></div></section>
      <section className="section-pad"><div className="container-wide grid gap-10 md:grid-cols-[.7fr_1.3fr]"><div><SectionTitle eyebrow="From the Stream Conferences blog" title="Notes for the in-between." /><Link href="/blog" className="btn-main btn-quiet mt-8" data-testid="link-home-insights">Read the blog <ArrowRight size={16} /></Link></div><div className="grid gap-4 sm:grid-cols-3">{insightsList.slice(0, 3).map((insight, index) => <div key={insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full"><div className="p-5 flex-1"><div className="aspect-video w-full rounded-lg overflow-hidden mb-4"><img src={blogImages[index % blogImages.length]} alt={insight.title} className="h-full w-full object-cover" /></div><span className="label text-[hsl(var(--accent))] text-[9px]">{insight.label}</span><h3 className="display mt-3 text-lg font-bold leading-tight">{insight.title}</h3><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{insight.copy}</p></div><div className="px-5 pb-5 pt-0"><Link href="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--secondary))]" data-testid={`link-home-blog-${index}`}>Read field note <ArrowRight size={13} /></Link></div></div>)}</div></div></section>
      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.38)] py-10"><div className="container-wide flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--secondary))]">Stay close to the conversation</p><p className="mt-2 text-sm font-semibold">Follow <span className="text-[hsl(var(--secondary))]">#ICMLHS2027</span> across the summit.</p></div><div className="flex gap-2"><a href="https://www.linkedin.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="LinkedIn" data-testid="link-social-linkedin"><Linkedin size={17} /></a><a href="https://x.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="X" data-testid="link-social-x"><X size={17} /></a><a href="https://www.youtube.com" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]" aria-label="YouTube" data-testid="link-social-youtube"><Youtube size={17} /></a></div></div></section>
      <section className="bg-[hsl(var(--accent))] py-10 text-[hsl(var(--accent-foreground))]"><div className="container-wide flex flex-col justify-between gap-6 md:flex-row md:items-center"><div><p className="label text-[hsl(var(--accent-foreground)/.65)]">Delegate secretariat</p><p className="display mt-2 text-2xl font-bold">Have a question before you arrive?</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><a href="mailto:info@streamconferences.com" className="flex items-center gap-2 font-semibold" data-testid="link-home-email"><Mail size={16} /> info@streamconferences.com</a><span className="flex items-center gap-2"><Phone size={16} /> +1 (617) 555-0199</span></div></div><Link href="/contact" className="btn-main border border-[hsl(var(--accent-foreground)/.35)]" data-testid="link-home-contact">Contact us <ArrowUpRight size={16} /></Link></div></section>
    </main>
  </Layout>;
}

function SpeakerCard({ image, name, role, index }: { image: string; name: string; role: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-lift overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]" data-testid={`card-speaker-${index}`}>
      <div className="relative h-64 overflow-hidden bg-[hsl(var(--primary))]">
        <img src={image} alt={name} className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105" />
      </div>
      <div className="p-5">
        <p className="label text-[hsl(var(--secondary))]">Invited speaker</p>
        <h3 className="display mt-3 text-xl font-bold">{name}</h3>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{role}</p>
        <button type="button" onClick={() => setOpen((value) => !value)} className="mt-5 flex items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))]" aria-expanded={open} data-testid={`button-bio-${index}`}>
          {open ? 'Hide bio' : 'View full bio'} <ChevronDown size={15} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
        {open && (
          <p className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
            A pioneer in their field, specializing in translational medicine and strategic development. Over the past decade, they have led multiple global clinical studies and published extensively in high-impact medical journals. Their session will detail new methods for bridging theoretical science with practical clinical care.
          </p>
        )}
      </div>
    </div>
  );
}

function SpeakersPage() {
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80" eyebrow="The human network" title="People who make the questions sharper." body="Meet the world-class organizing committee and invited faculty shaping the scientific agenda for ICMLHS 2027." /><main className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Organizing committee" title="The people behind the platform." body="A working committee that protects rigor while making the room generous to new ideas." /><div className="mt-10 grid gap-4 md:grid-cols-3"><SpeakerCard image={speakerImages['Prof. Charles Sterling']} name="Prof. Charles Sterling" role="Chairperson · Boston Research Institute" index={4} /><SpeakerCard image={speakerImages['Dr. Marcus Vance']} name="Dr. Marcus Vance" role="Scientific Lead · Harvard Medical School" index={5} /><SpeakerCard image={speakerImages['Sarah Jenkins']} name="Sarah Jenkins" role="Operations Director · Stream Secretariat" index={6} /></div><div className="my-24 border-t border-[hsl(var(--border))] pt-16"><SectionTitle eyebrow="Keynote & invited speakers" title="Voices worth making time for." body="Each session is designed to reward attention with a useful next move." /><div className="mt-10 grid gap-4 md:grid-cols-3"><SpeakerCard image={speakerImages['Dr. Amina Rahman']} name="Dr. Amina Rahman" role="Associate Professor of Clinical Systems" index={7} /><SpeakerCard image={speakerImages['Prof. James T. Cole']} name="Prof. James T. Cole" role="Director of Molecular Futures Laboratory" index={8} /><SpeakerCard image={speakerImages['Dr. Mei Kwan']} name="Dr. Mei Kwan" role="Principal Scientist in Health Technologies" index={9} /><SpeakerCard image={speakerImages['Dr. Lucia Santos']} name="Dr. Lucia Santos" role="Head of Translational Research Unit" index={10} /></div></div></div></main></Layout>;
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

function PastConferencesPage() {
  const { toast } = useToast();
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80" eyebrow="The archive" title="The conversation continues." body="Explore selected past Stream Conferences editions and the questions they brought into the room." /><main><section className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Selected editions" title="A growing record of useful exchange." body="Each edition brings academia, industry, and clinical practice into closer conversation around the problems that matter next." /><div className="mt-12 grid gap-4">{pastConferences.map((item, i) => <article key={item.year} className="group grid gap-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:grid-cols-[120px_1fr_auto] md:items-center" data-testid={`past-conference-${i}`}><span className="display text-5xl font-bold tracking-[-.06em] text-[hsl(var(--accent))]">{item.year}</span><div><p className="label text-[hsl(var(--secondary))]">{item.city}</p><h2 className="display mt-3 text-2xl font-bold">{item.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.focus}</p></div><button type="button" onClick={() => toast({ title: "Recap Requested", description: "The conference recap is loading. Please check back shortly." })} className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--secondary))] md:justify-self-end" data-testid={`button-past-conference-${i}`}>View recap <ArrowUpRight size={16} /></button></article>)}</div></div></section><section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><div className="container-wide grid gap-10 md:grid-cols-[1fr_auto] md:items-center"><div><SectionTitle light eyebrow="Keep the record moving" title="Be part of the next edition." body="Submit your work, join the delegate list, or bring your organization into the conversation." /></div><div className="flex flex-wrap gap-3"><Link href="/submit-abstract" className="btn-main btn-primary" data-testid="link-past-submit">Submit abstract <ArrowUpRight size={16} /></Link><Link href="/register" className="btn-main border border-[hsl(var(--primary-foreground)/.3)]" data-testid="link-past-register">Register <ArrowRight size={16} /></Link></div></div></section></main></Layout>;
}

function SubmitPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('');
  const [summary, setSummary] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/abstracts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          track,
          summary
        })
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Abstract submission failed:', err);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setTrack('');
    setSummary('');
    setSubmitted(false);
  };

  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" eyebrow="Call for contributions" title="Abstract submission guidelines" body="Stream Conferences invites researchers, clinicians, academicians, and industry leaders to submit original abstracts for oral, poster, and virtual presentations. Every submission receives rigorous double-blind peer review." /><main><section className="section-pad"><div className="container-wide"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><SectionTitle eyebrow="01 · Important dates" title="Give the work a clear runway." body="Keep track of these key deadlines to ensure your contribution is reviewed and scheduled on time." /><div className="mt-10 grid gap-3">{[['November 15, 2026', 'Early-bird abstract submission deadline'], ['January 10, 2027', 'Final abstract submission deadline'], ['Within 5–7 business days', 'Notification of acceptance'], ['February 12, 2027', 'Presenter registration deadline']].map(([date, title], i) => <div key={title} className="flex gap-5 border-b border-[hsl(var(--border))] py-5" data-testid={`submission-date-${i}`}><span className="display text-xl font-bold text-[hsl(var(--accent))]">0{i + 1}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-[hsl(var(--secondary))]">{date}</p></div></div>)}</div></div><div className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]"><p className="label text-[hsl(var(--accent))]">Start here</p><h3 className="display mt-4 text-3xl font-bold">Have original work ready?</h3><p className="mt-4 text-sm leading-7 text-[hsl(var(--primary-foreground)/.7)]">Prepare your structured abstract, choose a track and format, then send it to the scientific coordination desk.</p><a href="mailto:abstracts@streamconferences.com" className="btn-main btn-primary mt-7" data-testid="link-email-abstracts">Email the abstract desk <Send size={16} /></a><p className="mt-4 text-xs text-[hsl(var(--primary-foreground)/.5)]">Template download and portal links are placeholders until launch.</p></div></div></div></section><section className="section-pad bg-[hsl(var(--muted)/.35)]"><div className="container-wide"><SectionTitle eyebrow="02 · Categories & formats" title="Choose the right room for the work." /><TrackGrid /><div className="mt-16 grid gap-4 md:grid-cols-4">{[['Keynote / Plenary Talk', 'Distinguished speakers and senior authorities · 25–30 minutes'], ['Oral Presentation', 'Standard research presentation · 15–20 minutes including Q&A'], ['Poster Presentation', 'Visual display with dedicated live interactive Q&A'], ['Virtual / Online', 'Recorded or live-streamed presentation for remote delegates']].map(([title, text], i) => <div key={title} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5" data-testid={`card-format-${i}`}><span className="label text-[hsl(var(--accent))]">0{i + 1}</span><h3 className="display mt-9 text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>)}</div></div></section><section className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><div><SectionTitle eyebrow="03 · Formatting requirements" title="A compact brief. A rigorous structure." /><div className="mt-8 grid gap-3">{[['Title', 'Maximum 25 words. Concise, descriptive, Title Case.'], ['Author details', 'Full names, affiliations, city, country, and email. Mark presenting author with *.'], ['Word limit', '250–350 words, excluding title, authors, and affiliations.'], ['Keywords', '3–6 relevant keywords, separated by semicolons.'], ['Core structure', 'Background / Objectives · Methods · Results / Findings · Conclusion / Significance.']].map(([key, value]) => <div key={key} className="border-l-2 border-[hsl(var(--accent))] py-2 pl-5"><p className="font-bold">{key}</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{value}</p></div>)}</div></div><div><SectionTitle eyebrow="04 · How to submit" title="Four steps to a submission ID." /><ol className="mt-8 grid gap-4">{['Prepare your abstract using the standard Stream Conferences Abstract Template (.docx).', 'Access the online submission portal via the Submit Abstract button.', 'Fill out author information, track, and presentation format.', 'Upload your document and receive an automated confirmation email.'].map((step, i) => <li key={step} className="flex gap-4"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[hsl(var(--secondary))] text-sm font-bold text-[hsl(var(--secondary-foreground))]">{i + 1}</span><p className="pt-1 text-sm leading-6">{step}</p></li>)}</ol><button type="button" onClick={() => toast({ title: "Template Download", description: "The abstract Microsoft Word template is downloading to your device." })} className="btn-main btn-quiet mt-7" data-testid="button-download-template"><Download size={16} /> Download template</button></div></div></section><section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><div className="container-wide grid gap-12 lg:grid-cols-[.85fr_1.15fr]"><div><SectionTitle light eyebrow="05 · Your submission" title="Put the work in motion." body="Mock submission handling is enabled for this preview. Replace with the final portal connection before launch." /></div>{submitted ? <SuccessState title="Submission received" body="Thank you. A confirmation with your placeholder Submission ID will be sent to the email provided." reset={handleReset} testId="status-abstract-success" /> : <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[hsl(var(--primary-foreground)/.17)] bg-[hsl(var(--primary-foreground)/.06)] p-6" aria-label="Abstract submission form"><input required className="form-field" placeholder="Full name" aria-label="Full name" data-testid="input-abstract-name" value={name} onChange={(e) => setName(e.target.value)} /><input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-abstract-email" value={email} onChange={(e) => setEmail(e.target.value)} /><select required className="form-field" value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Track" data-testid="select-abstract-track"><option value="" disabled>Select primary track</option>{tracks.map((track) => <option key={track.title} value={track.title}>{track.title}</option>)}</select><textarea required className="form-field min-h-28" placeholder="Abstract title and a short summary" aria-label="Abstract summary" data-testid="input-abstract-summary" value={summary} onChange={(e) => setSummary(e.target.value)} /><button className="btn-main btn-primary mt-2" type="submit" data-testid="button-submit-abstract">Send for review <ArrowUpRight size={16} /></button><p className="text-xs text-[hsl(var(--primary-foreground)/.5)]">By submitting, you confirm the work is original and ethically compliant.</p></form>}</div></section></main></Layout>;
}

function SuccessState({ title, body, reset, testId }: { title: string; body: string; reset?: () => void; testId: string }) {
  return <div className="flex flex-col justify-center rounded-2xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-8" data-testid={testId}><div className="grid h-12 w-12 place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Check size={24} /></div><h3 className="display mt-6 text-3xl font-bold">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-[hsl(var(--primary-foreground)/.7)]">{body}</p>{reset && <button type="button" onClick={reset} className="mt-7 self-start text-sm font-bold text-[hsl(var(--accent))]" data-testid="button-reset-form">Submit another response</button>}</div>;
}

function ItineraryPage() {
  const { toast } = useToast();
  const [day, setDay] = useState('Day 01');
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80" eyebrow="Three days / many directions" title="A program with a pulse." body="The full conference itinerary features elite keynote addresses, technical sessions, roundtable discussions, and networking segments." /><main className="section-pad"><div className="container-wide"><div className="flex flex-wrap items-end justify-between gap-6"><SectionTitle eyebrow="Live program overview" title="Choose your day." /><button type="button" onClick={() => toast({ title: "Itinerary Compiled", description: "The complete three-day program PDF is compiling. Your download will start shortly." })} className="btn-main btn-quiet" data-testid="button-download-program"><Download size={16} /> Download full program</button></div><div className="mt-12 flex gap-2 overflow-x-auto border-b border-[hsl(var(--border))] pb-3">{Object.keys(schedule).map((item) => <button key={item} type="button" onClick={() => setDay(item)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold ${day === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border border-[hsl(var(--border))] hover:border-[hsl(var(--secondary))]'}`} aria-pressed={day === item} data-testid={`button-${item.toLowerCase().replace(' ', '-')}`}>{item}<span className="ml-2 font-normal opacity-60">{item === 'Day 01' ? 'Mar 12' : item === 'Day 02' ? 'Mar 13' : 'Mar 14'}</span></button>)}</div><div className="mt-3">{schedule[day].map((item, i) => <div key={item.time + item.title} className="grid gap-3 border-b border-[hsl(var(--border))] py-7 md:grid-cols-[110px_1fr_150px] md:items-center" data-testid={`agenda-item-${day}-${i}`}><span className="mono text-sm text-[hsl(var(--secondary))]">{item.time}</span><div><h3 className="display text-xl font-bold">{item.title}</h3><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{item.speaker}</p></div><span className="justify-self-start rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">{item.tag}</span></div>)}</div></div></main></Layout>;
}

function ProgramPage() {
  return <Layout><PageHero eyebrow="Program architecture" title="A clear route through complex work." body="The full program is organized around translation: what we know, what we can test, and what we can build together." /><main className="section-pad"><div className="container-wide"><div className="grid gap-4 md:grid-cols-3">{[['01', 'Orient', 'Keynotes and plenaries set the questions, contexts, and stakes for the day.'], ['02', 'Interrogate', 'Technical sessions and symposia test evidence in public, with room for disagreement.'], ['03', 'Connect', 'Roundtables and networking forums create the next collaboration beyond the stage.']].map(([n, title, body]) => <div key={n} className="rounded-2xl bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]"><span className="label text-[hsl(var(--accent))]">{n}</span><h2 className="display mt-12 text-3xl font-bold">{title}</h2><p className="mt-4 text-sm leading-7 text-[hsl(var(--primary-foreground)/.68)]">{body}</p></div>)}</div><div className="mt-24"><SectionTitle eyebrow="At a glance" title="Sessions that respect your attention." /><div className="mt-10 grid gap-3">{['Opening Keynote · The Velocity of Translation', 'Clinical Translation Roundtables', 'Research Dissemination Forum', 'Poster Session & Live Q&A', 'Future Systems · Closing Plenary'].map((item, i) => <div key={item} className="flex items-center gap-4 border-b border-[hsl(var(--border))] py-5"><span className="mono text-xs text-[hsl(var(--accent))]">0{i + 1}</span><p className="font-bold">{item}</p><ArrowUpRight size={17} className="ml-auto text-[hsl(var(--secondary))]" /></div>)}</div><Link href="/itinerary" className="btn-main btn-primary mt-10" data-testid="link-program-itinerary">View day-by-day itinerary <ArrowRight size={16} /></Link></div></div></main></Layout>;
}

function BrochurePage() {
  const { toast } = useToast();
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80" eyebrow="The delegate edition" title="Take the summit with you." body="A concise field guide to ICMLHS 2027: tracks, program architecture, venue notes, and the details that help you make the most of three days in Boston." /><main className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div className="relative mx-auto aspect-[.72] w-full max-w-[360px] overflow-hidden rounded-2xl bg-[hsl(var(--primary))] p-8 text-[hsl(var(--primary-foreground))] shadow-2xl shadow-[hsl(var(--primary)/.2)]"><div className="absolute right-[-50px] top-[-20px] h-48 w-48 rounded-full border border-[hsl(var(--accent)/.55)]" /><span className="label text-[hsl(var(--accent))]">Stream Conferences / 2027</span><div className="mt-24"><p className="label text-[9px] text-[hsl(var(--primary-foreground)/.55)]">International conference on</p><h2 className="display mt-3 text-4xl font-bold leading-[.95] tracking-[-.05em]">Medical, Life &<br />Health Sciences</h2></div><div className="absolute bottom-8 left-8 right-8 flex justify-between border-t border-[hsl(var(--primary-foreground)/.2)] pt-4 text-[10px]"><span>ICMLHS 2027</span><span>Boston / USA</span></div></div><div><SectionTitle eyebrow="Conference brochure" title="Everything you need, before you arrive." body="Use the brochure to align your team, plan your sessions, and share the invitation with collaborators." /><ul className="mt-8 grid gap-4">{['Five interdisciplinary tracks with clear submission routes', 'Three-day program architecture and delegate experience', 'Speaker, venue, travel, and registration overview', 'Publishing and proceedings pathway with DOI/ISBN note'].map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><Check size={18} className="mt-1 shrink-0 text-[hsl(var(--secondary))]" />{item}</li>)}</ul><button type="button" onClick={() => toast({ title: "Brochure Compiled", description: "The official conference brochure PDF has been generated and is downloading." })} className="btn-main btn-primary mt-9" data-testid="button-download-brochure"><Download size={16} /> Download brochure (PDF)</button><p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">Official brochure edition · PDF version including full track details and registration terms.</p></div></div></main></Layout>;
}

function VenuePage() {
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1501979392350-f8c5b058a5c6?auto=format&fit=crop&w=1200&q=80" eyebrow="Your base in Boston" title="A venue designed for exchange." body="ICMLHS 2027 will convene at the state-of-the-art Seaport Convention Center in Boston, selected for its advanced amenities, expansive layout, and harborfront location." /><main><section className="section-pad"><div className="container-wide grid gap-12 lg:grid-cols-[1fr_1fr]"><div><SectionTitle eyebrow="Conference venue" title="Seaport Convention Center" body="Seaport Convention Center · 200 Seaport Boulevard, Boston, MA 02210, USA" /><div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full bg-[hsl(var(--muted))] px-4 py-2 text-sm font-semibold"><MapPin size={15} className="mr-2 inline text-[hsl(var(--secondary))]" />Boston Seaport</span><span className="rounded-full bg-[hsl(var(--muted))] px-4 py-2 text-sm font-semibold"><Users size={15} className="mr-2 inline text-[hsl(var(--secondary))]" />Accessible venue</span></div><p className="mt-8 text-sm leading-7 text-[hsl(var(--muted-foreground))]">The Seaport Convention Center is fully accessible, featuring state-of-the-art presentations halls, dedicated breakout rooms, and networking atrium spaces. Special group rates at adjacent hotels are available for registered delegates.</p></div><div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[hsl(var(--border))]"><img src="https://images.unsplash.com/photo-1577900385315-b7784f18d70e?auto=format&fit=crop&w=800&q=80" alt="Boston Seaport map area" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" /><MapPin className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[hsl(var(--accent))] drop-shadow-lg" size={42} /><span className="label absolute bottom-5 left-5 bg-black/60 px-3 py-1.5 rounded text-[10px] text-white backdrop-blur-sm">Venue location · Boston Seaport</span></div></div></section><section className="section-pad bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 md:grid-cols-[.7fr_1.3fr]"><SectionTitle eyebrow="Getting there" title="Plan the last mile." body="Travel guidance from Boston Logan Airport and South Station directly to the Seaport district." /><div className="grid gap-3 sm:grid-cols-3">{[['Airport', 'Boston Logan International · approx. 15 min by car'], ['Transit', 'Silver Line to World Trade Center Station'], ['Hotels', 'Westin Seaport District & Omni Boston Hotel']].map(([title, body]) => <div key={title} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><p className="label text-[hsl(var(--secondary))]">{title}</p><p className="mt-6 text-sm leading-6">{body}</p></div>)}</div></div></section></main></Layout>;
}

function SponsorsPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80" eyebrow="Build the room with us" title="Put your work in the conversation." body="Sponsorship and exhibition at ICMLHS 2027 places your organization alongside the researchers and practitioners shaping what comes next." /><main><section className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Partnership architecture" title="Choose your level of visibility." body="Select from the partnership tiers designed to align your organization with leading research." /><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[['Platinum', 'Lead the room', ['Main stage recognition', 'Keynote introduction', 'Premium exhibition footprint']], ['Gold', 'Shape the exchange', ['Session recognition', 'Exhibition footprint', 'Delegate invitations']], ['Silver', 'Join the network', ['Logo visibility', 'Exhibition table', 'Delegate invitations']], ['Exhibitor', 'Show the work', ['Dedicated table', 'Listing in event guide', 'Passes included']]].map(([tier, lead, benefits]) => <div key={String(tier)} className={`rounded-2xl border p-6 ${tier === 'Platinum' ? 'border-[hsl(var(--accent))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}><p className={`label ${tier === 'Platinum' ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>{tier}</p><h3 className="display mt-4 text-2xl font-bold">{lead}</h3><ul className="mt-8 grid gap-3">{(benefits as string[]).map((benefit) => <li key={benefit} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" />{benefit}</li>)}</ul></div>)}</div></div></section><section className="section-pad border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)]"><div className="container-wide grid gap-12 lg:grid-cols-[.75fr_1.25fr]"><SectionTitle eyebrow="Partner desk" title="Start a useful conversation." body="Send an initial brief to partners@streamconferences.com. Our partnership team will respond within 24–48 business hours." />{sent ? <SuccessState title="Brief received" body="Thanks. The partnership desk has received your request and will contact you shortly." reset={() => setSent(false)} testId="status-sponsor-success" /> : <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><input required className="form-field" placeholder="Company name" aria-label="Company name" data-testid="input-sponsor-company" /><input required className="form-field" placeholder="Contact name" aria-label="Contact name" data-testid="input-sponsor-contact" /><div className="grid gap-4 sm:grid-cols-2"><input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-sponsor-email" /><input className="form-field" placeholder="Phone number" aria-label="Phone number" data-testid="input-sponsor-phone" /></div><select className="form-field" defaultValue="" aria-label="Tier of interest" data-testid="select-sponsor-tier"><option value="" disabled>Tier of interest</option><option>Platinum</option><option>Gold</option><option>Silver</option><option>Exhibitor</option></select><textarea className="form-field min-h-28" placeholder="Tell us what you want to make possible" aria-label="Message" data-testid="input-sponsor-message" /><button type="submit" className="btn-main btn-primary" data-testid="button-submit-sponsor">Send partnership brief <Send size={16} /></button></form>}</div></section></main></Layout>;
}

function RegisterPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [presentingAbstract, setPresentingAbstract] = useState('No');
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [mockPayment, setMockPayment] = useState<{ paymentId: string; signature: string } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const prices = [['Student', '$245', '$320'], ['Academic', '$395', '$480'], ['Industry Delegate', '$520', '$640'], ['Virtual Attendee', '$145', '$190']];

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, signature })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const regRes = await fetch('http://localhost:3000/api/registrations/register', {
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
          presentingAbstract
        })
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.error || 'Registration failed');
      }
      const regData = await regRes.json();

      const orderRes = await fetch('http://localhost:3000/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, category, registrationId: regData._id })
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
      } else {
        setPaying(true);
        openRazorpayCheckout(orderData.order);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setInstitution('');
    setCountry('');
    setCategory('');
    setPresentingAbstract('No');
    setPaymentOrderId('');
    setMockPayment(null);
    setPaymentAmount(0);
    setPaying(false);
    setError('');
    setSent(false);
  };

  const handleMockPay = () => {
    if (!mockPayment) return;
    setPaying(true);
    verifyPayment(paymentOrderId, mockPayment.paymentId, mockPayment.signature);
  };

  const paymentPending = paymentOrderId && !sent;

  return <Layout><PageHero bgImage="https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=1200&q=80" eyebrow="Secure your place" title="Register for the full conversation." body="Choose the participation format that fits your work. Select from physical, virtual, or academic registration options." /><main><section className="section-pad"><div className="container-wide"><SectionTitle eyebrow="Registration categories" title="A clear route in." /><div className="mt-10 overflow-x-auto rounded-2xl border border-[hsl(var(--border))]"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><tr><th className="p-5 font-semibold">Category</th><th className="p-5 font-semibold">Early-bird Rate</th><th className="p-5 font-semibold">Regular Rate</th><th className="p-5" /></tr></thead><tbody>{prices.map(([category, early, regular]) => <tr key={category} className="border-t border-[hsl(var(--border))]"><td className="p-5 font-bold">{category}</td><td className="p-5 mono text-[hsl(var(--secondary))]">{early}</td><td className="p-5 mono">{regular}</td><td className="p-5 text-right"><button type="button" onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })} className="font-bold text-[hsl(var(--secondary))]" data-testid={`button-register-${category.toLowerCase().replaceAll(' ', '-')}`}>Choose <ArrowRight className="ml-1 inline" size={15} /></button></td></tr>)}</tbody></table></div><div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">{['Conference kit', 'Proceedings access', 'Networking meals', 'Certificate of attendance'].map((item) => <div key={item} className="flex items-center gap-2 text-sm font-semibold"><Check size={17} className="text-[hsl(var(--secondary))]" />{item}<span className="text-xs text-[hsl(var(--muted-foreground))]"> · Included</span></div>)}</div></div></section><section className="section-pad bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" id="registration-form"><div className="container-wide grid gap-12 lg:grid-cols-[.85fr_1.15fr]"><SectionTitle light eyebrow="Registration desk" title="Tell us how you will join." body="Select your registration type and fill in delegate information. Upon submission, you will be redirected to our secure payment gateway." />{sent ? <SuccessState title="Registration & payment complete" body="Your registration and payment have been successfully recorded. A confirmation email with receipt and event details has been sent to the email provided." reset={handleReset} testId="status-register-success" /> : paymentPending ? <div className="grid gap-4 rounded-2xl border border-[hsl(var(--primary-foreground)/.17)] bg-[hsl(var(--primary-foreground)/.06)] p-6" data-testid="panel-register-payment"><p className="label text-[hsl(var(--accent))]">Step 2 · Payment</p><h3 className="display mt-2 text-2xl font-bold">Complete your registration</h3><p className="mt-3 text-sm text-[hsl(var(--primary-foreground)/.7)]">Registration recorded for <strong>{name}</strong> as <strong>{category}</strong>. Amount due: <strong>₹{paymentAmount.toFixed(2)}</strong></p>{error && <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">{error}</div>}<button type="button" onClick={handleMockPay} disabled={paying} className="btn-main btn-primary mt-5" data-testid="button-complete-payment">{paying ? 'Processing payment...' : `Pay ₹${paymentAmount.toFixed(2)}`} <ArrowUpRight size={16} /></button><p className="text-xs text-[hsl(var(--primary-foreground)/.5)]">Payment is processed securely via Razorpay (test mode). All major credit cards accepted.</p></div> : <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[hsl(var(--primary-foreground)/.17)] bg-[hsl(var(--primary-foreground)/.06)] p-6"><div className="grid gap-4 sm:grid-cols-2"><input required className="form-field" placeholder="Full name" aria-label="Full name" data-testid="input-register-name" value={name} onChange={(e) => setName(e.target.value)} /><input required type="email" className="form-field" placeholder="Email address" aria-label="Email address" data-testid="input-register-email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><div className="grid gap-4 sm:grid-cols-2"><input className="form-field" placeholder="Phone number" aria-label="Phone number" data-testid="input-register-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /><input required className="form-field" placeholder="Institution / organization" aria-label="Institution" data-testid="input-register-institution" value={institution} onChange={(e) => setInstitution(e.target.value)} /></div><input required className="form-field" placeholder="Country" aria-label="Country" data-testid="input-register-country" value={country} onChange={(e) => setCountry(e.target.value)} /><select required className="form-field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Registration category" data-testid="select-registration-category"><option value="" disabled>Registration category</option>{prices.map(([category]) => <option key={category} value={category}>{category}</option>)}</select><select className="form-field" value={presentingAbstract} onChange={(e) => setPresentingAbstract(e.target.value)} aria-label="Presenting abstract" data-testid="select-presenting-abstract"><option value="No">Presenting abstract? No</option><option value="Yes">Presenting abstract? Yes</option></select>{error && <div className="rounded-lg border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200">{error}</div>}<button type="submit" className="btn-main btn-primary mt-2" data-testid="button-submit-registration">Continue to payment <ArrowUpRight size={16} /></button><p className="text-xs text-[hsl(var(--primary-foreground)/.5)]">Payment details are processed securely. All major credit cards accepted.</p></form>}</div></section></main></Layout>;
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
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/contacts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, conference: conferenceName, message })
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
            {insightsList.map((insight, index) => (
              <div key={insight.title} className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden flex flex-col justify-between h-full">
                <div className="p-5 flex-1">
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
                    <img src={blogImages[index % blogImages.length]} alt={insight.title} className="h-full w-full object-cover" />
                  </div>
                  <span className="label text-[hsl(var(--accent))] text-[9px]">{insight.label}</span>
                  <h3 className="display mt-3 text-lg font-bold leading-tight">{insight.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{insight.copy}</p>
                </div>
                <div className="px-5 pb-5 pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--secondary))]">
                    Read field note <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
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

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/about" component={AboutPage} /><Route path="/submit-abstract" component={SubmitPage} /><Route path="/itinerary" component={ItineraryPage} /><Route path="/program" component={ProgramPage} /><Route path="/speakers" component={SpeakersPage} /><Route path="/gallery" component={GalleryPage} /><Route path="/blog" component={BlogPage} /><Route path="/conferences" component={ConferencesPage} /><Route path="/webinars" component={WebinarsPage} /><Route path="/past-conferences" component={PastConferencesPage} /><Route path="/brochure" component={BrochurePage} /><Route path="/venue" component={VenuePage} /><Route path="/sponsors" component={SponsorsPage} /><Route path="/register" component={RegisterPage} /><Route path="/terms" component={TermsPage} /><Route path="/faq" component={FAQPage} /><Route path="/guidelines" component={GuidelinesPage} /><Route path="/contact" component={ContactPage} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><APIProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></APIProvider></TooltipProvider></QueryClientProvider>;
}

export default App;