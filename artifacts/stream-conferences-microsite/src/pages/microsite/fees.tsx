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
      <div className="mb-8">
        <span className="section-eyebrow">Registration</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Participation fees</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Choose your registration category</p>
      </div>

      <div className="mx-auto max-w-[60%] space-y-10">
        {grouped.map(([type, items]) => (
          <div key={type}>
            <h2 className="text-xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))] mb-3">{type}</h2>
            <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
              <table className="w-full text-sm border-separate border-spacing-0" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '20%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-[hsl(var(--muted))]">
                    <th className="text-left px-6 py-3 font-semibold text-[hsl(var(--foreground))]">Heading</th>
                    <th className="text-right px-6 py-3 font-semibold text-[hsl(var(--foreground))]">EUR</th>
                    <th className="text-right px-6 py-3 font-semibold text-[hsl(var(--foreground))]">USD</th>
                    <th className="text-right px-6 py-3 font-semibold text-[hsl(var(--foreground))]">GBP</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="hover:bg-[hsl(var(--muted))]/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-[hsl(var(--foreground))] border-t border-[hsl(var(--border))]">{item.dateLabel || 'Standard'}</td>
                      <td className="px-6 py-3 text-right font-['Space_Grotesk'] font-semibold text-[hsl(var(--foreground))] border-t border-[hsl(var(--border))]">€{Number(item.eur).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-['Space_Grotesk'] font-semibold text-[hsl(var(--foreground))] border-t border-[hsl(var(--border))]">${Number(item.usd).toLocaleString()}</td>
                      <td className="px-6 py-3 text-right font-['Space_Grotesk'] font-semibold text-[hsl(var(--foreground))] border-t border-[hsl(var(--border))]">£{Number(item.gbp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-xl font-semibold hover:opacity-90 transition"
        >
          Register Now
        </Link>
      </div>
    </div>
  );
}
