import Resume from '../models/Resume.js';
import CareerProfile from '../models/CareerProfile.js';
import { generateResume, improveResume } from '../services/aiService.js';

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to load resumes.', error: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch resume.', error: error.message });
  }
};

export const createResume = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Resume data must be a JSON object.' });
    }

    const payload = req.body;
    const resumeData = {
      userId: req.user._id,
      title: payload.title || 'My Resume',
      targetRole: payload.targetRole || 'Software Developer',
      jobDescription: payload.jobDescription || '',
      summary: payload.summary || '',
      skills: payload.skills || [],
      experience: payload.experience || [],
      projects: payload.projects || [],
      education: payload.education || [],
      certifications: payload.certifications || [],
      achievements: payload.achievements || [],
      languages: payload.languages || [],
      contact: payload.contact || {},
      atsScore: payload.atsScore || 0,
    };

    const resume = await Resume.create(resumeData);
    res.status(201).json({ success: true, resume });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to create resume.', error: error.message });
  }
};

export const generateResumeForProfile = async (req, res) => {
  try {
    let profile = req.body.profile;
    if (!profile) {
      const stored = await CareerProfile.findOne({ userId: req.user._id });
      profile = stored ? (stored.toObject ? stored.toObject() : stored) : {};
    }
    const resume = await generateResume(profile || {}, req.body);
    res.json({ success: true, resume });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to generate resume.', error: error.message });
  }
};

export const improveResumeContent = async (req, res) => {
  try {
    const { text, profile } = req.body;
    let candidateProfile = profile;
    if (!candidateProfile) {
      const stored = await CareerProfile.findOne({ userId: req.user._id });
      candidateProfile = stored ? (stored.toObject ? stored.toObject() : stored) : {};
    }
    const result = await improveResume(candidateProfile || {}, text || '');
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to improve resume content.', error: error.message });
  }
};

export const updateResume = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Resume data must be a JSON object.' });
    }

    const allowedFields = [
      'title',
      'targetRole',
      'jobDescription',
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'certifications',
      'achievements',
      'languages',
      'contact',
      'atsScore',
    ];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to update resume.', error: error.message });
  }
};

export const duplicateResume = async (req, res) => {
  try {
    const original = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ success: false, message: 'Resume not found.' });
    const data = original.toObject ? original.toObject() : { ...original };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    data.title = `${data.title} (Copy)`;
    const copy = await Resume.create(data);
    res.status(201).json({ success: true, resume: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to duplicate resume.', error: error.message });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to delete resume.', error: error.message });
  }
};

export default {
  getResumes,
  getResumeById,
  createResume,
  generateResumeForProfile,
  improveResumeContent,
  updateResume,
  duplicateResume,
  deleteResume,
};
