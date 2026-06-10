import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin';
import { requireDatabase } from '../middleware/requireDatabase';
import { Invitation } from '../models/invitation';
import { Rsvp } from '../models/rsvp';
import { invitationInput } from '../schemas/invitation';

export const adminRouter = Router();

adminRouter.use(requireDatabase, requireAdmin);

adminRouter.get('/admin/me', (request, response) => {
  response.json({ user: request.admin });
});

adminRouter.get('/admin/invitations', async (_request, response, next) => {
  try {
    const invitations = await Invitation.find().sort({ updatedAt: -1 }).lean();
    response.json(invitations);
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/admin/invitations', async (request, response, next) => {
  try {
    const parsed = invitationInput.parse(request.body);
    const invitation = await Invitation.findOneAndUpdate(
      { slug: parsed.slug },
      { $set: parsed },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    response.status(201).json(invitation);
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/admin/invitations/:slug', async (request, response, next) => {
  try {
    const slug = String(request.params.slug);
    const parsed = invitationInput.parse({ ...request.body, slug });
    const invitation = await Invitation.findOneAndUpdate(
      { slug },
      { $set: parsed },
      { new: true, runValidators: true }
    ).lean();

    if (!invitation) {
      response.status(404).json({ message: 'Invitation not found.' });
      return;
    }

    response.json(invitation);
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/admin/invitations/:slug/rsvps', async (request, response, next) => {
  try {
    const slug = String(request.params.slug);
    const rsvps = await Rsvp.find({ invitationSlug: slug }).sort({ createdAt: -1 }).lean();
    response.json(rsvps);
  } catch (error) {
    next(error);
  }
});
