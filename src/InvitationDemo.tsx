import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Mail,
  MapPin,
  Music2,
  Users
} from 'lucide-react';
import { fallbackInvitation } from './demoInvitation';
import { Invitation } from './types';

type RsvpState = 'idle' | 'submitting' | 'success' | 'error';

const timeline = [
  { time: '5:30 PM', title: 'Golden hour welcome', detail: 'Champagne, portraits, and a soft string trio.' },
  { time: '6:15 PM', title: 'Garden ceremony', detail: 'An intimate vow exchange under olive branches.' },
  { time: '8:00 PM', title: 'Dinner under lights', detail: 'A seasonal menu, speeches, and candlelit tables.' },
  { time: '10:30 PM', title: 'After party', detail: 'Live DJ, late-night bites, and dancing until midnight.' }
];

export function InvitationDemo() {
  const [invitation, setInvitation] = useState<Invitation>(fallbackInvitation);
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const slug = getInvitationSlug();

    fetch(`/api/invitations/${slug}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: Invitation) => setInvitation({ ...fallbackInvitation, ...data }))
      .catch(() => setInvitation(fallbackInvitation));
  }, []);

  const guestOptions = useMemo(
    () => Array.from({ length: invitation.maxGuestsPerInvite }, (_, index) => index + 1),
    [invitation.maxGuestsPerInvite]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setRsvpState('submitting');
    setMessage('');

    try {
      const response = await fetch(`/api/invitations/${invitation.slug}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: formData.get('guestName'),
          email: formData.get('email'),
          attendingCount: Number(formData.get('attendingCount')),
          note: formData.get('note')
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Unable to submit RSVP');
      }

      setRsvpState('success');
      setMessage('Your RSVP was received. We cannot wait to celebrate with you.');
      event.currentTarget.reset();
    } catch (error) {
      setRsvpState('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  async function toggleMusic() {
    if (!invitation.musicUrl) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(invitation.musicUrl);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  }

  return (
    <main
      style={
        {
          '--gold': invitation.accentColor,
          '--gold-dark': invitation.secondaryColor
        } as React.CSSProperties
      }
      className={`invite-page invite-${invitation.template}`}
    >
      <InvitationTemplateView
        guestOptions={guestOptions}
        invitation={invitation}
        isPlaying={isPlaying}
        message={message}
        onRsvpSubmit={handleSubmit}
        onToggleMusic={toggleMusic}
        rsvpState={rsvpState}
      />
    </main>
  );
}

function InvitationTemplateView({
  guestOptions,
  invitation,
  isPlaying,
  message,
  onRsvpSubmit,
  onToggleMusic,
  rsvpState
}: {
  guestOptions: number[];
  invitation: Invitation;
  isPlaying: boolean;
  message: string;
  onRsvpSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMusic: () => void;
  rsvpState: RsvpState;
}) {
  const sharedProps = { guestOptions, invitation, isPlaying, message, onRsvpSubmit, onToggleMusic, rsvpState };

  if (invitation.template === 'editorial') {
    return <EditorialInvitation {...sharedProps} />;
  }

  if (invitation.template === 'garden') {
    return <GardenInvitation {...sharedProps} />;
  }

  return <ClassicInvitation {...sharedProps} />;
}

type InvitationTemplateProps = {
  guestOptions: number[];
  invitation: Invitation;
  isPlaying: boolean;
  message: string;
  onRsvpSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMusic: () => void;
  rsvpState: RsvpState;
};

function ClassicInvitation(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <section className="invite-classic-hero" style={{ backgroundImage: `url(${invitation.heroImage})` }}>
        <motion.div className="invite-classic-card" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
          <span>Wedding Invitation</span>
          <h1>{invitation.coupleNames}</h1>
          <p>{invitation.dateLabel}</p>
          <a href="#rsvp" className="button button--primary">
            RSVP
          </a>
        </motion.div>
      </section>
      <InviteDetails invitation={invitation} />
      <InviteTimeline />
      <InviteRsvpPanel {...props} />
    </>
  );
}

function EditorialInvitation(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <section className="invite-editorial-hero">
        <motion.div className="invite-editorial-copy" initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }}>
          <span>Save the date</span>
          <h1>{invitation.coupleNames}</h1>
          <p>{invitation.introText}</p>
          <a href="#details" className="button button--primary">
            Event Details
          </a>
        </motion.div>
        <motion.div
          className="invite-editorial-image"
          style={{ backgroundImage: `url(${invitation.heroImage})` }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        />
      </section>
      <InviteDetails invitation={invitation} compact />
      <InviteRsvpPanel {...props} />
    </>
  );
}

