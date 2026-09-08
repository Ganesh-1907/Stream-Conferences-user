import { useState, type FormEvent } from 'react';
import { Mail, Phone, Globe, MapPin, Check } from 'lucide-react';
import type { EventData } from './layout';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:7867/api';

export function ContactPage({ event }: { event: EventData }) {
  const contact = event.organizerContact;
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
        body: JSON.stringify({ ...formData, eventId: event._id, eventType: event.eventType, eventSlug: event.slug || event.subdomain }),
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
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Contact</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Contact us</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Get in touch with the organizers</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="font-bold text-xl mb-4">Organizer Contact</h3>
          {contact?.name && <p className="font-semibold text-[hsl(var(--foreground))]">{contact.name}</p>}
          <div className="mt-3 space-y-2">
            {contact?.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Mail size={16} />{contact.email}</a>}
            {contact?.phone && <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Phone size={16} />{contact.phone}</a>}
            {contact?.website && <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-base text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"><Globe size={16} />{contact.website}</a>}
            {contact?.address && <div className="flex items-start gap-2 text-base text-[hsl(var(--muted-foreground))]"><MapPin size={16} className="mt-0.5" />{contact.address}</div>}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-4">Send a Message</h3>
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-[hsl(var(--primary) / .1)] flex items-center justify-center text-[hsl(var(--primary))]"><Check size={24} /></div>
              <p className="mt-4 font-semibold">Message sent successfully!</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-xs font-semibold">Name *</label><input required className="form-field mt-1.5 w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div><label className="text-xs font-semibold">Email *</label><input required type="email" className="form-field mt-1.5 w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              </div>
              <div><label className="text-xs font-semibold">Subject *</label><input required className="form-field mt-1.5 w-full" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} /></div>
              <div><label className="text-xs font-semibold">Message *</label><textarea required rows={4} className="form-field mt-1.5 w-full resize-none" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} /></div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-main btn-primary disabled:opacity-50">{submitting ? 'Sending...' : 'Send Message'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
