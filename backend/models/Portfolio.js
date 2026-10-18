import mongoose from 'mongoose';
import { createHybridModel } from './localModel.js';

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: 'User',
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    theme: {
      type: String,
      default: 'Modern',
      enum: ['Minimal', 'Modern', 'Professional'],
    },
    hero: {
      headline: { type: String, default: '' },
      subheading: { type: String, default: '' },
      avatarUrl: { type: String, default: '' },
    },
    about: { type: String, default: '' },
    skills: { type: [String], default: [] },
    experience: { type: mongoose.Schema.Types.Mixed, default: [] },
    projects: { type: mongoose.Schema.Types.Mixed, default: [] },
    education: { type: mongoose.Schema.Types.Mixed, default: [] },
    certifications: { type: mongoose.Schema.Types.Mixed, default: [] },
    achievements: { type: mongoose.Schema.Types.Mixed, default: [] },
    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    sectionsVisibility: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      skills: { type: Boolean, default: true },
      experience: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
    published: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Portfolio = createHybridModel('Portfolio', 'portfolios', portfolioSchema);

export default Portfolio;
