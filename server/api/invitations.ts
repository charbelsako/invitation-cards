import { Router } from 'express';
import { demoInvitation } from '../data/demoInvitation';
import { requireDatabase } from '../middleware/requireDatabase';
import { Invitation } from '../models/invitation';
import { Rsvp } from '../models/rsvp';
import { rsvpInput } from '../schemas/rsvp';
import { isDatabaseConnected } from '../utils/database';
import { sendRsvpNotification } from '../utils/mailer';

export const invitationsRouter = Router();

invitationsRouter.get('/invitations/:slug', async (request, response, next) => {
  try {
    if (!isDatabaseConnected()) {
      response.json(demoInvitation);
      return;
    }

    const slug = String(request.params.slug);
    const invitation = await Invitation.findOne({ slug }).lean();

    response.json(invitation || demoInvitation);
  } catch (error) {
    next(error);
  }
});

invitationsRouter.post('/invitations/:slug/rsvps', requireDatabase, async (request, response, next) => {
  try {
    const slug = String(request.params.slug);
    const invitation = await Invitation.findOne({ slug }).lean();
    const maxGuests = invitation?.maxGuestsPerInvite || demoInvitation.maxGuestsPerInvite;
    const parsed = rsvpInput.parse(request.body);

    if (parsed.attendingCount > maxGuests) {
      response.status(400).json({ message: `This invitation allows up to ${maxGuests} guest(s).` });
      return;
    }

    const rsvp = await Rsvp.create({
      invitationSlug: slug,
      ...parsed
    });

    await sendRsvpNotification(parsed, slug, invitation?.notifyEmail);

    response.status(201).json({ id: rsvp.id, message: 'RSVP saved.' });
  } catch (error) {
    next(error);
  }
});
