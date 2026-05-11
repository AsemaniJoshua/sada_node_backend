import express from 'express';
import { subscribe, unsubscribe } from '../../controllers/public/notificationController.js';
import { authenticate } from '../../middlewares/auth/authenticate.js';

const router = express.Router();

// Public subscription route (can be authenticated if you want to link to users)
// Using optional authentication
router.post('/subscribe', (req, res, next) => {
    // If token exists, use authenticate middleware, otherwise proceed
    if (req.headers.authorization) {
        return authenticate(req, res, () => subscribe(req, res, next));
    }
    subscribe(req, res, next);
});

router.post('/unsubscribe', unsubscribe);

export default router;
