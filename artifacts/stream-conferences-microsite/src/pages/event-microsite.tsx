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

  const navItems = buildNavItems(event);

  return (
    <WouterRouter base="/">
      <MicrositeLayout event={event} navItems={navItems}>
        <Switch>
          <Route path="/" component={() => <HomePage event={event} />} />
          <Route path="/about" component={() => <AboutPage event={event} />} />
          <Route path="/program" component={() => <ProgramPage event={event} />} />
          <Route path="/speakers" component={() => <SpeakersPage event={event} />} />
          <Route path="/itinerary" component={() => <ItineraryPage event={event} />} />
          <Route path="/sponsors" component={() => <SponsorsExhibitorsPage event={event} />} />
          <Route path="/exhibitors" component={() => <SponsorsExhibitorsPage event={event} />} />
          <Route path="/sponsors-exhibitors" component={() => <SponsorsExhibitorsPage event={event} />} />
          <Route path="/partners" component={() => <SponsorsExhibitorsPage event={event} />} />
          <Route path="/resources" component={() => <ResourcesPage event={event} />} />
          <Route path="/fees" component={() => <FeesPage event={event} />} />
          <Route path="/tracks" component={() => <TracksPage event={event} />} />
          <Route path="/faq" component={() => <FAQPage event={event} />} />
          <Route path="/guidelines" component={() => <GuidelinesPage event={event} />} />
          <Route path="/venue" component={() => <VenuePage event={event} />} />
          <Route path="/contact" component={() => <ContactPage event={event} />} />
          <Route path="/terms" component={() => <TermsPage event={event} />} />
          <Route path="/register" component={() => <RegisterPage event={event} />} />
          <Route path="/submit-abstract" component={() => <AbstractPage event={event} />} />
          <Route path="/brochure" component={() => <BrochurePage event={event} />} />
          <Route path="/organizing-committee" component={() => <OrganizingCommitteePage event={event} />} />
          <Route path="/thank-you" component={() => <ThankYouPage event={event} />} />
          <Route component={() => <HomePage event={event} />} />
        </Switch>
      </MicrositeLayout>
    </WouterRouter>
  );
}
