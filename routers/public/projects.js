// Public projects routes
import express from 'express';
import { getAllProjects, getProjectById } from '../../controllers/public/projectController.js';

const router = express.Router();

// Get all projects
router.get('/', getAllProjects);

// Get project by ID
router.get('/:id', getProjectById);

export default router;
