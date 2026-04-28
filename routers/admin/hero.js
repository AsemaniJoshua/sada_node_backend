// Admin hero routes with CRUD operations and image upload
import express from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth/authenticate.js';
import { authorize } from '../../middlewares/auth/authorize.js';
import {
    createHero,
    getAllHeroes,
    getHeroById,
    updateHeroById,
    deleteHeroById,
} from '../../controllers/admin/heroAdminController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create new hero
router.post('/', authenticate, authorize('admin'), upload.single('image'), createHero);

// Get all heroes
router.get('/', authenticate, authorize('admin'), getAllHeroes);

// Get hero by ID
router.get('/:id', authenticate, authorize('admin'), getHeroById);

// Update hero by ID
router.patch('/:id', authenticate, authorize('admin'), upload.single('image'), updateHeroById);

// Delete hero by ID
router.delete('/:id', authenticate, authorize('admin'), deleteHeroById);

export default router;
