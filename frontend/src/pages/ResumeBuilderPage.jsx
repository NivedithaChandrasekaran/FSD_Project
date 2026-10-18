import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { downloadPdf } from '../utils/downloadPdf';

const EXAMPLE_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Software Developer',
  'Data Analyst',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Cybersecurity Analyst',
];

const ResumeBuilderPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.profile) {
          const p = response.data.profile;
          setProfile(p);
          if (p.targetRole || p.targetRoles?.[0]) {
            setTargetRole(p.targetRole || p.targetRoles[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load profile for resume builder:', err);
      }
    };

    fetchProfile();
  }, []);

  // Format resume data into standard ATS plain-text layout
  const buildPlainTextResume = (data, p) => {
    const candidateName = data.contact?.fullName || p?.fullName || 'Alex Johnson';
    const candidateTitle = data.contact?.professionalTitle || data.targetRole || p?.professionalTitle || 'Software Developer';
    const candidateEmail = data.contact?.email || p?.email || '';
    const candidatePhone = data.contact?.phone || p?.phone || '';
    const candidateLocation = data.contact?.location || p?.location || '';
    const candidateLinkedin = data.contact?.linkedin || p?.linkedin || '';
    const candidateGithub = data.contact?.github || p?.github || '';

    const contactLine = [candidateEmail, candidatePhone, candidateLocation, candidateLinkedin, candidateGithub]
      .filter(Boolean)
      .join(' | ');

    const sections = [];

    // Header
    sections.push(`${candidateName.toUpperCase()}`);
    sections.push(`${candidateTitle}`);
    if (contactLine) sections.push(contactLine);
    sections.push('');

    // Summary
    sections.push('PROFESSIONAL SUMMARY');
    sections.push(data.summary || 'Results-oriented software developer with proven engineering skills.');
    sections.push('');

    // Skills
    sections.push('TECHNICAL SKILLS');
    const skillsList = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
    sections.push(skillsList);
    sections.push('');

    // Experience
    if (Array.isArray(data.experience) && data.experience.length > 0) {
      sections.push('WORK EXPERIENCE');
      data.experience.forEach((exp) => {
        const titleLine = `${exp.title || 'Role'} | ${exp.company || 'Company'}${exp.location ? ` - ${exp.location}` : ''}`;
        const dateLine = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
        sections.push(`${titleLine} (${dateLine})`);
        if (exp.description) sections.push(`• ${exp.description}`);
        if (exp.achievements) sections.push(`• Impact: ${exp.achievements}`);
        sections.push('');
      });
    }

    // Projects
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      sections.push('TECHNICAL PROJECTS');
      data.projects.forEach((proj) => {
        const title = proj.name || 'Project';
        const tech = proj.technologies ? ` (${proj.technologies})` : '';
        sections.push(`${title}${tech}`);
        if (proj.description) sections.push(`• ${proj.description}`);
        if (proj.contributions) sections.push(`• Contributions: ${proj.contributions}`);
        if (proj.githubUrl || proj.liveUrl) {
          const links = [proj.githubUrl && `GitHub: ${proj.githubUrl}`, proj.liveUrl && `Demo: ${proj.liveUrl}`].filter(Boolean).join(' | ');
          sections.push(`  ${links}`);
        }
        sections.push('');
      });
    }

    // Education
    if (Array.isArray(data.education) && data.education.length > 0) {
      sections.push('EDUCATION');
      data.education.forEach((edu) => {
        sections.push(`${edu.degree || 'Degree'} | ${edu.institution || 'University'} (${edu.startYear || ''} - ${edu.endYear || ''})`);
        if (edu.score) sections.push(`• GPA / Score: ${edu.score}`);
        if (edu.coursework) sections.push(`• Relevant Coursework: ${edu.coursework}`);
        sections.push('');
      });
    }

    // Certifications
    if (Array.isArray(data.certifications) && data.certifications.length > 0) {
      sections.push('CERTIFICATIONS');
      data.certifications.forEach((cert) => {
        sections.push(`• ${cert.name || 'Certification'}${cert.organization ? ` - ${cert.organization}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
      });
      sections.push('');
    }

    // Achievements
    if (Array.isArray(data.achievements) && data.achievements.length > 0) {
      sections.push('HONORS & ACHIEVEMENTS');
      data.achievements.forEach((ach) => {
        sections.push(`• ${typeof ach === 'string' ? ach : ach.name || ach.description}`);
      });
    }

    return sections.join('\n').trim();
  };

  // Generate Resume with AI
  const handleGenerate = async () => {
    if (!profile) {
      setStatus({ type: 'error', message: 'Please create or load your career profile first.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/resumes/generate', {
        profile,
        targetRole,
        jobDescription,
      });

      const generated = response.data.resume;
      setResumeData(generated);
      const formattedText = buildPlainTextResume(generated, profile);
      setResumeText(formattedText);
      setIsEditing(false);
      setStatus({ type: 'success', message: 'ATS-optimized resume generated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to generate resume.' });
    } finally {
      setLoading(false);
    }
  };

  // Improve with AI
  const handleImproveWithAI = async () => {
    if (!resumeText.trim()) return;
    setImproving(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/resumes/improve', {
        text: resumeText,
        profile,
      });

      if (response.data.improved) {
        setResumeText(response.data.improved);
        const suggestionCount = response.data.suggestions?.length || 0;
        setStatus({
          type: 'success',
          message: `Resume improved with AI! Applied ${suggestionCount} enhancements to action verbs and clarity.`,
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to improve resume content right now.' });
    } finally {
      setImproving(false);
    }
  };

  // Save to MongoDB
  const handleSave = async () => {
    if (!resumeText.trim()) return;
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        title: `${profile?.fullName || 'My'} - ${targetRole} Resume`,
        targetRole,
        jobDescription,
        summary: resumeData?.summary || '',
        skills: resumeData?.skills || profile?.technicalSkills || [],
        experience: resumeData?.experience || profile?.experience || [],
        projects: resumeData?.projects || profile?.projects || [],
        education: resumeData?.education || profile?.education || [],
        certifications: resumeData?.certifications || profile?.certifications || [],
        achievements: resumeData?.achievements || profile?.achievements || [],
        contact: {
          fullName: profile?.fullName || '',
          professionalTitle: targetRole,
          email: profile?.email || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          linkedin: profile?.linkedin || '',
          github: profile?.github || '',
          website: profile?.website || '',
        },
      };

      await api.post('/resumes', payload);
      setStatus({ type: 'success', message: 'Resume successfully saved to MongoDB!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to save resume.' });
    } finally {
      setSaving(false);
    }
  };

  // Analyze ATS button
  const handleAnalyzeATS = () => {
    if (!resumeText.trim()) return;
    // Store in sessionStorage and navigate directly to ATS Analyzer
    sessionStorage.setItem('ats_resume_text', resumeText);
    sessionStorage.setItem('ats_job_description', jobDescription);
    navigate('/ats-analyzer');
  };

  // Download PDF
  const handleDownload = () => {
    if (!resumeText.trim()) return;

    const candidateName = profile?.fullName || 'Resume';
    const subtitle = [
      profile?.professionalTitle || targetRole,
      profile?.email,
      profile?.phone,
      profile?.location,
    ].filter(Boolean).join(' | ');

    // Parse sections from plain text
    const rawSections = resumeText.split(/\n\n+/);
    const parsedSections = [];

    rawSections.forEach((block) => {
      const lines = block.split('\n');
      const firstLine = lines[0].trim();
      if (/^[A-Z\s&]{4,}$/.test(firstLine) && !firstLine.includes('@')) {
        parsedSections.push({
          title: firstLine,
          body: lines.slice(1).join('\n'),
        });
      } else {
        parsedSections.push({
          title: '',
          body: block,
        });
      }
    });

    downloadPdf({
      filename: `${candidateName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${targetRole.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-resume.pdf`,
      header: {
        name: candidateName,
        subtitle,
      },
      sections: parsedSections,
    });
  };

  return (
    <div className="resume-builder-layout">
      {/* Input Panel */}
      <div className="panel-card resume-controls-panel">
        <div className="panel-header">
          <h3>AI Resume Builder</h3>
          <span className="badge-pill">ATS Optimized</span>
        </div>

        {status.message && (
          <div className={`form-status-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="form-stack">
          <label>Target Job Role *
            <div className="input-with-select">
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer"
              />
              <select onChange={(e) => e.target.value && setTargetRole(e.target.value)} value="">
                <option value="">Choose standard role...</option>
                {EXAMPLE_ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </label>

          <label>Target Job Description (Optional)
            <textarea
              rows="6"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements to prioritize relevant keywords and align your experience bullet points..."
            />
          </label>

          <button
            type="button"
            className="primary-button full-width cta-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⚡ Generating Tailored Resume...' : '✨ Generate Resume with AI'}
          </button>

          {profile && (
            <div className="profile-context-card">
              <div className="context-header">
                <strong>Source Profile:</strong>
                <span>{profile.fullName || 'No Name'}</span>
              </div>
              <p className="muted-text">
                Skills: {profile.technicalSkills?.slice(0, 5).join(', ') || 'None'} • Projects: {profile.projects?.length || 0} • Experience: {profile.experience?.length || 0}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resume Preview Panel */}
      <div className="panel-card resume-preview-panel">
        <div className="panel-header">
          <div>
            <h3>Professional Resume Preview</h3>
            <span className="muted-text">Single-column ATS-compliant hierarchy</span>
          </div>

          {resumeText && (
            <div className="action-button-row">
              <button
                type="button"
                className="secondary-button-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '👁️ View Formatted' : '✏️ Edit Text'}
              </button>
              <button
                type="button"
                className="ai-assist-btn"
                onClick={handleImproveWithAI}
                disabled={improving}
              >
                {improving ? '✨ Polishing...' : '✨ Improve with AI'}
              </button>
              <button
                type="button"
                className="secondary-button-sm"
                onClick={handleAnalyzeATS}
              >
                🎯 Analyze ATS
              </button>
              <button
                type="button"
                className="primary-button-sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button
                type="button"
                className="primary-button-sm download-btn"
                onClick={handleDownload}
              >
                📥 Download PDF
              </button>
            </div>
          )}
        </div>

        {!resumeText ? (
          <div className="empty-state-large">
            <span className="empty-state-icon">📄</span>
            <h4>No Resume Generated Yet</h4>
            <p>Select your target role, optionally paste a job description, and click "Generate Resume with AI".</p>
          </div>
        ) : isEditing ? (
          <div className="resume-editor-box">
            <p className="muted-text">Edit the raw resume text directly. Changes will appear in your PDF download.</p>
            <textarea
              rows="24"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="raw-resume-textarea"
            />
          </div>
        ) : (
          <div className="ats-resume-sheet">
            <pre className="ats-resume-formatted">{resumeText}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeBuilderPage;
