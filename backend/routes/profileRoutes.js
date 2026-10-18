import express from 'express';
import { getProfile, createOrUpdateProfile, generateProfileSummary } from '../controllers/profileController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProfile);
router.post('/', protect, createOrUpdateProfile);
router.put('/', protect, createOrUpdateProfile);
router.post('/generate-summary', protect, generateProfileSummary);

export default router;
