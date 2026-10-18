import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [atsReports, setAtsReports] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [profRes, resRes, atsRes, clRes, portRes] = await Promise.all([
          api.get('/profile').catch(() => ({ data: {} })),
          api.get('/resumes').catch(() => ({ data: {} })),
          api.get('/ats').catch(() => ({ data: {} })),
          api.get('/cover-letter').catch(() => ({ data: {} })),
          api.get('/portfolio').catch(() => ({ data: {} })),
        ]);

        setProfile(profRes.data?.profile || null);
        setResumes(resRes.data?.resumes || []);
        setAtsReports(atsRes.data?.reports || []);
        setCoverLetters(clRes.data?.coverLetters || []);
        setPortfolio(portRes.data?.portfolio || null);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    const checks = [
      profile.fullName?.trim(),
      profile.professionalTitle?.trim(),
      profile.email?.trim(),
      profile.summary?.trim(),
      Array.isArray(profile.education) && profile.education.length > 0,
      Array.isArray(profile.experience) && profile.experience.length > 0,
      Array.isArray(profile.projects) && profile.projects.length > 0,
      Array.isArray(profile.technicalSkills) && profile.technicalSkills.length > 0,
      Array.isArray(profile.certifications) && profile.certifications.length > 0,
      profile.targetRole || profile.targetRoles?.[0],
    ];

    checks.forEach((item) => {
      if (item) score += 10;
    });

    return Math.min(100, score);
  };

  const profileCompletionPercent = calculateProfileCompletion();
  const latestAtsScore = atsReports[0]?.overallScore ?? (resumes[0]?.atsScore || null);
  const totalDocumentsCreated = resumes.length + coverLetters.length + atsReports.length + (portfolio ? 1 : 0);
  const skillsCount = profile?.technicalSkills?.length || 0;

  // Build Recent Documents list from actual MongoDB data
  const recentDocs = [
    ...resumes.map((r) => ({ id: r._id, title: r.title || 'Resume', type: 'Resume', path: '/resume-builder', date: r.createdAt })),
    ...coverLetters.map((c) => ({ id: c._id, title: `${c.company} - ${c.jobTitle}`, type: 'Cover Letter', path: '/cover-letter', date: c.createdAt })),
    ...atsReports.map((a) => ({ id: a._id, title: `ATS Report: ${a.overallScore}/100`, type: 'ATS Report', path: '/ats-analyzer', date: a.createdAt })),
    ...(portfolio ? [{ id: portfolio._id, title: `Portfolio: @${portfolio.username}`, type: 'Portfolio', path: '/portfolio', date: portfolio.updatedAt }] : []),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Generate personalized AI recommendations based on user's real state
  const aiRecommendations = [];
  if (profileCompletionPercent < 70) {
    aiRecommendations.push('Complete your profile with education and project details to unlock 1-click tailored resume generation.');
  }
  if (resumes.length === 0) {
    aiRecommendations.push('Generate your first ATS-optimized resume using your career profile data.');
  } else if (!latestAtsScore || latestAtsScore < 80) {
    aiRecommendations.push('Upload your resume to the ATS Analyzer to identify missing keywords and boost your score above 85.');
  }
  if (!portfolio || !portfolio.published) {
    aiRecommendations.push('Build and publish your personal portfolio website to showcase your live projects to recruiters.');
  }
  if (skillsCount < 6) {
    aiRecommendations.push('Explore the Skill Gap Analyzer to discover trending technical competencies for your target role.');
  }
  if (coverLetters.length === 0) {
    aiRecommendations.push('Generate a tailored, persuasive cover letter targeting your next job application.');
  }

  const stats = [
    { label: 'Profile Completion', value: `${profileCompletionPercent}%`, hint: `${profileCompletionPercent}/100 points` },
    { label: 'ATS Score', value: latestAtsScore !== null ? `${latestAtsScore} / 100` : '—', hint: latestAtsScore !== null ? 'Latest ATS analysis' : 'Run ATS analysis' },
    { label: 'Resumes Created', value: String(resumes.length), hint: `${resumes.length} saved versions` },
    { label: 'Skills Added', value: String(skillsCount), hint: 'Verified skills' },
    { label: 'Documents Created', value: String(totalDocumentsCreated), hint: 'Total documents' },
  ];

  return (
    <div className="dashboard-page">
      {/* Statistics Row */}
      <div className="stat-grid five-col">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions Row */}
      <div className="dashboard-section-panel">
        <div className="panel-header">
          <h3>Quick Actions</h3>
          <span className="muted-text">Launch your primary career tools</span>
        </div>
        <div className="quick-action-grid">
          <Link to="/resume-builder" className="quick-action-card">
            <span className="action-icon">📄</span>
            <div>
              <strong>Create Resume</strong>
              <p>ATS-optimized formatting</p>
            </div>
          </Link>
          <Link to="/ats-analyzer" className="quick-action-card">
            <span className="action-icon">🎯</span>
            <div>
              <strong>Analyze Resume</strong>
              <p>Score against job descriptions</p>
            </div>
          </Link>
          <Link to="/cover-letter" className="quick-action-card">
            <span className="action-icon">✉️</span>
            <div>
              <strong>Generate Cover Letter</strong>
              <p>Personalized tone & facts</p>
            </div>
          </Link>
          <Link to="/portfolio" className="quick-action-card">
            <span className="action-icon">🌐</span>
            <div>
              <strong>Build Portfolio</strong>
              <p>Instant personal website</p>
            </div>
          </Link>
          <Link to="/career-ai" className="quick-action-card">
            <span className="action-icon">💡</span>
            <div>
              <strong>Get Career Advice</strong>
              <p>AI recommendations & readiness</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Profile Completion & AI Recommendations Grid */}
      <div className="dashboard-grid">
        {/* Profile Completion Card */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>Profile Completion Progress</h3>
            <span className="badge-pill">{profileCompletionPercent}% Complete</span>
          </div>
          <div className="progress-bar-large">
            <span style={{ width: `${profileCompletionPercent}%` }} />
          </div>
          <p className="muted-text" style={{ marginTop: '12px' }}>
            A completed profile allows CareerForge AI to automatically generate factually accurate resumes, portfolios, and letters.
          </p>
          <div className="completion-checklist">
            <div className={`check-item ${profile?.fullName ? 'checked' : ''}`}>
              <span>{profile?.fullName ? '✓' : '○'}</span> Personal Information
            </div>
            <div className={`check-item ${profile?.summary ? 'checked' : ''}`}>
              <span>{profile?.summary ? '✓' : '○'}</span> Professional Summary
            </div>
            <div className={`check-item ${profile?.education?.length ? 'checked' : ''}`}>
              <span>{profile?.education?.length ? '✓' : '○'}</span> Education History
            </div>
            <div className={`check-item ${profile?.experience?.length ? 'checked' : ''}`}>
              <span>{profile?.experience?.length ? '✓' : '○'}</span> Work Experience
            </div>
            <div className={`check-item ${profile?.projects?.length ? 'checked' : ''}`}>
              <span>{profile?.projects?.length ? '✓' : '○'}</span> Technical Projects
            </div>
            <div className={`check-item ${profile?.technicalSkills?.length ? 'checked' : ''}`}>
              <span>{profile?.technicalSkills?.length ? '✓' : '○'}</span> Skills & Tools
            </div>
          </div>
          <div style={{ marginTop: '18px' }}>
            <button className="primary-button full-width" onClick={() => navigate('/profile')}>
              {profileCompletionPercent === 100 ? 'Edit Profile' : 'Complete Profile Now'}
            </button>
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="panel-card">
          <div className="panel-header">
            <h3>AI Recommendations</h3>
            <span className="ai-tag">AI Guided</span>
          </div>
          <div className="recommendations-box clean">
            <ul className="doc-list interactive">
              {aiRecommendations.map((rec, i) => (
                <li key={i} className="rec-item">
                  <span className="rec-bullet">✦</span>
                  <p>{rec}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="panel-card wide" style={{ marginTop: '22px' }}>
        <div className="panel-header">
          <h3>Recent Documents</h3>
          <Link to="/saved-documents" className="link-button">View All ({totalDocumentsCreated})</Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="empty-state">
            <p>No career documents created yet.</p>
            <Link to="/resume-builder" className="primary-button" style={{ marginTop: '12px' }}>
              Create Your First Resume
            </Link>
          </div>
        ) : (
          <div className="recent-docs-table">
            {recentDocs.map((doc) => (
              <div key={`${doc.type}-${doc.id}`} className="recent-doc-row">
                <div className="doc-info">
                  <span className={`doc-tag ${doc.type.toLowerCase().replace(/\s+/g, '-')}`}>{doc.type}</span>
                  <strong>{doc.title}</strong>
                </div>
                <div className="doc-meta">
                  <span className="doc-date">{new Date(doc.date).toLocaleDateString()}</span>
                  <Link to={doc.path} className="secondary-button-sm">Open</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
