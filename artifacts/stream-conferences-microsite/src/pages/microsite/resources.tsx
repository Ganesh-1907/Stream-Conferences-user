import { Download, FileText, Image } from 'lucide-react';
import type { EventData } from './layout';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function ResourcesPage({ event }: { event: EventData }) {
  const has = Boolean(event.brochureUrl || event.logoUrl || event.bannerUrl);
  if (!has) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No resources available for download yet.</p>
      </div>
    );
  }

  const items: { label: string; url?: string; icon: any }[] = [
    { label: 'Event Brochure', url: event.brochureUrl || '', icon: <FileText size={18} /> },
    { label: 'Event Logo', url: event.logoUrl || '', icon: <Image size={18} /> },
    { label: 'Banner', url: event.bannerUrl || '', icon: <Image size={18} /> },
  ].filter((i) => i.url);

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Resources</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Brochure & logo</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Download the official event assets</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <a key={item.label} href={mediaUrl(item.url || '')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--primary) / .5)] hover:bg-[hsl(var(--primary) / .05)] transition-colors">
            <span className="text-[hsl(var(--primary))]">{item.icon}</span>
            <span className="font-medium text-base">{item.label}</span>
            <Download size={14} className="text-[hsl(var(--muted-foreground))]" />
          </a>
        ))}
      </div>
    </div>
  );
}
