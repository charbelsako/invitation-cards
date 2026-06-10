import mongoose, { Schema } from 'mongoose';

const rsvpSchema = new Schema(
  {
    invitationSlug: { type: String, required: true, index: true },
    guestName: { type: String, required: true },
    email: { type: String, required: true },
    attendingCount: { type: Number, required: true, min: 1, max: 10 },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', rsvpSchema);
