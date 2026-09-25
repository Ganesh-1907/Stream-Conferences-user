import { useState, useMemo, useEffect, useRef, type FormEvent } from 'react';
import { CalendarDays, MapPin, ChevronDown, ArrowUpRight, ArrowRight, Check, Loader2, User, CreditCard } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { normalizeFeesToDeadlineTiers, isFeeDateExpired, type DeadlineTier, type Currency, CURRENCY_INFO } from './fees';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { COUNTRIES, countryName } from '@/lib/countries';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

const TITLE_OPTIONS = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Assist Prof.', 'Assoc Prof.'];

export interface SelectableFeeOption {
  id: string;
  tierId: string;
  tierTitle: string;
  dateText?: string;
  deadlineDate?: string;
  categoryName: string;
  itemName: string;
  prices: { USD: number; GBP: number; EUR: number };
  expired: boolean;
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

export function RegisterPage({ event }: { event: EventData }) {
  const [step, setStep] = useState<1 | 2>(1);

  // Personal Details
  const [title, setTitle] = useState('Dr.');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [institution, setInstitution] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');

  // Billing Details
  const [sameAsPersonal, setSameAsPersonal] = useState(false);
  const [billingTitle, setBillingTitle] = useState('Dr.');
  const [billingFullName, setBillingFullName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingInstitution, setBillingInstitution] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCountry, setBillingCountry] = useState('');

  // Step 2 state
  const [currency, setCurrency] = useState<Currency>('USD');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [sent, setSent] = useState(false);

  // Payment gateway selection
  const [gateway, setGateway] = useState<'razorpay' | 'stripe'>('razorpay');
  const [orderPayload, setOrderPayload] = useState<Record<string, any> | null>(null);
  const [payStage, setPayStage] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [stripeElements, setStripeElements] = useState<any>(null);
  const [stripePaying, setStripePaying] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [stripePreparing, setStripePreparing] = useState(false);
  const ordersRef = useRef<Record<string, Promise<any>>>({});
  const stripeInitRef = useRef(false);
  const paymentElementRef = useRef<HTMLDivElement | null>(null);

  // Sync billing details when sameAsPersonal is enabled
  useEffect(() => {
    if (sameAsPersonal) {
      setBillingTitle(title);
      setBillingFullName(fullName);
      setBillingEmail(email);
      setBillingPhone(phoneNum);
      setBillingInstitution(institution);
      setBillingAddress(address);
      setBillingCountry(country);
    }
  }, [sameAsPersonal, title, fullName, email, phoneNum, institution, address, country]);

