import express from 'express';
import {
  analyzeResumeATS,
  getATSReports,
  getATSReportById,
  deleteATSReport,
} from '../controllers/atsController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', protect, analyzeResumeATS);
router.get('/', protect, getATSReports);
router.get('/:id', protect, getATSReportById);
router.delete('/:id', protect, deleteATSReport);

export default router;
