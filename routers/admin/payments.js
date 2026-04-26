// Admin Payments routes
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getAllPayments, getPaymentById } from '../../controllers/admin/paymentAdminController.js';

const router = express.Router();

// Get all payments
router.get('/', authenticate, authorize('admin'), getAllPayments);

// Get payment by ID
router.get('/:id', authenticate, authorize('admin'), getPaymentById);

export default router;
