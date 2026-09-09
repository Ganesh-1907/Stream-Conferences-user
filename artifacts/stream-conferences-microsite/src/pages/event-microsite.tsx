import { useEffect, useState } from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
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

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const cohortPath = parseCohortPath(pathname);
  const base = cohortPath?.base || '/';

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

  const displayEvent: EventData = {
    ...event,
    cohorts,
    currentCohort,
    activeCohort,
  };
  if (activeCohort) {
    Object.assign(displayEvent, activeCohort.content || {});
    displayEvent.startDate = displayEvent.startDate || event.startDate;
    displayEvent.endDate = displayEvent.endDate || event.endDate;
    displayEvent.eventDate = displayEvent.eventDate || event.eventDate;
  }

  const navItems = buildNavItems(displayEvent);

  return (
    <WouterRouter base={base}>
      <MicrositeLayout event={displayEvent} navItems={navItems}>
        <Switch>
          <Route path="/" component={() => <HomePage event={displayEvent} />} />
          <Route path="/about" component={() => <AboutPage event={displayEvent} />} />
          <Route path="/program" component={() => <ProgramPage event={displayEvent} />} />
          <Route path="/speakers" component={() => <SpeakersPage event={displayEvent} />} />
          <Route path="/itinerary" component={() => <ItineraryPage event={displayEvent} />} />
          <Route path="/sponsors" component={() => <SponsorsExhibitorsPage event={displayEvent} />} />
          <Route path="/exhibitors" component={() => <SponsorsExhibitorsPage event={displayEvent} />} />
          <Route path="/sponsors-exhibitors" component={() => <SponsorsExhibitorsPage event={displayEvent} />} />
          <Route path="/partners" component={() => <SponsorsExhibitorsPage event={displayEvent} />} />
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
