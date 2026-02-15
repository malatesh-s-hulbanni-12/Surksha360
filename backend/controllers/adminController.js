import Admin from '../models/Admin.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new admin
// @route   POST /api/admins/register
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // Check if admin code is correct (you can set a specific code)
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(400).json({ message: 'Invalid admin code' });
    }

    // Check if email exists in Admin collection
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Email already registered as an admin. Please use a different email or login.' });
    }

    // Check if email exists in User collection
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered as a user. Please use a different email.' });
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
      adminCode
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admins/login
// @desc    Login admin
// @route   POST /api/admins/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;

    // Check if admin code is provided
    if (!adminCode) {
      return res.status(400).json({ message: 'Admin secret key is required' });
    }

    // Verify admin code
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(401).json({ message: 'Invalid admin secret key' });
    }

    // Check for admin email
    const admin = await Admin.findOne({ email });
    
    if (admin && (await admin.comparePassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admins/profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (admin) {
      res.json(admin);
    } else {
      res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};