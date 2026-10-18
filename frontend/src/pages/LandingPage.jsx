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
  {
    title: 'Career Advisor',
    icon: '💡',
    desc: 'Interact with AI career guidance to uncover your ideal career trajectory, project ideas, and interview strategies.',
  },
  {
    title: 'Skill Gap Analyzer',
    icon: '🔍',
    desc: 'Map your skills against target roles, identify gaps, and follow a 5-priority personalized learning roadmap.',
  },
];

const howSteps = [
  {
    step: '01',
    title: 'Create Your Profile Once',
    desc: 'Input your education, experience, projects, and skills. The platform reuses your data across all AI tools.',
  },
  {
    step: '02',
    title: 'Generate ATS Resumes & Letters',
    desc: 'Produce keyword-dense, ATS-optimized resumes and personalized cover letters in one click.',
  },
  {
    step: '03',
    title: 'Analyze & Score Against Job Postings',
    desc: 'Paste any job description to view matched keywords, missing competencies, and your optimization score.',
  },
  {
    step: '04',
    title: 'Launch Your Portfolio & Career Path',
    desc: 'Publish your responsive portfolio website and follow tailored learning roadmaps to land your dream job.',
  },
];

const LandingPage = () => {
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
        {/* Hero Section */}
        <section className="hero-section container">
          <div className="hero-copy">
            <p className="eyebrow">CAREERFORGE AI</p>
            <h1>Build a Resume That Gets Noticed.</h1>
            <p className="hero-subtitle">
              Create ATS-friendly resumes, personalized cover letters, professional portfolios and AI-powered career plans from one intelligent platform.
            </p>
            <div className="cta-row">
              <Link to="/register" className="primary-button cta-main">Build My Resume</Link>
              <a href="#features" className="secondary-button">Explore Features</a>
            </div>
            <div className="hero-social-proof">
              <span>✓ MERN Architecture</span>
              <span>✓ 100% Deterministic ATS Scoring</span>
              <span>✓ Instant Demo Profile</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="CareerForge AI Visual Dashboard">
            <div className="visual-orb orb-one" />
            <div className="visual-orb orb-two" />
            
            <div className="visual-card card-main">
              <div className="mini-tag">ATS Optimization Score</div>
              <div className="mini-score">87 / 100</div>
              <div className="score-badge-pill">✓ Top 10% ATS Ready</div>
              <div className="bar-group">
                <span style={{ width: '87%' }} />
              </div>
              <div className="mini-metric-row">
                <span>Keyword Match: 28/30</span>
                <span>Skills: 17/20</span>
              </div>
            </div>

            <div className="visual-card card-side">
              <p className="card-side-title">Matched Role Competencies</p>
              <div className="matched-tags-mini">
                <span className="tag-pill">React.js ✓</span>
                <span className="tag-pill">Node.js ✓</span>
                <span className="tag-pill">MongoDB ✓</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Problem */}
        <section className="problem-section container">
          <div className="section-heading">
            <p className="eyebrow">The Challenge</p>
            <h2>Job seekers lose momentum when resumes are not optimized for ATS.</h2>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <span className="problem-icon">❌</span>
              <h3>75% of Resumes Never Reach Humans</h3>
              <p>Applicant Tracking Systems automatically discard unqualified or improperly formatted resumes before a recruiter ever sees them.</p>
            </div>
            <div className="problem-card">
              <span className="problem-icon">⚠️</span>
              <h3>Keyword & Skills Disconnect</h3>
              <p>Candidates struggle to extract and align exact keywords, action verbs, and quantifiable metrics required by target job descriptions.</p>
            </div>
            <div className="problem-card">
              <span className="problem-icon">⏳</span>
              <h3>Fragmented Career Document Preparation</h3>
              <p>Juggling disparate tools for resumes, cover letters, websites, and interview prep wastes critical hours during job searches.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Solution */}
        <section className="solution-section container">
          <div className="solution-panel">
            <div className="solution-copy">
              <p className="eyebrow">The Solution</p>
              <h2>One Intelligent Platform for Your Entire Job Search</h2>
              <p>
                CareerForge AI brings your career profile into a unified ecosystem. Input your experience once, and instantly generate optimized resumes, matching cover letters, live portfolios, and learning roadmaps tailored to each job application.
              </p>
              <ul className="solution-checklist">
                <li>✓ Unified career data source — enter your profile details once</li>
                <li>✓ Guaranteed factual integrity — zero hallucinated credentials</li>
                <li>✓ Deterministic ATS scoring engine with multi-factor breakdown</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Features */}
        <section id="features" className="features-section container">
          <div className="section-heading">
            <p className="eyebrow">Platform Capabilities</p>
            <h2>Everything you need to compete effectively in the job market</h2>
          </div>
          <div className="feature-grid">
            {featureCards.map((feat) => (
              <div key={feat.title} className="feature-card">
                <div className="feature-icon">{feat.icon}</div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: How It Works */}
        <section className="steps-section container">
          <div className="section-heading">
            <p className="eyebrow">The Workflow</p>
            <h2>A seamless journey from career profile to interview invites</h2>
          </div>
          <div className="steps-grid">
            {howSteps.map((item) => (
              <div key={item.step} className="step-card">
                <span className="step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: ATS Optimization */}
        <section className="ats-deepdive-section container">
          <div className="section-split">
            <div className="split-text">
              <p className="eyebrow">Deep ATS Engineering</p>
              <h2>Deterministic Scoring, Zero Guesswork</h2>
              <p>
                Unlike generic AI tools that invent random scores, CareerForge AI utilizes a rigorous 100-point deterministic evaluation engine built on real ATS scanning heuristics.
              </p>
              <div className="ats-breakdown-preview">
                <div className="ats-preview-bar"><span>Keyword Match</span><strong>30 pts</strong></div>
                <div className="ats-preview-bar"><span>Skills Coverage</span><strong>20 pts</strong></div>
                <div className="ats-preview-bar"><span>Structure & Hierarchy</span><strong>15 pts</strong></div>
                <div className="ats-preview-bar"><span>Action Verbs</span><strong>10 pts</strong></div>
                <div className="ats-preview-bar"><span>Quantified Achievements</span><strong>10 pts</strong></div>
                <div className="ats-preview-bar"><span>Formatting & Length</span><strong>10 pts</strong></div>
                <div className="ats-preview-bar"><span>Contact Accessibility</span><strong>5 pts</strong></div>
              </div>
            </div>
            <div className="split-visual">
              <div className="code-card">
                <div className="code-header">ATS Diagnostic Engine</div>
                <pre>{`{
  "estimatedScore": 87,
  "matchedSkills": ["JavaScript ✓", "React ✓", "Node.js ✓", "MongoDB ✓"],
  "missingSkills": ["Docker", "AWS"],
  "keywordCoverage": "85%",
  "verdict": "ATS Ready"
}`}</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: AI Career Guidance */}
        <section className="guidance-section container">
          <div className="section-heading">
            <p className="eyebrow">AI Career Guidance</p>
            <h2>Uncover Your Career Trajectory & Close Skill Gaps</h2>
          </div>
          <div className="guidance-grid">
            <div className="guidance-card">
              <h3>Role Compatibility Engine</h3>
              <p>Compare your qualifications against top software developer titles and discover compatibility percentages with strengths and next steps.</p>
            </div>
            <div className="guidance-card">
              <h3>Targeted Skill Gap Analysis</h3>
              <p>Classify competencies into Strong, Moderate, and Missing categories and follow structured, priority-ranked learning roadmaps.</p>
            </div>
            <div className="guidance-card">
              <h3>Interactive AI Career Advisor</h3>
              <p>Consult with an intelligent assistant on portfolio projects, interview readiness, and resume wording improvements.</p>
            </div>
          </div>
        </section>

        {/* Section 7: Portfolio Generation */}
        <section className="portfolio-showcase-section container">
          <div className="section-split reverse">
            <div className="split-text">
              <p className="eyebrow">Web Presence</p>
              <h2>Instant, Hostable Portfolio Websites</h2>
              <p>
                Turn your career profile into a modern personal website with one click. Choose from Minimal, Modern, and Professional themes, toggle sections on or off, and share your personal URL: <code>/portfolio/:username</code>.
              </p>
              <div className="theme-pills">
                <span className="theme-pill active">Modern Theme</span>
                <span className="theme-pill">Minimal Theme</span>
                <span className="theme-pill">Professional Theme</span>
              </div>
            </div>
            <div className="split-visual">
              <div className="portfolio-mockup">
                <div className="mockup-header">
                  <span className="mockup-dot" />
                  <span className="mockup-dot" />
                  <span className="mockup-dot" />
                  <span className="mockup-url">careerforge.ai/portfolio/alexjohnson</span>
                </div>
                <div className="mockup-body">
                  <h4>Alex Johnson</h4>
                  <p className="mockup-sub">Full Stack Developer • San Francisco, CA</p>
                  <div className="mockup-tags">
                    <span>React</span><span>Node.js</span><span>Express</span><span>MongoDB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Call To Action */}
        <section className="cta-panel container">
          <div className="cta-content">
            <h2>Ready to Build a Career That Gets Noticed?</h2>
            <p>Join students and job seekers using CareerForge AI to land interviews faster.</p>
          </div>
          <Link to="/register" className="primary-button cta-large">Get Started Now</Link>
        </section>
      </main>

      {/* Section 9: Footer */}
      <footer className="landing-footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="logo-badge">CF</span>
              <span>CareerForge AI</span>
            </div>
            <p>Full-Stack MERN + AI Career Acceleration Platform</p>
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
