import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from 'wouter';
import { MicrositeLayout, buildNavItems, type EventData } from './microsite/layout';
import { HomePage } from './microsite/home';
import { AboutPage } from './microsite/about';
import { ProgramPage } from './microsite/program';
import { SpeakersPage } from './microsite/speakers';
import { ItineraryPage } from './microsite/itinerary';
import { PartnersPage } from './microsite/partners';
import { SponsorsExhibitorsPage } from './microsite/sponsors';
import { ResourcesPage } from './microsite/resources';
import { TracksPage } from './microsite/tracks';
import { FAQPage } from './microsite/faq';
import { GuidelinesPage } from './microsite/guidelines';
import { VenuePage } from './microsite/venue';
import { ContactPage } from './microsite/contact';
import { TermsPage } from './microsite/terms';
import { RegisterPage } from './microsite/register';
import { AbstractPage } from './microsite/abstract';
import { BrochurePage } from './microsite/brochure';
import { ThankYouPage } from './microsite/thank-you';
import { OrganizingCommitteePage } from './microsite/organizing-committee';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function EventNotFound({ subdomain }: { subdomain: string }) {
  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold">Event not found</h1>
      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">There is no active event at <span className="font-mono">{subdomain}</span>.</p>
    </div>
  );
}

function CohortNotFound({ subdomain }: { subdomain: string }) {
  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-3xl font-bold">Cohort not found</h1>
      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
        This cohort does not exist at <span className="font-mono">{subdomain}</span>.{' '}
        <a href="/" className="text-[hsl(var(--primary))] hover:underline">View the current cohort</a>.
      </p>
    </div>
  );
}

function parseCohortPath(pathname: string): { year: string | null; batch: string | null; base: string } | null {
  // Support /b1, /b2, /b3 (batch-based path directly under subdomain, e.g. /b1)
  let m = pathname.match(/^\/b(\d+)/i);
  if (m) return { year: null, batch: m[1], base: `/b${m[1]}` };

  // Support /2026/b1 or /2026/b2
  m = pathname.match(/^\/(\d{4})\/b(\d+)/i);
  if (m) return { year: m[1], batch: m[2], base: `/${m[1]}/b${m[2]}` };

  // Support /2026/1 or /2026/2
  m = pathname.match(/^\/(\d{4})\/(\d+)/);
  if (m) return { year: m[1], batch: m[2], base: `/${m[1]}/${m[2]}` };

  // Support /2026 (current cohort for that year)
  m = pathname.match(/^\/(\d{4})/);
  if (m) return { year: m[1], batch: null, base: `/${m[1]}` };

  return null;
}

import { MediaPartnersPage } from './microsite/media-partners';
import { SponsorsPage } from './microsite/sponsors';

import { STREAM_LOGO_DARK_B64, STREAM_LOGO_LIGHT_B64 } from '@/components/stream-logo-data';

