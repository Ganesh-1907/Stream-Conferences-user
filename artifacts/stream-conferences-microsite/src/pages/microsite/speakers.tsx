import { Award, Presentation, Globe, Linkedin, Twitter } from 'lucide-react';
import type { EventData } from './layout';

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_ORIGIN || 'http://localhost:7867';
const mediaUrl = (u: string): string => (!u ? '' : u.startsWith('http') ? u : `${SERVER_ORIGIN}${u}`);

export function SpeakersPage({ event }: { event: EventData }) {
  const speakers = event.speakers || [];
  if (speakers.length === 0) {
    return (
      <div className="container-wide py-16 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">No speakers announced yet for this event.</p>
      </div>
    );
  }

  const keynoteSpeakers = speakers.filter((s) => s.isKeynote);
  const otherSpeakers = speakers.filter((s) => !s.isKeynote);

  const SpeakerCard = ({ speaker, isKeynote = false }: { speaker: any; isKeynote?: boolean }) => (
    <div className="speaker-item">
      {speaker.avatar ? (
        <img src={mediaUrl(speaker.avatar)} alt={speaker.name} className="speaker-avatar" />
      ) : (
        <div className="speaker-avatar-placeholder">{speaker.name.charAt(0)}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="speaker-name">{speaker.name}</h3>
          {isKeynote && <span className="session-badge bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] text-white">Keynote</span>}
        </div>
        {speaker.designation && <p className="speaker-role">{speaker.designation}</p>}
        {speaker.organization && <p className="speaker-org">{speaker.organization}</p>}
        {speaker.topic && <span className="speaker-topic"><Presentation size={12} />{speaker.topic}</span>}
        {speaker.bio && <p className="speaker-bio line-clamp-2">{speaker.bio}</p>}
        <div className="speaker-socials">
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Linkedin size={16} /></a>
          )}
          {speaker.twitter && (
            <a href={speaker.twitter} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Twitter size={16} /></a>
          )}
          {speaker.website && (
            <a href={speaker.website} target="_blank" rel="noopener noreferrer" className="speaker-social-link"><Globe size={16} /></a>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <span className="section-eyebrow">Speakers</span>
        <h1 className="mt-3 text-3xl md:text-4xl font-['Space_Grotesk'] font-bold tracking-tight text-[hsl(var(--foreground))]">Meet our speakers</h1>
        <p className="mt-2 text-base text-[hsl(var(--muted-foreground))]">Esteemed speakers and keynote presenters</p>
      </div>

      {keynoteSpeakers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award size={18} className="text-[hsl(var(--accent))]" />
            Keynote Speakers
          </h3>
          <div>
            {keynoteSpeakers.map((speaker) => <SpeakerCard key={speaker.name} speaker={speaker} isKeynote />)}
          </div>
        </div>
      )}

      {otherSpeakers.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Speakers</h3>
          <div>
            {otherSpeakers.map((speaker) => <SpeakerCard key={speaker.name} speaker={speaker} />)}
          </div>
        </div>
      )}
    </div>
  );
}
