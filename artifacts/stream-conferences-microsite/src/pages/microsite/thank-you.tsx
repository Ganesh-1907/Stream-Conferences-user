import { Link } from 'wouter';
import { Check } from 'lucide-react';
import type { EventData } from './layout';

export function ThankYouPage({ event }: { event: EventData }) {
  return (
    <div className="container-wide max-w-2xl py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] mx-auto"><Check size={28} /></div>
      <h1 className="mt-6 text-3xl font-bold text-[hsl(var(--foreground))]">Thank you!</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-[hsl(var(--muted-foreground))] mx-auto">
        Your submission has been received successfully. We will get back to you shortly.
      </p>
      <Link href="/" className="btn-main btn-primary mt-8 inline-flex">Back to event</Link>
    </div>
  );
}
