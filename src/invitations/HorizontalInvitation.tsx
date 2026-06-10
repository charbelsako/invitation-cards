import { motion } from 'framer-motion';
import {
  InviteDetails,
  InviteMusicButton,
  InviteRsvpPanel,
  InviteTimeline,
  InvitationTemplateProps
} from './shared';

export function HorizontalInvitation(props: InvitationTemplateProps) {
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
