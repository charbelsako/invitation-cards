import { motion } from 'framer-motion';
import {
  InviteDetails,
  InviteMusicButton,
  InviteRsvpPanel,
  InviteTimeline,
  InvitationTemplateProps
} from './shared';

export function Envelope(props: InvitationTemplateProps) {
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
