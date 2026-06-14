import { motion } from 'framer-motion';
import { Invitation } from '../../types';
import './EnvelopeTimeline.css';

type EnvelopeTimelineProps = {
  invitation: Invitation;
};

export function EnvelopeTimeline({ invitation }: EnvelopeTimelineProps) {
  const items = getEnvelopeTimelineItems(invitation);
  const venueDetail = getVenueDetail(invitation);

  if (!items.length && !venueDetail) {
    return null;
  }

  return (
    <section className="envelope-timeline" aria-labelledby="envelope-timeline-title">
      <h2 id="envelope-timeline-title">Timeline of the big day!</h2>
      {items.length > 0 && (
        <div className="envelope-timeline__list">
          {items.map((item) => (
            <motion.article
              className="envelope-timeline__item"
              key={`${item.time}-${item.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.45 }}
            >
              <span className="envelope-timeline__marker" aria-hidden="true" />
              <div className="envelope-timeline__content">
                <time>{item.time}</time>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      {venueDetail && (
        <motion.aside
          className="envelope-timeline__venue"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span>Location</span>
          <h3>{venueDetail.name}</h3>
          {venueDetail.address && <p>{venueDetail.address}</p>}
        </motion.aside>
      )}
    </section>
  );
}

function getEnvelopeTimelineItems(invitation: Invitation) {
  if (invitation.timelineItems?.length) {
    return invitation.timelineItems;
  }

  const detail = [invitation.venueName, invitation.location].filter(Boolean).join(' · ');

  if (!invitation.ceremonyTime && !invitation.dateLabel && !detail) {
    return [];
  }

  return [
    {
      time: invitation.ceremonyTime,
      title: invitation.dateLabel,
      detail
    }
  ];
}

function getVenueDetail(invitation: Invitation) {
  if (!invitation.venueName && !invitation.location) {
    return null;
  }

  return {
    name: invitation.venueName,
    address: invitation.location
  };
}