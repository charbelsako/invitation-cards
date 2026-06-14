import { z } from 'zod';
import { templateOptions } from '../constants/templates';

const colorValue = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a valid hex color.');

function isStoredMediaUrl(value: string) {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/uploads/')
  );
}

const requiredMediaUrl = z
  .string()
  .trim()
  .min(1, 'This file or URL is required.')
  .refine(isStoredMediaUrl, 'Use a valid URL or upload a file from the admin studio.');

const optionalMediaUrl = z.union([
  z.literal(''),
  z.string().trim().refine(isStoredMediaUrl, 'Use a valid URL or upload a file from the admin studio.')
]);

export const defaultTimelineItems = [
  {
    time: '6:30 PM',
    title: 'Golden hour drinks begin',
    detail: 'Arrive on time, the first surprise of the evening awaits at sunset!'
  },
  {
    time: '8:00 PM',
    title: 'The evening unfolds',
    detail: 'Expect surprises all night long!'
  }
];

const timelineItemInput = z.object({
  time: z.string().trim().min(1),
  title: z.string().trim().min(2),
  detail: z.string().trim().min(2)
});

export const invitationInput = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.'),
  template: z.enum(templateOptions).default('horizontal'),
  coupleNames: z.string().trim().min(2),
  dateLabel: z.string().trim().min(2),
  ceremonyTime: z.string().trim().min(1).default('6:15 PM'),
  venueName: z.string().trim().min(2),
  location: z.string().trim().min(2),
  heroImage: requiredMediaUrl,
  rsvpImage: optionalMediaUrl.default(''),
  accentColor: colorValue.default('#b9825b'),
  secondaryColor: colorValue.default('#7c4e34'),
  introTitle: z.string().trim().min(6),
  introText: z.string().trim().min(12),
  musicUrl: optionalMediaUrl.default(''),
  notifyEmail: z.union([z.literal(''), z.string().trim().email()]).default(''),
  maxGuestsPerInvite: z.coerce.number().int().min(1).max(10).default(2),
  timelineItems: z.array(timelineItemInput).max(6).default([])
});

export type InvitationInput = z.infer<typeof invitationInput>;
