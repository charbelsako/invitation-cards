import { InviteMusicButton, InvitationTemplateProps } from './shared';
import { VerticalDetails } from './vertical/VerticalDetails';
import { VerticalHero } from './vertical/VerticalHero';
import { VerticalRsvp } from './vertical/VerticalRsvp';
import './vertical/VerticalInvitation.css';

export function VerticalInvitation(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <VerticalHero invitation={invitation} />
      <VerticalDetails invitation={invitation} />
      <VerticalRsvp {...props} />
    </>
  );
}
