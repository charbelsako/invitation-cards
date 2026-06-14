import { z } from 'zod';

export const rsvpInput = z.object({
  guestName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  attendanceStatus: z.enum(['attending', 'not-attending']).default('attending'),
  attendingCount: z.number().int().min(0),
  note: z.string().trim().max(600).optional().default('')
}).refine(
  (input) => input.attendanceStatus === 'not-attending' || input.attendingCount >= 1,
  {
    message: 'Please choose how many guests are attending.',
    path: ['attendingCount']
  }
);

export type RsvpInput = z.infer<typeof rsvpInput>;
