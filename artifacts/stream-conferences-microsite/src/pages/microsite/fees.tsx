import { Link } from 'wouter';
import type { EventData } from './layout';

export function FeesPage({ event }: { event: EventData }) {
  const fees = Array.isArray(event.fees) ? event.fees : [];
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

      <div className="space-y-4">
        {fees.map((f, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-[hsl(var(--border))] last:border-0">
            <div>
              <p className="font-semibold text-lg text-[hsl(var(--foreground))]">{f.label}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Per delegate</p>
            </div>
            <div className="text-right">
              <p className="font-['Space_Grotesk'] text-2xl font-bold text-[hsl(var(--primary))]">₹{Number(f.amount).toLocaleString('en-IN')}</p>
              <Link href="/register" className="text-base text-[hsl(var(--primary))] font-medium hover:underline">Register →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
