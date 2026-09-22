import { useState, type FormEvent } from 'react';
import { Download, ArrowRight, Check, FileText } from 'lucide-react';
import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

const TITLE_OPTIONS = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.', 'Assist Prof.', 'Assoc Prof.'];

export function BrochurePage({ event }: { event: EventData }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('Dr.');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [designation, setDesignation] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const brochureUrl = event.brochureUrl ? mediaUrl(event.brochureUrl) : '';

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email || !phone || !institution || !country || !address.trim()) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/brochure-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, fullName, name: title ? `${title} ${fullName}`.trim() : fullName.trim(), firstName: title, lastName: fullName,
          email, phone, institution, designation, address, country,
          eventId: event._id,
          eventType: event.eventType,
          eventSlug: event.slug || event.subdomain || event.eventId || '',
          cohortId: event.activeCohort?.cohortId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit');
      }
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (brochureUrl) {
      const a = document.createElement('a');
      a.href = brochureUrl;
      a.download = `${event.title || 'event'}-brochure.pdf`;
      a.target = '_blank';
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="OFFICIAL BROCHURE"
        title="Download Event Brochure"
        tagline="Fill in your details to access the complete official conference prospectus and program guide."
      />
      <div className="container-wide py-10 sm:py-14 max-w-3xl">

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 1 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">1</span>
          Your Details
        </div>
        <div className="w-8 h-px bg-[hsl(var(--border))]" />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${step === 2 ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current text-[hsl(var(--background))] text-xs font-bold">2</span>
          Download
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleFormSubmit} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3 rounded-xl bg-[hsl(var(--primary)/.06)] px-4 py-3">
            <FileText size={18} className="text-[hsl(var(--primary))]" />
            <span className="text-base font-medium text-[hsl(var(--foreground))]">Enter your details to access the brochure</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Title *</label>
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
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Full Name *</label>
              <input required className="form-field w-full" placeholder="Full name (e.g. John Doe)" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Email Address *</label>
              <input required type="email" className="form-field w-full" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Phone Number *</label>
              <input required type="tel" className="form-field w-full" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Institution / Organization *</label>
              <input required className="form-field w-full" placeholder="Institution or company" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Designation</label>
              <input className="form-field w-full" placeholder="e.g. Professor, Researcher" value={designation} onChange={(e) => setDesignation(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Country *</label>
              <input required className="form-field w-full" placeholder="Country of residence" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Address *</label>
            <textarea required rows={3} className="form-field w-full resize-y" placeholder="Full mailing address" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600">{error}</div>}

          <button type="submit" disabled={submitting} className="w-full btn-main btn-primary py-3 mt-2">
            {submitting ? 'Submitting...' : 'Get Brochure'} <ArrowRight className="ml-1 inline" size={16} />
          </button>
          <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">Your data is protected and used only for event communication.</p>
        </form>
      ) : (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 shadow-sm text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <Check size={28} className="text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">Thank you, {title} {fullName}!</h3>
            <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Your details have been recorded. Click below to download the brochure.</p>
          </div>
          {brochureUrl ? (
            <a
              href={brochureUrl}
              download={`${event.title || 'event'}-brochure.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-base hover:opacity-90 transition"
            >
              <Download size={18} /> Download Brochure
            </a>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Brochure is not available yet. Please check back later.</p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
