import CareerProfile from '../models/CareerProfile.js';
import { generateCareerRecommendations, analyzeSkillGap, generateCareerAdvice } from '../services/aiService.js';

const getCandidateProfile = async (userId, passedProfile) => {
  if (passedProfile && typeof passedProfile === 'object' && Object.keys(passedProfile).length > 2) {
    return passedProfile;
  }
  const stored = await CareerProfile.findOne({ userId });
  if (!stored) return passedProfile || {};
  return stored.toObject ? stored.toObject() : { ...stored };
};

export const recommendRoles = async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user._id, req.body.profile);
    const recommendations = await generateCareerRecommendations(profile);
    res.json({ success: true, ...recommendations });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to generate career recommendations.', error: error.message });
  }
};

export const skillGapAnalysis = async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user._id, req.body.profile);
    const { targetRole } = req.body;
    const analysis = await analyzeSkillGap({ profile, targetRole: targetRole || 'Full Stack Developer' });
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to analyze skill gaps.', error: error.message });
  }
};

export const getCareerAdvice = async (req, res) => {
  try {
    const profile = await getCandidateProfile(req.user._id, req.body.profile);
    const { question } = req.body;
    const advice = await generateCareerAdvice({ profile, question: question || 'How can I improve my career path?' });
    res.json({ success: true, advice });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to generate career advice.', error: error.message });
  }
};

export default { recommendRoles, skillGapAnalysis, getCareerAdvice };
