import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    service: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD in the clinic time zone
    time: { type: String, required: true }, // HH:MM
    name: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['new', 'confirmed', 'cancelled'], default: 'new' },
    // Set only while the appointment is active. The unique sparse index makes
    // double-booking impossible even if two requests arrive at the same moment.
    // It is removed on cancel, which frees the slot.
    slotKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
