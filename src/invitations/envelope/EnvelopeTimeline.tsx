import { motion } from 'framer-motion';
import { Invitation } from '../../types';
import './EnvelopeTimeline.css';

const fallbackTimelineItems = [
  {
    time: '6:30 PM',
    title: 'Golden hour drinks begin',
    detail: 'Arrive on time, the first surprise of the evening awaits at sunset!'
  },
  {
    time: '8:00 PM',
    title: 'The evening unfolds',
    detail: 'Expect surprises all night long!'
  }
];

type EnvelopeTimelineProps = {
  invitation: Invitation;
};

export function EnvelopeTimeline({ invitation }: EnvelopeTimelineProps) {
  const items = invitation.timelineItems?.length ? invitation.timelineItems : fallbackTimelineItems;

  return (
    <section className="envelope-timeline" aria-labelledby="envelope-timeline-title">
      <h2 id="envelope-timeline-title">Timeline of the big day!</h2>
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
    </section>
  );
}
