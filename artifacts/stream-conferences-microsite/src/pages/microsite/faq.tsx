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

      <div className="container-wide py-4 sm:py-6">
        {faqs.length === 0 ? (
          <div className="py-12 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
            <p className="text-[hsl(var(--muted-foreground))] font-medium">No FAQs available for this event yet.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {sortedFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className={`group rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden bg-[hsl(var(--card))] shadow-xs hover:-translate-y-1 hover:shadow-lg ${
                    isOpen
                      ? 'border-[hsl(var(--secondary)/0.8)] shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.18)]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--secondary)/0.8)] hover:shadow-[0_10px_25px_-5px_hsl(var(--secondary)/0.15)]'
                  }`}
                >
                  <div
                    className="flex w-full items-center justify-between gap-5 p-5 sm:p-6 text-left font-bold text-base sm:text-lg select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="group-hover:text-[hsl(var(--secondary))] transition-colors text-[hsl(var(--foreground))]">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-[hsl(var(--secondary))] transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <div className="border-t border-[hsl(var(--border))] px-6 pb-6 pt-4 text-base sm:text-lg leading-8 text-[hsl(var(--foreground)/.85)] bg-[hsl(var(--muted)/.15)]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
