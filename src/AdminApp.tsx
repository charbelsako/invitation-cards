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
  Sparkles,
  Trash2
} from 'lucide-react';
import { apiFetch, mediaUrl } from './api/client';
import { fallbackInvitation } from './demoInvitation';
import { Invitation } from './types';

type SaveState = 'idle' | 'saving' | 'success' | 'error';
type MediaFieldName = 'heroImage' | 'rsvpImage' | 'musicUrl';
type UploadState = Partial<Record<MediaFieldName, boolean>>;

const templates = [

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
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loginMessage, setLoginMessage] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>({});
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchAdminInvitations(token)
      .then((items) => {
        setInvitations(items);
        if (items[0]) {
          const invitation = normalizeInvitation(items[0]);
          setForm(invitation);
          setEditingSlug(invitation.slug);
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
      const response = await apiFetch('/api/auth/login', {
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

  function handleTimelineItemChange(index: number, field: 'time' | 'title' | 'detail', value: string) {
    setForm((current) => ({
      ...current,
      timelineItems: current.timelineItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    }));
  }

  function addTimelineItem() {
    setForm((current) => ({
      ...current,
      timelineItems: [
        ...current.timelineItems,
        {
          time: '',
          title: '',
          detail: ''
        }
      ]
    }));
  }

  function removeTimelineItem(index: number) {
    setForm((current) => {
      if (current.timelineItems.length <= 1) {
        return current;
      }

      return {
        ...current,
        timelineItems: current.timelineItems.filter((_item, itemIndex) => itemIndex !== index)
      };
    });
  }

  async function handleFileUpload(field: MediaFieldName, file: File) {
    setUploadMessage('');
    setUploadState((current) => ({ ...current, [field]: true }));

    try {
      const body = new FormData();
      body.append('file', file);

      const kind = field === 'musicUrl' ? 'audio' : 'image';
      const response = await apiFetch(`/api/admin/uploads?kind=${kind}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Upload failed.');
      }

      setForm((current) => ({
        ...current,
        [field]: payload.url
      }));
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploadState((current) => ({ ...current, [field]: false }));
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState('saving');
    setSaveMessage('');

    try {
      const savePath = editingSlug ? `/api/admin/invitations/${encodeURIComponent(editingSlug)}` : '/api/admin/invitations';
      const response = await apiFetch(savePath, {
        method: editingSlug ? 'PUT' : 'POST',
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
      setEditingSlug(saved.slug);
      setInvitations((current) => [
        saved,
        ...current.filter((item) => item.slug !== saved.slug && item.slug !== editingSlug)
      ]);
      setSaveState('success');
      setSaveMessage('Invitation saved. Your guest link is ready.');
    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Could not save invitation.');
    }
  }

  async function handleDeleteInvitation(slug: string) {
    const shouldDelete = window.confirm(`Delete /invite/${slug}? You can create a new invitation with this slug later.`);

    if (!shouldDelete) {
      return;
    }

    setSaveState('saving');
    setSaveMessage('');

    try {
      const response = await apiFetch(`/api/admin/invitations/${encodeURIComponent(slug)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || 'Could not delete invitation.');
      }

      setInvitations((current) => current.filter((invitation) => invitation.slug !== slug));
      setForm((current) => (current.slug === slug ? fallbackInvitation : current));
      setEditingSlug((current) => (current === slug ? null : current));
      setSaveState('success');
      setSaveMessage('Invitation deleted. The slug is available for a new invitation.');
    } catch (error) {
      setSaveState('error');
      setSaveMessage(error instanceof Error ? error.message : 'Could not delete invitation.');
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
          <button
            className={`template-option template-option--new ${editingSlug === null ? 'template-option--active' : ''}`}
            type="button"
            onClick={() => {
              setForm(fallbackInvitation);
              setEditingSlug(null);
            }}
          >
            <Plus size={18} />
            New invitation
          </button>
          {invitations.map((invitation) => (
            <div className="template-option-row" key={invitation.slug}>
              <button
                className={`template-option ${invitation.slug === editingSlug ? 'template-option--active' : ''}`}
                type="button"
                onClick={() => {
                  const selected = normalizeInvitation(invitation);
                  setForm(selected);
                  setEditingSlug(selected.slug);
                }}
              >
                <strong>{invitation.coupleNames}</strong>
                <span>/invite/{invitation.slug}</span>
              </button>
              <button
                className="template-option-delete"
                type="button"
                aria-label={`Delete ${invitation.coupleNames}`}
                onClick={() => void handleDeleteInvitation(invitation.slug)}
              >
                <Trash2 size={16} />
              </button>
            </div>
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
            <MediaField
              accept="image/*"
              field="heroImage"
              kind="image"
              label="Hero image"
              onFieldChange={handleFieldChange}
              onUpload={handleFileUpload}
              required
              uploading={Boolean(uploadState.heroImage)}
              value={form.heroImage}
            />
            <MediaField
              accept="image/*"
              field="rsvpImage"
              kind="image"
              label="RSVP image"
              onFieldChange={handleFieldChange}
              onUpload={handleFileUpload}
              uploading={Boolean(uploadState.rsvpImage)}
              value={form.rsvpImage}
            />
            <MediaField
              accept="audio/*"
              field="musicUrl"
              kind="audio"
              label="Background music"
              onFieldChange={handleFieldChange}
              onUpload={handleFileUpload}
              uploading={Boolean(uploadState.musicUrl)}
              value={form.musicUrl || ''}
            />
          </div>
          {uploadMessage && <p className="form-message form-message--error">{uploadMessage}</p>}

          <SectionLabel icon={<Image size={18} />} title="Story Copy" />
          <label>
            Main intro title
            <textarea name="introTitle" rows={2} value={form.introTitle} onChange={handleFieldChange} required />
          </label>
          <label>
            Intro paragraph
            <textarea name="introText" rows={4} value={form.introText} onChange={handleFieldChange} required />
          </label>

          <SectionLabel icon={<Sparkles size={18} />} title="Timeline" />
          <div className="timeline-builder">
            {form.timelineItems.map((item, index) => (
              <div className="timeline-builder__item" key={index}>
                <div className="form-grid">
                  <label>
                    Time
                    <input
                      value={item.time}
                      onChange={(event) => handleTimelineItemChange(index, 'time', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Title
                    <input
                      value={item.title}
                      onChange={(event) => handleTimelineItemChange(index, 'title', event.target.value)}
                      required
                    />
                  </label>
                  <label className="form-grid__wide">
                    Description
                    <textarea
                      rows={2}
                      value={item.detail}
                      onChange={(event) => handleTimelineItemChange(index, 'detail', event.target.value)}
                      required
                    />
                  </label>
                </div>
                <button
                  className="button button--ghost timeline-builder__remove"
                  type="button"
                  disabled={form.timelineItems.length <= 1}
                  onClick={() => removeTimelineItem(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="button button--ghost" type="button" onClick={addTimelineItem}>
              Add timeline item
            </button>
          </div>

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
            <div className="preview-hero" style={{ backgroundImage: `url(${mediaUrl(form.heroImage)})` }}>
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

function MediaField({
  accept,
  field,
  kind,
  label,
  onFieldChange,
  onUpload,
  required = false,
  uploading,
  value
}: {
  accept: string;
  field: MediaFieldName;
  kind: 'audio' | 'image';
  label: string;
  onFieldChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onUpload: (field: MediaFieldName, file: File) => Promise<void>;
  required?: boolean;
  uploading: boolean;
  value: string;
}) {
  return (
    <label className="form-grid__wide media-field">
      {label}
      <div className="media-field__controls">
        <input
          accept={accept}
          className="media-field__file"
          disabled={uploading}
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void onUpload(field, file);
            }
            event.target.value = '';
          }}
        />
        <input
          name={field}
          placeholder={kind === 'audio' ? 'Upload a file or paste an mp3 URL' : 'Upload a file or paste an image URL'}
          required={required}
          value={value}
          onChange={onFieldChange}
        />
      </div>
      {uploading && <small className="media-field__status">Uploading...</small>}
      {kind === 'image' && value && (
        <div className="media-field__preview" style={{ backgroundImage: `url(${mediaUrl(value)})` }} />
      )}
      {kind === 'audio' && value && <small className="media-field__status">{value}</small>}
    </label>
  );
}

async function fetchAdminInvitations(token: string) {
  const response = await apiFetch('/api/admin/invitations', {
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
    rsvpImage: invitation.rsvpImage || invitation.heroImage || fallbackInvitation.rsvpImage,
    timelineItems: invitation.timelineItems || []
  };
}
