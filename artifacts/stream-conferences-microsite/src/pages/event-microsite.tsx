import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { MicrositeLayout, buildNavItems, type EventData } from './microsite/layout';
import { HomePage } from './microsite/home';
import { AboutPage } from './microsite/about';
import { ProgramPage } from './microsite/program';
import { SpeakersPage } from './microsite/speakers';
import { ItineraryPage } from './microsite/itinerary';
import { PartnersPage } from './microsite/partners';
import { SponsorsExhibitorsPage } from './microsite/sponsors';
import { ResourcesPage } from './microsite/resources';
import { FeesPage } from './microsite/fees';
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

function parseCohortPath(pathname: string): { year: string; batch: string | null; base: string } | null {
  // /2026        -> year=2026, batch=null (current cohort for that year)
  // /2026/2      -> year=2026, batch=2
  // /2026/b2     -> year=2026, batch=2 (legacy)
  let m = pathname.match(/^\/(\d{4})\/b(\d+)/);
  if (m) return { year: m[1], batch: m[2], base: `/${m[1]}/b${m[2]}` };
  m = pathname.match(/^\/(\d{4})\/(\d+)/);
  if (m) return { year: m[1], batch: m[2], base: `/${m[1]}/${m[2]}` };
  m = pathname.match(/^\/(\d{4})/);
  if (m) return { year: m[1], batch: null, base: `/${m[1]}` };
  return null;
}

import { MediaPartnersPage } from './microsite/media-partners';
import { SponsorsPage } from './microsite/sponsors';

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-[hsl(var(--muted-foreground))] font-semibold">
        <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
        <span>Loading event data…</span>
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
        if (String(c.year) !== cohortPath.year) return false;
        if (cohortPath.batch === null) return c.isCurrent || c.batchNo === 1;
        return String(c.batchNo) === cohortPath.batch;
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
        startDate: activeCohort.startDate || event.startDate || '',
        endDate: activeCohort.endDate || event.endDate || '',
        eventDate: activeCohort.startDate || event.eventDate || '',
        description: activeCohort.content?.description || event.description || '',
        theme: activeCohort.content?.theme || event.theme || '',
        themeColor: activeCohort.content?.themeColor || event.themeColor || '',
        primaryColor: activeCohort.content?.primaryColor || event.primaryColor || '',
        colorTheme: activeCohort.content?.colorTheme || event.colorTheme || '',
        day: activeCohort.content?.day || event.day || '',
        month: activeCohort.content?.month || event.month || '',
        location: activeCohort.content?.location || event.location || '',
        venue: activeCohort.content?.venue || event.venue || '',
        venueAddress: activeCohort.content?.venueAddress || event.venueAddress || '',
        venueMapUrl: activeCohort.content?.venueMapUrl || event.venueMapUrl || '',
        startTime: activeCohort.content?.startTime || event.startTime || '',
        endTime: activeCohort.content?.endTime || event.endTime || '',
        speaker: activeCohort.content?.speaker || event.speaker || '',
        speakers: (Array.isArray(activeCohort.content?.speakers) && activeCohort.content.speakers.length > 0) ? activeCohort.content.speakers : (event.speakers || []),
        tracks: (Array.isArray(activeCohort.content?.tracks) && activeCohort.content.tracks.length > 0) ? activeCohort.content.tracks : (event.tracks || []),
        faqs: (Array.isArray(activeCohort.content?.faqs) && activeCohort.content.faqs.length > 0) ? activeCohort.content.faqs : (event.faqs || []),
        fees: (Array.isArray(activeCohort.content?.fees) && activeCohort.content.fees.length > 0) ? activeCohort.content.fees : (event.fees || []),
        sponsors: (Array.isArray(activeCohort.content?.sponsors) && activeCohort.content.sponsors.length > 0) ? activeCohort.content.sponsors : (event.sponsors || []),
        partners: (Array.isArray(activeCohort.content?.partners) && activeCohort.content.partners.length > 0) ? activeCohort.content.partners : (event.partners || []),
        mediaPartners: (Array.isArray(activeCohort.content?.mediaPartners) && activeCohort.content.mediaPartners.length > 0) ? activeCohort.content.mediaPartners : (event.mediaPartners || []),
        exhibitors: (Array.isArray(activeCohort.content?.exhibitors) && activeCohort.content.exhibitors.length > 0) ? activeCohort.content.exhibitors : (event.exhibitors || []),
        guidelines: activeCohort.content?.guidelines || event.guidelines || '',
        organizingCommittee: (Array.isArray(activeCohort.content?.organizingCommittee) && activeCohort.content.organizingCommittee.length > 0) ? activeCohort.content.organizingCommittee : (event.organizingCommittee || []),
        venueDetails: (activeCohort.content?.venueDetails && Object.keys(activeCohort.content.venueDetails).length > 0) ? activeCohort.content.venueDetails : (event.venueDetails || null),
        program: (Array.isArray(activeCohort.content?.program) && activeCohort.content.program.length > 0) ? activeCohort.content.program : (event.program || []),
        headerBanners: (Array.isArray(activeCohort.content?.headerBanners) && activeCohort.content.headerBanners.length > 0) ? activeCohort.content.headerBanners : (event.headerBanners || []),
        welcomeBannerTitle: activeCohort.content?.welcomeBannerTitle || event.welcomeBannerTitle || '',
        welcomeBannerDescription: activeCohort.content?.welcomeBannerDescription || event.welcomeBannerDescription || '',
        brochureUrl: activeCohort.content?.brochureUrl || event.brochureUrl || '',
        bannerUrl: activeCohort.content?.bannerUrl || event.bannerUrl || '',
        logoUrl: activeCohort.content?.logoUrl || event.logoUrl || '',
        scientificProgramUrl: activeCohort.content?.scientificProgramUrl || event.scientificProgramUrl || '',
        termsAndConditions: activeCohort.content?.termsAndConditions || event.termsAndConditions || '',
        about: activeCohort.content?.about || event.about || '',
        terms: activeCohort.content?.terms || event.terms || '',
        privacy: activeCohort.content?.privacy || event.privacy || '',
        registerSteps: (Array.isArray(activeCohort.content?.registerSteps) && activeCohort.content.registerSteps.length > 0) ? activeCohort.content.registerSteps : (event.registerSteps || []),
        brochure: activeCohort.content?.brochure || event.brochure || null,
        feeLevels: (Array.isArray(activeCohort.content?.feeLevels) && activeCohort.content.feeLevels.length > 0) ? activeCohort.content.feeLevels : (event.feeLevels || []),
        gtmCode: activeCohort.content?.gtmCode || event.gtmCode || '',
        gaCode: activeCohort.content?.gaCode || event.gaCode || '',
        mcCode: activeCohort.content?.mcCode || event.mcCode || '',
        metaTitle: activeCohort.content?.metaTitle || event.metaTitle || '',
        metaDescription: activeCohort.content?.metaDescription || event.metaDescription || '',
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
          <Route path="/fees" component={() => <FeesPage event={displayEvent} />} />
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
