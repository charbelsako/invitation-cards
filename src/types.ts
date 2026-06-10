export type Invitation = {
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
