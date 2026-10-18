import mongoose from 'mongoose';
import { createHybridModel } from './localModel.js';

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    title: { type: String, default: 'My Resume' },
    targetRole: { type: String, default: 'Software Developer' },
    jobDescription: { type: String, default: '' },
    summary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: mongoose.Schema.Types.Mixed, default: [] },
    projects: { type: mongoose.Schema.Types.Mixed, default: [] },
    education: { type: mongoose.Schema.Types.Mixed, default: [] },
    certifications: { type: mongoose.Schema.Types.Mixed, default: [] },
    achievements: { type: mongoose.Schema.Types.Mixed, default: [] },
    languages: { type: [String], default: [] },
    contact: {
      fullName: { type: String, default: '' },
      professionalTitle: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    atsScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Resume = createHybridModel('Resume', 'resumes', resumeSchema);

export default Resume;
