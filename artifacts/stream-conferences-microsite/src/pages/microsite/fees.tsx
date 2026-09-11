import { useMemo } from 'react';
import { Link } from 'wouter';
import type { EventData } from './layout';

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

  if (fees.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No fee information available for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="section-eyebrow justify-center">Registration</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Participation Fees</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Choose your registration category and view applicable currency rates</p>
      </div>

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
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-full font-bold text-sm uppercase tracking-wider hover:opacity-90 transition shadow-md"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
