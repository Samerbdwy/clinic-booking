import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config, assertConfig } from './config.js';
import Doctor from './models/Doctor.js';
import Admin from './models/Admin.js';
import Appointment from './models/Appointment.js';

assertConfig();

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
if (!email || password.length < 12) {
  console.error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env first.');
  process.exit(1);
}

await mongoose.connect(config.mongoUri);

// Make sure the unique indexes exist before any bookings are made.
await Appointment.init();

if ((await Doctor.countDocuments()) === 0) {
  await Doctor.insertMany([
    { nameEn: 'Dr. Sample One', nameAr: 'د. سامبل الأول', specialtyEn: 'Orthodontics', specialtyAr: 'تقويم الأسنان' },
    { nameEn: 'Dr. Sample Two', nameAr: 'د. سامبل الثاني', specialtyEn: 'General dentistry', specialtyAr: 'طب الأسنان العام' },
    { nameEn: 'Dr. Sample Three', nameAr: 'د. سامبل الثالث', specialtyEn: 'Cosmetic dentistry', specialtyAr: 'تجميل الأسنان' },
  ]);
  console.log('Added 3 sample doctors.');
}

const passwordHash = await bcrypt.hash(password, 12);
await Admin.findOneAndUpdate({ email }, { email, passwordHash }, { upsert: true });
console.log(`Admin ready: ${email}`);

await mongoose.disconnect();
