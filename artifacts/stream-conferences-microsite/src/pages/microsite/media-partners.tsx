import { Award } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { PartnerLogoCard } from '@/components/partner-logo-card';

export function MediaPartnersPage({ event }: { event: EventData }) {
  const mediaPartners = Array.isArray(event?.mediaPartners) ? event.mediaPartners : [];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="OFFICIAL COLLABORATION"
        title="Media Partners"
        tagline="Recognizing our esteemed media partners and global publishing collaborators supporting this summit."
      />

      <div className="container-wide py-10 sm:py-14">
        {mediaPartners.length === 0 ? (
          <div className="text-center py-16 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 space-y-3 max-w-2xl mx-auto">
            <Award size={48} className="mx-auto text-[hsl(var(--primary))]" />
            <h3 className="text-xl font-bold font-['Space_Grotesk']">Media Partners To Be Announced</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
              Our official media partners and press collaborators for this summit will be listed here shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mediaPartners.map((partner, idx) => (
              <PartnerLogoCard key={idx} item={partner} defaultType={`Media Partner ${idx + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

