// Admin Statistics routes
import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import { getDashboardStatistics, getAdminDashboardStats } from '../../controllers/admin/statisticsAdminController.js';

const router = express.Router();

// Get dashboard statistics
router.get('/', authenticate, authorize('admin'), getDashboardStatistics);

// Get detailed dashboard statistics specifically for the admin panel
router.get('/dashboard-stats', authenticate, authorize('admin'), getAdminDashboardStats);

export default router;
