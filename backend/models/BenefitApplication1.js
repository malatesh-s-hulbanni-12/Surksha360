// backend/models/BenefitApplication1.js
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

const benefitApplicationSchema1 = new mongoose.Schema({
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
  approvedAmount: {
    type: Number,
    default: 0
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
  },
  statusHistory: [{
    status: String,
    changedBy: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Generate application ID before saving
benefitApplicationSchema1.pre('save', async function(next) {
  try {
    if (!this.applicationId) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('BenefitApplication1').countDocuments();
      const sequence = (count + 1).toString().padStart(3, '0');
      this.applicationId = `BEN-${year}-${sequence}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Add to status history when status changes
benefitApplicationSchema1.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedBy: this.reviewedBy || 'System',
      notes: this.reviewNotes || `Status changed to ${this.status}`
    });
  }
  next();
});

const BenefitApplication1 = mongoose.model('BenefitApplication1', benefitApplicationSchema1);
export default BenefitApplication1;