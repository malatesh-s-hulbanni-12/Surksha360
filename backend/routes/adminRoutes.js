import express from 'express';
import { registerAdmin, loginAdmin, getAdminProfile } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protect, adminOnly, getAdminProfile);

export default router;