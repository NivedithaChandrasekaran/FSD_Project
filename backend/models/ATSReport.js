import mongoose from 'mongoose';
import { createHybridModel } from './localModel.js';

const atsReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    resumeId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Resume',
    },
    jobTitle: { type: String, default: '' },
    jobDescription: { type: String, default: '' },
    overallScore: { type: Number, default: 0 },
    keywordScore: { type: Number, default: 0 },
    skillsScore: { type: Number, default: 0 },
    structureScore: { type: Number, default: 0 },
    actionVerbScore: { type: Number, default: 0 },
    achievementScore: { type: Number, default: 0 },
    contactScore: { type: Number, default: 0 },
    formatScore: { type: Number, default: 0 },
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    keywordCoverage: { type: Number, default: 0 },
    suggestions: { type: [String], default: [] },
    breakdown: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

const ATSReport = createHybridModel('ATSReport', 'atsreports', atsReportSchema);

export default ATSReport;
