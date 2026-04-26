// Public Payments routes
import express from 'express';
import { initiatePayment, verifyPayment } from '../../controllers/public/paymentController.js';

const router = express.Router();

// Initiate payment
router.post('/', initiatePayment);

// Verify payment
router.get('/verify/:reference', verifyPayment);

export default router;
