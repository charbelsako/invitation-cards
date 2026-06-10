import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eye,
  Gift,
  Heart,
  Image,
  LayoutTemplate,
  Lock,
  Mail,
  MapPin,
  Music2,
  Palette,
  Plus,
  Save,
  Sparkles,
  Users
} from 'lucide-react';

type Invitation = {
  slug: string;
  template: 'classic' | 'editorial' | 'garden';
  coupleNames: string;
  dateLabel: string;
  ceremonyTime: string;
  venueName: string;
  location: string;
  heroImage: string;
  rsvpImage: string;
  accentColor: string;
  secondaryColor: string;
  introTitle: string;
  introText: string;
  musicUrl?: string;
  notifyEmail: string;
  maxGuestsPerInvite: number;
};

type RsvpState = 'idle' | 'submitting' | 'success' | 'error';
type SaveState = 'idle' | 'saving' | 'success' | 'error';

const fallbackInvitation: Invitation = {
  slug: 'demo-wedding',
  template: 'classic',
  coupleNames: 'Mira & Elias',
  dateLabel: 'Saturday, 24 August 2026',
  ceremonyTime: '6:15 PM',
  venueName: 'Villa Sursock Gardens',
  location: 'Beirut, Lebanon',
  heroImage:
    'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1600&q=85',
  rsvpImage:
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85',
  accentColor: '#b9825b',
  secondaryColor: '#7c4e34',
  introTitle: 'A cinematic invitation experience for a once-in-a-lifetime celebration.',
  introText:
    'This invitation combines premium visual design, subtle movement, RSVP collection, and a template-ready structure for future designs.',
  musicUrl: '',
  notifyEmail: '',
  maxGuestsPerInvite: 2
};

const timeline = [
  { time: '5:30 PM', title: 'Golden hour welcome', detail: 'Champagne, portraits, and a soft string trio.' },
  { time: '6:15 PM', title: 'Garden ceremony', detail: 'An intimate vow exchange under olive branches.' },
  { time: '8:00 PM', title: 'Dinner under lights', detail: 'A seasonal menu, speeches, and candlelit tables.' },
  { time: '10:30 PM', title: 'After party', detail: 'Live DJ, late-night bites, and dancing until midnight.' }
];

const signatureIdeas = [
  'Horizontal story panels for mobile-first reveals',
  'Private RSVP capacity and plus-one control',
  'Background music with guest-controlled playback',
  'Email notifications when a guest responds',
  'Template-ready colors, SVG ornaments, and layouts'
];

const templates = [
  {
    id: 'classic',
    name: 'Classic Luxe',
    description: 'Warm neutrals, soft blur, and timeless editorial spacing.'
  },
  {
    id: 'editorial',
    name: 'Modern Editorial',
    description: 'High contrast cards, dramatic scale, and fashion-inspired rhythm.'
  },
  {
    id: 'garden',
    name: 'Garden Romance',
    description: 'Airy panels, botanical color palettes, and softer ceremony details.'
  }
] satisfies Array<{ id: Invitation['template']; name: string; description: string }>;

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  return <PublicInvitation />;
}

