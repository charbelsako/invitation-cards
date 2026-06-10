import nodemailer from 'nodemailer';
import { RsvpInput } from '../schemas/rsvp';

export async function sendRsvpNotification(
  input: RsvpInput,
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
