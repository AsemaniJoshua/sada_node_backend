// Public home routes
import express from 'express';
import { getHome } from '../../controllers/public/homeController.js';

const router = express.Router();

// Get home page data (singleton)
router.get('/', getHome);

export default router;
