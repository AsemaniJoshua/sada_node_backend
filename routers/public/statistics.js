// Public Statistics routes
import express from 'express';
import { getPublicSummary } from '../../controllers/public/statisticsPublicController.js';

const router = express.Router();

// Get public summary statistics
router.get('/', getPublicSummary);

export default router;
