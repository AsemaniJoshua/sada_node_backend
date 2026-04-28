// Public hero routes
import express from 'express';
import { getAllHeroes, getHeroById } from '../../controllers/public/heroController.js';

const router = express.Router();

// Get all published heroes
router.get('/', getAllHeroes);

// Get published hero by ID
router.get('/:id', getHeroById);

export default router;
