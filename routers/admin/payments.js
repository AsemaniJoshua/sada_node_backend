// Admin Payments routes
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getAllPayments, getPaymentById, getPaymentsByUniqueMemberId, createPayment } from '../../controllers/admin/paymentAdminController.js';

const router = express.Router();

// Get all payments
router.get('/', authenticate, authorize('admin'), getAllPayments);

// Create a manual payment
router.post('/', authenticate, authorize('admin'), createPayment);

// Get all payments for a specific member by their 6-digit ID
router.get('/member/:uniqueMemberId', authenticate, authorize('admin'), getPaymentsByUniqueMemberId);

// Get payment by ID (UUID)
router.get('/:id', authenticate, authorize('admin'), getPaymentById);

export default router;
