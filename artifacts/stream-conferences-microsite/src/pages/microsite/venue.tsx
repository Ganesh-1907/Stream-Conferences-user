import { Building, MapPin, Map } from 'lucide-react';
import type { EventData } from './layout';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function VenuePage({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};
  const has = Boolean(venue.name || venue.address || venue.city || venue.mapUrl || event.venue || event.location || venue.description || venue.directions);

  if (!has) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">Venue details not available yet.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Venue</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Event location</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Getting there, accommodation and directions</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-[hsl(var(--foreground))]">
              <Building size={18} className="text-[hsl(var(--primary))]" />
              {venue.name || event.venue || 'Venue'}
            </h3>
            {(venue.address || event.venueAddress || event.location) && (
              <div className="mt-2 flex items-start gap-2 text-base text-[hsl(var(--muted-foreground))]">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p>{venue.address || event.venueAddress}</p>
                  {venue.city && <p>{venue.city}{venue.state && `, ${venue.state}`}{venue.country && `, ${venue.country}`}</p>}
                  {venue.pincode && <p>PIN: {venue.pincode}</p>}
                  {!venue.city && event.location && <p>{event.location}</p>}
                </div>
              </div>
            )}
            {venue.description && <p className="mt-3 text-base text-[hsl(var(--muted-foreground))] leading-relaxed">{venue.description}</p>}
          </div>

          {venue.directions && (
            <div>
              <h4 className="font-semibold text-base flex items-center gap-2 text-[hsl(var(--foreground))]"><Map size={16} className="text-[hsl(var(--primary))]" />How to Reach</h4>
              <p className="mt-2 text-base text-[hsl(var(--muted-foreground))] leading-relaxed">{venue.directions}</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {venue.parking && (
              <div>
                <h4 className="font-semibold text-base text-[hsl(var(--foreground))]">Parking</h4>
                <p className="mt-1 text-base text-[hsl(var(--muted-foreground))]">{venue.parking}</p>
              </div>
            )}
            {venue.accommodation && (
              <div>
                <h4 className="font-semibold text-base text-[hsl(var(--foreground))]">Accommodation</h4>
                <p className="mt-1 text-base text-[hsl(var(--muted-foreground))]">{venue.accommodation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(venue.mapUrl || event.venueMapUrl) ? (
            <div className="rounded-xl overflow-hidden border border-[hsl(var(--border))]">
              <iframe src={venue.mapUrl || event.venueMapUrl} width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center border border-[hsl(var(--border))] rounded-xl">
              <Map size={48} className="text-[hsl(var(--muted-foreground))] mb-4" />
              <p className="text-[hsl(var(--muted-foreground))]">Map will be available soon</p>
            </div>
          )}
          {venue.images && venue.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {venue.images.map((img, idx) => <img key={idx} src={mediaUrl(img)} alt={`Venue ${idx + 1}`} className="rounded-lg object-cover w-full h-32" />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
