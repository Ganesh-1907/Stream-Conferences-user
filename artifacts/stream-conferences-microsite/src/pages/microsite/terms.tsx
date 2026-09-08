import type { EventData } from './layout';

const TERMS_AND_CONDITIONS = `
<h3>Responsibility</h3>
<p>Delegates are personally responsible for their belongings at the venue. The Organizers will not be held responsible for any stolen or missing items belonging to Delegates, Speakers or Attendees; due to any reason whatsoever.</p>

<h3>Insurance</h3>
<p>Registration fees do not include insurance of any kind.</p>

<h3>Transportation</h3>
<p>Please note that any (or) all transportation and parking is the responsibility of the registrant.</p>

<h3>Press/Media</h3>
<p>Press permission must be obtained from Pulsus Conferences Organizing Committee prior to the event. The press will not quote speakers or delegates unless they have obtained their approval in writing. The Pulsus Ltd is an objective third-party nonprofit organization. This conference is not associated with any commercial meeting company.</p>

<h3>Requesting an Invitation Letter</h3>
<p>For security purposes, letter of invitation will be sent only to those individuals who had registered for the conference. Once your registration is complete, please contact orthopedicsurgery@pulsusgather.com to request a personalized letter of invitation.</p>

<p>Regarding refunds, all bank charges will be for the registrants account.</p>

<p>This cancellation policy was last updated on April 04, 2015.</p>

<h3>Cancellation, Postponement and Transfer of Registration</h3>
<p>All cancellations or modifications of registration must be made in writing to finance@pulsus.com</p>

<h3>Cancellation Policy</h3>
<p>If Pulsus Group cancels this event for any reason, you will receive a credit for 100% of the registration fee paid. You may use this credit for another Pulsus Group event which must occur within one year from the date of cancellation.</p>

<h3>Postponement</h3>
<p>If Pulsus Group postpones an event for any reason and you are unable or unwilling to attend on rescheduled dates, you will receive a credit for 100% of the registration fee paid. You may use this credit for another Pulsus Ltd event which must occur within one year from the date of postponement.</p>

<h3>Transfer of Registration</h3>
<p>All fully paid registrations are transferable to other persons from the same organization, if registered person is unable to attend the event. Transfers must be made by the registered person in writing to finance@pulsus.com. Details must be included the full name of replacement person, their title, contact phone number and email address. All other registration details will be assigned to the new person unless otherwise specified.</p>

<p>Registration can be transferred to one conference to another conference of Pulsus Ltd if the person is unable to attend one of conferences.</p>

<p>However, Registration cannot be transferred if it is intimated within 14 days of respective conference. The transferred registrations will not be eligible for Refund.</p>

<h3>Visa Information</h3>
<p>Keeping in view of increased security measures, we would like to request all the participants to apply for Visa as soon as possible.</p>

<p>Pulsus Ltd will not directly contact embassies and consulates on behalf of visa applicants. All delegates or invitees should apply for Business Visa only.</p>

<p><strong>Important note for failed visa applications:</strong> Visa issues cannot come under the consideration of cancellation policy of Pulsus Ltd, including the inability to obtain a visa.</p>

<h3>Refund Policy</h3>
<p>If the registrant is unable to attend, and is not in a position to transfer his/her participation to another person or event, then the following refund arrangements apply:</p>

<p>Keeping in view of advance payments towards Venue, Printing, Shipping, Hotels and other overheads, we had to keep Refund Policy is as following slabs-</p>
<ul>
  <li>Before 60 days of the conference: Eligible for Full Refund less $100 service Fee</li>
  <li>Within 60-30 days of Conference: Eligible for 50% of payment Refund</li>
  <li>Within 30 days of Conference: Not eligible for Refund</li>
</ul>
<p>E-Poster Payments will not be refunded.</p>

<h3>Accommodation Cancellation Policy</h3>
<p>Accommodation Providers (Hotels) have their own cancellation policies, and they generally apply when cancellations are made less than 30 days prior to arrival. Please contact us as soon as possible, if you wish to cancel or amend your accommodation. Pulsus Ltd will advise the cancellation policy of your accommodation provider, prior to cancelling or amending your booking, to ensure you are fully aware of any non-refundable deposits.</p>
`;

export function TermsPage({ event }: { event: EventData }) {
  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Legal</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Terms & Conditions</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Please read the terms and conditions carefully before registering for {event.title}</p>
      </div>

      <div className="prose prose-lg max-w-none text-[hsl(var(--muted-foreground))]" dangerouslySetInnerHTML={{ __html: TERMS_AND_CONDITIONS }} />
    </div>
  );
}
