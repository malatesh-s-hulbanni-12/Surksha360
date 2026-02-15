import express from 'express';
import {
  getAllRegistrations,
  getRegistrationById,
  getRegistrationsByFamilyId, // Import the new function
  createRegistration,
  updateRegistration,
  deleteRegistration
} from '../controllers/registrationController.js';

const router = express.Router();

router.get('/', getAllRegistrations);
router.get('/:id', getRegistrationById);
router.get('/family/:familyId', getRegistrationsByFamilyId); // NEW ROUTE
router.post('/', createRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

export default router;