import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
// backend/server.js - Add this line with other routes
import benefitRoutes from './routes/benefitRoutes.js';
import benefitRoutes1 from './routes/benefitRoutes1.js'; // Updated import


dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/registrations', registrationRoutes);
// Routes
app.use('/api/payments', paymentRoutes);
// Add this after other app.use statements
app.use('/api/benefits', benefitRoutes);
// Routes - using renamed routes
app.use('/api/benefits', benefitRoutes1); // Updated route usage

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});