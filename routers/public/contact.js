// Public contact routes
import express from 'express';
import { createContact } from '../../controllers/public/contactController.js';

const router = express.Router();

// Submit contact form
router.post('/', createContact);

export default router;
