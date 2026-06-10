import mongoose from 'mongoose';
import { demoInvitations } from '../data/demoInvitation';
import { Invitation } from '../models/invitation';
import { seedAdminUser } from './seedAdminUser';

export async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      'MONGODB_URI is not set. GET routes will use demo data and admin/RSVP writes will be disabled.',
    );
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  // await Promise.all(
  //   demoInvitations.map((demo) =>
  //     Invitation.updateOne({ slug: demo.slug }, { $setOnInsert: demo }, { upsert: true })
  //   )
  // );
  // await seedAdminUser();

  console.log('Connected to MongoDB.');
}

export function getDatabaseStatus() {
  return mongoose.connection.readyState === 1 ? 'connected' : 'not connected';
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}
