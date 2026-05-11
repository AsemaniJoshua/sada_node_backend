import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getAllActivities, getActivityById } from '../../controllers/admin/activityAdminController.js';

const router = express.Router();

// All activity routes are admin-only
router.get('/', authenticate, authorize('admin'), getAllActivities);
router.get('/:id', authenticate, authorize('admin'), getActivityById);

export default router;
