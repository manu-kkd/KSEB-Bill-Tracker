import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
  billingDate: {
    type: Date,
    required: [true, 'Please provide a billing date'],
  },
  unitsConsumed: {
    type: Number,
    required: [true, 'Please provide the units consumed'],
  },
  amountPaid: {
    type: Number,
    required: [true, 'Please provide the amount paid'],
  },
  notes: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