function PublicInvitation() {
  const [invitation, setInvitation] = useState<Invitation>(fallbackInvitation);
  const [rsvpState, setRsvpState] = useState<RsvpState>('idle');
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0.35]);

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

  return (
    <main
      style={
        {
          '--gold': invitation.accentColor,
          '--gold-dark': invitation.secondaryColor
        } as React.CSSProperties
      }
      className={`theme-${invitation.template}`}
    >
      <section className="hero">
        <motion.div
          className="hero__image"
          style={{ backgroundImage: `url(${invitation.heroImage})`, scale: heroScale, opacity: heroOpacity }}
        />
        <div className="hero__veil" />
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className="eyebrow">
            <Sparkles size={16} />
            {invitation.template} wedding invitation
          </span>
          <h1>{invitation.coupleNames}</h1>
          <p>{invitation.dateLabel}</p>
          <div className="hero__actions">
            <a href="#rsvp" className="button button--primary">
              RSVP Now
            </a>
            <a href="#details" className="button button--ghost">
              View Details
            </a>
          </div>
        </motion.div>
        <motion.a
          className="scroll-cue"
          href="#details"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          aria-label="Scroll to invitation details"
        >
          <ChevronDown />
        </motion.a>
      </section>

      <section className="intro section" id="details">
        <motion.div
          className="intro__card"
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-kicker">With great joy</span>
          <h2>{invitation.introTitle}</h2>
          <p>{invitation.introText}</p>
          <div className="detail-grid">
            <div>
              <CalendarDays />
              <strong>{invitation.dateLabel}</strong>
              <span>Ceremony starts at {invitation.ceremonyTime}</span>
            </div>
            <div>
              <MapPin />
              <strong>{invitation.venueName}</strong>
              <span>{invitation.location}</span>
            </div>
            <div>
              <Users />
              <strong>Private RSVP</strong>
              <span>Up to {invitation.maxGuestsPerInvite} guest(s) for this invite</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="story section">
        <div className="section-heading">
          <span className="section-kicker">The experience</span>
          <h2>Designed to feel like opening a luxury paper invitation.</h2>
        </div>
        <div className="horizontal-rail" aria-label="Invitation feature highlights">
          {signatureIdeas.map((idea, index) => (
            <motion.article
              className="feature-card"
              key={idea}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
            >
              <span>0{index + 1}</span>
              <h3>{idea}</h3>
              <p>Built as a reusable product feature, not a one-off landing page section.</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="timeline section">
        <div className="section-heading">
          <span className="section-kicker">Wedding day</span>
          <h2>The celebration plan</h2>
        </div>
        <div className="timeline__list">
          {timeline.map((item) => (
            <motion.div
              className="timeline__item"
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.55 }}
            >
              <span>{item.time}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rsvp section" id="rsvp">
        <motion.div
          className="rsvp__panel"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65 }}
        >
          <div className="rsvp__copy">
            <div
              className="rsvp__photo"
              style={{ backgroundImage: `url(${invitation.rsvpImage || invitation.heroImage})` }}
            />
            <span className="section-kicker">Kindly respond</span>
            <h2>Reserve your place at the table.</h2>
            <p>
              Guest responses are sent to the API and stored in MongoDB. The backend can also
              notify the couple by email when SMTP variables are configured.
            </p>
            <div className="mini-actions">
              <button className="icon-button" type="button" onClick={toggleMusic} disabled={!invitation.musicUrl}>
                <Music2 />
                {invitation.musicUrl ? (isPlaying ? 'Pause music' : 'Play music') : 'Music ready when added'}
              </button>
              <span>
                <Gift />
                Registry and travel sections can be added next.
              </span>
            </div>
          </div>

          <form className="rsvp__form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input name="guestName" required placeholder="Charbel Sarkis" />
            </label>
            <label>
              Email
              <input name="email" type="email" required placeholder="guest@example.com" />
            </label>
            <label>
              Guests attending
              <select name="attendingCount" required defaultValue="1">
                {guestOptions.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Note to the couple
              <textarea name="note" rows={4} placeholder="Dietary notes, song requests, or a sweet message" />
            </label>
            <button className="button button--primary" type="submit" disabled={rsvpState === 'submitting'}>
              {rsvpState === 'submitting' ? 'Sending...' : 'Send RSVP'}
            </button>
            <AnimatePresence>
              {message && (
                <motion.p
                  className={`form-message form-message--${rsvpState}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {rsvpState === 'success' ? <CheckCircle2 size={18} /> : <Mail size={18} />}
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </section>

      <footer>
        <Heart size={18} />
        Crafted for a refined wedding invitation experience.
      </footer>
    </main>
  );
}

function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem('invitation-admin-token') || '');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [form, setForm] = useState<Invitation>(fallbackInvitation);
  const [loginMessage, setLoginMessage] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchAdminInvitations(token)
      .then((items) => {
        setInvitations(items);
        if (items[0]) {
          setForm(normalizeInvitation(items[0]));
        }
      })
      .catch((error) => {
        setLoginMessage(error instanceof Error ? error.message : 'Could not load invitations.');
      });
  }, [token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoginMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Login failed.');
      }

      localStorage.setItem('invitation-admin-token', payload.token);
      setToken(payload.token);
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : 'Login failed.');
    }
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === 'maxGuestsPerInvite' ? Number(value) : value
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState('saving');
    setSaveMessage('');

    try {
      const response = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Could not save invitation.');
      }

      const saved = normalizeInvitation(payload);
      setForm(saved);
      setInvitations((current) => [saved, ...current.filter((item) => item.slug !== saved.slug)]);
      setSaveState('success');
      setSaveMessage('Invitation saved. Your guest link is ready.');
    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Could not save invitation.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('invitation-admin-token');
    setToken('');
  }

  if (!token) {
    return (
      <main className="admin-shell admin-shell--login">
        <motion.form
          className="admin-login"
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="eyebrow">
            <Lock size={16} />
            Private admin
          </span>
          <h1>Invitation studio</h1>
          <p>Log in to create templates, change colors and images, and decide where RSVP emails go.</p>
          <label>
            Admin email
            <input name="email" type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input name="password" type="password" required minLength={8} placeholder="Minimum 8 characters" />
          </label>
          <button className="button button--primary" type="submit">
            Enter studio
          </button>
          {loginMessage && <p className="form-message form-message--error">{loginMessage}</p>}
        </motion.form>
      </main>
    );
  }

  return (
    <main
      className="admin-shell"
      style={
        {
          '--gold': form.accentColor,
          '--gold-dark': form.secondaryColor
        } as React.CSSProperties
      }
    >
      <header className="admin-header">
        <div>
          <span className="eyebrow">
            <Sparkles size={16} />
            Invitation studio
          </span>
          <h1>Create an invitation without touching the database.</h1>
        </div>
        <div className="admin-header__actions">
          <a className="button button--ghost admin-preview-link" href={`/${form.slug}`} target="_blank" rel="noreferrer">
            <Eye size={18} />
            Open guest link
          </a>
          <button className="icon-button" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="studio-grid">
        <aside className="admin-sidebar">
          <button className="template-option template-option--new" type="button" onClick={() => setForm(fallbackInvitation)}>
            <Plus size={18} />
            New invitation
          </button>
          {invitations.map((invitation) => (
            <button
              className={`template-option ${invitation.slug === form.slug ? 'template-option--active' : ''}`}
              key={invitation.slug}
              type="button"
              onClick={() => setForm(normalizeInvitation(invitation))}
            >
              <strong>{invitation.coupleNames}</strong>
              <span>/{invitation.slug}</span>
            </button>
          ))}
        </aside>

        <form className="builder-panel" onSubmit={handleSave}>
          <SectionLabel icon={<LayoutTemplate size={18} />} title="Template" />
          <div className="template-grid">
            {templates.map((template) => (
              <label className={`template-card ${form.template === template.id ? 'template-card--selected' : ''}`} key={template.id}>
                <input
                  name="template"
                  type="radio"
                  value={template.id}
                  checked={form.template === template.id}
                  onChange={handleFieldChange}
                />
                <strong>{template.name}</strong>
                <span>{template.description}</span>
              </label>
            ))}
          </div>

          <SectionLabel icon={<Heart size={18} />} title="Invitation Details" />
          <div className="form-grid">
            <label>
              URL slug
              <input name="slug" value={form.slug} onChange={handleFieldChange} required />
            </label>
            <label>
              Couple names
              <input name="coupleNames" value={form.coupleNames} onChange={handleFieldChange} required />
            </label>
            <label>
              Date label
              <input name="dateLabel" value={form.dateLabel} onChange={handleFieldChange} required />
            </label>
            <label>
              Ceremony time
              <input name="ceremonyTime" value={form.ceremonyTime} onChange={handleFieldChange} required />
            </label>
            <label>
              Venue
              <input name="venueName" value={form.venueName} onChange={handleFieldChange} required />
            </label>
            <label>
              Location
              <input name="location" value={form.location} onChange={handleFieldChange} required />
            </label>
          </div>

          <SectionLabel icon={<Palette size={18} />} title="Colors and Images" />
          <div className="form-grid">
            <label>
              Accent color
              <input name="accentColor" type="color" value={form.accentColor} onChange={handleFieldChange} />
            </label>
            <label>
              Secondary color
              <input name="secondaryColor" type="color" value={form.secondaryColor} onChange={handleFieldChange} />
            </label>
            <label className="form-grid__wide">
              Hero image URL
              <input name="heroImage" value={form.heroImage} onChange={handleFieldChange} required />
            </label>
            <label className="form-grid__wide">
              RSVP image URL
              <input name="rsvpImage" value={form.rsvpImage} onChange={handleFieldChange} />
            </label>
            <label className="form-grid__wide">
              Music URL
              <input name="musicUrl" value={form.musicUrl || ''} onChange={handleFieldChange} placeholder="Optional mp3 URL" />
            </label>
          </div>

          <SectionLabel icon={<Image size={18} />} title="Story Copy" />
          <label>
            Main intro title
            <textarea name="introTitle" rows={2} value={form.introTitle} onChange={handleFieldChange} required />
          </label>
          <label>
            Intro paragraph
            <textarea name="introText" rows={4} value={form.introText} onChange={handleFieldChange} required />
          </label>

          <SectionLabel icon={<Mail size={18} />} title="RSVP Settings" />
          <div className="form-grid">
            <label>
              Email to receive RSVPs
              <input name="notifyEmail" type="email" value={form.notifyEmail} onChange={handleFieldChange} />
            </label>
            <label>
              Guests allowed
              <input
                name="maxGuestsPerInvite"
                type="number"
                min={1}
                max={10}
                value={form.maxGuestsPerInvite}
                onChange={handleFieldChange}
              />
            </label>
          </div>

          <button className="button button--primary" type="submit" disabled={saveState === 'saving'}>
            <Save size={18} />
            {saveState === 'saving' ? 'Saving...' : 'Save invitation'}
          </button>
          {saveMessage && <p className={`form-message form-message--${saveState}`}>{saveMessage}</p>}
        </form>

        <aside className={`builder-preview theme-${form.template}`}>
          <span className="section-kicker">Live preview</span>
          <div className="preview-phone">
            <div className="preview-hero" style={{ backgroundImage: `url(${form.heroImage})` }}>
              <span>{form.dateLabel}</span>
              <h2>{form.coupleNames}</h2>
            </div>
            <div className="preview-body">
              <strong>{form.introTitle}</strong>
              <p>{form.introText}</p>
              <small>
                {form.venueName} · {form.location}
              </small>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="builder-section-label">
      {icon}
      <span>{title}</span>
    </div>
  );
}

async function fetchAdminInvitations(token: string) {
  const response = await fetch('/api/admin/invitations', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Could not load invitations.');
  }

  return payload.map(normalizeInvitation) as Invitation[];
}

function normalizeInvitation(invitation: Partial<Invitation>): Invitation {
  return {
    ...fallbackInvitation,
    ...invitation,
    template: invitation.template || fallbackInvitation.template,
    musicUrl: invitation.musicUrl || '',
    notifyEmail: invitation.notifyEmail || '',
    rsvpImage: invitation.rsvpImage || invitation.heroImage || fallbackInvitation.rsvpImage
  };
}

function getInvitationSlug() {
  const searchSlug = new URLSearchParams(window.location.search).get('id');
  const pathSlug = window.location.pathname.split('/').filter(Boolean)[0];
  return searchSlug || pathSlug || fallbackInvitation.slug;
}

export default App;
