import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { sendSystemEmail, sendSystemSMS } from '../../controllers/admin/communicationController.js';

const router = express.Router();

// All communication routes are restricted to admins only
router.use(authenticate);
router.use(authorize('admin'));

router.post('/email', sendSystemEmail);
router.post('/sms', sendSystemSMS);

export default router;
