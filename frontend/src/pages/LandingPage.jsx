import { Link } from 'react-router-dom';

const featureCards = [
  {
    title: 'AI Resume Builder',
    icon: '📄',
    desc: 'Craft ATS-compliant resumes with verified profile facts, enhanced action verbs, and tailored keywords.',
  },
  {
    title: 'ATS Analyzer',
    icon: '🎯',
    desc: 'Evaluate your resume with deterministic scoring across 7 critical dimensions with actionable recommendations.',
  },
  {
    title: 'Cover Letter Generator',
    icon: '✉️',
    desc: 'Produce persuasive, tone-matched cover letters highlighting your genuine technical achievements.',
  },
  {
    title: 'Portfolio Builder',
    icon: '🌐',
    desc: 'Auto-generate a personal portfolio website with Minimal, Modern, or Professional themes.',
  },
  // Additional features are retained in the codebase but omitted from the minimal homepage.
];

const LandingPage = () => {
  // Minimal homepage redesign according to premium dark theme
  const minimalFeatureCards = featureCards.slice(0, 4); // Show core four features
  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="container nav-wrap">
          <div className="brand-logo">
            <span className="logo-badge">CF</span>
            <span>CareerForge AI</span>
          </div>
          <div className="header-actions">
            <Link to="/login" className="link-button">Login</Link>
            <Link to="/register" className="primary-button">Get Started Free</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Minimal */}
        <section className="hero-section container">
          <div className="hero-copy">
            <p className="eyebrow">AI-POWERED CAREER TOOLS</p>
            <h1>Your Career. Your Next Move.</h1>
            <p className="hero-subtitle">Build resumes, optimize for ATS, and plan your career with AI.</p>
            <div className="cta-row">
              <Link to="/register" className="primary-button cta-main">Build My Resume</Link>
              <a href="#features" className="secondary-button">Explore Features</a>
            </div>
          </div>
          {/* Sample product preview – simple demo card */}
          <div className="hero-visual">
            <div className="visual-card card-main">
              <div className="mini-tag">Sample ATS Score</div>
              <div className="mini-score">87 / 100</div>
              <div className="score-badge-pill">✓ Top 10% ATS Ready</div>
              <div className="bar-group"><span style={{ width: '87%' }} /></div>
              <div className="mini-metric-row">
                <span>Keyword Match: 28/30</span>
                <span>Skills: 17/20</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section – core four */}
        <section id="features" className="features-section container">
          <div className="section-heading">
            <p className="eyebrow">Platform Capabilities</p>
            <h2>Core Tools</h2>
          </div>
          <div className="feature-grid">
            {minimalFeatureCards.map((feat) => (
              <div key={feat.title} className="feature-card">
                <div className="feature-icon" aria-hidden="true">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final Call‑to‑Action */}
        <section className="cta-panel container">
          <h2>Ready to Build a Career That Gets Noticed?</h2>
          <p>Create your career profile today.</p>
          <Link to="/register" className="primary-button cta-large">Get Started</Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="logo-badge">CF</span>
              <span>CareerForge AI</span>
            </div>
            <p>Full‑Stack MERN + AI Career Acceleration Platform</p>
          </div>
          <div className="footer-links">
            <div>
              <strong>Tools</strong>
              <Link to="/resume-builder">Resume Builder</Link>
              <Link to="/ats-analyzer">ATS Analyzer</Link>
              <Link to="/cover-letter">Cover Letter</Link>
              <Link to="/portfolio">Portfolio</Link>
            </div>
            <div>
              <strong>Career AI</strong>
              <Link to="/career-ai">Career Advisor</Link>
              <Link to="/skill-gap">Skill Gap</Link>
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>© 2026 CareerForge AI. All rights reserved. Built with MongoDB, Express, React, Node.js.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
