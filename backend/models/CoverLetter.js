import mongoose from 'mongoose';
import { createHybridModel } from './localModel.js';

const coverLetterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    company: { type: String, required: true },
    recipientName: { type: String, default: '' },
    jobTitle: { type: String, required: true },
    jobDescription: { type: String, default: '' },
    tone: { type: String, default: 'Professional' },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CoverLetter = createHybridModel('CoverLetter', 'coverletters', coverLetterSchema);

export default CoverLetter;
