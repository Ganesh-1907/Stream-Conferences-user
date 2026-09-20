import { useState, useMemo, type FormEvent } from 'react';
import { CalendarDays, MapPin, ChevronDown, ArrowUpRight, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { isFeeDateExpired } from './fees';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

type FeeItem = { type: string; dateLabel: string; deadline?: string | Date; usd: number; gbp: number; eur: number };
type Currency = 'USD' | 'EUR' | 'GBP';

function formatDateRange(event: EventData): string {
  const start = event.startDate || event.eventDate;
  if (!start) return event.day && event.month ? `${event.month} ${event.day}` : '';
  const startD = new Date(start);
  const end = event.endDate ? new Date(event.endDate) : null;
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (end && end.getTime() !== startD.getTime()) {
    return `${startD.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
  }
  return startD.toLocaleDateString(undefined, opts);
}

const CURRENCY_SYMBOL: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' };

export function RegisterPage({ event }: { event: EventData }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedFeeIndex, setSelectedFeeIndex] = useState<number>(0);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [mockPayment, setMockPayment] = useState<any>(null);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [sent, setSent] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('fees');
  const [copied, setCopied] = useState(false);

  const fees = useMemo(() => (Array.isArray(event.fees) ? (event.fees as FeeItem[]) : []), [event.fees]);

  const importantDates = useMemo(() => {
    const list: { label: string; expired: boolean }[] = [];
    const seen = new Set<string>();
    if (Array.isArray(event.fees)) {
      for (const f of event.fees as FeeItem[]) {
        const label = (f.dateLabel || '').trim();
        if (label && !seen.has(label.toLowerCase())) {
          seen.add(label.toLowerCase());
          list.push({
            label,
            expired: isFeeDateExpired(f),
          });
        }
      }
    }
    return list;
  }, [event.fees]);

  const groupedFees = useMemo(() => {
    const map = new Map<string, FeeItem[]>();
    for (const f of fees) {
      const key = f.type || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return Array.from(map.entries());
  }, [fees]);

  const selectedFee = fees[selectedFeeIndex] || fees[0] || null;

  const phone = phoneNum.trim();
  const name = `${firstName} ${lastName}`.trim();

  const verifyPayment = async (orderId: string, paymentId: string, signature: string) => {
    try {
      const res = await fetch(`${API_BASE}/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, signature }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch {
      setError('Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  const openRazorpayCheckout = (order: any) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: order.key, amount: order.amount, currency: order.currency,
        name: event.title, description: `${selectedFee?.type || category} Registration`, order_id: order.id,
        modal: { ondismiss: () => setPaying(false) },
        handler: (response: any) => verifyPayment(order.id, response.razorpay_payment_id, response.razorpay_signature),
        prefill: { name, email, contact: phone },
        theme: { color: '#8B5CF6' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => { setError('Failed to load payment gateway'); setPaying(false); };
    document.body.appendChild(script);
  };

  const handlePayNow = () => {
    setError('');
    if (mockPayment) {
      setPaying(true);
      verifyPayment(paymentOrderId, mockPayment.paymentId, mockPayment.signature);
      return;
    }
    if (pendingOrder) {
      setPaying(true);
      openRazorpayCheckout(pendingOrder);
    }
  };

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phoneNum || !institution || !country) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const category = selectedFee?.type || '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const regRes = await fetch(`${API_BASE}/registrations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, institution, country, category,
          eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain || event.eventId,
          cohortId: event.activeCohort?.cohortId || null,
        }),
      });
      if (!regRes.ok) throw new Error((await regRes.json()).error || 'Registration failed');
      const regData = await regRes.json();

      const selectedPrice = currency === 'USD' ? selectedFee?.usd : currency === 'EUR' ? selectedFee?.eur : selectedFee?.gbp;

      const orderRes = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, category, amount: selectedPrice || 245, currency, registrationId: regData._id,
          eventId: event._id, eventType: event.eventType, eventTitle: event.title, eventSlug: event.slug || event.subdomain || event.eventId,
          cohortId: event.activeCohort?.cohortId || null,
        }),
      });
      if (!orderRes.ok) throw new Error((await orderRes.json()).error || 'Payment order creation failed');
      const orderData = await orderRes.json();

      setPaymentOrderId(orderData.order.id);
      setPaymentAmount(orderData.order.amount / 100);
      if (orderData.mock) { setMockPayment(orderData.mock); setPendingOrder(null); }
      else { setPendingOrder(orderData.order); setMockPayment(null); }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRegisterLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const guidelines = Array.isArray(event.guidelines)
    ? event.guidelines.length ? event.guidelines : []
    : event.guidelines
      ? [event.guidelines]
      : [
          'Registration is mandatory for all participants.',
          'Carry a valid photo ID at the venue.',
          'Virtual attendees receive access links 24 hours before the event.',
        ];

  const sym = CURRENCY_SYMBOL[currency];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="EVENT REGISTRATION"
        title="Register For Conference"
        tagline="Complete your registration in simple steps to confirm your attendance and participation."
      />
      <div className="container-wide py-10 sm:py-14 max-w-6xl">

      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 1 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">1</span>
          Personal Details
        </div>
        <div className="w-8 h-px bg-[hsl(var(--border))]" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 2 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">2</span>
          Fee & Confirm
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[auto_480px] items-start">
        <div className="space-y-6">
          {sent ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 shadow-sm text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <Check size={28} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Registration Complete!</h3>
                <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Your registration and payment have been successfully recorded. A confirmation email has been sent to {email}.</p>
              </div>
              <button onClick={() => { setSent(false); setStep(1); setFirstName(''); setLastName(''); setEmail(''); setPhoneNum(''); setInstitution(''); setCountry(''); setSelectedFeeIndex(0); setConsent(false); setPaymentOrderId(''); }} className="mt-4 btn-main btn-primary">Register Another</button>
            </div>
          ) : paymentOrderId && !sent ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
              <div>
                <p className="label text-[hsl(var(--primary))]">Payment</p>
                <h3 className="display mt-2 text-xl font-bold text-[hsl(var(--foreground))]">Complete your registration</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Registration recorded for <strong>{name}</strong> as <strong>{category}</strong>.</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted)/.4)] p-4 border border-[hsl(var(--border))] flex justify-between items-center">
                <span className="text-base font-medium text-[hsl(var(--foreground))]">Amount due</span>
                <span className="text-xl font-bold text-[hsl(var(--secondary))]">{sym}{paymentAmount.toFixed(2)}</span>
              </div>
              {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
              <button type="button" onClick={handlePayNow} disabled={paying} className="w-full btn-main btn-primary py-3">{paying ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16} /> Processing payment...</span> : <>Pay Now · {sym}{paymentAmount.toFixed(2)} <ArrowUpRight size={16} /></>}</button>
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Secure payment via Razorpay. All major cards, UPI and net banking accepted.</p>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <form onSubmit={handleStep1} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                  <div>
                    <p className="label text-[hsl(var(--primary))]">Step 1 of 2</p>
                    <h3 className="display mt-2 text-xl font-bold text-[hsl(var(--foreground))]">Personal Information</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">First Name *</label>
                      <input required className="form-field w-full" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Last Name *</label>
                      <input required className="form-field w-full" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Email Address *</label>
                      <input required type="email" className="form-field w-full" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Phone Number *</label>
                      <input required type="tel" className="form-field w-full" placeholder="Mobile number" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
                      <input required className="form-field w-full" placeholder="Institution or company" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Country *</label>
                      <input required className="form-field w-full" placeholder="Country of residence" value={country} onChange={(e) => setCountry(e.target.value)} />
                    </div>
                  </div>

                  {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
                  <button type="submit" className="w-full btn-main btn-primary py-3 mt-2">Continue <ArrowRight className="ml-1 inline" size={16} /></button>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Your data is protected. By continuing, you agree to our Terms & Conditions.</p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                  <div>
                    <p className="label text-[hsl(var(--primary))]">Step 2 of 2</p>
                    <h3 className="display mt-2 text-xl font-bold text-[hsl(var(--foreground))]">Fee & Confirmation</h3>
                  </div>

                  <div className="rounded-xl bg-[hsl(var(--muted)/.3)] p-4 border border-[hsl(var(--border))]">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">Registering as: <strong>{name}</strong> ({email})</p>
                  </div>

                  {/* Currency selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Select Currency</label>
                    <div className="flex gap-3">
                      {(['USD', 'EUR', 'GBP'] as Currency[]).map((c) => (
                        <label key={c} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${currency === c ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.5)]'}`}>
                          <input type="radio" name="currency" value={c} checked={currency === c} onChange={() => setCurrency(c)} className="sr-only" />
                          {CURRENCY_SYMBOL[c]} {c}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Fee selection grouped by type */}
                  <div className="space-y-4">
                    <label className="text-base font-bold text-[hsl(var(--foreground))]">Select Fee Category *</label>
                    <div className="space-y-5">
                      {groupedFees.map(([type, items]) => (
                        <div key={type}>
                          <p className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2.5">{type}</p>
                          <div className="grid gap-2.5">
                            {items.map((item, idx) => {
                              const globalIdx = fees.indexOf(item);
                              const price = currency === 'USD' ? item.usd : currency === 'EUR' ? item.eur : item.gbp;
                              const expired = isFeeDateExpired(item);
                              return (
                                <label key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${expired ? 'opacity-50 cursor-not-allowed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.15)]' : selectedFeeIndex === globalIdx ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.05)] cursor-pointer' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)] cursor-pointer'}`}>
                                  <div className="flex items-center gap-3.5">
                                    <input type="radio" name="feeSelect" checked={selectedFeeIndex === globalIdx} onChange={() => setSelectedFeeIndex(globalIdx)} required disabled={expired} className="h-5 w-5 text-[hsl(var(--primary))]" />
                                    <span className={`text-base font-semibold text-[hsl(var(--foreground))] ${expired ? 'line-through' : ''}`}>{item.dateLabel || 'Standard'}</span>
                                  </div>
                                  <span className={`text-lg sm:text-xl font-bold text-[hsl(var(--secondary))] ${expired ? 'line-through' : ''}`}>{sym}{Number(price).toLocaleString()}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-main border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] w-1/3 justify-center py-3">Back</button>
                    <button type="submit" disabled={isSubmitting || paying} className="btn-main btn-primary flex-1 justify-center py-3">{isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16} /> Creating Order...</span> : 'Proceed to payment'}</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">
            <div>
              <span className={`inline-block mb-3 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${event.eventType === 'webinar' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>{event.eventType}</span>
              <h2 className="display text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">{event.title}</h2>
            </div>
            <div className="space-y-4 pt-3 border-t border-[hsl(var(--border))]">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={18} />
                <div><p className="font-bold text-[hsl(var(--foreground))] text-sm">Date</p><p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{formatDateRange(event)}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-[hsl(var(--primary))] shrink-0" size={18} />
                <div><p className="font-bold text-[hsl(var(--foreground))] text-sm">Location</p><p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">{event.location || 'Online / Virtual'}</p></div>
              </div>
            </div>
            <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">

              {/* Important Dates Accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'dates' ? null : 'dates')}
                  className="w-full flex items-center justify-between font-bold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors cursor-pointer"
                >
                  <span className="uppercase tracking-wider">Important Dates</span>
                  <ChevronDown size={16} className={`transform transition-transform ${openAccordion === 'dates' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'dates' && (
                  <div className="mt-2.5 pl-1 space-y-2.5 text-sm text-[hsl(var(--muted-foreground))]">
                    {importantDates.length > 0 ? (
                      importantDates.map((d, i) => (
                        <div key={i} className={`flex items-center justify-between gap-3 border-b border-[hsl(var(--border)/0.4)] pb-2 last:border-0 ${d.expired ? 'opacity-50 line-through' : ''}`}>
                          <span className="font-semibold text-[hsl(var(--foreground))] text-sm">{d.label}</span>
                          {d.expired && <span className="text-xs font-bold text-red-500 uppercase shrink-0">Expired</span>}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm opacity-60">No important dates available.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Fee Levels Accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'fees' ? null : 'fees')}
                  className="w-full flex items-center justify-between font-bold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors cursor-pointer"
                >
                  <span className="uppercase tracking-wider">Fee Levels</span>
                  <ChevronDown size={16} className={`transform transition-transform ${openAccordion === 'fees' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'fees' && (
                  <div className="mt-2.5 pl-1 space-y-3.5 text-sm text-[hsl(var(--muted-foreground))]">
                    {groupedFees.length > 0 ? (
                      groupedFees.map(([type, items]) => (
                        <div key={type} className="space-y-2 border-b border-[hsl(var(--border)/0.3)] pb-3 last:border-0 last:pb-0">
                          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">{type}</p>
                          <div className="space-y-2">
                            {items.map((item, idx) => {
                              const price = currency === 'USD' ? item.usd : currency === 'EUR' ? item.eur : item.gbp;
                              const expired = isFeeDateExpired(item);
                              return (
                                <div key={idx} className={`flex items-center justify-between text-sm ${expired ? 'opacity-50 line-through' : ''}`}>
                                  <span className="font-semibold text-[hsl(var(--foreground))] text-sm">{item.dateLabel || 'Standard'}</span>
                                  <span className="font-bold text-[hsl(var(--secondary))] text-sm">{sym}{Number(price).toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm opacity-60">No fee levels configured.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Organizer Contact Accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'organizer' ? null : 'organizer')}
                  className="w-full flex items-center justify-between font-bold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors cursor-pointer"
                >
                  <span className="uppercase tracking-wider">Organizer Contact</span>
                  <ChevronDown size={16} className={`transform transition-transform ${openAccordion === 'organizer' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'organizer' && (
                  <div className="mt-2.5 pl-1 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Name:</span> {event.organizerContact?.name || '—'}</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Email:</span> {event.organizerContact?.email || '—'}</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Phone:</span> {event.organizerContact?.phone || '—'}</p>
                  </div>
                )}
              </div>
            </div>
            <button type="button" onClick={copyRegisterLink} className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.02)] transition-all">
              {copied ? 'Copied ✓' : 'Copy Registration Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
