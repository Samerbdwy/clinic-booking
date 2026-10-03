import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';
import Appointment from '../models/Appointment.js';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, statusSchema, adminListQuerySchema, idParamSchema } from '../validation.js';

const router = Router();

// Only failed attempts count, so a legitimate admin is never locked out by their own logins.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

// Used so a login for an unknown email takes about as long as one for a real email.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.valid.body;
    const admin = await Admin.findOne({ email });
    const ok = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_HASH);
    if (!admin || !ok) return res.status(401).json({ error: 'Wrong email or password' });

    const token = jwt.sign({ sub: String(admin._id) }, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '8h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

router.use(requireAdmin);

router.get('/appointments', validate(adminListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.valid.query.status) filter.status = req.valid.query.status;
    if (req.valid.query.date) filter.date = req.valid.query.date;

    const items = await Appointment.find(filter)
      .populate('doctor', 'nameEn nameAr')
      .sort({ date: 1, time: 1 })
      .limit(200)
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.patch(
  '/appointments/:id',
  validate(idParamSchema, 'params'),
  validate(statusSchema),
  async (req, res, next) => {
    try {
      const { status } = req.valid.body;
      // Cancelling removes slotKey, which frees the slot for someone else.
      const update = status === 'cancelled' ? { status, $unset: { slotKey: '' } } : { status };
      const updated = await Appointment.findByIdAndUpdate(req.valid.params.id, update, {
        new: true,
      })
        .populate('doctor', 'nameEn nameAr')
        .lean();
      if (!updated) return res.status(404).json({ error: 'Not found' });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
