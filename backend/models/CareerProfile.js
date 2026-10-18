import mongoose from 'mongoose';
import { createHybridModel } from './localModel.js';

const careerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      unique: true,
      ref: 'User',
    },
    fullName: { type: String, default: '' },
    professionalTitle: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    summary: { type: String, default: '' },
    education: {
      type: [
        {
          degree: { type: String, default: '' },
          institution: { type: String, default: '' },
          startYear: { type: String, default: '' },
          endYear: { type: String, default: '' },
          score: { type: String, default: '' },
          coursework: { type: String, default: '' },
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          company: { type: String, default: '' },
          title: { type: String, default: '' },
          location: { type: String, default: '' },
          startDate: { type: String, default: '' },
          endDate: { type: String, default: '' },
          description: { type: String, default: '' },
          achievements: { type: String, default: '' },
        },
      ],
      default: [],
    },
    projects: {
      type: [
        {
          name: { type: String, default: '' },
          description: { type: String, default: '' },
          technologies: { type: String, default: '' },
          githubUrl: { type: String, default: '' },
          liveUrl: { type: String, default: '' },
          contributions: { type: String, default: '' },
        },
      ],
      default: [],
    },
    technicalSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    certifications: {
      type: [
        {
          name: { type: String, default: '' },
          organization: { type: String, default: '' },
          date: { type: String, default: '' },
          credentialUrl: { type: String, default: '' },
        },
      ],
      default: [],
    },
    achievements: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    careerInterests: { type: [String], default: [] },
    targetRoles: { type: [String], default: [] },
    targetIndustry: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const CareerProfile = createHybridModel('CareerProfile', 'careerprofiles', careerProfileSchema);

export default CareerProfile;
