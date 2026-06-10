import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import nodemailer from 'nodemailer';
import { z } from 'zod';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me';

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const templateOptions = ['classic', 'editorial', 'garden'] as const;

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

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' }
  },
  { timestamps: true }
);

const Invitation = mongoose.model('Invitation', invitationSchema);
const Rsvp = mongoose.model('Rsvp', rsvpSchema);
const User = mongoose.model('User', userSchema);

const optionalUrl = z.string().trim().optional().default('');
const colorValue = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, 'Use a valid hex color.');

const invitationInput = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes.'),
  template: z.enum(templateOptions).default('classic'),
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

const rsvpInput = z.object({
  guestName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  attendingCount: z.number().int().min(1),
  note: z.string().trim().max(600).optional().default('')
});

const loginInput = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

const demoInvitation = {
  slug: 'demo-wedding',
  template: 'classic',
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
  maxGuestsPerInvite: 2
} satisfies z.infer<typeof invitationInput>;

type AuthenticatedRequest = Request & {
  admin?: {
    userId: string;
    email: string;
  };
};

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Admin login will not be seeded.');
    return;
  }

  const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });

  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.create({
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: 'admin'
  });
  console.log(`Seeded admin user ${adminEmail}.`);
}

async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. GET routes will use demo data and admin/RSVP writes will be disabled.');
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Invitation.updateOne(
    { slug: demoInvitation.slug },
    { $setOnInsert: demoInvitation },
    { upsert: true }
  );
  await seedAdminUser();
  console.log('Connected to MongoDB.');
}

function requireDatabase(_request: Request, response: Response, next: NextFunction) {
  if (mongoose.connection.readyState !== 1) {
    response.status(503).json({ message: 'MongoDB is not connected. Add MONGODB_URI to enable this feature.' });
    return;
  }

  next();
}

function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    response.status(401).json({ message: 'Admin login required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { userId: string; email: string };
    request.admin = payload;
    next();
  } catch {
    response.status(401).json({ message: 'Your admin session expired. Please log in again.' });
  }
}

async function sendRsvpNotification(
  input: z.infer<typeof rsvpInput>,
  invitationSlug: string,
  notificationEmail?: string
) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RSVP_NOTIFY_TO } = process.env;
  const recipient = notificationEmail || RSVP_NOTIFY_TO;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !recipient) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: recipient,
    subject: `New RSVP for ${invitationSlug}`,
    text: [
      `Guest: ${input.guestName}`,
      `Email: ${input.email}`,
      `Attending: ${input.attendingCount}`,
      `Note: ${input.note || 'None'}`
    ].join('\n')
  });
}

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected'
  });
});

app.post('/api/auth/login', requireDatabase, async (request, response, next) => {
  try {
    const parsed = loginInput.parse(request.body);
    const user = await User.findOne({ email: parsed.email.toLowerCase() });
    const isValid = user ? await bcrypt.compare(parsed.password, user.passwordHash) : false;

    if (!user || !isValid) {
      response.status(401).json({ message: 'Invalid admin credentials.' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
    response.json({ token, user: { email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/me', requireDatabase, requireAdmin, (request: AuthenticatedRequest, response) => {
  response.json({ user: request.admin });
});

app.get('/api/admin/invitations', requireDatabase, requireAdmin, async (_request, response, next) => {
  try {
    const invitations = await Invitation.find().sort({ updatedAt: -1 }).lean();
    response.json(invitations);
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/invitations', requireDatabase, requireAdmin, async (request, response, next) => {
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

app.put('/api/admin/invitations/:slug', requireDatabase, requireAdmin, async (request, response, next) => {
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

app.get('/api/admin/invitations/:slug/rsvps', requireDatabase, requireAdmin, async (request, response, next) => {
  try {
    const slug = String(request.params.slug);
    const rsvps = await Rsvp.find({ invitationSlug: slug }).sort({ createdAt: -1 }).lean();
    response.json(rsvps);
  } catch (error) {
    next(error);
  }
});

app.get('/api/invitations/:slug', async (request, response, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
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

app.post('/api/invitations/:slug/rsvps', requireDatabase, async (request, response, next) => {
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

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) {
    response.status(400).json({ message: error.issues[0]?.message || 'Invalid request details.' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Unexpected server error.' });
});

connectToDatabase()
  .catch((error) => {
    console.error('Failed to connect to MongoDB.', error);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`Invitation API running on http://localhost:${port}`);
    });
  });
