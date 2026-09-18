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
    <div className="group relative w-full h-full p-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm hover:shadow-xl hover:border-[hsl(var(--primary))] transition-all duration-300 flex flex-col items-center justify-between text-center min-h-[220px]">
      {/* Top Tag/Badge if tier or website is present */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        {(item.tier || item.package) && (
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] font-bold uppercase tracking-wider">
            {item.tier || item.package}
          </span>
        )}
        {item.website && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Visit →
          </span>
        )}
      </div>

      {/* Inner Container dedicated for high logo visibility */}
      <div className="w-full h-32 sm:h-36 flex items-center justify-center p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 shadow-inner group-hover:scale-[1.03] transition-transform duration-300">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={displayName}
            className="max-h-24 sm:max-h-28 w-auto max-w-full object-contain filter drop-shadow-sm transition-all"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center font-bold text-2xl font-['Space_Grotesk'] shadow-sm">
            {displayName[0]?.toUpperCase() || <Award size={28} />}
          </div>
        )}
      </div>

      {/* Partner/Sponsor Name Label */}
      <div className="mt-4 flex flex-col items-center w-full">
        <h4 className="font-bold text-base sm:text-lg text-[hsl(var(--foreground))] font-['Space_Grotesk'] tracking-wide group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
          {displayName}
        </h4>
        {item.description && (
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-1 max-w-[220px]">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );

  if (item.website) {
    return (
      <a
        href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] rounded-2xl"
      >
        {cardContent}
      </a>
    );
  }

  return <div className="h-full">{cardContent}</div>;
}
