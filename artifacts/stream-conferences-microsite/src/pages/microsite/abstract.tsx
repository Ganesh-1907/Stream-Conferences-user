import { useState, useMemo, type FormEvent } from 'react';
import { CalendarDays, MapPin, ChevronDown, FileText, ArrowRight, Check } from 'lucide-react';
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

export function AbstractPage({ event }: { event: EventData }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [country, setCountry] = useState('');
  const [abstractFile, setAbstractFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guidelines = Array.isArray(event.guidelines)
    ? event.guidelines.length ? event.guidelines : []
    : event.guidelines
      ? [event.guidelines]
      : [
          'Title: Maximum 25 words, concise and descriptive',
          'Authors: Full names and institutional affiliations',
          'Word Limit: 250-350 words (excluding title and authors)',
          'Keywords: 3-6 relevant keywords, semicolon-separated',
          'Format: PDF file, maximum 5MB',
          'Review: Double-blind peer review by Scientific Advisory Board',
        ];

  const eventPrices = useMemo(() => {
    if (event.fees?.length) {
      return event.fees.map((f) => [f.label, `₹${f.amount}`, `₹${Math.round(f.amount * 1.2)}`]);
    }
    return [['Student', '₹20000', '₹26000'], ['Academic', '₹32000', '₹39000'], ['Industry Delegate', '₹42000', '₹52000'], ['Virtual Attendee', '₹12000', '₹15000']];
  }, [event.fees]);

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !institution || !country) {
      setError('Please fill all required fields.');
      return;
    }
    setError('');
    setStep(2);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!abstractFile) {
      setError('Please upload your abstract as a PDF file.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('firstName', firstName);
      fd.append('lastName', lastName);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('institution', institution);
      fd.append('country', country);
      fd.append('abstractFile', abstractFile);
      fd.append('eventId', event._id);
      fd.append('eventType', event.eventType);
      fd.append('eventSlug', event.slug || event.subdomain || event.eventId || '');
      const res = await fetch(`${API_BASE}/abstracts/submit`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error((await res.json()).error || 'Abstract submission failed');
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Abstract submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container-wide py-12 max-w-6xl">
      {/* Title above the grid */}
      <div className="mb-8 text-center md:text-left">
        <span className="section-eyebrow">Abstract Submission Gateway</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Submit an Abstract</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Share your research with the global scientific community</p>
      </div>

      {/* Step indicators above the grid */}
      <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 1 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">1</span>
          Your Details
        </div>
        <div className="w-8 h-px bg-[hsl(var(--border))]" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 2 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">2</span>
          Upload Abstract
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
                <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Abstract Submitted Successfully!</h3>
                <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Your abstract has been submitted for review. You will receive a confirmation email at {email} within 5-7 business days.</p>
              </div>
              <button onClick={() => { setSent(false); setStep(1); setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setInstitution(''); setCountry(''); setAbstractFile(null); }} className="mt-4 btn-main btn-primary">Submit Another</button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleStep1} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                <div>
                  <p className="label text-[hsl(var(--accent))]">Step 1 of 2</p>
                  <h3 className="display mt-2 text-xl font-bold">Author Information</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Tell us about yourself before uploading</p>
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
                    <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Phone Number</label>
                    <input type="tel" className="form-field w-full" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Your data is protected and used only for event communication.</p>
              </form>
          ) : (
            <form onSubmit={submit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
                <div>
                  <p className="label text-[hsl(var(--accent))]">Step 2 of 2</p>
                  <h3 className="display mt-2 text-xl font-bold">Upload Your Abstract</h3>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Upload your research paper as a PDF file</p>
                </div>

                <div className="rounded-xl bg-[hsl(var(--muted)/.3)] p-4 border border-[hsl(var(--border))]">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">Submitting as: <strong>{firstName} {lastName}</strong> ({email})</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Abstract PDF *</label>
                  <div className="border-2 border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center hover:border-[hsl(var(--accent))] transition-colors">
                    <input type="file" accept=".pdf" className="hidden" id="abstract-upload" onChange={(e) => setAbstractFile(e.target.files?.[0] || null)} />
                    <label htmlFor="abstract-upload" className="cursor-pointer">
                      {abstractFile ? (
                        <div>
                          <p className="font-semibold text-[hsl(var(--accent))]">{abstractFile.name}</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <FileText size={32} className="mx-auto text-[hsl(var(--muted-foreground))] mb-2" />
                          <p className="font-semibold">Click to upload PDF</p>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">Maximum file size: 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}

                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => { setStep(1); setError(''); }} className="btn-main border border-[hsl(var(--border))] bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] w-1/3 justify-center py-3">Back</button>
                  <button type="submit" disabled={submitting} className="btn-main btn-primary flex-1 justify-center py-3 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit Abstract'} <ArrowRight className="ml-1 inline" size={16} /></button>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Your submission will be reviewed by our Scientific Advisory Board.</p>
              </form>
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
                  <span className="uppercase tracking-wider">Submission Guidelines</span>
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
              {/* Important Dates accordion */}
              <div className="border-b border-[hsl(var(--border)]/60 pb-3">
                <button type="button" onClick={() => setOpenAccordion(openAccordion === 'dates' ? null : 'dates')} className="w-full flex items-center justify-between font-semibold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors">
                  <span className="uppercase tracking-wider">Important Dates</span>
                  <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'dates' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'dates' && (
                  <div className="mt-2 pl-1 space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Deadline:</span> {event.endDate ? new Date(event.endDate).toLocaleDateString() : '—'}</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Notification:</span> Within 5-7 business days</p>
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
                <button type="button" onClick={() => setOpenAccordion(openAccordion === 'contact' ? null : 'contact')} className="w-full flex items-center justify-between font-semibold text-sm text-[hsl(var(--foreground))] py-2 hover:text-[hsl(var(--secondary))] transition-colors">
                  <span className="uppercase tracking-wider">Organizer Contact</span>
                  <ChevronDown size={14} className={`transform transition-transform ${openAccordion === 'contact' ? 'rotate-180' : ''}`} />
                </button>
                {openAccordion === 'contact' && (
                  <div className="mt-2 pl-1 space-y-1.5 text-sm text-[hsl(var(--muted-foreground))]">
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Name:</span> {event.organizerContact?.name || '—'}</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Email:</span> {event.organizerContact?.email || '—'}</p>
                    <p><span className="font-medium text-[hsl(var(--foreground))]">Phone:</span> {event.organizerContact?.phone || '—'}</p>
                  </div>
                )}
              </div>
            </div>
            <button type="button" onClick={copyLink} className="w-full rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2.5 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--secondary))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.02)] transition-all">
              {copied ? 'Copied ✓' : 'Copy Submission Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
