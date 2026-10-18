import express from 'express';
import {
  generateCoverLetterForRole,
  getCoverLetters,
  getCoverLetterById,
  updateCoverLetter,
  duplicateCoverLetter,
  deleteCoverLetter,
} from '../controllers/coverLetterController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generateCoverLetterForRole);
router.get('/', protect, getCoverLetters);
router.get('/:id', protect, getCoverLetterById);
router.put('/:id', protect, updateCoverLetter);
router.post('/:id/duplicate', protect, duplicateCoverLetter);
router.delete('/:id', protect, deleteCoverLetter);

export default router;
