import { Building, MapPin, Map, Globe, Compass, Car, Plane, ExternalLink } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function VenuePage({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};

  const venueName = venue.name || event.venue || '';
  const venueAddress = venue.address || event.venueAddress || '';
  
  // Format city, state, country or fallback to location
  const locationParts = [venue.city, venue.state, venue.country].filter(Boolean);
  const cityStateCountry = locationParts.length > 0 
    ? locationParts.join(', ') 
    : (event.location || '');

  const mainImage = venue.mainImage || (venue.images && venue.images[0]) || '';
  
  const subImages = (venue.subImages && venue.subImages.length > 0)
    ? venue.subImages.filter(Boolean)
    : (venue.images && venue.images.length > 1 ? venue.images.slice(1).filter(Boolean) : []);

  const hasContent = Boolean(
    venue.name || venue.address || venue.city || venue.mapUrl || 
    event.venue || event.location || venue.description || venue.directions ||
    mainImage || subImages.length > 0
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="CONFERENCE LOCATION"
        title="Venue & Location"
        tagline="Explore the conference center, accommodation options, travel directions, and nearby amenities."
      />

      <div className="container-wide py-10 sm:py-14 space-y-10">
        {!hasContent ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">Venue details not available yet.</p>
          </div>
        ) : (
          <>
            {/* 1. Highlighted Location Card */}
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] text-xs font-bold uppercase tracking-wider">
                    <Building size={14} />
                    <span>Venue Location</span>
                  </div>
                  {venueName && (
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--foreground))] tracking-tight font-['Space_Grotesk']">
                      {venueName}
                    </h2>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-base font-medium text-[hsl(var(--foreground))]">
                    {venueAddress && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={18} className="text-[hsl(var(--secondary))] shrink-0" />
                        {venueAddress}
                      </span>
                    )}

                    {cityStateCountry && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[hsl(var(--muted))] text-sm font-semibold text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
                        <Globe size={15} className="text-[hsl(var(--secondary))] shrink-0" />
                        {cityStateCountry}
                      </span>
                    )}
                  </div>
                </div>

                {venue.mapUrl && (
                  <a
                    href={venue.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-bold text-sm shadow hover:opacity-90 transition-all shrink-0"
                  >
                    <Compass size={18} />
                    Open Maps Location
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </section>

            {/* 2. Main Image Showcase & Venue Description (Side by Side) */}
            <section className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Left Column: Featured Main Image */}
              <div className="space-y-4">
                <div className="relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-md group">
                  {mainImage ? (
                    <img
                      src={mediaUrl(mainImage)}
                      alt={venueName || 'Venue'}
                      className="w-full h-80 sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : venue.mapUrl ? (
                    <iframe
                      src={venue.mapUrl}
                      className="w-full h-80 sm:h-[400px] border-0"
                      loading="lazy"
                      title="Venue Map"
                    />
                  ) : (
                    <div className="w-full h-80 sm:h-[400px] bg-gradient-to-br from-[hsl(var(--secondary)/.1)] to-[hsl(var(--primary)/.1)] flex flex-col items-center justify-center p-6 text-center">
                      <Building size={64} className="text-[hsl(var(--secondary))] mb-3 opacity-80" />
                      <p className="font-bold text-xl text-[hsl(var(--foreground))]">{venueName || 'Conference Venue'}</p>
                      {venueAddress && <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{venueAddress}</p>}
                    </div>
                  )}

                  {mainImage && (
                    <div className="absolute top-4 left-4 bg-[hsl(var(--background)/.9)] backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm">
                      Main Venue Showcase
                    </div>
                  )}
                </div>

                {venue.mapUrl && mainImage && (
                  <div className="rounded-2xl border border-[hsl(var(--border))] overflow-hidden shadow-sm h-64">
                    <iframe
                      src={venue.mapUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                      title="Venue Map Location"
                    />
                  </div>
                )}
              </div>

              {/* Right Column: Venue Description & Additional Notes */}
              <div className="space-y-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-sm">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] font-['Space_Grotesk'] pb-4 border-b border-[hsl(var(--border))]">
                    About the Venue
                  </h3>
                  {venue.description ? (
                    <div
                      className="mt-4 prose max-w-none text-[hsl(var(--foreground))] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: venue.description }}
                    />
                  ) : (
                    <p className="mt-4 text-base text-[hsl(var(--foreground))] leading-relaxed">
                      Detailed information about the venue, presentation rooms, and delegate services.
                    </p>
                  )}
                </div>

                {/* Additional Info Cards (Directions, Parking, Airport) */}
                {(venue.directions || venue.parking || (venue as any).nearestAirport) && (
                  <div className="space-y-4 pt-4 border-t border-[hsl(var(--border))]">
                    {venue.directions && (
                      <div className="rounded-xl bg-[hsl(var(--muted)/.5)] p-4 border border-[hsl(var(--border))]">
                        <h4 className="font-bold text-base flex items-center gap-2 text-[hsl(var(--foreground))]">
                          <Map size={18} className="text-[hsl(var(--secondary))]" />
                          How to Reach
                        </h4>
                        <p className="mt-2 text-sm sm:text-base text-[hsl(var(--foreground))] leading-relaxed">
                          {venue.directions}
                        </p>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {venue.parking && (
                        <div className="rounded-xl bg-[hsl(var(--muted)/.5)] p-4 border border-[hsl(var(--border))]">
                          <h4 className="font-bold text-sm flex items-center gap-2 text-[hsl(var(--foreground))]">
                            <Car size={16} className="text-[hsl(var(--secondary))]" />
                            Parking
                          </h4>
                          <p className="mt-1 text-sm text-[hsl(var(--foreground))]">{venue.parking}</p>
                        </div>
                      )}

                      {(venue as any).nearestAirport && (
                        <div className="rounded-xl bg-[hsl(var(--muted)/.5)] p-4 border border-[hsl(var(--border))]">
                          <h4 className="font-bold text-sm flex items-center gap-2 text-[hsl(var(--foreground))]">
                            <Plane size={16} className="text-[hsl(var(--secondary))]" />
                            Nearest Airport
                          </h4>
                          <p className="mt-1 text-sm text-[hsl(var(--foreground))]">{(venue as any).nearestAirport}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 3. Three Sub Images Gallery (Sub images at last) */}
            {subImages.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-[hsl(var(--border))]">
                <div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] font-['Space_Grotesk']">
                    Venue Gallery & Photos
                  </h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Photo showcase of the venue facilities, conference rooms, and surroundings.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  {subImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-[hsl(var(--muted))]">
                        <img
                          src={mediaUrl(imgUrl)}
                          alt={`Venue Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 text-center border-t border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                        <span className="text-xs font-bold text-[hsl(var(--foreground))]">
                          Sub Image 0{idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
