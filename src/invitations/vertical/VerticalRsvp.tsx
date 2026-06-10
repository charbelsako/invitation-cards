import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Mail } from 'lucide-react';
import { InvitationTemplateProps } from '../shared';

export function VerticalRsvp({
  guestOptions,
  invitation,
  message,
  onRsvpSubmit,
  rsvpState
}: InvitationTemplateProps) {
  return (
    <section className="vertical-rsvp" id="rsvp">
      <div
        className="vertical-rsvp__image"
        style={{ backgroundImage: `url(${invitation.rsvpImage || invitation.heroImage})` }}
      />
      <form className="rsvp__form vertical-rsvp__form" onSubmit={onRsvpSubmit}>
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
