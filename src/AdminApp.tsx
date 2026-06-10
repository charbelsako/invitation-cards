import { ChangeEvent, FormEvent, ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Eye,
  Heart,
  Image,
  LayoutTemplate,
  Lock,
  Mail,
  Palette,
  Plus,
  Save,
  Sparkles
} from 'lucide-react';
import { fallbackInvitation } from './demoInvitation';
import { Invitation } from './types';

type SaveState = 'idle' | 'saving' | 'success' | 'error';

const templates = [
  {
    id: 'horizontal',
    name: 'Modern Horizontal',
    description: 'Warm neutrals, soft blur, and timeless editorial spacing.'
  },
  {
    id: 'vertical',
    name: 'Modern Vertical',
    description: 'High contrast cards, dramatic scale, and fashion-inspired rhythm.'
  },
  {
    id: 'envelope',
    name: 'Envelope',
    description: 'Airy panels, botanical color palettes, and softer ceremony details.'
  }
] satisfies Array<{ id: Invitation['template']; name: string; description: string }>;

export function AdminApp() {
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
          <Link className="text-black button button--ghost admin-preview-link" to={`/invite/${form.slug}`} target="_blank" rel="noreferrer">
            <Eye size={18} />
            Open guest link
          </Link>
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
              <span>/invite/{invitation.slug}</span>
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

function SectionLabel({ icon, title }: { icon: ReactNode; title: string }) {
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
