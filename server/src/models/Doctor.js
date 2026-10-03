import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  nameEn: { type: String, required: true },
  nameAr: { type: String, required: true },
  specialtyEn: { type: String, required: true },
  specialtyAr: { type: String, required: true },
  active: { type: Boolean, default: true },
});

export default mongoose.model('Doctor', doctorSchema);
