import { useState, useMemo } from 'react';
import { Link } from 'wouter';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { ArrowRight } from 'lucide-react';

export interface FeeItemPrice {
  USD?: number;
  GBP?: number;
  EUR?: number;
}

export interface FeeCategoryItem {
  id: string;
  name: string;
  prices: FeeItemPrice;
}

export interface FeeCategory {
  id: string;
  name: string;
  items: FeeCategoryItem[];
}

export interface DeadlineTier {
  id: string;
  title: string;
  dateText?: string;
  deadlineDate?: string;
  categories: FeeCategory[];
}

export type Currency = 'GBP' | 'USD' | 'EUR';

export const CURRENCY_INFO: Record<Currency, { symbol: string; label: string }> = {
  GBP: { symbol: '£', label: 'GBP (£)' },
  USD: { symbol: '$', label: 'USD ($)' },
  EUR: { symbol: '€', label: 'EUR (€)' },
};

export function normalizeFeesToDeadlineTiers(rawFees: any): DeadlineTier[] {
  if (!rawFees || !Array.isArray(rawFees) || rawFees.length === 0) {
    return [];
  }

  // If already in DeadlineTier[] structure
  if (rawFees[0] && (rawFees[0].categories || rawFees[0].title)) {
    return rawFees as DeadlineTier[];
  }

  // If legacy flat FeeEntry[]: { type, dateLabel, usd, gbp, eur, deadline }
  const dateMap = new Map<string, DeadlineTier>();
  rawFees.forEach((fee: any, idx: number) => {
    const label = fee.dateLabel || fee.type || `Deadline ${idx + 1}`;
    if (!dateMap.has(label)) {
      dateMap.set(label, {
        id: `d_${idx}`,
        title: label,
        dateText: fee.dateLabel || '',
        deadlineDate: fee.deadline ? String(fee.deadline).slice(0, 10) : '',
        categories: []
      });
    }
    const tier = dateMap.get(label)!;
    let cat = tier.categories.find(c => c.name === (fee.type || 'General'));
    if (!cat) {
      cat = { id: `c_${tier.categories.length}`, name: fee.type || 'General', items: [] };
      tier.categories.push(cat);
    }
    cat.items.push({
      id: `i_${cat.items.length}`,
      name: fee.dateLabel ? `${fee.type || 'Registration'} (${fee.dateLabel})` : fee.type || 'Registration',
      prices: { USD: Number(fee.usd) || 0, GBP: Number(fee.gbp) || 0, EUR: Number(fee.eur) || 0 }
    });
  });

  return Array.from(dateMap.values());
}

export function isFeeDateExpired(item: any): boolean {
  const deadline = item.deadline || item.deadlineDate;
  if (!deadline) return false;
  const d = new Date(deadline);
  return !isNaN(d.getTime()) && d < new Date();
}

const CATEGORY_COLOR_MAP: Record<string, { header: string; tag: string }> = {
  academic: {
    header: 'bg-[#6ec7a2] dark:bg-[#4ea883] text-white',
    tag: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
  },
  business: {
    header: 'bg-[#7da0be] dark:bg-[#587c9e] text-white',
    tag: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
  },
  student: {
    header: 'bg-[#f39f9b] dark:bg-[#d67b77] text-white',
    tag: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
  },
  webinar: {
    header: 'bg-[#99d6ea] dark:bg-[#68acc2] text-white',
    tag: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800'
  },
  general: {
    header: 'bg-primary text-primary-foreground',
    tag: 'text-primary bg-primary/10 border-primary/20'
  }
};

