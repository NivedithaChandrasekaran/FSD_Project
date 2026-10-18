import { useEffect, useState } from 'react';
import api from '../services/api';
import { DEMO_PROFILE } from '../utils/demoData';

const STEPS = [
  'Personal Info',
  'Summary',
  'Education',
  'Experience',
  'Projects',
  'Skills',
  'Certifications',
  'Achievements',
  'Preferences',
];

const createEmptyProfile = () => ({
  fullName: '',
  professionalTitle: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  website: '',
  profilePhoto: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  technicalSkills: [],
  softSkills: [],
  certifications: [],
  achievements: [],
  languages: [],
  careerInterests: [],
  targetRole: '',
  targetRoles: [],
  targetIndustry: '',
});

const ProfilePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState(createEmptyProfile());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // Skill input buffers for comma-separated editing
  const [skillsInput, setSkillsInput] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.profile) {
          const p = response.data.profile;
          setProfile({
            ...createEmptyProfile(),
            ...p,
            targetRole: p.targetRole || p.targetRoles?.[0] || '',
          });
          setSkillsInput(Array.isArray(p.technicalSkills) ? p.technicalSkills.join(', ') : '');
          setSoftSkillsInput(Array.isArray(p.softSkills) ? p.softSkills.join(', ') : '');
          setLanguagesInput(Array.isArray(p.languages) ? p.languages.join(', ') : '');
          setInterestsInput(Array.isArray(p.careerInterests) ? p.careerInterests.join(', ') : '');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Step 2: AI Summary Generation
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await api.post('/profile/generate-summary', { profile });
      if (response.data.summary) {
        handleInputChange('summary', response.data.summary);
        setStatus({ type: 'success', message: 'Professional summary generated with AI!' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to generate summary right now.' });
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Step 3: Education Add / Edit / Remove
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', startYear: '', endYear: '', score: '', coursework: '' },
      ],
    }));
  };

  const updateEducation = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Step 4: Experience Add / Edit / Remove
  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', title: '', location: '', startDate: '', endDate: '', description: '', achievements: '' },
      ],
    }));
  };

  const updateExperience = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Step 5: Projects Add / Edit / Remove
  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', technologies: '', githubUrl: '', liveUrl: '', contributions: '' },
      ],
    }));
  };

  const updateProject = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // Step 7: Certifications Add / Edit / Remove
  const addCertification = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', organization: '', date: '', credentialUrl: '' },
      ],
    }));
  };

  const updateCertification = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  // Step 8: Achievements Add / Edit / Remove
  const addAchievement = () => {
    setProfile((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ''],
    }));
  };

  const updateAchievement = (index, value) => {
    setProfile((prev) => {
      const updated = [...prev.achievements];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  };

  const removeAchievement = (index) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  // Load Demo Profile (Requirement #27)
  const handleLoadDemo = () => {
    setProfile(DEMO_PROFILE);
    setSkillsInput(DEMO_PROFILE.technicalSkills.join(', '));
    setSoftSkillsInput(DEMO_PROFILE.softSkills.join(', '));
    setLanguagesInput(DEMO_PROFILE.languages.join(', '));
    setInterestsInput(DEMO_PROFILE.careerInterests.join(', '));
    setStatus({ type: 'success', message: 'Demo profile for Alex Johnson loaded! Remember to save changes.' });
  };

  // Save profile to MongoDB
  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });

    const payload = {
      ...profile,
      technicalSkills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      softSkills: softSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      languages: languagesInput.split(',').map((s) => s.trim()).filter(Boolean),
      careerInterests: interestsInput.split(',').map((s) => s.trim()).filter(Boolean),
      targetRoles: profile.targetRole ? [profile.targetRole.trim()] : profile.targetRoles,
    };

    try {
      const response = await api.post('/profile', payload);
      setProfile((prev) => ({ ...prev, ...response.data.profile }));
      setStatus({ type: 'success', message: 'Career profile successfully saved to MongoDB!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to save profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-builder-page">
      {/* Top Banner with Demo Loader and Save */}
      <div className="profile-top-controls">
        <div className="demo-loader-box">
          <button type="button" className="demo-btn" onClick={handleLoadDemo}>
            ⚡ Load Demo Profile (Alex Johnson)
          </button>
          <span className="muted-text">Instant 1-click test data for presentations and testing</span>
        </div>
        <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save All Profile Changes'}
        </button>
      </div>

      {status.message && (
        <div className={`form-status-alert ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* Wizard Steps Bar */}
      <div className="wizard-stepper">
        {STEPS.map((stepName, idx) => (
          <button
            key={stepName}
            type="button"
            className={`step-tab ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(idx)}
          >
            <span className="step-circle">{idx + 1}</span>
            <span className="step-label">{stepName}</span>
          </button>
        ))}
      </div>

      <div className="panel-card wide wizard-content">
        {/* STEP 1: Personal Information */}
        {currentStep === 0 && (
          <div className="step-section">
            <h3>Step 1 — Personal Information</h3>
            <p className="muted-text">Provide your contact details so recruiters and ATS engines can reach you.</p>
            <div className="form-grid">
              <label>Full Name *
                <input value={profile.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} placeholder="e.g. Alex Johnson" required />
              </label>
              <label>Professional Title *
                <input value={profile.professionalTitle} onChange={(e) => handleInputChange('professionalTitle', e.target.value)} placeholder="e.g. Full Stack Developer" required />
              </label>
              <label>Email *
                <input type="email" value={profile.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="alex.johnson@example.com" required />
              </label>
              <label>Phone
                <input value={profile.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              </label>
              <label>Location
                <input value={profile.location} onChange={(e) => handleInputChange('location', e.target.value)} placeholder="City, State / Country" />
              </label>
              <label>LinkedIn URL
                <input value={profile.linkedin} onChange={(e) => handleInputChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
              </label>
              <label>GitHub URL
                <input value={profile.github} onChange={(e) => handleInputChange('github', e.target.value)} placeholder="https://github.com/username" />
              </label>
              <label>Portfolio / Personal Website URL
                <input value={profile.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://mywebsite.dev" />
              </label>
              <label>Profile Photo URL (Optional)
                <input value={profile.profilePhoto} onChange={(e) => handleInputChange('profilePhoto', e.target.value)} placeholder="https://example.com/avatar.jpg" />
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: Professional Summary */}
        {currentStep === 1 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 2 — Professional Summary</h3>
                <p className="muted-text">Write a compelling 2-4 sentence summary or generate one using AI.</p>
              </div>
              <button
                type="button"
                className="ai-assist-btn"
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
              >
                {generatingSummary ? '✨ Generating...' : '✨ Generate Summary with AI'}
              </button>
            </div>
            <textarea
              rows="6"
              value={profile.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="e.g. Motivated Full Stack Developer with hands-on experience building modern web applications using React, Node.js, Express, and MongoDB..."
            />
          </div>
        )}

        {/* STEP 3: Education */}
        {currentStep === 2 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 3 — Education</h3>
                <p className="muted-text">Add your degrees, institutions, graduation years, and relevant coursework.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addEducation}>+ Add Education</button>
            </div>

            {profile.education.length === 0 ? (
              <div className="empty-state-card">
                <p>No education history added yet.</p>
                <button type="button" className="primary-button-sm" onClick={addEducation}>+ Add First Degree</button>
              </div>
            ) : (
              profile.education.map((edu, idx) => (
                <div key={idx} className="sub-card">
                  <div className="sub-card-header">
                    <strong>Education Entry #{idx + 1}</strong>
                    <button type="button" className="delete-icon-btn" onClick={() => removeEducation(idx)}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <label>Degree
                      <input value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} placeholder="e.g. B.S. in Computer Science" />
                    </label>
                    <label>Institution / University
                      <input value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} placeholder="e.g. State University" />
                    </label>
                    <label>Start Year
                      <input value={edu.startYear} onChange={(e) => updateEducation(idx, 'startYear', e.target.value)} placeholder="2020" />
                    </label>
                    <label>End Year (or Expected)
                      <input value={edu.endYear} onChange={(e) => updateEducation(idx, 'endYear', e.target.value)} placeholder="2024" />
                    </label>
                    <label>CGPA / Percentage
                      <input value={edu.score} onChange={(e) => updateEducation(idx, 'score', e.target.value)} placeholder="e.g. 3.8 / 4.0 or 85%" />
                    </label>
                    <label>Relevant Coursework
                      <input value={edu.coursework} onChange={(e) => updateEducation(idx, 'coursework', e.target.value)} placeholder="Data Structures, Algorithms, Web Development, Databases" />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 4: Experience */}
        {currentStep === 3 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 4 — Work Experience</h3>
                <p className="muted-text">Detail your previous roles, companies, dates, and key accomplishments.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addExperience}>+ Add Experience</button>
            </div>

            {profile.experience.length === 0 ? (
              <div className="empty-state-card">
                <p>No work experience added yet.</p>
                <button type="button" className="primary-button-sm" onClick={addExperience}>+ Add First Job</button>
              </div>
            ) : (
              profile.experience.map((exp, idx) => (
                <div key={idx} className="sub-card">
                  <div className="sub-card-header">
                    <strong>Experience Entry #{idx + 1}</strong>
                    <button type="button" className="delete-icon-btn" onClick={() => removeExperience(idx)}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <label>Company Name
                      <input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} placeholder="e.g. TechFlow Solutions" />
                    </label>
                    <label>Job Title
                      <input value={exp.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} placeholder="e.g. Junior Full Stack Developer" />
                    </label>
                    <label>Location
                      <input value={exp.location} onChange={(e) => updateExperience(idx, 'location', e.target.value)} placeholder="e.g. San Francisco, CA (or Remote)" />
                    </label>
                    <label>Start Date
                      <input value={exp.startDate} onChange={(e) => updateExperience(idx, 'startDate', e.target.value)} placeholder="2023-06" />
                    </label>
                    <label>End Date
                      <input value={exp.endDate} onChange={(e) => updateExperience(idx, 'endDate', e.target.value)} placeholder="Present (or 2024-05)" />
                    </label>
                  </div>
                  <div className="form-stack" style={{ marginTop: '12px' }}>
                    <label>Role Description
                      <textarea rows="3" value={exp.description} onChange={(e) => updateExperience(idx, 'description', e.target.value)} placeholder="Describe core responsibilities and technologies used..." />
                    </label>
                    <label>Measurable Achievements
                      <input value={exp.achievements} onChange={(e) => updateExperience(idx, 'achievements', e.target.value)} placeholder="e.g. Decreased API response latency by 28% and shipped 15+ features" />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 5: Projects */}
        {currentStep === 4 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 5 — Projects</h3>
                <p className="muted-text">Add notable engineering projects showcasing practical problem solving.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addProject}>+ Add Project</button>
            </div>

            {profile.projects.length === 0 ? (
              <div className="empty-state-card">
                <p>No projects added yet.</p>
                <button type="button" className="primary-button-sm" onClick={addProject}>+ Add First Project</button>
              </div>
            ) : (
              profile.projects.map((proj, idx) => (
                <div key={idx} className="sub-card">
                  <div className="sub-card-header">
                    <strong>Project #{idx + 1}</strong>
                    <button type="button" className="delete-icon-btn" onClick={() => removeProject(idx)}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <label>Project Name
                      <input value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} placeholder="e.g. CareerForge AI Platform" />
                    </label>
                    <label>Technologies Used
                      <input value={proj.technologies} onChange={(e) => updateProject(idx, 'technologies', e.target.value)} placeholder="React, Node.js, Express, MongoDB" />
                    </label>
                    <label>GitHub Repository URL
                      <input value={proj.githubUrl} onChange={(e) => updateProject(idx, 'githubUrl', e.target.value)} placeholder="https://github.com/..." />
                    </label>
                    <label>Live Demo URL
                      <input value={proj.liveUrl} onChange={(e) => updateProject(idx, 'liveUrl', e.target.value)} placeholder="https://myproject.demo" />
                    </label>
                  </div>
                  <div className="form-stack" style={{ marginTop: '12px' }}>
                    <label>Project Overview & Architecture
                      <textarea rows="3" value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} placeholder="Describe the application's purpose, architecture, and features..." />
                    </label>
                    <label>Key Contributions & Impact
                      <input value={proj.contributions} onChange={(e) => updateProject(idx, 'contributions', e.target.value)} placeholder="e.g. Implemented JWT auth, optimized DB queries, built responsive React UI" />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 6: Skills */}
        {currentStep === 5 && (
          <div className="step-section">
            <h3>Step 6 — Technical & Soft Skills</h3>
            <p className="muted-text">Categorize your competencies for ATS keyword matching. Separate with commas.</p>
            <div className="form-stack">
              <label>Technical Skills (Languages, Frameworks, Databases, Tools)
                <textarea
                  rows="4"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="JavaScript, TypeScript, React, Node.js, MongoDB, Express, HTML5, CSS3, Git, REST APIs, SQL, Docker"
                />
              </label>
              <label>Soft Skills & Professional Competencies
                <input
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  placeholder="Problem Solving, Team Leadership, Effective Communication, Adaptability, Agile/Scrum"
                />
              </label>
              <label>Languages Spoken
                <input
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  placeholder="English (Fluent), Spanish (Conversational)"
                />
              </label>
            </div>
          </div>
        )}

        {/* STEP 7: Certifications */}
        {currentStep === 6 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 7 — Certifications & Licenses</h3>
                <p className="muted-text">List professional certificates from AWS, Google, Coursera, Meta, etc.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addCertification}>+ Add Certification</button>
            </div>

            {profile.certifications.length === 0 ? (
              <div className="empty-state-card">
                <p>No certifications added yet.</p>
                <button type="button" className="primary-button-sm" onClick={addCertification}>+ Add First Certificate</button>
              </div>
            ) : (
              profile.certifications.map((cert, idx) => (
                <div key={idx} className="sub-card">
                  <div className="sub-card-header">
                    <strong>Certification #{idx + 1}</strong>
                    <button type="button" className="delete-icon-btn" onClick={() => removeCertification(idx)}>Remove</button>
                  </div>
                  <div className="form-grid">
                    <label>Certification Name
                      <input value={cert.name} onChange={(e) => updateCertification(idx, 'name', e.target.value)} placeholder="e.g. AWS Certified Cloud Practitioner" />
                    </label>
                    <label>Issuing Organization
                      <input value={cert.organization} onChange={(e) => updateCertification(idx, 'organization', e.target.value)} placeholder="e.g. Amazon Web Services" />
                    </label>
                    <label>Issue Date
                      <input value={cert.date} onChange={(e) => updateCertification(idx, 'date', e.target.value)} placeholder="2024-02" />
                    </label>
                    <label>Credential Verification URL
                      <input value={cert.credentialUrl} onChange={(e) => updateCertification(idx, 'credentialUrl', e.target.value)} placeholder="https://..." />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 8: Achievements */}
        {currentStep === 7 && (
          <div className="step-section">
            <div className="section-header-row">
              <div>
                <h3>Step 8 — Standout Achievements & Honors</h3>
                <p className="muted-text">Highlight hackathon wins, scholarships, publications, open source, or awards.</p>
              </div>
              <button type="button" className="secondary-button" onClick={addAchievement}>+ Add Achievement</button>
            </div>

            {profile.achievements.length === 0 ? (
              <div className="empty-state-card">
                <p>No achievements added yet.</p>
                <button type="button" className="primary-button-sm" onClick={addAchievement}>+ Add Achievement</button>
              </div>
            ) : (
              profile.achievements.map((ach, idx) => (
                <div key={idx} className="achievement-input-row">
                  <span className="bullet-indicator">🏆</span>
                  <input
                    value={typeof ach === 'string' ? ach : ach.name || ''}
                    onChange={(e) => updateAchievement(idx, e.target.value)}
                    placeholder="e.g. Won 1st Place at State Hackathon 2023 among 60+ engineering teams"
                  />
                  <button type="button" className="delete-icon-btn" onClick={() => removeAchievement(idx)}>✕</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* STEP 9: Preferences */}
        {currentStep === 8 && (
          <div className="step-section">
            <h3>Step 9 — Career Preferences</h3>
            <p className="muted-text">Define your target roles and industries to guide AI career recommendations.</p>
            <div className="form-grid">
              <label>Target Role *
                <input
                  value={profile.targetRole}
                  onChange={(e) => handleInputChange('targetRole', e.target.value)}
                  placeholder="e.g. Full Stack Developer, Frontend Developer"
                />
              </label>
              <label>Target Industry
                <input
                  value={profile.targetIndustry}
                  onChange={(e) => handleInputChange('targetIndustry', e.target.value)}
                  placeholder="e.g. Technology / SaaS, FinTech, E-Commerce"
                />
              </label>
              <label>Career Interests (comma separated)
                <input
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="Full Stack Development, Cloud Architecture, AI Systems"
                />
              </label>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="wizard-navigation-footer">
          <button
            type="button"
            className="secondary-button"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          >
            ← Previous Step
          </button>

          <div className="wizard-right-actions">
            <button type="button" className="primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                className="primary-button cta-btn"
                onClick={handleSave}
              >
                ✓ Finish & Save Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
