import CoverLetter from '../models/CoverLetter.js';
import CareerProfile from '../models/CareerProfile.js';
import { generateCoverLetter } from '../services/aiService.js';

export const generateCoverLetterForRole = async (req, res) => {
  try {
    const { company = '', recipientName = '', jobTitle = '', jobDescription = '', tone = 'Professional' } = req.body;
    const storedProfile = await CareerProfile.findOne({ userId: req.user._id });
    const profile = storedProfile ? (storedProfile.toObject ? storedProfile.toObject() : { ...storedProfile }) : {};

    Object.entries(req.body.profile || {}).forEach(([key, value]) => {
      if (typeof value === 'string' ? value.trim() : Array.isArray(value) ? value.length > 0 : value != null) {
        profile[key] = value;
      }
    });

    const candidateName = profile.fullName || req.body.senderName || req.user.name || 'Candidate';
    profile.fullName = candidateName;

    if (!company.trim() || !jobTitle.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Company name and job title are required to generate a tailored cover letter.',
      });
    }

    const generated = await generateCoverLetter({
      company,
      recipientName,
      jobTitle,
      jobDescription,
      tone,
      profile,
    });

    const document = await CoverLetter.create({
      userId: req.user._id,
      company,
      recipientName,
      jobTitle,
      jobDescription,
      tone,
      content: generated.content,
    });

    res.status(201).json({ success: true, document, coverLetter: generated });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to generate cover letter.', error: error.message });
  }
};

export const getCoverLetters = async (req, res) => {
  try {
    const letters = await CoverLetter.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, coverLetters: letters });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to load cover letters.', error: error.message });
  }
};

export const getCoverLetterById = async (req, res) => {
  try {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });
    if (!letter) return res.status(404).json({ success: false, message: 'Cover letter not found.' });
    res.json({ success: true, coverLetter: letter });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch cover letter.', error: error.message });
  }
};

export const updateCoverLetter = async (req, res) => {
  try {
    const { company, jobTitle, content, tone, recipientName } = req.body;
    const letter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { company, jobTitle, content, tone, recipientName },
      { new: true }
    );
    if (!letter) return res.status(404).json({ success: false, message: 'Cover letter not found.' });
    res.json({ success: true, coverLetter: letter });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to update cover letter.', error: error.message });
  }
};

export const duplicateCoverLetter = async (req, res) => {
  try {
    const original = await CoverLetter.findOne({ _id: req.params.id, userId: req.user._id });
    if (!original) return res.status(404).json({ success: false, message: 'Cover letter not found.' });
    const data = original.toObject ? original.toObject() : { ...original };
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    data.company = `${data.company} (Copy)`;
    const copy = await CoverLetter.create(data);
    res.status(201).json({ success: true, coverLetter: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to duplicate cover letter.', error: error.message });
  }
};

export const deleteCoverLetter = async (req, res) => {
  try {
    const letter = await CoverLetter.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!letter) return res.status(404).json({ success: false, message: 'Cover letter not found.' });
    res.json({ success: true, message: 'Cover letter deleted successfully.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to delete cover letter.', error: error.message });
  }
};

export default {
  generateCoverLetterForRole,
  getCoverLetters,
  getCoverLetterById,
  updateCoverLetter,
  duplicateCoverLetter,
  deleteCoverLetter,
};
