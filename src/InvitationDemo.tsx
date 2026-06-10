import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { fallbackInvitation } from './demoInvitation';
import { Envelope } from './invitations/Envelope';
import { HorizontalInvitation } from './invitations/HorizontalInvitation';
import { InvitationTemplateProps, RsvpState } from './invitations/shared';
import { VerticalInvitation } from './invitations/VerticalInvitation';
import { Invitation } from './types';

export function InvitationDemo() {
  const [invitation, setInvitation] = useState<Invitation>(fallbackInvitation);
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const slug = getInvitationSlug();

    fetch(`/api/invitations/${slug}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: Invitation) => setInvitation({ ...fallbackInvitation, ...data }))
      .catch(() => setInvitation(fallbackInvitation));
  }, []);

  const guestOptions = useMemo(
    () => Array.from({ length: invitation.maxGuestsPerInvite }, (_, index) => index + 1),
    [invitation.maxGuestsPerInvite]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setRsvpState('submitting');
    setMessage('');

    try {
      const response = await fetch(`/api/invitations/${invitation.slug}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: formData.get('guestName'),
          email: formData.get('email'),
          attendingCount: Number(formData.get('attendingCount')),
          note: formData.get('note')
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Unable to submit RSVP');
      }

      setRsvpState('success');
      setMessage('Your RSVP was received. We cannot wait to celebrate with you.');
      event.currentTarget.reset();
    } catch (error) {
      setRsvpState('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  }

  async function toggleMusic() {
    if (!invitation.musicUrl) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(invitation.musicUrl);
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await audioRef.current.play();
    setIsPlaying(true);
  }

  const templateProps: InvitationTemplateProps = {
    guestOptions,
    invitation,
    isPlaying,
    message,
    onRsvpSubmit: handleSubmit,
    onToggleMusic: toggleMusic,
    rsvpState
  };

  return (
    <main
      style={
        {
          '--gold': invitation.accentColor,
          '--gold-dark': invitation.secondaryColor
        } as React.CSSProperties
      }
      className={`invite-page invite-${invitation.template}`}
    >
      {invitation.template === 'vertical' && <VerticalInvitation {...templateProps} />}
      {invitation.template === 'envelope' && <Envelope {...templateProps} />}
      {invitation.template === 'horizontal' && <HorizontalInvitation {...templateProps} />}
    </main>
  );
}

function getInvitationSlug() {
  const searchSlug = new URLSearchParams(window.location.search).get('id');
  const segments = window.location.pathname.split('/').filter(Boolean);
  const pathSlug = segments[0] === 'invite' ? segments[1] : segments[0];
  return searchSlug || pathSlug || fallbackInvitation.slug;
}