  const handleToggleSameAsPersonal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSameAsPersonal(checked);
    if (checked) {
      setBillingTitle(title);
      setBillingFullName(fullName);
      setBillingEmail(email);
      setBillingPhone(phoneNum);
      setBillingInstitution(institution);
      setBillingAddress(address);
      setBillingCountry(country);
    }
  };

  const deadlineTiers = useMemo(() => {
    return normalizeFeesToDeadlineTiers(event.fees);
  }, [event.fees]);

  // Flatten options for lookup
  const allFeeOptions = useMemo<SelectableFeeOption[]>(() => {
    const list: SelectableFeeOption[] = [];
    deadlineTiers.forEach((tier, tIdx) => {
      const tierTitle = tier.title || `Deadline Tier #${tIdx + 1}`;
      const expired = isFeeDateExpired(tier);
      tier.categories.forEach((cat) => {
        cat.items.forEach((item) => {
          list.push({
            id: `${tier.id || tIdx}_${cat.id}_${item.id}`,
            tierId: tier.id || String(tIdx),
            tierTitle,
            dateText: tier.dateText,
            deadlineDate: tier.deadlineDate,
            categoryName: cat.name || 'General',
            itemName: item.name || 'Registration',
            prices: {
              USD: Number(item.prices?.USD) || 0,
              GBP: Number(item.prices?.GBP) || 0,
              EUR: Number(item.prices?.EUR) || 0,
            },
            expired,
          });
        });
      });
    });
    return list;
  }, [deadlineTiers]);

  // Only select when user explicitly chooses one
  const selectedOption = useMemo(() => {
    if (selectedOptionId) {
      const found = allFeeOptions.find((o) => o.id === selectedOptionId);
      if (found && !found.expired) return found;
    }
    return null;
  }, [allFeeOptions, selectedOptionId]);

  const phone = phoneNum.trim();
  const name = title ? `${title} ${fullName}`.trim() : fullName.trim();
  const sym = CURRENCY_INFO[currency].symbol;

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

  const loadStripeJs = () =>
    new Promise<any>((resolve, reject) => {
      if ((window as any).Stripe) return resolve((window as any).Stripe);
      const existing = document.querySelector<HTMLScriptElement>('script[data-stripe-js]');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).Stripe));
        existing.addEventListener('error', () => reject(new Error('Failed to load payment gateway')));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.setAttribute('data-stripe-js', 'true');
      script.onload = () => resolve((window as any).Stripe);
      script.onerror = () => reject(new Error('Failed to load payment gateway'));
      document.body.appendChild(script);
    });

  const createOrderFor = (gw: 'razorpay' | 'stripe') => {
    if (!ordersRef.current[gw]) {
      ordersRef.current[gw] = (async () => {
        const res = await fetch(`${API_BASE}/orders/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...orderPayload, gateway: gw }),
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Payment order creation failed');
        const data = await res.json();
        setPaymentOrderId(data.order.id);
        setPaymentAmount(data.order.amount / 100);
        return data;
      })();
    }
    return ordersRef.current[gw];
  };

  const resetPaymentState = () => {
    ordersRef.current = {};
    stripeInitRef.current = false;
    setStripeKey('');
    setStripeClientSecret('');
    setStripeInstance(null);
    setStripeElements(null);
    setStripeError('');
    setStripePreparing(false);
    setPaymentOrderId('');
    setPaymentAmount(0);
    setGateway('razorpay');
    setPayStage(false);
    setOrderPayload(null);
  };

  // Stripe 3DS redirects reload this page, so restore the payment session and finish verification.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get('payment_intent');
    const redirectStatus = params.get('redirect_status');
    if (!paymentIntentId || !redirectStatus) return;

    let saved: any = {};
    try {
      saved = JSON.parse(sessionStorage.getItem('stripe_return') || '{}');
    } catch {
      saved = {};
    }
    sessionStorage.removeItem('stripe_return');

    ['payment_intent', 'payment_intent_client_secret', 'redirect_status', 'source_type'].forEach((key) =>
      params.delete(key),
    );
    const query = params.toString();
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );

    if (saved.title) setTitle(saved.title);
    if (saved.fullName) setFullName(saved.fullName);
    if (saved.email) setEmail(saved.email);
    if (saved.orderPayload) setOrderPayload(saved.orderPayload);
    if (saved.paymentAmount) setPaymentAmount(Number(saved.paymentAmount));
    if (saved.orderId) setPaymentOrderId(saved.orderId);
    setGateway('stripe');
    setPayStage(true);

    if (redirectStatus !== 'succeeded') {
      setError('Payment was not completed. Please try again.');
      return;
    }
    if (!saved.orderId) {
      setError('Payment verification failed');
      return;
    }
    stripeInitRef.current = true;
    void verifyPayment(saved.orderId, paymentIntentId, '');
  }, []);

  // Prepare the Stripe Payment Element as soon as Stripe is the chosen gateway.
  useEffect(() => {
    if (!payStage || gateway !== 'stripe' || stripeClientSecret || stripeInitRef.current) return;
    stripeInitRef.current = true;
    let cancelled = false;
    setStripePreparing(true);
    (async () => {
      try {
        const data = await createOrderFor('stripe');
        if (cancelled) return;
        if (data.mock) {
          await verifyPayment(data.order.id, data.mock.paymentId, data.mock.signature);
          return;
        }
        setStripeKey(data.order.key || '');
        setStripeClientSecret(data.order.clientSecret || '');
      } catch (err: any) {
        if (!cancelled) {
          stripeInitRef.current = false;
          setStripeError(err.message || 'Payment order creation failed');
        }
      } finally {
        if (!cancelled) setStripePreparing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [payStage, gateway, stripeClientSecret]);

  // Initialise the Stripe.js runtime once we have a client secret.
  useEffect(() => {
    if (!stripeClientSecret || !stripeKey) return;
    let cancelled = false;
    (async () => {
      try {
        const StripeCtor = await loadStripeJs();
        if (cancelled) return;
        const stripe = StripeCtor(stripeKey);
        const elements = stripe.elements({ clientSecret: stripeClientSecret });
        if (cancelled) return;
        setStripeInstance(stripe);
        setStripeElements(elements);
      } catch (err: any) {
        if (!cancelled) setStripeError(err.message || 'Failed to load payment gateway');
      }
    })();
    return () => { cancelled = true; };
  }, [stripeClientSecret, stripeKey]);

  // Mount / remount the Payment Element whenever the gateway view is shown.
  useEffect(() => {
    if (gateway !== 'stripe' || !stripeElements || !paymentElementRef.current) return;
    const paymentElement = stripeElements.create('payment', { layout: 'tabs' });
    paymentElement.mount(paymentElementRef.current);
    return () => {
      try { paymentElement.unmount(); } catch { /* already unmounted */ }
    };
  }, [stripeElements, gateway]);

  const openRazorpayCheckout = (order: any) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: event.title,
        description: selectedOption ? `${selectedOption.categoryName} - ${selectedOption.itemName}` : 'Conference Registration',
        order_id: order.id,
        modal: { ondismiss: () => setPaying(false) },
        handler: (response: any) => verifyPayment(order.id, response.razorpay_payment_id, response.razorpay_signature),
        prefill: { name, email, contact: phone },
        theme: { color: '#0d9488' },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    };
    script.onerror = () => { setError('Failed to load payment gateway'); setPaying(false); };
    document.body.appendChild(script);
  };

  const handlePayNow = async () => {
    setError('');
    setStripeError('');
    setPaying(true);
    try {
      const data = await createOrderFor(gateway);
      if (data.mock) {
        await verifyPayment(data.order.id, data.mock.paymentId, data.mock.signature);
        return;
      }
      if (gateway === 'stripe') {
        setStripeKey(data.order.key || '');
        setStripeClientSecret(data.order.clientSecret || '');
        setPaying(false);
        return;
      }
      openRazorpayCheckout(data.order);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
      setPaying(false);
    }
  };

  const handleStripeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripeInstance || !stripeElements) return;
    setStripeError('');
    setStripePaying(true);
    setPaying(true);
    try {
      sessionStorage.setItem(
        'stripe_return',
        JSON.stringify({
          orderId: paymentOrderId,
          orderPayload,
          paymentAmount,
          title,
          fullName,
          email,
        }),
      );
      const { error, paymentIntent } = await stripeInstance.confirmPayment({
        elements: stripeElements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });
      if (error) {
        setStripeError(error.message || 'Payment failed');
        setStripePaying(false);
        setPaying(false);
        return;
      }
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await verifyPayment(paymentOrderId, paymentIntent.id, '');
      } else {
        setStripeError(paymentIntent ? `Payment not completed (${paymentIntent.status})` : 'Payment could not be confirmed');
        setStripePaying(false);
        setPaying(false);
      }
    } catch {
      setStripeError('Payment verification failed');
      setStripePaying(false);
      setPaying(false);
    }
  };

  const selectGateway = (gw: 'razorpay' | 'stripe') => {
    if (gw === gateway) return;
    setGateway(gw);
    setStripeError('');
    setPaying(false);
  };

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email || !phoneNum || !institution || !country || !address.trim()) {
      setError('Please fill all required personal information fields.');
      return;
    }

    const finalBillingFullName = sameAsPersonal ? fullName : billingFullName;
    const finalBillingEmail = sameAsPersonal ? email : billingEmail;
    const finalBillingCountry = sameAsPersonal ? country : billingCountry;
    const finalBillingAddress = sameAsPersonal ? address : billingAddress;

    if (!finalBillingFullName.trim() || !finalBillingEmail.trim() || !finalBillingCountry.trim() || !finalBillingAddress.trim()) {
      setError('Please fill all required billing information fields or check "Same as personal information".');
      return;
    }

    if (allFeeOptions.length === 0) {
      setError('No registration fee options configured for this conference.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select a registration fee category.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const categoryLabel = `${selectedOption.categoryName} - ${selectedOption.itemName} (${selectedOption.tierTitle})`;
      const selectedPrice = selectedOption.prices[currency] || 0;

       const billingPayload = {
         title: sameAsPersonal ? title : billingTitle,
         fullName: sameAsPersonal ? fullName : billingFullName,
         email: sameAsPersonal ? email : billingEmail,
         phone: sameAsPersonal ? phoneNum : billingPhone,
         institution: sameAsPersonal ? institution : billingInstitution,
         country: countryName(sameAsPersonal ? country : billingCountry),
         address: sameAsPersonal ? address : billingAddress,
       };

       const regRes = await fetch(`${API_BASE}/registrations/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           title, fullName, name, email, phone, institution, address, country: countryName(country), category: categoryLabel,
           billingInfo: billingPayload,
           eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain || event.eventId,
           cohortId: event.activeCohort?.cohortId || null,
         }),
       });
      if (!regRes.ok) throw new Error((await regRes.json()).error || 'Registration failed');
      const regData = await regRes.json();

      resetPaymentState();
      setOrderPayload({
        title, fullName, name, email, phone, category: categoryLabel, address, country: sameAsPersonal ? country : billingCountry, amount: selectedPrice || 245, currency, registrationId: regData._id,
        eventId: event._id, eventType: event.eventType, eventTitle: event.title, eventSlug: event.slug || event.subdomain || event.eventId,
        cohortId: event.activeCohort?.cohortId || null,
      });
      setPaymentAmount(Number(selectedPrice) || 245);
      setPayStage(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] pb-20">
      <MicrositeHero
        badge="EVENT REGISTRATION"
        title="Register For Conference"
        tagline="Complete your registration in simple steps to confirm your attendance and participation."
      />

      <div className="container-wide max-w-6xl mx-auto py-8 space-y-8">
        {/* Step Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${step === 1 ? 'bg-[hsl(var(--primary))] text-white shadow-md' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-black">1</span>
            <span>Personal & Billing Details</span>
          </div>
          <div className="w-6 sm:w-8 h-px bg-[hsl(var(--border))]" />
          <div className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${step === 2 ? 'bg-[hsl(var(--primary))] text-white shadow-md' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-black">2</span>
            <span>Fee & Confirm</span>
          </div>
        </div>

        {sent ? (
          <div className="max-w-2xl mx-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 shadow-sm text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <Check size={32} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] font-['Space_Grotesk']">Registration Complete!</h3>
              <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Your registration and payment have been successfully recorded. A confirmation email has been sent to {email}.</p>
            </div>
            <button
              onClick={() => {
                setSent(false); setStep(1); setTitle('Dr.'); setFullName(''); setEmail(''); setPhoneNum('');
                setInstitution(''); setAddress(''); setCountry(''); setSelectedOptionId(''); resetPaymentState();
                setSameAsPersonal(false); setBillingFullName(''); setBillingEmail(''); setBillingPhone(''); setBillingAddress(''); setBillingCountry('');
              }}
              className="mt-4 btn-main btn-primary cursor-pointer"
            >
              Register Another Participant
            </button>
          </div>
        ) : payStage && !sent ? (
          <div className="max-w-xl mx-auto card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-6">
            <div>
              <p className="label text-[hsl(var(--primary))] font-bold uppercase tracking-wider text-xs">Payment</p>
              <h3 className="display mt-1 text-2xl font-bold text-[hsl(var(--foreground))]">Complete your registration</h3>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                Registration recorded for <strong>{name}</strong> as <strong>{selectedOption ? `${selectedOption.categoryName} - ${selectedOption.itemName}` : 'Participant'}</strong>.
              </p>
            </div>
            <div className="rounded-xl bg-[hsl(var(--muted)/.4)] p-5 border border-[hsl(var(--border))] flex justify-between items-center">
              <span className="text-base font-semibold text-[hsl(var(--foreground))]">Amount due</span>
              <span className="text-2xl font-black text-[hsl(var(--primary))]">{sym}{paymentAmount.toFixed(2)}</span>
            </div>

            {/* Gateway selection */}
            <div className="space-y-2.5">
              <span className="label text-[hsl(var(--primary))] font-bold uppercase tracking-wider text-xs">Choose payment gateway</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  { id: 'razorpay' as const, name: 'Razorpay', desc: 'Cards, UPI, Netbanking' },
                  { id: 'stripe' as const, name: 'Stripe', desc: 'International cards' },
                ]).map((gw) => {
                  const active = gateway === gw.id;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => selectGateway(gw.id)}
                      aria-pressed={active}
                      className={`relative flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3.5 text-left transition cursor-pointer ${
                        active
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] ring-1 ring-[hsl(var(--primary))]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)] hover:border-[hsl(var(--primary)/.45)]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-bold text-[hsl(var(--foreground))]">
                        <CreditCard size={15} className={active ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'} />
                        {gw.name}
                      </span>
                      <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">{gw.desc}</span>
                      {active && (
                        <Check size={15} className="absolute top-3 right-3 text-[hsl(var(--primary))]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 font-semibold">{error}</div>}
            {stripeError && !error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 font-semibold">{stripeError}</div>}

            {gateway === 'stripe' && stripeClientSecret ? (
              <form onSubmit={handleStripeSubmit} className="space-y-4">
                <div ref={paymentElementRef} id="payment-element" className="min-h-[52px] rounded-xl border border-[hsl(var(--border))] bg-white p-3" />
                <button
                  type="submit"
                  disabled={stripePaying || paying}
                  className="w-full btn-main btn-primary py-3.5 text-base font-bold shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {stripePaying || paying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> Processing payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Pay with Stripe · {sym}{paymentAmount.toFixed(2)} <ArrowUpRight size={18} />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying || stripePreparing}
                className="w-full btn-main btn-primary py-3.5 text-base font-bold shadow-lg cursor-pointer disabled:opacity-60"
              >
                {paying || stripePreparing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> {stripePreparing ? 'Preparing secure card form...' : 'Processing payment...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {gateway === 'stripe' ? 'Continue with Stripe' : 'Pay Now'} · {sym}{paymentAmount.toFixed(2)} <ArrowUpRight size={18} />
                  </span>
                )}
              </button>
            )}
            <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
              Secure payment via {gateway === 'stripe' ? 'Stripe' : 'Razorpay'}. All major cards accepted.
            </p>
          </div>
        ) : step === 1 ? (
          /* STEP 1 - Personal Information (Left) & Billing Information (Right) Perfectly Aligned */
          <form onSubmit={handleStep1} className="w-full space-y-8">
            <div className="grid gap-6 md:grid-cols-2 items-stretch">
              {/* Left Column: Personal Information */}
              <div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-[hsl(var(--border))] pb-3.5 flex items-center justify-between min-h-[44px]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                      <User size={20} className="text-[hsl(var(--primary))]" />
                      <span>Personal Information</span>
                    </h3>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Title *</label>
                        <Select value={title} onValueChange={(val) => setTitle(val)}>
                          <SelectTrigger className="form-field w-full rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-11 px-4 flex items-center justify-between cursor-pointer">
                            <SelectValue placeholder="Select Title" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl text-[hsl(var(--foreground))] z-50 p-1">
                            {TITLE_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t} className="rounded-lg cursor-pointer py-2 px-3 text-sm focus:bg-[hsl(var(--primary)/.1)] focus:text-[hsl(var(--primary))]">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Full Name *</label>
                        <input required className="form-field w-full" placeholder="e.g. John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Email Address *</label>
                        <input required type="email" className="form-field w-full" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Phone Number *</label>
                        <input required type="tel" className="form-field w-full" placeholder="+1 (555) 000-0000" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
                        <input required className="form-field w-full" placeholder="University or Company" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Country *</label>
                        <Select value={country} onValueChange={(val) => setCountry(val)}>
                          <SelectTrigger className="form-field w-full rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-11 px-4 flex items-center justify-between cursor-pointer">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl text-[hsl(var(--foreground))] z-50 p-1 max-h-64 overflow-auto">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code} className="rounded-lg cursor-pointer py-2 px-3 text-sm focus:bg-[hsl(var(--primary)/.1)] focus:text-[hsl(var(--primary))]">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Address *</label>
                      <textarea required rows={3} className="form-field w-full resize-y" placeholder="Full residential/office address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Billing Information */}
              <div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-[hsl(var(--border))] pb-3.5 flex items-center justify-between min-h-[44px]">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                      <CreditCard size={20} className="text-[hsl(var(--primary))]" />
                      <span>Billing Information</span>
                    </h3>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] hover:bg-[hsl(var(--primary)/.15)] px-3 py-1.5 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={sameAsPersonal}
                        onChange={handleToggleSameAsPersonal}
                        className="w-4 h-4 rounded text-[hsl(var(--primary))] accent-[hsl(var(--primary))] cursor-pointer"
                      />
                      <span>Same as personal</span>
                    </label>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Title *</label>
                        <Select
                          value={sameAsPersonal ? title : billingTitle}
                          onValueChange={(val) => setBillingTitle(val)}
                          disabled={sameAsPersonal}
                        >
                          <SelectTrigger className="form-field w-full rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-11 px-4 flex items-center justify-between cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                            <SelectValue placeholder="Select Title" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl text-[hsl(var(--foreground))] z-50 p-1">
                            {TITLE_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t} className="rounded-lg cursor-pointer py-2 px-3 text-sm focus:bg-[hsl(var(--primary)/.1)] focus:text-[hsl(var(--primary))]">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Full Name *</label>
                        <input
                          required
                          className="form-field w-full disabled:opacity-70 disabled:cursor-not-allowed"
                          placeholder="e.g. John Doe"
                          value={sameAsPersonal ? fullName : billingFullName}
                          onChange={(e) => setBillingFullName(e.target.value)}
                          disabled={sameAsPersonal}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Email Address *</label>
                        <input
                          required
                          type="email"
                          className="form-field w-full disabled:opacity-70 disabled:cursor-not-allowed"
                          placeholder="billing@example.com"
                          value={sameAsPersonal ? email : billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                          disabled={sameAsPersonal}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Phone Number *</label>
                        <input
                          required
                          type="tel"
                          className="form-field w-full disabled:opacity-70 disabled:cursor-not-allowed"
                          placeholder="+1 (555) 000-0000"
                          value={sameAsPersonal ? phoneNum : billingPhone}
                          onChange={(e) => setBillingPhone(e.target.value)}
                          disabled={sameAsPersonal}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
                        <input
                          required
                          className="form-field w-full disabled:opacity-70 disabled:cursor-not-allowed"
                          placeholder="Organization for invoice"
                          value={sameAsPersonal ? institution : billingInstitution}
                          onChange={(e) => setBillingInstitution(e.target.value)}
                          disabled={sameAsPersonal}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Country *</label>
                        <Select
                          value={sameAsPersonal ? country : billingCountry}
                          onValueChange={(val) => setBillingCountry(val)}
                          disabled={sameAsPersonal}
                        >
                          <SelectTrigger className="form-field w-full rounded-xl bg-[hsl(var(--card))] border-[hsl(var(--border))] text-[hsl(var(--foreground))] h-11 px-4 flex items-center justify-between cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl text-[hsl(var(--foreground))] z-50 p-1 max-h-64 overflow-auto">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c.code} value={c.code} className="rounded-lg cursor-pointer py-2 px-3 text-sm focus:bg-[hsl(var(--primary)/.1)] focus:text-[hsl(var(--primary))]">
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Address *</label>
                      <textarea
                        required
                        rows={3}
                        className="form-field w-full resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="Billing street address, postal code"
                        value={sameAsPersonal ? address : billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        disabled={sameAsPersonal}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 font-semibold text-center">{error}</div>}

            <div className="text-center pt-2">
              <button
                type="submit"
                className="btn-main btn-primary px-10 py-4 font-bold text-base shadow-xl hover:shadow-2xl transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Continue to Fee Selection</span>
                <ArrowRight size={18} className="ml-1 inline" />
              </button>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                Your information is encrypted & secure. By continuing, you agree to the conference Terms & Conditions.
              </p>
            </div>
          </form>
        ) : (
          /* STEP 2 - Full Width Side-by-Side Deadline Tiers with Radio Options */
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            {/* Top Bar: Participant Summary & Currency Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 sm:p-6 shadow-sm">
              <div>
                <p className="label text-[hsl(var(--primary))] font-bold uppercase tracking-wider text-xs">Step 2 of 2</p>
                <h3 className="display text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))]">Fee & Confirmation</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                  Registering as: <strong className="text-[hsl(var(--foreground))] font-bold">{name}</strong> ({email})
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-2 sm:gap-3 bg-[#f0f4f8] dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 px-4 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mr-1">Currency:</span>
                {(['GBP', 'USD', 'EUR'] as const).map((c) => {
                  const active = currency === c;
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-1.5 cursor-pointer font-bold text-xs sm:text-sm transition px-3 py-1.5 rounded-xl ${
                        active
                          ? 'text-[hsl(var(--primary))] bg-white dark:bg-slate-800 shadow-xs ring-1 ring-[hsl(var(--primary))]'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="currency"
                        value={c}
                        checked={active}
                        onChange={() => setCurrency(c)}
                        className="w-3.5 h-3.5 text-[hsl(var(--primary))] accent-[hsl(var(--primary))] cursor-pointer"
                      />
                      <span>{CURRENCY_INFO[c].label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Deadline Tier Columns (Matching Step 1 Width) */}
            {deadlineTiers.length === 0 ? (
              <div className="py-14 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 max-w-2xl mx-auto shadow-xs">
                <p className="text-[hsl(var(--muted-foreground))] font-semibold text-base">
                  No fee information configured for this conference.
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 lg:gap-8 ${
                deadlineTiers.length === 1
                  ? 'max-w-xl mx-auto grid-cols-1'
                  : deadlineTiers.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {deadlineTiers.map((tier, tIdx) => {
                  const isExpired = isFeeDateExpired(tier);
                  return (
                    <div
                      key={tier.id || tIdx}
                      className={`rounded-2xl border bg-white dark:bg-[#0f172a] shadow-lg overflow-hidden flex flex-col transition-all ${
                        isExpired ? 'opacity-60 border-slate-300 dark:border-slate-800' : 'border-slate-200 dark:border-white/10 hover:shadow-xl'
                      }`}
                    >
                      {/* Tier Header Banner */}
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

                      {/* Tier Categories Container */}
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

                              {/* Category Items with Radio Beside Price */}
                              <div className="divide-y divide-slate-100 dark:divide-white/5">
                                {cat.items.map((item, iIdx) => {
                                  const optId = `${tier.id || tIdx}_${cat.id}_${item.id}`;
                                  const isSelected = selectedOption?.id === optId;
                                  const price = item.prices?.[currency] ?? 0;

                                  return (
                                    <div
                                      key={item.id || iIdx}
                                      onClick={() => {
                                        if (!isExpired) setSelectedOptionId(optId);
                                      }}
                                      className={`flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
                                        isExpired
                                          ? 'opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-white/[0.01]'
                                          : isSelected
                                          ? 'bg-[hsl(var(--primary)/.1)] dark:bg-[hsl(var(--primary)/.2)] cursor-pointer'
                                          : 'hover:bg-slate-100/80 dark:hover:bg-white/[0.04] cursor-pointer'
                                      }`}
                                    >
                                      {/* Item Name */}
                                      <span className={`text-xs sm:text-sm font-semibold leading-snug ${
                                        isSelected
                                          ? 'text-[hsl(var(--primary))] font-bold'
                                          : isExpired
                                          ? 'text-slate-500 dark:text-slate-400'
                                          : 'text-slate-700 dark:text-slate-200'
                                      }`}>
                                        {item.name || 'Registration Item'}
                                      </span>

                                      {/* Price Badge + Radio Toggle (Only if not expired) */}
                                      <div className="flex items-center gap-3 shrink-0">
                                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-black font-mono shadow-2xs ${
                                          isSelected
                                            ? 'bg-[hsl(var(--primary))] text-white border-[hsl(var(--primary))]'
                                            : isExpired
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                                        }`}>
                                          {sym} {Number(price).toLocaleString()}
                                        </span>

                                        {!isExpired && (
                                          <input
                                            type="radio"
                                            name="selectedFeeOptionRadio"
                                            checked={isSelected}
                                            onChange={() => setSelectedOptionId(optId)}
                                            className="h-4.5 w-4.5 text-[hsl(var(--primary))] accent-[hsl(var(--primary))] cursor-pointer"
                                          />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 font-semibold text-center">
                {error}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Selected Category:
                </span>
                <p className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))]">
                  {selectedOption ? (
                    <>
                      <span>{selectedOption.categoryName}</span> · <span className="text-[hsl(var(--primary))]">{selectedOption.itemName}</span>{' '}
                      <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">({selectedOption.tierTitle})</span>
                    </>
                  ) : (
                    <span className="text-[hsl(var(--muted-foreground))] font-normal text-sm sm:text-base">
                      Please select a fee level above
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="btn-main border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] px-6 py-3.5 font-bold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || paying || !selectedOption}
                  className="btn-main btn-primary flex-1 sm:flex-none px-8 py-3.5 font-bold text-base shadow-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={18} /> Creating Order...
                    </span>
                  ) : selectedOption ? (
                    `Proceed to payment · ${sym}${Number(selectedOption.prices[currency] || 0).toLocaleString()}`
                  ) : (
                    'Select Fee to Proceed'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
