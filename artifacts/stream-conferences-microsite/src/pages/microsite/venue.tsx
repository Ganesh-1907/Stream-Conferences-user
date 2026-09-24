import { Building, MapPin, Map, Globe, Compass, Car, Plane, ExternalLink } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function VenuePage({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};

  const venueName = venue.name || event.venue || '';
  const venueAddress = venue.address || event.venueAddress || '';
  const mapUrl = venue.mapUrl || venue.locationUrl || venue.venueMapUrl || event.venueMapUrl || (event as any).locationUrl || '';
  
  // Format city, state, country only if explicitly defined on the venue
  const locationParts = [venue.city, venue.state, venue.country].filter(Boolean);
  const cityStateCountry = locationParts.length > 0 ? locationParts.join(', ') : '';

  const mainImage = venue.mainImage || (venue.images && venue.images[0]) || '';
  
  const subImages = (venue.subImages && venue.subImages.length > 0)
    ? venue.subImages.filter(Boolean)
    : (venue.images && venue.images.length > 1 ? venue.images.slice(1).filter(Boolean) : []);

  const hasContent = Boolean(
    venueName || venueAddress || cityStateCountry || mapUrl || 
    venue.description || venue.directions || mainImage || subImages.length > 0
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="CONFERENCE LOCATION"
        title="Venue & Location"
        tagline="Explore the conference center, accommodation options, travel directions, and nearby amenities."
      />

      <div className="container-wide py-4 sm:py-6 space-y-6">
        {!hasContent ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">Venue details not available yet.</p>
          </div>
        ) : (
          <>
            {/* 1. Highlighted Location Card with Side Headings */}
            <section className="card-lift rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[hsl(var(--border))]">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] text-xs font-bold uppercase tracking-wider">
                  <Building size={14} />
                  <span>Venue Location & Details</span>
                </div>
              </div>

              {/* Grid of details with clear side headings */}
              <div className={`grid grid-cols-1 ${cityStateCountry ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
                {/* Side Heading 1: Venue Name */}
                <div className="p-4 rounded-2xl bg-[hsl(var(--muted)/.4)] border border-[hsl(var(--border))] space-y-1.5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                    <Building size={14} className="text-[hsl(var(--secondary))]" />
                    Venue Name
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold text-[hsl(var(--foreground))] tracking-tight font-['Space_Grotesk']">
                    {venueName || 'To Be Announced'}
                  </p>
                </div>

                {/* Side Heading 2: Venue Address */}
                <div className="p-4 rounded-2xl bg-[hsl(var(--muted)/.4)] border border-[hsl(var(--border))] space-y-1.5 flex flex-col justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                    <MapPin size={14} className="text-[hsl(var(--secondary))]" />
                    Venue Address
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] leading-snug">
                    {venueAddress || 'Venue address will be announced soon'}
                  </p>
                </div>

                {/* Side Heading 3: City & Country (Only when explicitly present) */}
                {cityStateCountry && (
                  <div className="p-4 rounded-2xl bg-[hsl(var(--muted)/.4)] border border-[hsl(var(--border))] space-y-1.5 flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                      <Globe size={14} className="text-[hsl(var(--secondary))]" />
                      City & Country
                    </span>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))]">
                      {cityStateCountry}
                    </p>
                  </div>
                )}
              </div>

              {/* Side Heading 4: Location URL / Map Link Card */}
              {mapUrl && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[hsl(var(--secondary)/.06)] border border-[hsl(var(--secondary)/.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--secondary))] flex items-center gap-1.5">
                      <Compass size={14} />
                      Location URL / Map Link
                    </span>
                    <a
                      href={mapUrl.startsWith('http') ? mapUrl : `https://${mapUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs sm:text-sm font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--secondary))] transition-colors block truncate max-w-2xl underline underline-offset-4"
                    >
                      {mapUrl}
                    </a>
                  </div>

                  <a
                    href={mapUrl.startsWith('http') ? mapUrl : `https://${mapUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-bold text-xs hover:opacity-90 transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    <Compass size={15} />
                    <span>Open in Google Maps</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </section>

            {/* 2. Main Image Showcase & Venue Description (Side by Side) */}
            <section className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Left Column: Featured Main Image */}
              <div className="space-y-4">
                <div className="relative overflow-hidden group">
                  {mainImage ? (
                    <img
                      src={mediaUrl(mainImage)}
                      alt={venueName || 'Venue'}
                      className="w-full h-80 sm:h-[400px] object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                    />
                  ) : mapUrl ? (
                    <div className="w-full h-80 sm:h-[400px] bg-gradient-to-br from-[hsl(var(--secondary)/.12)] to-[hsl(var(--primary)/.12)] border border-[hsl(var(--border))] flex flex-col items-center justify-center p-6 text-center rounded-2xl space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center shadow-xs">
                        <MapPin size={32} />
                      </div>
                      <p className="font-bold text-xl text-[hsl(var(--foreground))]">{venueName || 'Conference Venue'}</p>
                      {venueAddress && <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md">{venueAddress}</p>}
                      <a
                        href={mapUrl.startsWith('http') ? mapUrl : `https://${mapUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-bold text-xs shadow-sm hover:opacity-90 transition"
                      >
                        <Compass size={15} />
                        Open Google Maps
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <div className="w-full h-80 sm:h-[400px] bg-gradient-to-br from-[hsl(var(--secondary)/.1)] to-[hsl(var(--primary)/.1)] flex flex-col items-center justify-center p-6 text-center rounded-2xl">
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
              </div>

              {/* Right Column: Venue Description & Additional Notes */}
              <div className="space-y-6">
                <div>
                  <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))] pb-4 border-b border-[hsl(var(--border))]">
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
                      className="card-lift group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm p-4"
                    >
                      <div className="aspect-[4/3] h-56 sm:h-64 w-full overflow-hidden flex items-center justify-center bg-[hsl(var(--card))]">
                        <img
                          src={mediaUrl(imgUrl)}
                          alt={`Venue Photo ${idx + 1}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
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
