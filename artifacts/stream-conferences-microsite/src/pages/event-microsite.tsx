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

  const displayEvent: EventData = activeCohort
    ? {
        ...event,
        cohorts,
        currentCohort,
        activeCohort,
        title: activeCohort.title || event.title,
        subdomain: activeCohort.subdomain || event.subdomain,
        startDate: activeCohort.startDate || '',
        endDate: activeCohort.endDate || '',
        eventDate: activeCohort.startDate || '',
        description: activeCohort.content?.description || '',
        theme: activeCohort.content?.theme || '',
        themeColor: activeCohort.content?.themeColor || '',
        heroThemeColor: activeCohort.content?.heroThemeColor || '',
        primaryColor: activeCohort.content?.primaryColor || '',
        colorTheme: activeCohort.content?.colorTheme || '',
        day: activeCohort.content?.day || '',
        month: activeCohort.content?.month || '',
        location: activeCohort.content?.location || '',
        venue: activeCohort.content?.venue || '',
        venueAddress: activeCohort.content?.venueAddress || '',
        venueMapUrl: activeCohort.content?.venueMapUrl || '',
        startTime: activeCohort.content?.startTime || '',
        endTime: activeCohort.content?.endTime || '',
        speaker: activeCohort.content?.speaker || '',
        speakers: Array.isArray(activeCohort.content?.speakers) ? activeCohort.content.speakers : [],
        tracks: Array.isArray(activeCohort.content?.tracks) ? activeCohort.content.tracks : [],
        faqs: Array.isArray(activeCohort.content?.faqs) ? activeCohort.content.faqs : [],
        fees: Array.isArray(activeCohort.content?.fees) ? activeCohort.content.fees : [],
        sponsors: Array.isArray(activeCohort.content?.sponsors) ? activeCohort.content.sponsors : [],
        partners: Array.isArray(activeCohort.content?.partners) ? activeCohort.content.partners : [],
        mediaPartners: Array.isArray(activeCohort.content?.mediaPartners) ? activeCohort.content.mediaPartners : [],
        exhibitors: Array.isArray(activeCohort.content?.exhibitors) ? activeCohort.content.exhibitors : [],
        guidelines: activeCohort.content?.guidelines || '',
        organizingCommittee: Array.isArray(activeCohort.content?.organizingCommittee) ? activeCohort.content.organizingCommittee : [],
        venueDetails: activeCohort.content?.venueDetails || null,
        program: Array.isArray(activeCohort.content?.program) ? activeCohort.content.program : [],
        headerBanners: Array.isArray(activeCohort.content?.headerBanners) ? activeCohort.content.headerBanners : [],
        welcomeBannerTitle: activeCohort.content?.welcomeBannerTitle || '',
        welcomeBannerDescription: activeCohort.content?.welcomeBannerDescription || '',
        brochureUrl: activeCohort.content?.brochureUrl || '',
        bannerUrl: activeCohort.content?.bannerUrl || '',
        logoUrl: activeCohort.content?.logoUrl || '',
        scientificProgramUrl: activeCohort.content?.scientificProgramUrl || '',
        termsAndConditions: activeCohort.content?.termsAndConditions || '',
        about: activeCohort.content?.about || '',
        terms: activeCohort.content?.terms || '',
        privacy: activeCohort.content?.privacy || '',
        registerSteps: Array.isArray(activeCohort.content?.registerSteps) ? activeCohort.content.registerSteps : [],
        brochure: activeCohort.content?.brochure || null,
        feeLevels: Array.isArray(activeCohort.content?.feeLevels) ? activeCohort.content.feeLevels : [],
        gtmCode: activeCohort.content?.gtmCode || '',
        gaCode: activeCohort.content?.gaCode || '',
        mcCode: activeCohort.content?.mcCode || '',
        metaTitle: activeCohort.content?.metaTitle || '',
        metaDescription: activeCohort.content?.metaDescription || '',
        globalAddons: Array.isArray(activeCohort.content?.globalAddons) ? activeCohort.content.globalAddons : [],
        globalAddonTitle: activeCohort.content?.globalAddonTitle || '',
        accommodationFees: Array.isArray(activeCohort.content?.accommodationFees) ? activeCohort.content.accommodationFees : [],
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
