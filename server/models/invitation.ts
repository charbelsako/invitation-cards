import mongoose, { Schema } from 'mongoose';
import { templateOptions } from '../constants/templates';

const invitationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    template: { type: String, enum: templateOptions, default: 'classic' },
    coupleNames: { type: String, required: true },
    dateLabel: { type: String, required: true },
    ceremonyTime: { type: String, default: '6:15 PM' },
    venueName: { type: String, required: true },
    location: { type: String, required: true },
    heroImage: { type: String, required: true },
    rsvpImage: { type: String, default: '' },
    accentColor: { type: String, default: '#b9825b' },
    secondaryColor: { type: String, default: '#7c4e34' },
    introTitle: { type: String, required: true },
    introText: { type: String, required: true },
    musicUrl: { type: String, default: '' },
    notifyEmail: { type: String, default: '' },
    maxGuestsPerInvite: { type: Number, default: 2, min: 1, max: 10 }
  },
  { timestamps: true }
);

export const Invitation =
  mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
