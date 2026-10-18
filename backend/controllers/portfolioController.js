import Portfolio from '../models/Portfolio.js';
import CareerProfile from '../models/CareerProfile.js';

export const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      // Auto-generate portfolio from career profile if not created yet
      const profile = await CareerProfile.findOne({ userId: req.user._id });
      if (profile) {
        const username = (profile.fullName || req.user.name || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');

        portfolio = await Portfolio.create({
          userId: req.user._id,
          username: username || `user${Date.now().toString().slice(-4)}`,
          theme: 'Modern',
          hero: {
            headline: profile.fullName || req.user.name || 'Professional Portfolio',
            subheading: profile.professionalTitle || 'Software Professional',
            avatarUrl: profile.profilePhoto || '',
          },
          about: profile.summary || '',
          skills: profile.technicalSkills || [],
          experience: profile.experience || [],
          projects: profile.projects || [],
          education: profile.education || [],
          certifications: profile.certifications || [],
          achievements: profile.achievements || [],
          contact: {
            email: profile.email || req.user.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            website: profile.website || '',
          },
          sectionsVisibility: {
            hero: true,
            about: true,
            skills: true,
            experience: true,
            projects: true,
            education: true,
            certifications: true,
            achievements: true,
            contact: true,
          },
          published: false,
        });
      }
    }
    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch portfolio.', error: error.message });
  }
};

export const createOrUpdatePortfolio = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: 'Portfolio data must be a JSON object.' });
    }

    const {
      username,
      theme,
      hero,
      about,
      skills,
      experience,
      projects,
      education,
      certifications,
      achievements,
      contact,
      sectionsVisibility,
      published,
    } = req.body;

    const normalizedUsername = (username || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!normalizedUsername) {
      return res.status(400).json({ success: false, message: 'A valid username is required for your portfolio URL.' });
    }

    // Check username uniqueness if changing username
    const existing = await Portfolio.findOne({ username: normalizedUsername });
    if (existing && String(existing.userId) !== String(req.user._id)) {
      return res.status(409).json({ success: false, message: 'This portfolio username is already taken. Please choose another.' });
    }

    const payload = {
      userId: req.user._id,
      username: normalizedUsername,
      theme: theme || 'Modern',
      hero: hero || {},
      about: typeof about === 'string' ? about : '',
      skills: Array.isArray(skills) ? skills : [],
      experience: Array.isArray(experience) ? experience : [],
      projects: Array.isArray(projects) ? projects : [],
      education: Array.isArray(education) ? education : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      contact: contact || {},
      sectionsVisibility: sectionsVisibility || {},
      published: Boolean(published),
    };

    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user._id },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to save portfolio.', error: error.message });
  }
};

export const getPublicPortfolio = async (req, res) => {
  try {
    const username = (req.params.username || req.query.username || '').toLowerCase().trim();
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }

    const portfolio = await Portfolio.findOne({ username, published: true }).select('-userId');
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found or not published yet.' });
    }
    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: 'Unable to fetch public portfolio.', error: error.message });
  }
};

export default { getPortfolio, createOrUpdatePortfolio, getPublicPortfolio };
