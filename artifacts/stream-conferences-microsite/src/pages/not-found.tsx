import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="line-grid flex min-h-[70dvh] w-full items-center justify-center px-5">
      <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center shadow-xl shadow-[hsl(var(--primary)/.08)]">
        <AlertCircle className="mx-auto text-[hsl(var(--accent))]" size={38} />
        <p className="label mt-6 text-[hsl(var(--secondary))]">Signal lost</p>
        <h1 className="display mt-3 text-4xl font-bold tracking-[-.04em]" data-testid="text-not-found-title">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]" data-testid="text-not-found-description">This route is outside the current conference program.</p>
        <Link href="/" className="btn-main btn-primary mt-7" data-testid="link-not-found-home"><ArrowLeft size={16} /> Return to conference home</Link>
      </div>
    </div>
  );
}