const DEFAULT_CATEGORY_COLORS = [
  { header: 'bg-[#6ec7a2] dark:bg-[#4ea883] text-white', tag: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
  { header: 'bg-[#7da0be] dark:bg-[#587c9e] text-white', tag: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800' },
  { header: 'bg-[#f39f9b] dark:bg-[#d67b77] text-white', tag: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { header: 'bg-[#99d6ea] dark:bg-[#68acc2] text-white', tag: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
  { header: 'bg-[#f6b26b] dark:bg-[#c9833b] text-white', tag: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { header: 'bg-[#b4a7d6] dark:bg-[#8676ad] text-white', tag: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
];

function getCategoryStyle(name: string, index: number) {
  const key = (name || '').toLowerCase().trim();
  for (const [k, style] of Object.entries(CATEGORY_COLOR_MAP)) {
    if (key.includes(k)) return style;
  }
  return DEFAULT_CATEGORY_COLORS[index % DEFAULT_CATEGORY_COLORS.length];
}

export function FeesPage({ event }: { event: EventData }) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');

  const deadlineTiers = useMemo(() => {
    return normalizeFeesToDeadlineTiers(event.fees);
  }, [event.fees]);

  const currencySymbol = CURRENCY_INFO[selectedCurrency].symbol;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pb-16">
      <MicrositeHero
        badge="REGISTRATION & FEES"
        title="Participation Fees"
        tagline="Choose your registration category, early-bird deadlines, and view applicable currency rates."
      />

      <div className="container-wide py-8 sm:py-12 space-y-8">
        {/* Currency Selector */}
        <div className="bg-[#f0f4f8] dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 max-w-xl mx-auto text-center shadow-xs">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 font-['Space_Grotesk']">
            Choose your Currency
          </h3>
          <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            {(['GBP', 'USD', 'EUR'] as const).map((c) => {
              const active = selectedCurrency === c;
              return (
                <label
                  key={c}
                  className={`flex items-center gap-2.5 cursor-pointer font-bold text-sm sm:text-base transition px-3 py-1.5 rounded-xl ${
                    active
                      ? 'text-[hsl(var(--primary))] bg-white dark:bg-slate-800 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="currency"
                    value={c}
                    checked={active}
                    onChange={() => setSelectedCurrency(c)}
                    className="w-4 h-4 text-[hsl(var(--primary))] accent-[hsl(var(--primary))] cursor-pointer"
                  />
                  <span>{CURRENCY_INFO[c].label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Deadlines Grid */}
        {deadlineTiers.length === 0 ? (
          <div className="py-14 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto shadow-xs">
            <p className="text-[hsl(var(--muted-foreground))] font-semibold text-base">
              No fee information available for this conference yet.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 lg:gap-8 ${
            deadlineTiers.length === 1
              ? 'max-w-md mx-auto grid-cols-1'
              : deadlineTiers.length === 2
              ? 'max-w-4xl mx-auto grid-cols-1 md:grid-cols-2'
              : deadlineTiers.length === 3
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : deadlineTiers.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}>
            {deadlineTiers.map((tier, tIdx) => (
              <div
                key={tier.id || tIdx}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-card dark:bg-[#0f172a] shadow-lg overflow-hidden flex flex-col transition-all hover:shadow-xl"
              >
                {/* Tier Top Header Banner */}
                <div className="bg-gradient-to-br from-[#d98b76] via-[#cb7386] to-[#a85a85] dark:from-[#9c513e] dark:to-[#743557] text-white p-5 text-center flex flex-col items-center justify-center min-h-[125px] shadow-inner">
                  {(tier.dateText || tier.deadlineDate) && (
                    <span className="text-xs font-semibold text-white/85 tracking-wide uppercase">
                      (On or Before)
                    </span>
                  )}
                  <span className="text-lg sm:text-xl font-black tracking-tight my-1 drop-shadow-xs">
                    {tier.dateText || tier.deadlineDate || 'Registration Deadline'}
                  </span>
                  <span className="text-sm font-bold text-white/95 mt-0.5">
                    {tier.title || `Deadline Tier #${tIdx + 1}`}
                  </span>
                </div>

                {/* Tier Categories */}
                <div className="p-4 sm:p-5 flex-1 space-y-5 bg-card">
                  {tier.categories.map((cat, cIdx) => {
                    const style = getCategoryStyle(cat.name, cIdx);
                    return (
                      <div
                        key={cat.id || cIdx}
                        className="rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02] overflow-hidden shadow-2xs"
                      >
                        {/* Category Header */}
                        <div className={`py-2 px-4 text-center font-bold text-sm tracking-wide ${style.header}`}>
                          {cat.name || 'General'}
                        </div>

                        {/* Category Items */}
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                          {cat.items.map((item, iIdx) => {
                            const price = item.prices?.[selectedCurrency] ?? 0;
                            return (
                              <div
                                key={item.id || iIdx}
                                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white dark:hover:bg-white/[0.04] transition-colors"
                              >
                                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                                  {item.name || 'Registration Item'}
                                </span>
                                <span className="shrink-0 px-2.5 py-1 rounded-lg border text-xs font-black font-mono shadow-2xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                                  {currencySymbol} {Number(price).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA Button */}
        <div className="text-center pt-8">
          <Link
            href="/register"
            className="btn-main btn-primary inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full text-base font-bold shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Proceed to Registration</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
