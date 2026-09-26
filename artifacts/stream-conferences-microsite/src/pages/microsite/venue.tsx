import { Building2, MapPin, Map, Globe2, Compass, Car, Plane, ExternalLink, Navigation } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

function getGoogleMapsEmbedUrl(name: string, address: string, cityStateCountry: string, mapUrl: string): string | null {
  if (mapUrl) {
    if (mapUrl.includes('google.com/maps/embed') || mapUrl.includes('output=embed')) {
      return mapUrl;
    }
  }
  const query = [name, address, cityStateCountry].filter(Boolean).join(', ').trim() || (mapUrl && !mapUrl.startsWith('http') ? mapUrl.trim() : '');
  if (!query) {
    if (mapUrl && mapUrl.startsWith('http')) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(mapUrl)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return null;
  }
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function VenuePage({ event }: { event: EventData }) {
  const venue = event.venueDetails || {};

  const venueName = venue.name || event.venue || '';
  const venueAddress = venue.address || event.venueAddress || '';
  const mapUrl = venue.mapUrl || (venue as any).locationUrl || (venue as any).venueMapUrl || event.venueMapUrl || (event as any).locationUrl || '';
  
  // Format city, state, country only if explicitly defined on the venue
  const locationParts = [venue.city, venue.state, venue.country].filter(Boolean);
  const cityStateCountry = locationParts.length > 0 ? locationParts.join(', ') : '';

  const embedMapUrl = getGoogleMapsEmbedUrl(venueName, venueAddress, cityStateCountry, mapUrl);
  const directMapLink = mapUrl ? (mapUrl.startsWith('http') ? mapUrl : `https://${mapUrl}`) : embedMapUrl ? `https://maps.google.com/maps?q=${encodeURIComponent([venueName, venueAddress, cityStateCountry].filter(Boolean).join(', '))}` : '';

  const mainImage = venue.mainImage || (venue.images && venue.images[0]) || '';
  
  const subImages = (venue.subImages && venue.subImages.length > 0)
    ? venue.subImages.filter(Boolean)
    : (venue.images && venue.images.length > 1 ? venue.images.slice(1).filter(Boolean) : []);

  const cityHighlights = (venue.cityHighlights && venue.cityHighlights.length > 0)
    ? venue.cityHighlights.filter(Boolean)
    : [];

  const hasLocationDetails = Boolean(venueName || venueAddress || cityStateCountry || embedMapUrl || mapUrl);
  const hasAboutVenue = Boolean(mainImage || venue.description || venue.directions || venue.parking || (venue as any).nearestAirport);
  const hasContent = hasLocationDetails || hasAboutVenue || subImages.length > 0 || cityHighlights.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="CONFERENCE LOCATION"
        title="Venue & Location"
        tagline="Explore the conference center, accommodation options, travel directions, and nearby amenities."
      />

      <div className="container-wide py-5 sm:py-7 space-y-8">
        {!hasContent ? (
          <div className="py-14 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 max-w-2xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] flex items-center justify-center mx-auto mb-3">
              <Building2 size={24} />
            </div>
            <p className="text-[hsl(var(--muted-foreground))] font-medium text-base">Venue details not available yet.</p>
          </div>
        ) : (
          <>
            {/* 1. Highlighted Location Card: Details on Left, Embedded Map on Right */}
            {hasLocationDetails && (
              <section className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 shadow-sm space-y-5">
                {/* Header with pill and direct map link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[hsl(var(--border))]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--secondary)/.1)] border border-[hsl(var(--secondary)/.2)] text-[hsl(var(--secondary))] text-xs font-bold uppercase tracking-wider">
                    <Building2 size={14} />
                    <span>Venue Location & Details</span>
                  </div>

                  {directMapLink && (
                    <a
                      href={directMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary)/.8)] transition-colors group"
                    >
                      <Navigation size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Open in Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Left side details & Right side embedded map */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Venue Details Card */}
                  <div className={`${embedMapUrl ? 'lg:col-span-5' : 'lg:col-span-12'} flex flex-col justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted)/.3)] border border-[hsl(var(--border))] shadow-xs`}>
                    <div className="space-y-4">
                      {/* Venue Name */}
                      {venueName && (
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary)/.12)] border border-[hsl(var(--secondary)/.2)] text-[hsl(var(--secondary))] flex items-center justify-center shrink-0 shadow-xs">
                            <Building2 size={18} />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--secondary))]">
                              Venue Name
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--foreground))] tracking-tight font-['Space_Grotesk'] capitalize leading-snug">
                              {venueName}
                            </h3>
                          </div>
                        </div>
                      )}

                      {/* Divider */}
                      {venueName && (venueAddress || cityStateCountry) && (
                        <div className="h-px bg-[hsl(var(--border))]" />
                      )}

                      {/* Venue Address */}
                      {venueAddress && (
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/.1)] border border-[hsl(var(--primary)/.2)] text-[hsl(var(--primary))] flex items-center justify-center shrink-0 shadow-xs">
                            <MapPin size={18} />
                          </div>
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                              Venue Address
                            </span>
                            <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-relaxed capitalize">
                              {venueAddress}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* City & Country */}
                      {cityStateCountry && (
                        <>
                          <div className="h-px bg-[hsl(var(--border))]" />
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary)/.12)] border border-[hsl(var(--secondary)/.2)] text-[hsl(var(--secondary))] flex items-center justify-center shrink-0 shadow-xs">
                              <Globe2 size={18} />
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                                City & Country
                              </span>
                              <p className="text-sm font-medium text-[hsl(var(--foreground))] leading-relaxed">
                                {cityStateCountry}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Button inside Left Card */}
                    {directMapLink && (
                      <div className="pt-1">
                        <a
                          href={directMapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-bold text-xs sm:text-sm shadow-sm hover:opacity-95 hover:shadow-md transition-all active:scale-[0.99]"
                        >
                          <Compass size={15} />
                          <span>Get Directions / View Map</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Embedded Google Map */}
                  {embedMapUrl && (
                    <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] min-h-[260px] sm:min-h-[280px] lg:min-h-[290px] h-full shadow-sm flex relative group">
                      <iframe
                        title="Venue Location Map"
                        src={embedMapUrl}
                        width="100%"
                        height="100%"
                        className="w-full h-full min-h-[260px] border-0 rounded-2xl"
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 2. Main Image Showcase & Venue Description */}
            {hasAboutVenue && (
              <section className="space-y-6">
                <div>
                  <h3 className="display text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase text-[hsl(var(--secondary))] pb-4 border-b border-[hsl(var(--border))]">
                    About the Venue
                  </h3>
                </div>

                <div className="w-full">
                  {/* Left Column: Featured Main Image if present */}
                  {mainImage && (
                    <div className="w-full lg:w-[45%] xl:w-[42%] lg:max-w-[500px] lg:float-left lg:mr-8 lg:mb-6 mb-8">
                      <div className="relative overflow-hidden group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
                        <img
                          src={mediaUrl(mainImage)}
                          alt={venueName || 'Venue'}
                          className="w-full h-72 sm:h-80 md:h-[360px] object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        />
                        <div className="absolute top-4 left-4 bg-[hsl(var(--background)/.9)] backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-[hsl(var(--foreground))] border border-[hsl(var(--border))] shadow-sm">
                          Main Venue Showcase
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Venue Description */}
                  {venue.description && (
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none text-[hsl(var(--foreground))] leading-relaxed text-base sm:text-lg text-justify prose-strong:font-bold prose-strong:text-[hsl(var(--foreground))]"
                      dangerouslySetInnerHTML={{ __html: venue.description }}
                    />
                  )}

                  <div className="clear-both" />
                </div>

                {/* Additional Info Cards (Directions, Parking, Airport) */}
                {(venue.directions || venue.parking || (venue as any).nearestAirport) && (
                  <div className="space-y-4 pt-6 border-t border-[hsl(var(--border))]">
                    {venue.directions && (
                      <div className="rounded-2xl bg-[hsl(var(--muted)/.5)] p-5 border border-[hsl(var(--border))]">
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
                        <div className="rounded-2xl bg-[hsl(var(--muted)/.5)] p-4 border border-[hsl(var(--border))]">
                          <h4 className="font-bold text-sm flex items-center gap-2 text-[hsl(var(--foreground))]">
                            <Car size={16} className="text-[hsl(var(--secondary))]" />
                            Parking
                          </h4>
                          <p className="mt-1 text-sm text-[hsl(var(--foreground))]">{venue.parking}</p>
                        </div>
                      )}

                      {(venue as any).nearestAirport && (
                        <div className="rounded-2xl bg-[hsl(var(--muted)/.5)] p-4 border border-[hsl(var(--border))]">
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
              </section>
            )}

            {/* 3. Three Sub Images Gallery */}
            {subImages.length > 0 && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] font-['Space_Grotesk']">
                    Venue Gallery & Photos
                  </h3>
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

            {/* 4. Three City Attractions Gallery */}
            {cityHighlights.length > 0 && (
              <section className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] font-['Space_Grotesk']">
                    City Attractions
                  </h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-3">
                  {cityHighlights.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="card-lift group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm p-4"
                    >
                      <div className="aspect-[4/3] h-56 sm:h-64 w-full overflow-hidden flex items-center justify-center bg-[hsl(var(--card))]">
                        <img
                          src={mediaUrl(imgUrl)}
                          alt={`City Attraction ${idx + 1}`}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
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
