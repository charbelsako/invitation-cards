import { motion } from 'framer-motion';
import {
  InviteDetails,
  InviteMusicButton,
  InviteRsvpPanel,
  InvitationTemplateProps
} from './shared';

export function VerticalInvitation(props: InvitationTemplateProps) {
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
