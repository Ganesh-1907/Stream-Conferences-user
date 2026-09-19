import type { EventData } from './layout';
import { MicrositeHero } from '@/components/microsite-hero';

const TERMS_AND_CONDITIONS = `
<h3>Responsibility</h3>
<p>Delegates are personally responsible for their belongings at the venue. The Organizers will not be held responsible for any stolen or missing items belonging to Delegates, Speakers or Attendees; due to any reason whatsoever.</p>

<h3>Insurance</h3>
<p>Registration fees do not include insurance of any kind.</p>

<h3>Transportation</h3>
<p>Please note that any (or) all transportation and parking is the responsibility of the registrant.</p>

<h3>Press/Media</h3>
<p>Press permission must be obtained from the Stream Conferences Organizing Committee prior to the event. The press will not quote speakers or delegates unless they have obtained their approval in writing.</p>

<h3>Requesting an Invitation Letter</h3>
<p>For security purposes, letters of invitation will be sent only to those individuals who have registered for the conference. Once your registration is complete, please contact the organizing desk to request a personalized letter of invitation.</p>

<p>Regarding refunds, all bank charges will be for the registrant's account.</p>

<h3>Cancellation, Postponement and Transfer of Registration</h3>
<p>All cancellations or modifications of registration must be made in writing to the organizing committee email.</p>

<h3>Cancellation Policy</h3>
<p>If Stream Conferences cancels this event for any reason, you will receive a credit for 100% of the registration fee paid. You may use this credit for another Stream Conferences event occurring within one year from the date of cancellation.</p>

<h3>Postponement</h3>
<p>If Stream Conferences postpones an event for any reason and you are unable or unwilling to attend on rescheduled dates, you will receive a credit for 100% of the registration fee paid. You may use this credit for another event within one year from the date of postponement.</p>

<h3>Transfer of Registration</h3>
<p>All fully paid registrations are transferable to another person from the same organization if the registered person is unable to attend. Transfers must be made in writing prior to the event, providing full details of the replacement delegate.</p>

<h3>Visa Information</h3>
<p>Keeping in view of increased security measures, we request all participants to apply for their Visa as soon as possible. Stream Conferences will not directly contact embassies or consulates on behalf of visa applicants. All delegates should apply for a Business Visa.</p>

<h3>Refund Policy</h3>
<p>If the registrant is unable to attend and cannot transfer participation to another person or event, the following refund arrangements apply based on advance commitments towards venue, printing, and overheads:</p>
<ul>
  <li>Before 60 days of the conference: Eligible for Full Refund less $100 service fee.</li>
  <li>Within 60-30 days of Conference: Eligible for 50% refund.</li>
  <li>Within 30 days of Conference: Not eligible for refund.</li>
</ul>

<h3>Accommodation Cancellation Policy</h3>
<p>Accommodation Providers (Hotels) have their own cancellation policies, which generally apply when cancellations are made less than 30 days prior to arrival. Please contact us as soon as possible if you wish to cancel or amend accommodation bookings.</p>
`;

export function TermsPage({ event }: { event: EventData }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <MicrositeHero
        badge="TERMS & POLICIES"
        title="Terms & Conditions"
        tagline="Please read the official policies, cancellation guidelines, and terms before registering."
      />

      <div className="container-wide py-10 sm:py-14">
        <div className="max-w-4xl mx-auto">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-['Space_Grotesk'] prose-headings:text-[hsl(var(--foreground))] prose-p:text-[hsl(var(--foreground)/0.85)] prose-strong:text-[hsl(var(--foreground))] prose-li:text-[hsl(var(--foreground)/0.85)] font-normal"
            dangerouslySetInnerHTML={{ __html: TERMS_AND_CONDITIONS }}
          />
        </div>
      </div>
    </div>
  );
}
