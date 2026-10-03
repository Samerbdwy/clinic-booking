import { z } from 'zod';
import { config } from './config.js';

// Half-hour slots, 10:00 to 16:30
export const SLOTS = [];
for (let h = 10; h < 17; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`, `${String(h).padStart(2, '0')}:30`);
}

export const SERVICES = ['checkup', 'cleaning', 'whitening', 'braces', 'implants', 'emergency'];
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date');

// .strict() rejects unexpected fields. Every field is a validated primitive,
// so objects like { "$gt": "" } can never reach a database query (NoSQL injection).
export const bookingSchema = z
  .object({
    doctorId: objectId,
    service: z.enum(SERVICES),
    date: dateStr,
    time: z.enum(SLOTS),
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{8,15}$/, 'Invalid phone number'),
    notes: z.string().trim().max(300).optional().default(''),
  })
  .strict();

export const slotsQuerySchema = z.object({ doctorId: objectId, date: dateStr }).strict();

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(120),
    password: z.string().min(1).max(200),
  })
  .strict();

export const statusSchema = z.object({ status: z.enum(['confirmed', 'cancelled']) }).strict();

export const adminListQuerySchema = z
  .object({
    status: z.enum(['new', 'confirmed', 'cancelled']).optional(),
    date: dateStr.optional(),
  })
  .strict();

export const idParamSchema = z.object({ id: objectId });

// ---- date helpers (clinic time zone) ----
export function clinicNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.clinicTz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${hour}:${get('minute')}` };
}

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns an error message, or null if the date can be booked.
export function checkBookableDate(dateString) {
  const d = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateString) {
    return 'Invalid date';
  }
  const { date: today } = clinicNow();
  if (dateString < today) return 'Date is in the past';
  if (dateString > addDays(today, 60)) return 'Date is too far ahead';
  if (d.getUTCDay() === 5) return 'The clinic is closed on Fridays';
  return null;
}

export function isSlotInPast(dateString, time) {
  const now = clinicNow();
  return dateString === now.date && time <= now.time;
}
