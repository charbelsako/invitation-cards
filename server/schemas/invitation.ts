import { z } from 'zod';
import { templateOptions } from '../constants/templates';

const optionalUrl = z.string().trim().optional().default('');
const colorValue = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a valid hex color.');

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
  heroImage: z.string().trim().url('Hero image must be a valid URL.'),
  rsvpImage: optionalUrl,
  accentColor: colorValue.default('#b9825b'),
  secondaryColor: colorValue.default('#7c4e34'),
  introTitle: z.string().trim().min(6),
  introText: z.string().trim().min(12),
  musicUrl: optionalUrl,
  notifyEmail: z.union([z.literal(''), z.string().trim().email()]).default(''),
  maxGuestsPerInvite: z.coerce.number().int().min(1).max(10).default(2)
});

export type InvitationInput = z.infer<typeof invitationInput>;
