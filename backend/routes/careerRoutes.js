import express from 'express';
import { recommendRoles, skillGapAnalysis, getCareerAdvice } from '../controllers/careerController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/recommend', protect, recommendRoles);
router.post('/skill-gap', protect, skillGapAnalysis);
router.post('/advice', protect, getCareerAdvice);

export default router;
