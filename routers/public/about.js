import express from 'express';
import { getAbout } from '../../controllers/public/aboutController.js';

const router = express.Router();

// Get about page data (singleton)
router.get('/', getAbout);

export default router;
