import {
  EnvelopeInviteDetails,
  InviteMusicButton,
  InviteRsvpPanel,
  InvitationTemplateProps
} from './shared';
import { EnvelopeOpening } from './envelope/EnvelopeOpening';
import { EnvelopeTimeline } from './envelope/EnvelopeTimeline';

export function Envelope(props: InvitationTemplateProps) {
  const { invitation } = props;

  return (
    <>
      <InviteMusicButton {...props} />
      <EnvelopeOpening invitation={invitation} />
      {/* <EnvelopeInviteDetails invitation={invitation} /> */}
      <EnvelopeTimeline invitation={invitation} />
      <InviteRsvpPanel {...props} />
    </>
  );
}
