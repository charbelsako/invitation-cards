import { z } from 'zod';

export const rsvpInput = z.object({
  guestName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  attendingCount: z.number().int().min(1),
  note: z.string().trim().max(600).optional().default('')
});

export type RsvpInput = z.infer<typeof rsvpInput>;
