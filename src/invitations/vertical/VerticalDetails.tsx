import { ReactNode } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { Invitation } from '../../types';

type VerticalDetailsProps = {
  invitation: Invitation;
};

export function VerticalDetails({ invitation }: VerticalDetailsProps) {
  return (
    <section className="vertical-details" id="details">
      <span className="section-kicker">Details</span>
      <h2>{invitation.introTitle}</h2>
      <p className="vertical-details__intro">{invitation.introText}</p>
      <div className="vertical-details__grid">
        <VerticalDetailCard
          icon={<CalendarDays />}
          title={invitation.dateLabel}
          text={`Ceremony starts at ${invitation.ceremonyTime}`}
        />
        <VerticalDetailCard icon={<MapPin />} title={invitation.venueName} text={invitation.location} />
        <VerticalDetailCard
          icon={<Users />}
          title="Private invitation"
          text={`Up to ${invitation.maxGuestsPerInvite} guest(s)`}
        />
      </div>
    </section>
  );
}

function VerticalDetailCard({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <div className="vertical-details__card">
      {icon}
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}
