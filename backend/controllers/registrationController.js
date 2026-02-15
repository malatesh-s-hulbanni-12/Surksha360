// controllers/registrationController.js
import Registration from '../models/Registration.js';

// Get all registrations
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single registration
export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get registrations by family ID - IMPROVED VERSION
export const getRegistrationsByFamilyId = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    console.log('🔍 Searching for familyId:', familyId);
    
    if (!familyId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Family ID is required' 
      });
    }

    // Try to find with exact match first
    let registrations = await Registration.find({ 
      familyId: familyId 
    });

    console.log('📊 Found registrations:', registrations.length);

    // If no results, try case-insensitive search
    if (registrations.length === 0) {
      console.log('🔄 Trying case-insensitive search...');
      registrations = await Registration.find({
        familyId: { $regex: new RegExp(`^${familyId}$`, 'i') }
      });
      console.log('📊 Case-insensitive results:', registrations.length);
    }

    // If still no results, try partial match
    if (registrations.length === 0) {
      console.log('🔄 Trying partial match...');
      registrations = await Registration.find({
        familyId: { $regex: familyId, $options: 'i' }
      });
      console.log('📊 Partial match results:', registrations.length);
    }

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No family members found with this Family ID',
        searchedId: familyId
      });
    }

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations
    });
  } catch (error) {
    console.error('❌ Error in getRegistrationsByFamilyId:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create new registration
export const createRegistration = async (req, res) => {
  try {
    const registration = new Registration(req.body);
    const savedRegistration = await registration.save();
    res.status(201).json({
      success: true,
      data: savedRegistration
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update registration
export const updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(200).json(registration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete registration
export const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(200).json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};