// backend/routes/benefitRoutes.js
import express from 'express';
import {
  applyForBenefit,
  upload,
  trackApplication,
  getAllApplications,
  getApplicationsByFamily,
  updateApplicationStatus,
  downloadAcknowledgment
} from '../controllers/benefitController.js';

const router = express.Router();

// Public routes
router.post('/apply', upload, applyForBenefit);
router.get('/track/:applicationId', trackApplication);
router.get('/download/:applicationId', downloadAcknowledgment);

// Admin routes (add auth middleware as needed)
router.get('/all', getAllApplications);
router.get('/family/:familyId', getApplicationsByFamily);
router.patch('/:id/status', updateApplicationStatus);

export default router;