// backend/routes/benefitRoutes1.js
import express from 'express';
import {
  applyForBenefit,
  upload,
  getAllApplications,
  getApplicationById,
  trackApplication,
  getApplicationsByFamily,
  updateApplicationStatus,
  downloadAcknowledgment
} from '../controllers/benefitController1.js';

const router = express.Router();

// Public routes
router.post('/apply', upload, applyForBenefit);
router.get('/track/:applicationId', trackApplication);
router.get('/download/:applicationId', downloadAcknowledgment);

// Admin routes
router.get('/all', getAllApplications);
router.get('/family/:familyId', getApplicationsByFamily);
router.get('/:id', getApplicationById);
router.patch('/:id/status', updateApplicationStatus);

export default router;