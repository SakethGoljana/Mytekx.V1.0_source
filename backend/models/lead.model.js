import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  businessRequirement: { type: String },
  timeline: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Lead', leadSchema);
