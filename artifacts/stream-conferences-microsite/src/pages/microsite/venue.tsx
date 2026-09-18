import { Building, MapPin, Map } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function VenuePage({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};
  const has = Boolean(venue.name || venue.address || venue.city || venue.mapUrl || event.venue || event.location || venue.description || venue.directions);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="CONFERENCE LOCATION"
        title="Venue & Location"
        tagline="Explore the conference center, accommodation options, travel directions, and nearby amenities."
      />

      <div className="container-wide py-10 sm:py-14">
        {!has ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">Venue details not available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-[hsl(var(--foreground))] font-['Space_Grotesk']">
                  <Building size={20} className="text-[hsl(var(--primary))]" />
                  {venue.name || event.venue || 'Venue'}
                </h3>
                {(venue.address || event.venueAddress || event.location) && (
                  <div className="mt-3 flex items-start gap-2 text-base text-[hsl(var(--muted-foreground))]">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" />
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">{venue.address || event.venueAddress}</p>
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
                  <h4 className="font-semibold text-base flex items-center gap-2 text-[hsl(var(--foreground))] font-['Space_Grotesk']"><Map size={18} className="text-[hsl(var(--primary))]" />How to Reach</h4>
                  <p className="mt-2 text-base text-[hsl(var(--muted-foreground))] leading-relaxed">{venue.directions}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {venue.parking && (
                  <div>
                    <h4 className="font-semibold text-base text-[hsl(var(--foreground))]">Parking</h4>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{venue.parking}</p>
                  </div>
                )}
                {(venue as any).nearestAirport && (
                  <div>
                    <h4 className="font-semibold text-base text-[hsl(var(--foreground))]">Nearest Airport</h4>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{(venue as any).nearestAirport}</p>
                  </div>
                )}
              </div>
            </div>

            {venue.mapUrl && (
              <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm h-[380px]">
                <iframe src={venue.mapUrl} className="w-full h-full border-0" loading="lazy" title="Venue map" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
