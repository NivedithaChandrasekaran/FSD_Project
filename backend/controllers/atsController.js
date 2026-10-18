import ATSReport from '../models/ATSReport.js';
import Resume from '../models/Resume.js';
import CareerProfile from '../models/CareerProfile.js';
import { analyzeATS } from '../services/aiService.js';

export const analyzeResumeATS = async (req, res) => {
  try {
    const { resumeText, jobDescription, resumeId } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ success: false, message: 'Resume content is required for ATS analysis.' });
    }

    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id }).select('_id');
      if (!resume) return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    let profile = req.body.profile;
    if (!profile) {
      const stored = await CareerProfile.findOne({ userId: req.user._id });
      profile = stored ? (stored.toObject ? stored.toObject() : stored) : {};
    }

    const report = await analyzeATS({
      resumeText,
      jobDescription: jobDescription || '',
      profile: profile || {},
    });

    const createdReport = await ATSReport.create({
      userId: req.user._id,
      resumeId: resumeId || undefined,
      jobTitle: req.body.jobTitle || '',
      jobDescription: jobDescription || '',
      overallScore: report.overallScore || report.estimatedScore || 0,
      keywordScore: report.breakdown?.keywordMatch?.score || 0,
      skillsScore: report.breakdown?.skillsMatch?.score || 0,
      structureScore: report.breakdown?.structure?.score || 0,
      actionVerbScore: report.breakdown?.actionVerbs?.score || 0,
      achievementScore: report.breakdown?.achievements?.score || 0,
      contactScore: report.breakdown?.contact?.score || 0,
      formatScore: report.breakdown?.formatting?.score || 0,
      matchedKeywords: report.matchedKeywords || [],
      missingKeywords: report.missingKeywords || [],
      matchedSkills: report.matchedSkills || [],
      missingSkills: report.missingSkills || [],
      keywordCoverage: report.keywordCoverage || 0,
      suggestions: report.suggestions || [],
      breakdown: report.breakdown || {},
    });

    if (resumeId) {
      await Resume.updateOne(
        { _id: resumeId, userId: req.user._id },
        { $set: { atsScore: createdReport.overallScore } }
      );
    }

    res.json({ success: true, report: createdReport, analysis: report });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to analyze resume.', error: error.message });
  }
};

export const getATSReports = async (req, res) => {
  try {
    const reports = await ATSReport.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to load ATS reports.', error: error.message });
  }
};

export const getATSReportById = async (req, res) => {
  try {
    const report = await ATSReport.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'ATS report not found.' });
    res.json({ success: true, report });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch ATS report.', error: error.message });
  }
};

export const deleteATSReport = async (req, res) => {
  try {
    const report = await ATSReport.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'ATS report not found.' });
    res.json({ success: true, message: 'ATS report deleted successfully.' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to delete ATS report.', error: error.message });
  }
};

export default { analyzeResumeATS, getATSReports, getATSReportById, deleteATSReport };
