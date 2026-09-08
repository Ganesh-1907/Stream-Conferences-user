import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EventData } from './layout';

export function FAQPage({ event }: { event: EventData }) {
  const faqs = event.faqs || [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (faqs.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No FAQs available for this event yet.</p>
      </div>
    );
  }

  const sortedFaqs = [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">FAQ</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Frequently asked questions</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Find answers to common questions</p>
      </div>

      <div>
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
    </div>
  );
}
