import type { EventData } from './layout';
import { SponsorsExhibitorsPage } from './sponsors';

export function PartnersPage({ event }: { event: EventData }) {
  return <SponsorsExhibitorsPage event={event} />;
}

export { SponsorsExhibitorsPage };

