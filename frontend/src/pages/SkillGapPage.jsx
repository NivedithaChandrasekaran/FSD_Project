import { useEffect, useState } from 'react';
import api from '../services/api';

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
];

const SkillGapPage = () => {
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.profile) {
          setProfile(response.data.profile);
          if (response.data.profile.targetRole) {
            setTargetRole(response.data.profile.targetRole);
          }
        }
      } catch (err) {
        console.error('Failed to load profile for skill gap analysis:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/career/skill-gap', {
        targetRole,
        profile,
      });

      setAnalysis(response.data.analysis);
      setStatus({ type: 'success', message: `Skill gap analysis generated for ${targetRole}!` });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to analyze skill gaps.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-gap-layout">
      {/* Controls Card */}
      <div className="panel-card wide">
        <div className="panel-header">
          <div>
            <h3>Skill Gap Analyzer</h3>
            <span className="muted-text">Compare your profile competencies against market expectations</span>
          </div>
        </div>

        {status.message && (
          <div className={`form-status-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="form-grid align-end">
          <label>Target Engineering Role
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <div>
            <button
              type="button"
              className="primary-button cta-btn"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '⚡ Analyzing Competencies...' : '🔍 Analyze Skill Gap'}
            </button>
          </div>
        </div>

        {profile && (
          <div className="profile-context-inline">
            <strong>Current Profile Skills ({profile.technicalSkills?.length || 0}):</strong>
            <p className="muted-text">
              {profile.technicalSkills?.length ? profile.technicalSkills.join(', ') : 'No technical skills added yet in My Profile.'}
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="gap-results-container">
          {/* 3-Column Classification: Strong, Moderate, Missing */}
          <div className="skills-classification-grid">
            {/* Strong */}
            <div className="classification-card strong-card">
              <div className="class-card-header">
                <span className="class-badge green">Strong</span>
                <span className="class-count">({analysis.strong?.length || 0})</span>
              </div>
              <p className="class-desc">Skills you possess that directly fulfill core role requirements.</p>
              <div className="skill-tags-list">
                {(analysis.strong || []).map((skill) => (
                  <span key={skill} className="skill-chip-green">{skill} ✓</span>
                ))}
              </div>
            </div>

            {/* Moderate */}
            <div className="classification-card moderate-card">
              <div className="class-card-header">
                <span className="class-badge blue">Moderate</span>
                <span className="class-count">({analysis.moderate?.length || 0})</span>
              </div>
              <p className="class-desc">Transferable skills or related areas you should deepen.</p>
              <div className="skill-tags-list">
                {(analysis.moderate || []).map((skill) => (
                  <span key={skill} className="skill-chip-blue">{skill}</span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div className="classification-card missing-card">
              <div className="class-card-header">
                <span className="class-badge amber">Missing</span>
                <span className="class-count">({analysis.missing?.length || 0})</span>
              </div>
              <p className="class-desc">Key competencies to acquire to maximize your interview conversion.</p>
              <div className="skill-tags-list">
                {(analysis.missing || []).map((skill) => (
                  <span key={skill} className="skill-chip-amber">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Prioritized Learning Roadmap */}
          <div className="panel-card wide learning-roadmap-card">
            <div className="panel-header">
              <h3>Personalized AI Learning Roadmap</h3>
              <span className="badge-pill">Step-by-Step Trajectory</span>
            </div>
            <p className="muted-text">
              Follow this phased curriculum to systematically close skill gaps and qualify for {targetRole} roles:
            </p>

            <div className="roadmap-timeline">
              {(analysis.learningRoadmap || []).map((phase, idx) => (
                <div key={idx} className="roadmap-step-card">
                  <div className="roadmap-step-circle">0{idx + 1}</div>
                  <div className="roadmap-step-content">
                    <p>{phase}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
