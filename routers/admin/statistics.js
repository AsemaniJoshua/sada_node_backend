// Admin Statistics routes
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getDashboardStatistics } from '../../controllers/admin/statisticsAdminController.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticate, authorize('admin'), getDashboardStatistics);

export default router;
