import { motion } from 'framer-motion';
import { Invitation } from '../../types';

type VerticalHeroProps = {
  invitation: Invitation;
};

export function VerticalHero({ invitation }: VerticalHeroProps) {
  return (
    <section className="vertical-hero">
      <motion.div
        className="vertical-hero__image"
        style={{ backgroundImage: `url(${invitation.heroImage})` }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      />
      <motion.div
        className="vertical-hero__copy"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span>Save the date</span>
        <h1>{invitation.coupleNames}</h1>
        <p>{invitation.introText}</p>
        <a href="#details" className="button button--primary">
          Event Details
        </a>
      </motion.div>
    </section>
  );
}