function GardenInvitation(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <section className="invite-garden-hero">
        <motion.div className="invite-garden-photo" style={{ backgroundImage: `url(${invitation.heroImage})` }} />
        <motion.div className="invite-garden-card" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }}>
          <span>We invite you to celebrate</span>
          <h1>{invitation.coupleNames}</h1>
          <p>{invitation.dateLabel}</p>
          <a href="#rsvp" className="button button--primary">
            Respond
          </a>
        </motion.div>
      </section>
      <InviteDetails invitation={invitation} />
      <InviteTimeline />
      <InviteRsvpPanel {...props} />
    </>
  );
}

function InviteMusicButton({ invitation, isPlaying, onToggleMusic }: InvitationTemplateProps) {
  return (
    <div className="invite-floating-actions">
      <a href="/" className="icon-button">
        <Home size={18} />
        Home
      </a>
      <button className="icon-button" type="button" onClick={onToggleMusic} disabled={!invitation.musicUrl}>
        <Music2 size={18} />
        {invitation.musicUrl ? (isPlaying ? 'Pause' : 'Music') : 'No music'}
      </button>
    </div>
  );
}

function InviteDetails({ compact = false, invitation }: { compact?: boolean; invitation: Invitation }) {
  return (
    <section className={`invite-details ${compact ? 'invite-details--compact' : ''}`} id="details">
      <span className="section-kicker">Details</span>
      <h2>{invitation.introTitle}</h2>
      <p>{invitation.introText}</p>
      <div className="invite-detail-grid">
        <InviteDetail icon={<CalendarDays />} title={invitation.dateLabel} text={`Ceremony starts at ${invitation.ceremonyTime}`} />
        <InviteDetail icon={<MapPin />} title={invitation.venueName} text={invitation.location} />
        <InviteDetail icon={<Users />} title="Private invitation" text={`Up to ${invitation.maxGuestsPerInvite} guest(s)`} />
      </div>
    </section>
  );
}

function InviteDetail({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div>
      {icon}
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function InviteTimeline() {
  return (
    <section className="invite-timeline">
      <span className="section-kicker">Wedding Day</span>
      {timeline.map((item) => (
        <motion.div
          className="invite-timeline__item"
          key={item.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <span>{item.time}</span>
          <div>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </div>
        </motion.div>
      ))}
    </section>
  );
}

function InviteRsvpPanel({
  guestOptions,
  invitation,
  message,
  onRsvpSubmit,
  rsvpState
}: InvitationTemplateProps) {
  return (
    <section className="invite-rsvp" id="rsvp">
      <div className="invite-rsvp__image" style={{ backgroundImage: `url(${invitation.rsvpImage || invitation.heroImage})` }} />
      <form className="rsvp__form invite-rsvp__form" onSubmit={onRsvpSubmit}>
        <span className="section-kicker">Kindly respond</span>
        <h2>Will you join us?</h2>
        <label>
          Full name
          <input name="guestName" required placeholder="Charbel Sarkis" />
        </label>
        <label>
          Email
          <input name="email" type="email" required placeholder="guest@example.com" />
        </label>
        <label>
          Guests attending
          <select name="attendingCount" required defaultValue="1">
            {guestOptions.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </label>
        <label>
          Note to the couple
          <textarea name="note" rows={4} placeholder="Dietary notes, song requests, or a sweet message" />
        </label>
        <button className="button button--primary" type="submit" disabled={rsvpState === 'submitting'}>
          {rsvpState === 'submitting' ? 'Sending...' : 'Send RSVP'}
        </button>
        <AnimatePresence>
          {message && (
            <motion.p
              className={`form-message form-message--${rsvpState}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {rsvpState === 'success' ? <CheckCircle2 size={18} /> : <Mail size={18} />}
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </section>
  );
}

function getInvitationSlug() {
  const searchSlug = new URLSearchParams(window.location.search).get('id');
  const segments = window.location.pathname.split('/').filter(Boolean);
  const pathSlug = segments[0] === 'invite' ? segments[1] : segments[0];
  return searchSlug || pathSlug || fallbackInvitation.slug;
}
