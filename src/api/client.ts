const apiBaseUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export function mediaUrl(path: string): string {
  if (!path) {
    return path;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return apiUrl(path);
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}

type MediaFields = {
  heroImage: string;
  rsvpImage: string;
  musicUrl?: string;
};

export function resolveInvitationMedia<T extends MediaFields>(invitation: T): T {
  return {
    ...invitation,
    heroImage: mediaUrl(invitation.heroImage),
    rsvpImage: invitation.rsvpImage ? mediaUrl(invitation.rsvpImage) : '',
    musicUrl: invitation.musicUrl ? mediaUrl(invitation.musicUrl) : ''
  };
}
