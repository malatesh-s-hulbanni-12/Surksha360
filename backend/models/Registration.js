import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  aadhar: {
    type: String,
    required: true
  },
  payingAmount: {
    type: Number,
    required: true
  }
});

const registrationSchema = new mongoose.Schema({
  registrationId: {
    type: String,
    required: true,
    unique: true
  },
  registrationType: {
    type: String,
    enum: ['family', 'individual'],
    required: true
  },
  numberOfMembers: {
    type: Number,
    required: true
  },
  members: [memberSchema],
  registrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;