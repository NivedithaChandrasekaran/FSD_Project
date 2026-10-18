import CareerProfile from '../models/CareerProfile.js';

export const getProfile = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.user._id });
    const profileData = profile ? (profile.toObject ? profile.toObject() : { ...profile }) : null;
    if (profileData) {
      profileData.targetRole = profileData.targetRoles?.[0] || '';
    }
    return res.json({ success: true, profile: profileData });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch profile.', error: error.message });
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Profile data must be a JSON object.' });
    }

    const allowedFields = [
      'profilePhoto',
      'fullName',
      'professionalTitle',
      'phone',
      'email',
      'location',
      'linkedin',
      'github',
      'website',
      'summary',
      'education',
      'experience',
      'projects',
      'technicalSkills',
      'softSkills',
      'certifications',
      'achievements',
      'languages',
      'careerInterests',
      'targetIndustry',
    ];

    const payload = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(req.body, field))
        .map((field) => [field, req.body[field]])
    );

    if (typeof req.body.targetRole === 'string') {
      payload.targetRoles = req.body.targetRole.trim() ? [req.body.targetRole.trim()] : [];
    } else if (Array.isArray(req.body.targetRoles)) {
      payload.targetRoles = req.body.targetRoles;
    }
    payload.userId = req.user._id;

    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user._id },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const profileData = profile.toObject ? profile.toObject() : { ...profile };
    profileData.targetRole = profileData.targetRoles?.[0] || '';
    res.json({ success: true, profile: profileData });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to save profile.', error: error.message });
  }
};

export const generateProfileSummary = async (req, res) => {
  try {
    const profile = req.body.profile || (await CareerProfile.findOne({ userId: req.user._id })) || {};
    const title = profile.professionalTitle || profile.targetRole || profile.targetRoles?.[0] || 'Software Professional';
    const skills = Array.isArray(profile.technicalSkills) ? profile.technicalSkills.slice(0, 5).join(', ') : '';
    const expCount = Array.isArray(profile.experience) ? profile.experience.length : 0;
    const expLevel = expCount > 2 ? 'seasoned' : expCount > 0 ? 'experienced' : 'motivated';

    const summary = `Dedicated and ${expLevel} ${title} with proven expertise in ${skills || 'full-stack software development'}. Strong problem-solving background focused on building scalable, reliable applications and collaborating effectively in modern agile development environments. Passionate about continuous learning and engineering high-impact solutions.`;

    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to generate profile summary.', error: error.message });
  }
};

export default { getProfile, createOrUpdateProfile, generateProfileSummary };
