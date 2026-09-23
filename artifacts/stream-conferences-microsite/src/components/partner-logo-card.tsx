import { Award } from 'lucide-react';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export interface PartnerItem {
  name?: string;
  title?: string;
  logo?: string;
  website?: string;
  description?: string;
  package?: string;
  tier?: string;
}

export function PartnerLogoCard({
  item,
  defaultType = 'Partner',
}: {
  item: PartnerItem;
  defaultType?: string;
}) {
  const displayName = item.name || item.title || defaultType;
  const logoUrl = item.logo ? mediaUrl(item.logo) : '';

  const cardContent = (
    <div className="group flex flex-col items-center justify-center w-full cursor-pointer transition-all duration-300">
      {/* Direct Logo Card Container */}
      <div className="card-lift relative w-full h-36 sm:h-40 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-3 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={displayName}
            className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-base rounded-xl gap-2 p-2">
            <Award size={24} />
            <span className="font-['Space_Grotesk'] line-clamp-1">{displayName}</span>
          </div>
        )}
      </div>

      {/* Name Label */}
      <h4 className="mt-2.5 text-sm sm:text-base font-extrabold text-[hsl(var(--foreground))] text-center line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors font-['Space_Grotesk']">
        {displayName}
      </h4>
    </div>
  );

  if (item.website) {
    return (
      <a
        href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full focus:outline-none"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="w-full">{cardContent}</div>;
}
