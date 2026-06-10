import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { apiFetch, resolveInvitationMedia } from './api/client';
import { Envelope } from './invitations/Envelope';
import { HorizontalInvitation } from './invitations/HorizontalInvitation';
import { InvitationTemplateProps, RsvpState } from './invitations/shared';
import { VerticalInvitation } from './invitations/VerticalInvitation';
import { Invitation } from './types';

const templateOptions: Invitation['template'][] = ['horizontal', 'vertical', 'envelope'];

type LoadState = 'loading' | 'ready' | 'error';

function isTemplate(value?: string): value is Invitation['template'] {
  return templateOptions.includes(value as Invitation['template']);
}

export function InvitationDemo() {
  const { slug, template: templateParam } = useParams<{ slug?: string; template?: string }>();
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const demoTemplate = isTemplate(templateParam) ? templateParam : undefined;
  const invitationSlug = demoTemplate ? `demo-${demoTemplate}` : slug || searchParams.get('id') || '';

  useEffect(() => {
    if (!invitationSlug) {
      setInvitation(null);
      setLoadState('error');
      return;
    }

    setLoadState('loading');

    apiFetch(`/api/invitations/${invitationSlug}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Invitation not found');
        }

        return response.json() as Promise<Invitation>;
      })
      .then((data) => {
        setInvitation(resolveInvitationMedia(data));
        setLoadState('ready');
      })
      .catch(() => {
        setInvitation(null);
        setLoadState('error');
      });
  }, [invitationSlug]);

  useEffect(() => {
    if (loadState !== 'ready' || !invitation?.musicUrl) {
      return;
    }

    const audio = new Audio(invitation.musicUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setAutoplayBlocked(true);
      });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
      setAutoplayBlocked(false);
    };
  }, [invitation?.musicUrl, loadState]);

  useEffect(() => {
    const musicUrl = invitation?.musicUrl;

    if (!autoplayBlocked || !musicUrl) {
      return;
    }

    async function startMusicOnInteraction() {
      if (!audioRef.current) {
        const audio = new Audio(musicUrl);
        audio.loop = true;
        audio.preload = 'auto';
        audioRef.current = audio;
      }

      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    }

    window.addEventListener('pointerdown', startMusicOnInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', startMusicOnInteraction);
    };
  }, [autoplayBlocked, invitation?.musicUrl]);

  const guestOptions = useMemo(
    () => (invitation ? Array.from({ length: invitation.maxGuestsPerInvite }, (_, index) => index + 1) : []),
    [invitation]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!invitation) {
      return;
    }

    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setRsvpState('submitting');
    setMessage('');

    try {
      const response = await apiFetch(`/api/invitations/${invitation.slug}/rsvps`, {
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
    if (!invitation?.musicUrl) {
      return;
    }

    if (!audioRef.current) {
      const audio = new Audio(invitation.musicUrl);
      audio.loop = true;
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setAutoplayBlocked(true);
    }
  }

  if (loadState === 'loading') {
    return (
      <main className="invite-page invite-loading">
        <p className="invite-status">Loading invitation...</p>
      </main>
    );
  }

  if (loadState === 'error' || !invitation) {
    return (
      <main className="invite-page invite-error">
        <p className="invite-status">Invitation not found.</p>
        <Link to="/" className="button button--primary">
          Back to home
        </Link>
      </main>
    );
  }

  const templateProps: InvitationTemplateProps = {
    autoplayBlocked,
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
