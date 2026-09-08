import { useState, useMemo, type FormEvent } from 'react';
import { CalendarDays, MapPin, ChevronDown, ArrowUpRight, ArrowRight, Check } from 'lucide-react';
import type { EventData } from './layout';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

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

export function RegisterPage({ event }: { event: EventData }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState(event.fees?.[0]?.label || '');
  const [presentingAbstract, setPresentingAbstract] = useState('No');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [mockPayment, setMockPayment] = useState<any>(null);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [sent, setSent] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    if (event.fees?.length) return event.fees.map((f) => f.label);
    return ['Student', 'Academic', 'Industry Delegate', 'Virtual Attendee'];
  }, [event.fees]);

  const eventPrices = useMemo(() => {
    if (event.fees?.length) {
      return event.fees.map((f) => [f.label, `₹${f.amount}`, `₹${Math.round(f.amount * 1.2)}`]);
    }
    return [['Student', '₹20000', '₹26000'], ['Academic', '₹32000', '₹39000'], ['Industry Delegate', '₹42000', '₹52000'], ['Virtual Attendee', '₹12000', '₹15000']];
  }, [event.fees]);

  const phone = `${countryCode} ${phoneNum}`.trim();
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
        name: event.title, description: `${category} Registration`, order_id: order.id,
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must agree to the declaration before continuing.');
      return;
    }
    setError('');
    try {
      const regRes = await fetch(`${API_BASE}/registrations/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, institution, country, category, presentingAbstract,
          eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain || event.eventId,
        }),
      });
      if (!regRes.ok) throw new Error((await regRes.json()).error || 'Registration failed');
      const regData = await regRes.json();

      const orderRes = await fetch(`${API_BASE}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, category, registrationId: regData._id,
          eventId: event._id, eventType: event.eventType, eventTitle: event.title, eventSlug: event.slug || event.subdomain || event.eventId,
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
          'Early-bird pricing ends 30 days before the event.',
          'Virtual attendees receive access links 24 hours before the event.',
        ];

  return (
    <div className="container-wide py-12 max-w-6xl">
      {/* Title + step indicators above the grid */}
      <div className="mb-8 text-center md:text-left">
        <span className="section-eyebrow">Event Registration Gateway</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">{event.title}</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Complete your registration in two simple steps</p>
      </div>

      <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
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
              <button onClick={() => { setSent(false); setStep(1); setFirstName(''); setLastName(''); setEmail(''); setPhoneNum(''); setInstitution(''); setCountry(''); setCategory(event.fees?.[0]?.label || ''); setConsent(false); setPaymentOrderId(''); }} className="mt-4 btn-main btn-primary">Register Another</button>
            </div>
          ) : paymentOrderId && !sent ? (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
              <div>
                <p className="label text-[hsl(var(--accent))]">Payment</p>
                <h3 className="display mt-2 text-xl font-bold">Complete your registration</h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Registration recorded for <strong>{name}</strong> as <strong>{category}</strong>.</p>
              </div>
              <div className="rounded-xl bg-[hsl(var(--muted)/.4)] p-4 border border-[hsl(var(--border))] flex justify-between items-center">
                <span className="text-base font-medium">Amount due</span>
                <span className="text-xl font-bold text-[hsl(var(--secondary))]">₹{paymentAmount.toFixed(2)}</span>
              </div>
              {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
              <button type="button" onClick={handlePayNow} disabled={paying} className="w-full btn-main btn-primary py-3">{paying ? 'Processing...' : `Pay Now · ₹${paymentAmount.toFixed(2)}`} <ArrowUpRight size={16} /></button>
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Secure payment via Razorpay. All major cards, UPI and net banking accepted.</p>
            </div>
          ) : (
            <>
              {step === 1 ? (
                <form onSubmit={handleStep1} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                  <div>
                    <p className="label text-[hsl(var(--accent))]">Step 1 of 2</p>
                    <h3 className="display mt-2 text-xl font-bold">Delegate Personal Information</h3>
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
                      <div className="flex gap-2">
                        <select className="form-field shrink-0" style={{ width: '96px', minWidth: '96px' }} value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                          <option>+91</option><option>+1</option><option>+44</option><option>+33</option><option>+65</option><option>+61</option>
                        </select>
                        <input required type="tel" className="form-field" style={{ flex: 1, minWidth: 0 }} placeholder="Mobile number" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
                      </div>
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

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Presenting Abstract? *</label>
                    <select className="form-field w-full" value={presentingAbstract} onChange={(e) => setPresentingAbstract(e.target.value)}>
                      <option value="No">No</option><option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-2.5 text-sm text-[hsl(var(--muted-foreground))] cursor-pointer select-none">
                      <input type="checkbox" className="mt-0.5" defaultChecked />
                      <span>I would like to receive updates on products, services, news and surveys.</span>
                    </label>
                  </div>

                  {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}
                  <button type="submit" className="w-full btn-main btn-primary py-3 mt-2">Continue <ArrowRight className="ml-1 inline" size={16} /></button>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Your data is protected. By continuing, you agree to our Terms & Conditions.</p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                  <div>
                    <p className="label text-[hsl(var(--accent))]">Step 2 of 2</p>
                    <h3 className="display mt-2 text-xl font-bold">Fee & Confirmation</h3>
                  </div>

                  <div className="rounded-xl bg-[hsl(var(--muted)/.3)] p-4 border border-[hsl(var(--border))]">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">Registering as: <strong>{name}</strong> ({email})</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Registration Category *</label>
                    <div className="grid gap-3">
                      {eventPrices.map(([catName, earlyPrice, regularPrice]: string[]) => (
                        <label key={catName} className="flex items-center justify-between p-4 rounded-xl border border-[hsl(var(--border))] cursor-pointer hover:border-[hsl(var(--accent))] transition-colors">
                          <div className="flex items-center gap-3">
                            <input type="radio" name="feeCategory" value={catName} checked={category === catName} onChange={() => setCategory(catName)} required className="h-4 w-4" />
                            <span className="text-base font-medium">{catName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-[hsl(var(--secondary))]">{earlyPrice}</span>
                            <span className="block text-[10px] line-through opacity-60">{regularPrice}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[hsl(var(--border))]">
                    <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Declaration</label>
                    <label className="flex items-start gap-3 cursor-pointer p-4 bg-[hsl(var(--muted)/.3)] rounded-xl border border-[hsl(var(--border))]">
                      <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setError(''); }} className="mt-1 h-4 w-4" />
                      <span className="text-xs leading-5">I have read and agree to the <span className="text-[hsl(var(--accent))]">Health Declaration</span>, <span className="text-[hsl(var(--accent))]">Program Participant Agreement</span> and <span className="text-[hsl(var(--accent))]">Privacy Policy</span>.*</span>
                    </label>
                  </div>

                  {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}

                  <div className="flex gap-4 pt-2">
                    <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-main border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] w-1/3 justify-center py-3">Back</button>
                    <button type="submit" disabled={paying} className="btn-main btn-primary flex-1 justify-center py-3">{paying ? 'Processing...' : 'Proceed to payment'}</button>
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
            <div className="space-y-4 pt-2 border-t border-[hsl(var(--border))]">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 text-[hsl(var(--secondary))] shrink-0" size={16} />
                <div><p className="font-semibold text-[hsl(var(--foreground))] text-xs">Date</p><p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{formatDateRange(event)}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-[hsl(var(--accent))] shrink-0" size={16} />
                <div><p className="font-semibold text-[hsl(var(--foreground))] text-xs">Location</p><p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{event.location || 'Online / Virtual'}</p></div>
              </div>
            </div>
            <div className="border-t border-[hsl(var(--border))] pt-4 space-y-2">
              {/* Guidelines accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button type="button" onClick={() => setOpenAccordion(openAccordion === 'guidelines' ? null : 'guidelines')} className="w-full flex items-center justify-between font-semibold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors">
                  <span className="uppercase tracking-wider">Guidelines</span>
                  <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'guidelines' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'guidelines' && (
                  <div className="mt-2 pl-1 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {guidelines.length > 0 ? guidelines.map((g: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check size={12} className="mt-0.5 text-[hsl(var(--accent))] shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: g.replace(/\n/g, '<br/>') }} />
                      </div>
                    )) : (
                      <p className="text-xs opacity-60">No guidelines available.</p>
                    )}
                  </div>
                )}
              </div>
              {/* Fee Details accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button type="button" onClick={() => setOpenAccordion(openAccordion === 'fees' ? null : 'fees')} className="w-full flex items-center justify-between font-semibold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors">
                  <span className="uppercase tracking-wider">Fee Details</span>
                  <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'fees' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'fees' && (
                  <div className="mt-2 pl-1 space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                    {eventPrices.map(([catLabel, earlyPrice, regularPrice]: string[]) => (
                      <div key={catLabel} className="flex justify-between items-center border-b border-[hsl(var(--border))]/30 pb-1.5 last:border-0 last:pb-0">
                        <span className="font-medium text-[hsl(var(--foreground))]">{catLabel}</span>
                        <div className="text-right"><span className="font-bold text-[hsl(var(--secondary))]">{earlyPrice}</span><span className="block text-[10px] line-through opacity-60">{regularPrice}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Organizer Contact accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button type="button" onClick={() => setOpenAccordion(openAccordion === 'organizer' ? null : 'organizer')} className="w-full flex items-center justify-between font-semibold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors">
                  <span className="uppercase tracking-wider">Organizer Contact</span>
                  <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'organizer' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'organizer' && (
                  <div className="mt-2 pl-1 space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
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
  );
}
