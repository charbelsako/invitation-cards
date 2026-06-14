import { defaultTimelineItems, InvitationInput } from '../schemas/invitation';

const baseDemo = {
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
  maxGuestsPerInvite: 2,
  timelineItems: defaultTimelineItems
} satisfies Omit<InvitationInput, 'slug' | 'template'>;

export const demoInvitations = [
  {
    ...baseDemo,
    slug: 'demo-horizontal',
    template: 'horizontal'
  },
  {
    ...baseDemo,
    slug: 'demo-vertical',
    template: 'vertical'
  },
  {
    ...baseDemo,
    slug: 'demo-envelope',
    template: 'envelope'
  }
] satisfies InvitationInput[];

export const demoInvitation = demoInvitations[0];
