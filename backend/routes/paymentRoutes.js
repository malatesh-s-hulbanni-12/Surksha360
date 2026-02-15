// backend/routes/paymentRoutes.js
import express from 'express';
import {
  getAllPayments,
  getPaymentsByFamilyId,
  createPayment,
  updatePaymentStatus,
  deletePayment
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getAllPayments);
router.get('/family/:familyId', getPaymentsByFamilyId);
router.post('/', createPayment);
router.patch('/:id/status', updatePaymentStatus);
router.delete('/:id', deletePayment);

export default router;