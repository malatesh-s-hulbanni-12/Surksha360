// backend/models/BenefitApplication.js
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String
  },
  state: {
    type: String
  },
  pincode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'India'
  }
}, { _id: false });

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  documentType: {
    type: String,
    enum: ['aadhar', 'hospitalLetter', 'paymentSlip', 'registrationCopy', 'other'],
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const benefitApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true
  },
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
  memberAadhar: {
    type: String
  },
  memberPhone: {
    type: String
  },
  benefitType: {
    type: String,
    required: true,
    enum: [
      'Medical Emergency',
      'Education Support',
      'Housing Assistance',
      'Disability Support',
      'Senior Citizen Benefit',
      'Maternity Benefit',
      'Other'
    ]
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  place: {
    type: String,
    required: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  documents: [documentSchema],
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: String
  },
  reviewDate: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate application ID before saving - FIXED VERSION
benefitApplicationSchema.pre('save', async function(next) {
  try {
    if (!this.applicationId) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('BenefitApplication').countDocuments();
      const sequence = (count + 1).toString().padStart(3, '0');
      this.applicationId = `BEN-${year}-${sequence}`;
      console.log('Generated applicationId:', this.applicationId);
    }
    next();
  } catch (error) {
    console.error('Error in pre-save hook:', error);
    next(error);
  }
});

const BenefitApplication = mongoose.model('BenefitApplication', benefitApplicationSchema);
export default BenefitApplication;