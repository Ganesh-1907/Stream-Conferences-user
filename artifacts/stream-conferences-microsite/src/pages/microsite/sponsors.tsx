import { useState, type FormEvent } from 'react';
import {
  Award, Check, Mail, Phone, MapPin, Building,
  Send, Sparkles, Store, ShieldCheck, ChevronRight, CheckCircle2
} from 'lucide-react';
import type { EventData } from './layout';

export function SponsorsExhibitorsPage({ event }: { event: EventData }) {
  const [formSent, setFormSent] = useState(false);
  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedTier, setSelectedTier] = useState('Elite Sponsor');
  const [message, setMessage] = useState('');

  const handleEnquiry = (e: FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  const eliteBenefits = [
    'An opportunity to sponsor 10 Poster Presentation Awards.',
    'Three corporate sponsored workshop slots (audio visual included).',
    'Two complimentary exhibit booths with priority to purchase exhibition space and choose booth location (Booth size-3X3 sqm).',
    'Four complimentary registrations.',
    'Logo recognition on congress website front page with link, logo recognition on congress sponsorship page and logo recognition on corresponding Stream Journal home page.',
    'One A4 color advertisement in the congress program or book of abstracts (excluding cover pages).',
    'Three Inserts provided by the sponsor in the congress delegate bags.',
    'One post congress e-mail message to consented congress registrants up to 60 days after the congress (content to be provided by the sponsor, approved and distributed by corresponding Journal).',
    'An exclusive online Promotion on all our Social Networking Sites.',
    '20% Waiver on Sponsorship for any of our next year conferences.',
  ];

  const goldBenefits = [
    'An opportunity to sponsor 5 Poster Presentation Awards.',
    'Two corporate sponsored workshop slot (must honor deadlines, catering and audio visual included).',
    'One complimentary exhibit booth with priority to purchase exhibition space and choose booth location (Booth size-3X3 sqm).',
    'Three complimentary congress registrations.',
    'Logo recognition on congress website front page with link and logo recognition on congress sponsorship page.',
    'One A4 color advertisement in the congress program or book of abstracts (excluding cover pages).',
    'Two Inserts provided by the sponsor in the congress delegate bags.',
    'An exclusive online Promotion on all our Social Networking Sites.',
    '15% Waiver on Sponsorship for any of our next year conferences.',
  ];

  const silverBenefits = [
    'An opportunity to sponsor 3 Poster Presentation Awards.',
    'Two complimentary congress registrations.',
    'One corporate sponsored workshop slot (must honor deadlines, catering and audio visual included).',
    'One complimentary exhibit booth with priority to purchase exhibition space and choose booth location (Booth size-3X3 sqm).',
    'Logo recognition on congress website sponsorship page.',
    'One A4 color advertisement in the congress program or book of abstracts (excluding cover pages).',
    'One insert provided by the sponsor in the congress delegate bags.',
    'Priority to purchase additional sponsorship items.',
    'An exclusive online Promotion on all our Social Networking Sites.',
    '10% Waiver on Sponsorship for any of our next year conferences.',
  ];

  const exhibitionBenefits = [
    'An opportunity to sponsor one poster presentation award.',
    'One complimentary congress registration.',
    'Set up of one tailor-made exhibit booth (Booth Size 3x3 sqm).',
    'Logo recognition on congress website sponsorship page.',
    'A4 Color Advertisement in Congress Program or Book of Abstract.',
    'Inclusion of your company\'s leaflet/insert in the congress delegate bags.',
    'An exclusive online promotion on all our social Networking Sites.',
    '5% Waiver on Sponsorship for any of our next year conferences.',
    'Recognition to your products and services in the world market through our website.',
    'Develop new client relationships and strengthen the existing ones (B2B Meeting).',
    'Shape and raise your corporate image through logo branding.',
    'Brand briefing at the opening and closing ceremonies.',
    'Press Release on behalf of your company.',
    'Brand announcement with 50000 Brochures across the Globe.',
    'Sharing Conference Posters (10000) with Industries and Universities located across the globe.',
  ];

  const additionalPackages = [
    'Lunch / Cocktail Sponsor',
    'Coffee Break Sponsor',
    'Conference Delegate Bag Sponsor',
    'Bag Insert Sponsor',
    'Lanyard (also known as neck cords)',
  ];

  const advertisementItems = [
    'Outside Back Cover (color)',
    'Inside Front Cover (color)',
    'Inside Back Cover (color)',
    'Per Page',
  ];

  const conferenceTitle = event.title || 'Conference';

  return (
    <div className="py-10 md:py-14">
      {/* Header Banner - Centered Conference Title */}
      <div className="container-wide mb-10 md:mb-14">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))] text-balance leading-tight">
            {conferenceTitle}
          </h1>
        </div>
      </div>

      {/* Why With Us Section */}
      <section className="container-wide">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 md:p-12 shadow-sm">
          <div className="max-w-3xl">
            <span className="section-eyebrow">Strategic Value</span>
            <h2 className="mt-3 text-2xl md:text-3xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
              Why with us?
            </h2>
          </div>

          <div className="mt-6 space-y-4 text-sm md:text-base leading-relaxed text-[hsl(var(--muted-foreground))]">
            <p>
              In today's economic climate your business decisions are as crucial as ever.{' '}
              <strong className="text-[hsl(var(--foreground))] font-semibold">{conferenceTitle}</strong> allows
              you to maximize your time and marketing dollars while receiving immediate feedback on your new products and services.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))] font-semibold">{conferenceTitle}</strong> is organizing
              an outstanding Scientific Exhibition/Program and anticipates the world's leading specialists involved in it.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))] font-semibold">{conferenceTitle}</strong> organizing
              committee anticipates over 300 participants to attend this premier event. Your organization will benefit
              with excellent exposure to leading authorities, specialists, and decision makers in the field.
            </p>
            <p>
              <strong className="text-[hsl(var(--foreground))] font-semibold">{conferenceTitle}</strong> is an exciting
              opportunity to showcase the new technology, the new products of your company, and/or the service your industry
              may offer to a broad international audience.
            </p>
            <p>
              Exhibiting at <strong className="text-[hsl(var(--foreground))] font-semibold">{conferenceTitle}</strong> will
              attain you with an exceptional format in showcasing your products and services. Stream Conferences and Exhibitions
              provide you one location to reach your top customers.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Sponsorship Packages */}
      <section className="container-wide mt-14 md:mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="section-eyebrow justify-center">Partnership Tiers</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
            Premium Sponsorship Packages
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Tailored packages designed to maximize your organizational visibility and brand alignment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Column 1: Elite & Gold */}
          <div className="space-y-8">
            {/* Elite Sponsor Card */}
            <div className="rounded-2xl border-2 border-[hsl(var(--primary))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-lg shadow-[hsl(var(--primary)/.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-1 rounded-bl-xl text-[11px] font-mono uppercase font-bold tracking-wider">
                Top Tier
              </div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))] flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-[hsl(var(--primary))]">
                    Elite Sponsor
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Highest priority visibility & thought leadership</p>
                </div>
              </div>

              <div className="divide-y divide-[hsl(var(--border))]">
                {eliteBenefits.map((benefit, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-3 text-sm text-[hsl(var(--foreground))]">
                    <Check size={16} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <a
                  href="#enquire"
                  onClick={() => setSelectedTier('Elite Sponsor')}
                  className="btn-main btn-primary text-xs py-2.5 px-5"
                >
                  Choose Elite Sponsor
                </a>
              </div>
            </div>

            {/* Gold Sponsor Card */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm hover:border-amber-500/70 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-amber-600 dark:text-amber-400">
                    Gold Sponsor
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Prominent branding & technical workshop presence</p>
                </div>
              </div>

              <div className="divide-y divide-[hsl(var(--border))]">
                {goldBenefits.map((benefit, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-3 text-sm text-[hsl(var(--foreground))]">
                    <Check size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <a
                  href="#enquire"
                  onClick={() => setSelectedTier('Gold Sponsor')}
                  className="btn-main btn-quiet text-xs py-2.5 px-5 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  Choose Gold Sponsor
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Silver & Exhibition */}
          <div className="space-y-8">
            {/* Silver Sponsor Card */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm hover:border-[hsl(var(--secondary)/.7)] transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--secondary)/.15)] text-[hsl(var(--secondary))] flex items-center justify-center">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-[hsl(var(--secondary))]">
                    Silver Sponsor
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Targeted reach & dedicated exhibition booth</p>
                </div>
              </div>

              <div className="divide-y divide-[hsl(var(--border))]">
                {silverBenefits.map((benefit, idx) => (
                  <div key={idx} className="py-3 flex items-start gap-3 text-sm text-[hsl(var(--foreground))]">
                    <Check size={16} className="text-[hsl(var(--secondary))] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <a
                  href="#enquire"
                  onClick={() => setSelectedTier('Silver Sponsor')}
                  className="btn-main btn-quiet text-xs py-2.5 px-5 hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]"
                >
                  Choose Silver Sponsor
                </a>
              </div>
            </div>

            {/* Exhibition Card */}
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm hover:border-[hsl(var(--primary)/.5)] transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] flex items-center justify-center">
                  <Store size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
                    Exhibition
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Dedicated booth space & international delegate networking</p>
                </div>
              </div>

              <div className="divide-y divide-[hsl(var(--border))]">
                {exhibitionBenefits.map((benefit, idx) => (
                  <div key={idx} className="py-2.5 flex items-start gap-3 text-sm text-[hsl(var(--foreground))]">
                    <Check size={16} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))] flex justify-end">
                <a
                  href="#enquire"
                  onClick={() => setSelectedTier('Exhibition')}
                  className="btn-main btn-quiet text-xs py-2.5 px-5 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                >
                  Choose Exhibition
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Sponsorship Packages & Advertisements Section */}
      <section className="container-wide mt-14 md:mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Additional Sponsorship Packages */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary)/.12)] text-[hsl(var(--secondary))] flex items-center justify-center font-bold">
                <Award size={20} />
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
                Additional Sponsorship Packages
              </h3>
            </div>

            <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden divide-y divide-[hsl(var(--border))] bg-[hsl(var(--background)/.5)]">
              {additionalPackages.map((pkg, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/.4)] transition-colors">
                  <span className="flex items-center gap-2">
                    <ChevronRight size={15} className="text-[hsl(var(--secondary))]" />
                    {pkg}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[hsl(var(--muted-foreground))]">
                    Available
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advertisements */}
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))] flex items-center justify-center font-bold">
                <Sparkles size={20} />
              </div>
              <h3 className="text-xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
                Advertisements
              </h3>
            </div>

            <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden divide-y divide-[hsl(var(--border))] bg-[hsl(var(--background)/.5)]">
              {advertisementItems.map((ad, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/.4)] transition-colors">
                  <span className="flex items-center gap-2">
                    <ChevronRight size={15} className="text-[hsl(var(--primary))]" />
                    {ad}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-wider font-semibold text-[hsl(var(--muted-foreground))]">
                    Book Now
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Avail the Opportunity Section / Contact & Brief Form */}
      <section id="enquire" className="container-wide mt-14 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] rounded-3xl border border-[hsl(var(--border))] overflow-hidden bg-[hsl(var(--card))] shadow-xl">
          {/* Left: Contact Card (matching the green/teal banner from screenshot 3) */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold tracking-widest uppercase mb-4">
                Exclusive Opportunity
              </div>
              <h2 className="text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-white">
                Avail the Opportunity!!
              </h2>
              <p className="mt-4 text-white/85 text-sm md:text-base leading-relaxed max-w-md">
                Reach an engaged international delegation of researchers, key opinion leaders, and industry specialists at <strong className="text-white">{conferenceTitle}</strong>.
              </p>

              <div className="mt-8 space-y-4 text-sm text-white/90">
                <div className="flex items-start gap-3">
                  <Building className="shrink-0 mt-1 text-emerald-200" size={18} />
                  <div>
                    <strong className="block text-white font-semibold">Stream Conferences Secretariat</strong>
                    <span>{event.organizerContact?.address || event.venueAddress || '35 Ruddlesway, Windsor, Berkshire, SL4 5SF'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="shrink-0 text-emerald-200" size={18} />
                  <div>
                    <span className="text-xs text-white/70 block">Telephone:</span>
                    <a href={`tel:${event.organizerContact?.phone || '+44 20 3769 1778'}`} className="hover:underline font-medium">
                      {event.organizerContact?.phone || '+44 20 3769 1778'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="shrink-0 text-emerald-200" size={18} />
                  <div>
                    <span className="text-xs text-white/70 block">Direct Email:</span>
                    <a href={`mailto:${event.organizerContact?.email || 'sponsors@streamconferences.com'}`} className="hover:underline font-medium">
                      {event.organizerContact?.email || 'sponsors@streamconferences.com'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 text-xs text-white/70">
              Response guarantee: The sponsorship committee will review and respond within 24 business hours.
            </div>
          </div>

          {/* Right: Quick Partnership Brief Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-[hsl(var(--foreground))]">
              Submit Sponsorship Brief
            </h3>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Fill in your details below and our corporate relations team will connect with your organization.
            </p>

            {formSent ? (
              <div className="mt-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 size={42} className="mx-auto text-emerald-500 mb-3" />
                <h4 className="text-lg font-bold text-[hsl(var(--foreground))]">Thank You!</h4>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Your sponsorship enquiry for <strong>{selectedTier}</strong> has been received. Our partnership desk will reach out shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSent(false)}
                  className="mt-5 btn-main btn-quiet text-xs py-2 px-4"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquiry} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Company / Organization *
                  </label>
                  <input
                    required
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Stryker, Medtronic, Pfizer..."
                    className="form-field mt-1 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Contact Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="form-field mt-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="form-field mt-1 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Work Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partnerships@company.com"
                    className="form-field mt-1 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Package of Interest
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="form-field mt-1 text-sm"
                  >
                    <option value="Elite Sponsor">Elite Sponsor</option>
                    <option value="Gold Sponsor">Gold Sponsor</option>
                    <option value="Silver Sponsor">Silver Sponsor</option>
                    <option value="Exhibition">Exhibition (Booth Space)</option>
                    <option value="Additional Sponsorship Packages">Additional Sponsorship Packages</option>
                    <option value="Advertisements">Advertisements</option>
                    <option value="Custom Partnership">Custom Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                    Message / Special Requests
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your objectives or specific requirements..."
                    className="form-field mt-1 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-main btn-primary text-sm py-3 flex items-center justify-center gap-2 mt-2"
                >
                  <Send size={16} /> Submit Partnership Brief
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
