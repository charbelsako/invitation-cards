import bcrypt from 'bcryptjs';
import { User } from '../models/user';

export async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Admin login will not be seeded.');
    return;
  }

  const email = adminEmail.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await User.create({
    email,
    passwordHash,
    role: 'admin'
  });

  console.log(`Seeded admin user ${adminEmail}.`);
}
