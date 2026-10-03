import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { validate } from '../middleware/validate.js';
import {
  SLOTS,
  bookingSchema,
  slotsQuerySchema,
  checkBookableDate,
  isSlotInPast,
} from '../validation.js';

const router = Router();

// Booking is the only public write endpoint, so it gets its own tight limit.
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking attempts. Please try again later.' },
});

router.get('/doctors', async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ active: true })
      .select('nameEn nameAr specialtyEn specialtyAr')
      .lean();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

router.get('/slots', validate(slotsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { doctorId, date } = req.valid.query;
    const dateError = checkBookableDate(date);
    if (dateError) return res.json({ slots: [], reason: dateError });

    const taken = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $in: ['new', 'confirmed'] },
    })
      .select('time')
      .lean();
    const takenTimes = new Set(taken.map((a) => a.time));
    const slots = SLOTS.filter((t) => !takenTimes.has(t) && !isSlotInPast(date, t));
    res.json({ slots });
  } catch (err) {
    next(err);
  }
});

router.post('/appointments', bookingLimiter, validate(bookingSchema), async (req, res, next) => {
  try {
    const data = req.valid.body;

    const dateError = checkBookableDate(data.date);
    if (dateError) return res.status(400).json({ error: dateError });
    if (isSlotInPast(data.date, data.time)) {
      return res.status(400).json({ error: 'That time has already passed' });
    }

    const doctor = await Doctor.findOne({ _id: data.doctorId, active: true }).lean();
    if (!doctor) return res.status(400).json({ error: 'Doctor not found' });

    const appointment = await Appointment.create({
      doctor: doctor._id,
      service: data.service,
      date: data.date,
      time: data.time,
      name: data.name,
      phone: data.phone,
      notes: data.notes,
      slotKey: `${doctor._id}_${data.date}_${data.time}`,
    });

    res.status(201).json({
      id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      doctor: { nameEn: doctor.nameEn, nameAr: doctor.nameAr },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'That slot was just taken. Please pick another time.' });
    }
    next(err);
  }
});

export default router;
