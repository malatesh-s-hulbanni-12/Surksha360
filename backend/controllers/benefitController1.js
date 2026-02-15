// backend/controllers/benefitController1.js
import BenefitApplication1 from '../models/BenefitApplication1.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/benefits');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const documentType = file.fieldname;
    cb(null, `${documentType}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
}).fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'hospitalLetter', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
  { name: 'registrationCopy', maxCount: 1 },
  { name: 'otherDocuments', maxCount: 5 }
]);

// Apply for benefit
export const applyForBenefit = async (req, res) => {
  try {
    const files = req.files || {};
    const {
      familyId,
      memberId,
      memberName,
      memberAadhar,
      memberPhone,
      benefitType,
      reason,
      description,
      totalAmount,
      place
    } = req.body;

    // Parse address
    let parsedAddress;
    try {
      if (req.body.address && typeof req.body.address === 'string') {
        parsedAddress = JSON.parse(req.body.address);
      } else if (req.body['address[street]']) {
        parsedAddress = {
          street: req.body['address[street]'] || '',
          city: req.body['address[city]'] || '',
          district: req.body['address[district]'] || '',
          state: req.body['address[state]'] || '',
          pincode: req.body['address[pincode]'] || '',
          country: req.body['address[country]'] || 'India'
        };
      } else if (req.body.address && typeof req.body.address === 'object') {
        parsedAddress = req.body.address;
      } else {
        throw new Error('Address not found in request');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address format'
      });
    }

    // Prepare documents array
    const documents = [];

    // Add documents
    if (files.aadharCard) {
      documents.push({
        filename: files.aadharCard[0].filename,
        originalName: files.aadharCard[0].originalname,
        path: files.aadharCard[0].path,
        mimetype: files.aadharCard[0].mimetype,
        size: files.aadharCard[0].size,
        documentType: 'aadhar'
      });
    }

    if (files.hospitalLetter) {
      documents.push({
        filename: files.hospitalLetter[0].filename,
        originalName: files.hospitalLetter[0].originalname,
        path: files.hospitalLetter[0].path,
        mimetype: files.hospitalLetter[0].mimetype,
        size: files.hospitalLetter[0].size,
        documentType: 'hospitalLetter'
      });
    }

    if (files.paymentSlip) {
      documents.push({
        filename: files.paymentSlip[0].filename,
        originalName: files.paymentSlip[0].originalname,
        path: files.paymentSlip[0].path,
        mimetype: files.paymentSlip[0].mimetype,
        size: files.paymentSlip[0].size,
        documentType: 'paymentSlip'
      });
    }

    if (files.registrationCopy) {
      documents.push({
        filename: files.registrationCopy[0].filename,
        originalName: files.registrationCopy[0].originalname,
        path: files.registrationCopy[0].path,
        mimetype: files.registrationCopy[0].mimetype,
        size: files.registrationCopy[0].size,
        documentType: 'registrationCopy'
      });
    }

    if (files.otherDocuments) {
      files.otherDocuments.forEach(file => {
        documents.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          documentType: 'other'
        });
      });
    }

    // Calculate approved amount (50% of total)
    const approvedAmount = Math.round(parseFloat(totalAmount) * 0.5);

    const application = new BenefitApplication1({
      familyId,
      memberId,
      memberName,
      memberAadhar: memberAadhar || '',
      memberPhone: memberPhone || '',
      benefitType,
      reason,
      description: description || '',
      totalAmount: parseFloat(totalAmount),
      approvedAmount,
      place,
      address: parsedAddress,
      documents,
      status: 'Pending',
      reviewedBy: 'System',
      reviewNotes: 'Application submitted'
    });

    const savedApplication = await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: savedApplication.applicationId,
      data: savedApplication
    });

  } catch (error) {
    console.error('Error in applyForBenefit:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all applications (admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await BenefitApplication1.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error in getAllApplications:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await BenefitApplication1.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Track application by application ID
export const trackApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await BenefitApplication1.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error in trackApplication:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get applications by family ID
export const getApplicationsByFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    const applications = await BenefitApplication1.find({ familyId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error in getApplicationsByFamily:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, reviewedBy } = req.body;

    const application = await BenefitApplication1.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Calculate approved amount if status is Approved
    let approvedAmount = application.approvedAmount;
    if (status === 'Approved') {
      approvedAmount = Math.round(application.totalAmount * 0.5);
    }

    application.status = status;
    application.approvedAmount = approvedAmount;
    application.reviewNotes = reviewNotes || application.reviewNotes;
    application.reviewedBy = reviewedBy || 'Admin';
    application.reviewDate = new Date();

    const updatedApplication = await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: updatedApplication
    });

  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Download acknowledgment
export const downloadAcknowledgment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await BenefitApplication1.findOne({ applicationId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const acknowledgment = {
      applicationId: application.applicationId,
      applicantName: application.memberName,
      familyId: application.familyId,
      benefitType: application.benefitType,
      place: application.place,
      address: application.address,
      applicationDate: application.createdAt,
      status: application.status,
      totalAmount: application.totalAmount,
      approvedAmount: application.approvedAmount
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=acknowledgment-${applicationId}.json`);
    
    res.status(200).json(acknowledgment);

  } catch (error) {
    console.error('Error in downloadAcknowledgment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};