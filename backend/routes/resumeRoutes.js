import express from 'express';
import {
  getResumes,
  getResumeById,
  createResume,
  generateResumeForProfile,
  improveResumeContent,
  updateResume,
  duplicateResume,
  deleteResume,
} from '../controllers/resumeController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getResumes);
router.get('/:id', protect, getResumeById);
router.post('/', protect, createResume);
router.post('/generate', protect, generateResumeForProfile);
router.post('/improve', protect, improveResumeContent);
router.post('/:id/duplicate', protect, duplicateResume);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

export default router;
