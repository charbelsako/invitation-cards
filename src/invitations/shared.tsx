import { FormEvent, ReactNode } from 'react';
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
import { Invitation } from '../types';

export type RsvpState = 'idle' | 'submitting' | 'success' | 'error';

export type InvitationTemplateProps = {
  guestOptions: number[];
  invitation: Invitation;
  isPlaying: boolean;
  message: string;
  onRsvpSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMusic: () => void;
  rsvpState: RsvpState;
};

export const timeline = [
  { time: '5:30 PM', title: 'Golden hour welcome', detail: 'Champagne, portraits, and a soft string trio.' },
  { time: '6:15 PM', title: 'Garden ceremony', detail: 'An intimate vow exchange under olive branches.' },
  { time: '8:00 PM', title: 'Dinner under lights', detail: 'A seasonal menu, speeches, and candlelit tables.' },
  { time: '10:30 PM', title: 'After party', detail: 'Live DJ, late-night bites, and dancing until midnight.' }
];

export function InviteMusicButton({ invitation, isPlaying, onToggleMusic }: InvitationTemplateProps) {
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

export function InviteDetails({ compact = false, invitation }: { compact?: boolean; invitation: Invitation }) {
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

export function InviteTimeline() {
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

export function InviteRsvpPanel({
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
