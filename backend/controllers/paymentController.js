// backend/controllers/paymentController.js
import Payment from '../models/Payment.js';

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payments by family ID
export const getPaymentsByFamilyId = async (req, res) => {
  try {
    const { familyId } = req.params;
    const payments = await Payment.find({ familyId }).sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new payment
export const createPayment = async (req, res) => {
  try {
    console.log('Creating payment with data:', req.body);
    
    const payment = new Payment({
      familyId: req.body.familyId,
      memberId: req.body.memberId,
      memberName: req.body.memberName,
      amount: req.body.amount || 10,
      months: req.body.months,
      paymentMethod: req.body.paymentMethod,
      status: req.body.status || (req.body.paymentMethod === 'cash' ? 'Completed' : 'Pending'),
      transactionId: req.body.transactionId || `TXN${Date.now()}`,
      notes: req.body.notes
    });

    const savedPayment = await payment.save();
    console.log('Payment saved:', savedPayment);
    
    res.status(201).json({
      success: true,
      data: savedPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};