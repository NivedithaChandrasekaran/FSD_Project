import express from 'express';
import { getPortfolio, createOrUpdatePortfolio, getPublicPortfolio } from '../controllers/portfolioController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createOrUpdatePortfolio);
router.get('/', protect, getPortfolio);
router.put('/', protect, createOrUpdatePortfolio);
router.get('/public', getPublicPortfolio);
router.get('/public/:username', getPublicPortfolio);

export default router;
