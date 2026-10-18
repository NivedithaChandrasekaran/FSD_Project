import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const THEMES = ['Minimal', 'Modern', 'Professional'];

const SECTIONS = [
  { id: 'hero', label: 'Hero Header' },
  { id: 'about', label: 'About Me' },
  { id: 'skills', label: 'Skills & Tools' },
  { id: 'projects', label: 'Featured Projects' },
  { id: 'experience', label: 'Work Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'achievements', label: 'Honors & Achievements' },
  { id: 'contact', label: 'Contact Details' },
];

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState({
    username: '',
    theme: 'Modern',
    hero: { headline: '', subheading: '', avatarUrl: '' },
    about: '',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    contact: { email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
    sectionsVisibility: {
      hero: true,
      about: true,
      skills: true,
      projects: true,
      experience: true,
      education: true,
      certifications: true,
      achievements: true,
      contact: true,
    },
    published: false,
  });

  const [skillsString, setSkillsString] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portRes, profRes] = await Promise.all([
          api.get('/portfolio').catch(() => ({ data: {} })),
          api.get('/profile').catch(() => ({ data: {} })),
        ]);

        const prof = profRes.data?.profile || null;
        setProfile(prof);

        if (portRes.data?.portfolio) {
          const p = portRes.data.portfolio;
          setPortfolio((prev) => ({
            ...prev,
            ...p,
            sectionsVisibility: { ...prev.sectionsVisibility, ...(p.sectionsVisibility || {}) },
          }));
          setSkillsString(Array.isArray(p.skills) ? p.skills.join(', ') : '');
        } else if (prof) {
          // Auto populate from profile initially
          populateFromProfile(prof);
        }
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const populateFromProfile = (prof) => {
    const safeUsername = (prof.fullName || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const populated = {
      username: safeUsername || 'user',
      theme: 'Modern',
      hero: {
        headline: prof.fullName || 'Professional Portfolio',
        subheading: prof.professionalTitle || 'Software Developer',
        avatarUrl: prof.profilePhoto || '',
      },
      about: prof.summary || '',
      skills: prof.technicalSkills || [],
      experience: prof.experience || [],
      projects: prof.projects || [],
      education: prof.education || [],
      certifications: prof.certifications || [],
      achievements: prof.achievements || [],
      contact: {
        email: prof.email || '',
        phone: prof.phone || '',
        location: prof.location || '',
        linkedin: prof.linkedin || '',
        github: prof.github || '',
        website: prof.website || '',
      },
      sectionsVisibility: {
        hero: true,
        about: true,
        skills: true,
        projects: true,
        experience: true,
        education: true,
        certifications: true,
        achievements: true,
        contact: true,
      },
      published: true,
    };

    setPortfolio(populated);
    setSkillsString(Array.isArray(prof.technicalSkills) ? prof.technicalSkills.join(', ') : '');
    setStatus({ type: 'success', message: 'Portfolio automatically populated from your career profile!' });
  };

  const handleToggleSection = (sectionId) => {
    setPortfolio((prev) => ({
      ...prev,
      sectionsVisibility: {
        ...prev.sectionsVisibility,
        [sectionId]: !prev.sectionsVisibility[sectionId],
      },
    }));
  };

  const handleSave = async () => {
    if (!portfolio.username.trim()) {
      setStatus({ type: 'error', message: 'Please provide a username for your portfolio URL.' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });

    const payload = {
      ...portfolio,
      skills: skillsString.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      const response = await api.post('/portfolio', payload);
      setPortfolio(response.data.portfolio);
      setStatus({
        type: 'success',
        message: `Portfolio saved! ${portfolio.published ? 'Live at /portfolio/' + portfolio.username : 'Saved as draft.'}`,
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to save portfolio.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portfolio-builder-layout">
      {/* Top Controls Banner */}
      <div className="profile-top-controls">
        <div className="demo-loader-box">
          {profile && (
            <button
              type="button"
              className="demo-btn"
              onClick={() => populateFromProfile(profile)}
            >
              ⚡ Re-Sync with Career Profile
            </button>
          )}
          {portfolio.published && portfolio.username && (
            <a
              href={`/portfolio/${portfolio.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="public-url-pill"
            >
              🔗 View Live: /portfolio/{portfolio.username}
            </a>
          )}
        </div>

        <div className="wizard-right-actions">
          <button
            type="button"
            className={`secondary-button-sm ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            ✏️ Editor
          </button>
          <button
            type="button"
            className={`secondary-button-sm ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            👁️ Preview
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Portfolio'}
          </button>
        </div>
      </div>

      {status.message && (
        <div className={`form-status-alert ${status.type}`}>
          {status.message}
        </div>
      )}

      {activeTab === 'editor' ? (
        <div className="portfolio-editor-grid">
          {/* Settings & Visibility Sidebar */}
          <div className="panel-card portfolio-settings-panel">
            <div className="panel-header">
              <h3>Portfolio Configuration</h3>
            </div>

            <div className="form-stack">
              <label>Public Username URL *
                <div className="url-prefix-input">
                  <span className="url-prefix">/portfolio/</span>
                  <input
                    value={portfolio.username}
                    onChange={(e) => setPortfolio({ ...portfolio, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="alexjohnson"
                    required
                  />
                </div>
              </label>

              <label>Theme Style
                <select
                  value={portfolio.theme}
                  onChange={(e) => setPortfolio({ ...portfolio, theme: e.target.value })}
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>{t} Theme</option>
                  ))}
                </select>
              </label>

              <label className="checkbox-toggle-row">
                <input
                  type="checkbox"
                  checked={portfolio.published}
                  onChange={(e) => setPortfolio({ ...portfolio, published: e.target.checked })}
                />
                <strong>Publicly Published</strong>
              </label>
              <p className="muted-text">
                When checked, your portfolio is viewable by anyone at <code>/portfolio/{portfolio.username || ':username'}</code>.
              </p>

              <hr className="divider-line" />

              <div className="visibility-toggles-box">
                <h4>Section Visibility</h4>
                <p className="muted-text">Show or hide sections on your public page:</p>
                <div className="toggles-list">
                  {SECTIONS.map((sec) => (
                    <label key={sec.id} className="checkbox-row-styled">
                      <input
                        type="checkbox"
                        checked={portfolio.sectionsVisibility[sec.id] !== false}
                        onChange={() => handleToggleSection(sec.id)}
                      />
                      <span>{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section Content Customization Panel */}
          <div className="panel-card portfolio-content-panel">
            <div className="panel-header">
              <h3>Section Content</h3>
              <span className="muted-text">Fine-tune your public personal website content</span>
            </div>

            <div className="form-stack">
              {/* Hero */}
              <div className="section-block">
                <h4>1. Hero Section</h4>
                <div className="form-grid">
                  <label>Hero Headline
                    <input
                      value={portfolio.hero?.headline || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        hero: { ...portfolio.hero, headline: e.target.value },
                      })}
                      placeholder="e.g. Alex Johnson"
                    />
                  </label>
                  <label>Subheading / Professional Title
                    <input
                      value={portfolio.hero?.subheading || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        hero: { ...portfolio.hero, subheading: e.target.value },
                      })}
                      placeholder="e.g. Full Stack Developer & Open Source Contributor"
                    />
                  </label>
                  <label>Avatar / Photo URL
                    <input
                      value={portfolio.hero?.avatarUrl || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        hero: { ...portfolio.hero, avatarUrl: e.target.value },
                      })}
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </div>

              {/* About */}
              <div className="section-block">
                <h4>2. About Me</h4>
                <textarea
                  rows="4"
                  value={portfolio.about || ''}
                  onChange={(e) => setPortfolio({ ...portfolio, about: e.target.value })}
                  placeholder="Introduce yourself, your passions, and what drives your engineering work..."
                />
              </div>

              {/* Skills */}
              <div className="section-block">
                <h4>3. Skills (Comma-separated)</h4>
                <textarea
                  rows="3"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Express, MongoDB, Git, AWS, Docker"
                />
              </div>

              {/* Contact Details */}
              <div className="section-block">
                <h4>4. Contact Links</h4>
                <div className="form-grid">
                  <label>Contact Email
                    <input
                      type="email"
                      value={portfolio.contact?.email || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, email: e.target.value },
                      })}
                      placeholder="you@example.com"
                    />
                  </label>
                  <label>Phone
                    <input
                      value={portfolio.contact?.phone || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, phone: e.target.value },
                      })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </label>
                  <label>Location
                    <input
                      value={portfolio.contact?.location || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, location: e.target.value },
                      })}
                      placeholder="San Francisco, CA"
                    />
                  </label>
                  <label>GitHub URL
                    <input
                      value={portfolio.contact?.github || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, github: e.target.value },
                      })}
                      placeholder="https://github.com/..."
                    />
                  </label>
                  <label>LinkedIn URL
                    <input
                      value={portfolio.contact?.linkedin || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, linkedin: e.target.value },
                      })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </label>
                  <label>Website URL
                    <input
                      value={portfolio.contact?.website || ''}
                      onChange={(e) => setPortfolio({
                        ...portfolio,
                        contact: { ...portfolio.contact, website: e.target.value },
                      })}
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </div>

              {/* Summary of Experience & Projects */}
              <div className="section-block">
                <h4>5. Featured Projects & Experience</h4>
                <p className="muted-text">
                  Projects ({portfolio.projects?.length || 0}) and Experience entries ({portfolio.experience?.length || 0}) are automatically pulled from your Career Profile. Edit them directly in the My Profile tab.
                </p>
                <div className="preview-items-row">
                  {(portfolio.projects || []).slice(0, 3).map((p, i) => (
                    <span key={i} className="skill-chip">{p.name || 'Project'}</span>
                  ))}
                  {(portfolio.projects?.length || 0) > 3 && (
                    <span className="muted-text">+{portfolio.projects.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIVE PREVIEW CONTAINER */
        <div className="panel-card portfolio-live-preview-box">
          <div className="preview-top-bar">
            <span>Theme: <strong>{portfolio.theme}</strong></span>
            <span>URL: <code>/portfolio/{portfolio.username || ':username'}</code></span>
            <span>Status: <strong className={portfolio.published ? 'status-live' : 'status-draft'}>{portfolio.published ? 'Live' : 'Draft'}</strong></span>
          </div>

          <div className={`portfolio-preview-inner theme-${portfolio.theme.toLowerCase()}`}>
            <header className="portfolio-hero-preview">
              {portfolio.hero?.avatarUrl && (
                <img src={portfolio.hero.avatarUrl} alt="Avatar" className="portfolio-avatar-sm" />
              )}
              <h2>{portfolio.hero?.headline || 'Your Name'}</h2>
              <p className="muted-text">{portfolio.hero?.subheading || 'Professional Title'}</p>
            </header>

            {portfolio.sectionsVisibility.about !== false && portfolio.about && (
              <section className="preview-section">
                <h3>About Me</h3>
                <p>{portfolio.about}</p>
              </section>
            )}

            {portfolio.sectionsVisibility.skills !== false && skillsString && (
              <section className="preview-section">
                <h3>Skills</h3>
                <div className="skills-badge-grid">
                  {skillsString.split(',').map((s) => s.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="skill-chip">{skill}</span>
                  ))}
                </div>
              </section>
            )}

            {portfolio.sectionsVisibility.projects !== false && (portfolio.projects || []).length > 0 && (
              <section className="preview-section">
                <h3>Featured Projects</h3>
                <div className="portfolio-grid">
                  {portfolio.projects.map((proj, idx) => (
                    <div key={idx} className="portfolio-card compact">
                      <h4>{proj.name}</h4>
                      <p>{proj.description}</p>
                      {proj.technologies && <small className="muted-text">{proj.technologies}</small>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
