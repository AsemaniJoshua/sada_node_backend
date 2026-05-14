import express from 'express';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    getAllNotifications,
    getNotificationById,
    markAsRead,
    markAsUnread,
    markAllAsRead
} from '../../controllers/admin/notificationAdminController.js';

const router = express.Router();

// All routes are admin only
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.patch('/:id/unread', markAsUnread);
router.patch('/mark-all-read', markAllAsRead);

export default router;
