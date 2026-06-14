import mongoose, { Schema } from 'mongoose';

const rsvpSchema = new Schema(
  {
    invitationSlug: { type: String, required: true, index: true },
    guestName: { type: String, required: true },
    email: { type: String, required: true },
    attendanceStatus: { type: String, enum: ['attending', 'not-attending'], default: 'attending' },
    attendingCount: { type: Number, required: true, min: 0, max: 10 },
    note: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Rsvp = mongoose.models.Rsvp || mongoose.model('Rsvp', rsvpSchema);
