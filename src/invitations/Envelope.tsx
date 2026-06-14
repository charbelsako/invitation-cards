import {
  InviteDetails,
  InviteMusicButton,
  InviteRsvpPanel,
  InviteTimeline,
  InvitationTemplateProps
} from './shared';
import { EnvelopeOpening } from './envelope/EnvelopeOpening';

export function Envelope(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <EnvelopeOpening invitation={invitation} />
      <InviteDetails invitation={invitation} />
      <InviteTimeline />
      <InviteRsvpPanel {...props} />
    </>
  );
}
