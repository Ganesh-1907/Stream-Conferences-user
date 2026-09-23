import { Award } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { PartnerLogoCard } from '@/components/partner-logo-card';

export function MediaPartnersPage({ event }: { event: EventData }) {
  const mediaPartners = Array.isArray(event?.mediaPartners) ? event.mediaPartners : [];

  return (
    <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="OFFICIAL COLLABORATION"
        title="Media Partners"
        tagline="Recognizing our esteemed media partners and global publishing collaborators supporting this summit."
      />

      <div className="container-wide py-4 sm:py-6">
        {mediaPartners.length === 0 ? (
          <div className="text-center py-16 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 space-y-3 max-w-2xl mx-auto">
            <Award size={48} className="mx-auto text-[hsl(var(--primary))]" />
            <h3 className="text-xl font-bold font-['Space_Grotesk']">Media Partners To Be Announced</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
              Our official media partners and press collaborators for this summit will be listed here shortly.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 sm:gap-8 items-start">
            {mediaPartners.map((partner, idx) => (
              <div key={idx} className="w-56 sm:w-64 md:w-72 shrink-0">
                <PartnerLogoCard item={partner} defaultType={`Media Partner ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

