// backend/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  memberName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 10
  },
  months: [{
    type: String,
    required: true
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'scanner'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;