import { useMemo } from 'react';
import { Link } from 'wouter';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

type FeeItem = { type: string; dateLabel: string; usd: number; gbp: number; eur: number };

export function FeesPage({ event }: { event: EventData }) {
  const fees = Array.isArray(event.fees) ? (event.fees as FeeItem[]) : [];

  const grouped = useMemo(() => {
    const map = new Map<string, FeeItem[]>();
    for (const f of fees) {
      const key = f.type || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return Array.from(map.entries());
  }, [fees]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="REGISTRATION & FEES"
        title="Participation Fees"
        tagline="Choose your registration category, early-bird deadlines, and view applicable currency rates."
      />

      <div className="container-wide py-10 sm:py-14">
        {fees.length === 0 ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No fee information available for this event yet.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-10">
            {grouped.map(([type, items]) => (
              <div key={type} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-[#f0f4f9] dark:bg-slate-900/60 border-b border-[hsl(var(--border))]">
                  <h2 className="text-base font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))] uppercase tracking-wider">{type || 'Untitled Fee Type'}</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[hsl(var(--muted)/.4)] border-b border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold text-xs uppercase tracking-wider">
                        <th className="text-left px-6 py-3.5 w-[40%]">HEADING</th>
                        <th className="text-center px-6 py-3.5 w-[20%]">EUR (€)</th>
                        <th className="text-center px-6 py-3.5 w-[20%]">USD ($)</th>
                        <th className="text-center px-6 py-3.5 w-[20%]">GBP (£)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {items.map((item, i) => (
                        <tr key={i} className="hover:bg-[hsl(var(--muted)/.3)] transition-colors">
                          <td className="px-6 py-4 font-semibold text-[hsl(var(--foreground))]">{item.dateLabel || 'Standard'}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-[hsl(var(--foreground))]">€{Number(item.eur || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-[hsl(var(--foreground))]">${Number(item.usd || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-center font-mono font-bold text-[hsl(var(--foreground))]">£{Number(item.gbp || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="text-center pt-4">
              <Link href="/register" className="btn-main btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full text-base font-bold shadow-lg">
                Proceed to Registration
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
