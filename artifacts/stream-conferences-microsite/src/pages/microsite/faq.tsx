import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

export function FAQPage({ event }: { event: EventData }) {
  const faqs = event.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const sortedFaqs = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="FREQUENTLY ASKED QUESTIONS"
        title="Frequently Asked Questions"
        tagline="Find answers to common questions about abstract submission, registration, venue, and attendance."
      />

      <div className="container-wide py-10 sm:py-14">
        {faqs.length === 0 ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No FAQs available for this event yet.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {sortedFaqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="faq-question">
                  <span>{faq.question}</span>
                  <ChevronDown size={18} className={`text-[hsl(var(--muted-foreground))] transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openIndex === idx && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
