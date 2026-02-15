// backend/controllers/benefitController.js
import BenefitApplication from '../models/BenefitApplication.js';
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
// backend/controllers/benefitController.js - Update the applyForBenefit function
export const applyForBenefit = async (req, res) => {
  try {
    const files = req.files || {};
    console.log('Received files:', Object.keys(files));
    console.log('Received body:', req.body);

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

    // Parse address - FIXED PARSING
    let parsedAddress;
    try {
      // If address is sent as a stringified JSON
      if (req.body.address && typeof req.body.address === 'string') {
        parsedAddress = JSON.parse(req.body.address);
      } 
      // If address is sent as individual fields
      else if (req.body['address[street]']) {
        parsedAddress = {
          street: req.body['address[street]'] || '',
          city: req.body['address[city]'] || '',
          district: req.body['address[district]'] || '',
          state: req.body['address[state]'] || '',
          pincode: req.body['address[pincode]'] || '',
          country: req.body['address[country]'] || 'India'
        };
      }
      // If address is already an object
      else if (req.body.address && typeof req.body.address === 'object') {
        parsedAddress = req.body.address;
      }
      else {
        throw new Error('Address not found in request');
      }
    } catch (error) {
      console.error('Error parsing address:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid address format'
      });
    }

    console.log('Parsed address:', parsedAddress);

    // Prepare documents array
    const documents = [];

    // Add Aadhar Card
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

    // Add Hospital Letter
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

    // Add Payment Slip
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

    // Add Registration Copy
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

    // Add Other Documents
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

    // Create application WITHOUT applicationId (it will be generated by pre-save hook)
    const application = new BenefitApplication({
      familyId,
      memberId,
      memberName,
      memberAadhar: memberAadhar || '',
      memberPhone: memberPhone || '',
      benefitType,
      reason,
      description: description || '',
      totalAmount: parseFloat(totalAmount),
      place,
      address: parsedAddress,
      documents,
      status: 'Pending'
    });

    console.log('Application object before save:', application);

    const savedApplication = await application.save();
    console.log('Saved application:', savedApplication);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: savedApplication.applicationId,
      data: savedApplication
    });

  } catch (error) {
    console.error('Error in applyForBenefit:', error);
    
    // Send more detailed error message
    res.status(500).json({
      success: false,
      message: error.message,
      details: error.errors || null
    });
  }
};

// Track application by ID
export const trackApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await BenefitApplication.findOne({ applicationId });

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

// Download acknowledgment
export const downloadAcknowledgment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await BenefitApplication.findOne({ applicationId });

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
      totalAmount: application.totalAmount
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

// Get all applications (admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await BenefitApplication.find().sort({ createdAt: -1 });
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

// Get applications by family ID
export const getApplicationsByFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    const applications = await BenefitApplication.find({ familyId }).sort({ createdAt: -1 });
    
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

// Update application status (admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, reviewedBy } = req.body;

    const application = await BenefitApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
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