export function EventMicrosite({ subdomain, customBase }: { subdomain: string; customBase?: string }) {
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
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f17] px-4 font-serif">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="relative">
            <img
              src={STREAM_LOGO_LIGHT_B64}
              alt="Stream Conferences"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="w-36 h-1 bg-white/10 rounded-full overflow-hidden relative">
              <div className="h-full w-1/2 bg-cyan-500 rounded-full animate-pulse" />
            </div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Connecting Minds · Advancing Science
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return <EventNotFound subdomain={subdomain} />;
  }

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const relativePathname = customBase && pathname.startsWith(customBase) ? (pathname.slice(customBase.length) || '/') : pathname;
  const cohortPath = parseCohortPath(relativePathname);
  const base = customBase
    ? `${customBase}${cohortPath?.base || ''}`
    : (cohortPath?.base || '');

  const cohorts = Array.isArray(event.cohorts) ? event.cohorts : [];
  const currentCohort = event.currentCohort || cohorts.find((c) => c.isCurrent) || null;
  const activeCohort = cohortPath
    ? (cohorts.find((c) => {
        if (cohortPath.year && String(c.year) !== cohortPath.year) return false;
        if (cohortPath.batch !== null) {
          return (
            String(c.batchNo) === cohortPath.batch ||
            c.cohortId?.toLowerCase().endsWith(`-b${cohortPath.batch}`) ||
            c.cohortId?.toLowerCase().endsWith(`-${cohortPath.batch}`)
          );
        }
        return c.isCurrent || c.batchNo === 1;
      }) || null)
    : currentCohort;

  if (cohortPath && !activeCohort) {
    return <CohortNotFound subdomain={subdomain} />;
  }

  // Cohorts are fully independent: when a cohort is active, only its own content
  // is used. No fallback to the parent event (which would mix years / batches).
  // The backend snapshots parent content into each cohort at creation time.
  const cc = (activeCohort?.content || {}) as Record<string, any>;
  const scalar = <T,>(v: T | undefined | null, fallback: T): T =>
    v !== undefined && v !== null && v !== '' ? v : fallback;
  const arr = <T,>(v: unknown, fallback: T[] = [] as T[]): T[] =>
    Array.isArray(v) ? (v as T[]) : fallback;
  const obj = (v: unknown): Record<string, any> =>
    v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, any>) : {};

  const displayEvent: EventData = activeCohort
    ? {
        ...event,
        cohorts,
        currentCohort,
        activeCohort,
        title: activeCohort.title || '',
        shortTitle: scalar(cc.shortTitle, activeCohort.title || ''),
        subdomain: activeCohort.subdomain || event.subdomain,
        startDate: activeCohort.startDate || '',
        endDate: activeCohort.endDate || '',
        eventDate: activeCohort.startDate || '',
        description: scalar(cc.description, ''),
        theme: scalar(cc.theme, ''),
        themeColor: scalar(cc.themeColor, ''),
        heroThemeColor: scalar(cc.heroThemeColor, ''),
        primaryColor: scalar(cc.primaryColor, ''),
        colorTheme: scalar(cc.colorTheme, ''),
        day: scalar(cc.day, ''),
        month: scalar(cc.month, ''),
        location: scalar(cc.location, ''),
        venue: scalar(cc.venue, ''),
        venueAddress: scalar(cc.venueAddress, ''),
        venueMapUrl: scalar(cc.venueMapUrl, ''),
        startTime: scalar(cc.startTime, ''),
        endTime: scalar(cc.endTime, ''),
        speaker: scalar(cc.speaker, ''),
        speakers: arr(cc.speakers),
        tracks: arr(cc.tracks),
        faqs: arr(cc.faqs),
        fees: arr(cc.fees),
        sponsors: arr(cc.sponsors),
        partners: arr(cc.partners),
        mediaPartners: arr(cc.mediaPartners),
        exhibitors: arr(cc.exhibitors),
        guidelines: scalar(cc.guidelines, ''),
        organizingCommittee: arr(cc.organizingCommittee),
        venueDetails: obj(cc.venueDetails) as any,
        program: arr(cc.program),
        headerBanners: arr(cc.headerBanners),
        welcomeBannerTitle: scalar(cc.welcomeBannerTitle, ''),
        welcomeBannerDescription: scalar(cc.welcomeBannerDescription, ''),
        brochureUrl: scalar(cc.brochureUrl, ''),
        bannerUrl: scalar(cc.bannerUrl, ''),
        logoUrl: scalar(cc.logoUrl, ''),
        subjectImageUrl: scalar(cc.subjectImageUrl, ''),
        scientificProgramUrl: scalar(cc.scientificProgramUrl, ''),
        termsAndConditions: scalar(cc.termsAndConditions, ''),
        about: scalar(cc.about, ''),
        terms: scalar(cc.terms, ''),
        privacy: scalar(cc.privacy, ''),
        registerSteps: arr(cc.registerSteps),
        brochure: obj(cc.brochure) as any,
        feeLevels: arr(cc.feeLevels),
        gtmCode: scalar(cc.gtmCode, ''),
        gaCode: scalar(cc.gaCode, ''),
        mcCode: scalar(cc.mcCode, ''),
        metaTitle: scalar(cc.metaTitle, ''),
        metaDescription: scalar(cc.metaDescription, ''),
        globalAddons: arr(cc.globalAddons),
        globalAddonTitle: scalar(cc.globalAddonTitle, ''),
        accommodationFees: arr(cc.accommodationFees),
        organizerContact: obj(cc.organizerContact),
        socialLinks: obj(cc.socialLinks),
      }
    : {
        ...event,
        cohorts,
        currentCohort,
        activeCohort,
      };

  const navItems = buildNavItems(displayEvent);

  return (
    <WouterRouter base={base}>
      <ScrollToTop />
      <MicrositeLayout event={displayEvent} navItems={navItems}>
        <Switch>
          <Route path="/" component={() => <HomePage event={displayEvent} />} />
          <Route path="/about" component={() => <AboutPage event={displayEvent} />} />
          <Route path="/speakers" component={() => <SpeakersPage event={displayEvent} />} />
          <Route path="/sponsors" component={() => <SponsorsPage event={displayEvent} />} />
          <Route path="/media-partners" component={() => <MediaPartnersPage event={displayEvent} />} />
          <Route path="/exhibitors" component={() => <SponsorsPage event={displayEvent} />} />
          <Route path="/sponsors-exhibitors" component={() => <SponsorsPage event={displayEvent} />} />
          <Route path="/partners" component={() => <SponsorsPage event={displayEvent} />} />
          <Route path="/resources" component={() => <ResourcesPage event={displayEvent} />} />
          <Route path="/fees" component={() => <Redirect to="/register" replace />} />
          <Route path="/tracks" component={() => <TracksPage event={displayEvent} />} />
          <Route path="/faq" component={() => <FAQPage event={displayEvent} />} />
          <Route path="/guidelines" component={() => <GuidelinesPage event={displayEvent} />} />
          <Route path="/venue" component={() => <VenuePage event={displayEvent} />} />
          <Route path="/contact" component={() => <ContactPage event={displayEvent} />} />
          <Route path="/terms" component={() => <TermsPage event={displayEvent} />} />
          <Route path="/register" component={() => <RegisterPage event={displayEvent} />} />
          <Route path="/submit-abstract" component={() => <AbstractPage event={displayEvent} />} />
          <Route path="/brochure" component={() => <BrochurePage event={displayEvent} />} />
          <Route path="/organizing-committee" component={() => <OrganizingCommitteePage event={displayEvent} />} />
          <Route path="/thank-you" component={() => <ThankYouPage event={displayEvent} />} />
          <Route component={() => <HomePage event={displayEvent} />} />
        </Switch>
      </MicrositeLayout>
    </WouterRouter>
  );
}
