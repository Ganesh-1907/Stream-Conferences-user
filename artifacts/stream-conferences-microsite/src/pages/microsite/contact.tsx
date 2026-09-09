import { useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { Mail, Phone, Globe, MapPin, Check, ExternalLink, Building, Send } from 'lucide-react';
import type { EventData } from './layout';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

export function ContactPage({ event }: { event: EventData }) {
  const contact = event.organizerContact;
  const email = contact?.email || 'organizer@streamconferences.com';
  const phone = contact?.phone || '+1 555 010 0000';
  const website = contact?.website || 'https://streamconferences.com';

  const venue = event.venueDetails || {};
  const venueAddressParts = [
    venue.address || event.venueAddress,
    venue.city,
    venue.state,
    venue.country,
  ].filter(Boolean);

  const venueFullAddress = venueAddressParts.length > 0
    ? venueAddressParts.join(', ')
    : (event.venueAddress || event.venue || event.location || contact?.address || '100 Convention Boulevard');

  const venueName = venue.name || event.venue;
  const conferenceLocation = venueName && venueFullAddress && !venueFullAddress.toLowerCase().includes(venueName.toLowerCase())
    ? `${venueName}, ${venueFullAddress}`
    : (venueFullAddress || venueName || '100 Convention Boulevard');

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/contacts/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          eventId: event._id,
          eventType: event.eventType,
          eventSlug: event.slug || event.subdomain,
          cohortId: event.activeCohort?.cohortId || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-wide py-12 md:py-16">
      {/* Page Header */}
      <div className="mb-10 md:mb-12">
        <span className="section-eyebrow">Contact</span>
        <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">
          Contact us
        </h1>
        <p className="mt-2 text-base md:text-lg text-[hsl(var(--muted-foreground))]">
          Get in touch with the organizers
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-2 items-stretch">
        {/* Left Side: Organizer Contact Box */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-xl shadow-black/5 hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle decorative glow */}
          <div className="absolute -top-20 -left-20 w-44 h-44 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
                Organizer Contact
              </h2>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Direct communication channels for registration, abstracts, and attendee support.
              </p>
            </div>

            {contact?.name && (
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)]">
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center shrink-0 font-bold text-sm">
                  {contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Organizer</p>
                  <p className="text-base font-semibold text-[hsl(var(--foreground))] truncate">{contact.name}</p>
                </div>
              </div>
            )}

            <div className="space-y-3.5">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-4 p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--primary)/0.04)] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Email Address</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] truncate transition-colors">
                      {email}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="group flex items-center gap-4 p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Telephone</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate transition-colors">
                      {phone}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {website && (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Globe size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Official Website</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 truncate transition-colors">
                      {website}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </a>
              )}

              {conferenceLocation && (
                <Link
                  href="/venue"
                  className="group flex items-center gap-4 p-3.5 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)] hover:border-amber-500/50 hover:bg-amber-500/[0.04] transition-all duration-200 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Conference Venue Address</p>
                    <p className="text-sm sm:text-base font-semibold text-[hsl(var(--foreground))] group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate transition-colors">
                      {conferenceLocation}
                    </p>
                  </div>
                  <ExternalLink size={14} className="text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </Link>
              )}
            </div>
          </div>

          {/* Assurance Badges */}
          <div className="mt-8 pt-5 border-t border-[hsl(var(--border)/0.7)] flex flex-wrap items-center gap-2.5 relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Quick Response Guarantee</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-xs font-semibold text-[hsl(var(--muted-foreground))] shadow-sm">
              <Building size={13} className="text-[hsl(var(--primary))]" />
              <span>Dedicated Organizer Desk</span>
            </div>
          </div>
        </div>

        {/* Right Side: Message Form Box */}
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-xl shadow-black/5 hover:border-[hsl(var(--primary)/0.4)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
          {/* Subtle decorative glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[hsl(var(--primary)/0.08)] blur-3xl pointer-events-none" />

          <div className="relative">
            <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[hsl(var(--foreground))]">
              Send a Message
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Fill out the inquiry form below and our committee will respond shortly.
            </p>

            {submitted ? (
              <div className="text-center py-12 my-4 px-6 rounded-2xl bg-[hsl(var(--background))] border border-[hsl(var(--border)/0.7)]">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <Check size={28} />
                </div>
                <h4 className="text-lg font-bold text-[hsl(var(--foreground))]">Message Sent Successfully!</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Our secretariat has received your inquiry and will respond within 24–48 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', email: '', subject: '', message: '' });
                    setSubmitted(false);
                  }}
                  className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[hsl(var(--primary)/0.12)] hover:bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))] font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                      <span>Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="Your full name"
                      className="form-field mt-1.5 w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] rounded-xl px-3.5 py-2.5 text-sm transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                      <span>Email</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="you@organization.com"
                      className="form-field mt-1.5 w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] rounded-xl px-3.5 py-2.5 text-sm transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                    <span>Subject</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="e.g. Registration inquiry, Abstract presentation"
                    className="form-field mt-1.5 w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] rounded-xl px-3.5 py-2.5 text-sm transition-colors"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                    <span>Message</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please write your query or message here..."
                    className="form-field mt-1.5 w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] rounded-xl px-3.5 py-2.5 text-sm resize-none transition-colors"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border-2 border-[#155e75]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group"
                  >
                    {submitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send size={16} className="transition-transform group-hover:scale-110 text-[#38bdf8]" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
