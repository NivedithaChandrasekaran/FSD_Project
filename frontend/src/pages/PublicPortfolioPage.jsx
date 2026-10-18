import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PublicPortfolioPage = () => {
  const { username } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`/api/portfolio/public/${username}`);
        if (response.data.portfolio) {
          setPortfolio(response.data.portfolio);
        } else {
          setError('Portfolio not found or not currently published.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Portfolio not found or not published.');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPortfolio();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="portfolio-loading-screen">
        <div className="spinner" />
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="portfolio-error-screen">
        <h2>Portfolio Unavailable</h2>
        <p>{error || 'This user has not published their portfolio yet.'}</p>
        <Link to="/" className="primary-button">Visit CareerForge AI</Link>
      </div>
    );
  }

  const {
    theme = 'Modern',
    hero = {},
    about = '',
    skills = [],
    experience = [],
    projects = [],
    education = [],
    certifications = [],
    achievements = [],
    contact = {},
    sectionsVisibility = {},
  } = portfolio;

  const isVisible = (section) => sectionsVisibility[section] !== false;

  return (
    <div className={`portfolio-container theme-${theme.toLowerCase()}`}>
      <nav className="portfolio-nav">
        <div className="nav-brand">{hero.headline || username}</div>
        <div className="nav-links-public">
          {isVisible('about') && about && <a href="#about">About</a>}
          {isVisible('skills') && skills.length > 0 && <a href="#skills">Skills</a>}
          {isVisible('projects') && projects.length > 0 && <a href="#projects">Projects</a>}
          {isVisible('experience') && experience.length > 0 && <a href="#experience">Experience</a>}
          {isVisible('education') && education.length > 0 && <a href="#education">Education</a>}
          {isVisible('contact') && <a href="#contact">Contact</a>}
        </div>
      </nav>

      {/* Hero Section */}
      {isVisible('hero') && (
        <header className="portfolio-hero">
          <div className="hero-content">
            {hero.avatarUrl && (
              <img src={hero.avatarUrl} alt={hero.headline || username} className="portfolio-avatar" />
            )}
            <h1 className="hero-headline">{hero.headline || username}</h1>
            <p className="hero-subheading">{hero.subheading || 'Professional Portfolio'}</p>
            <div className="hero-social-links">
              {contact.github && (
                <a href={contact.github} target="_blank" rel="noopener noreferrer" className="social-pill">
                  GitHub
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="social-pill">
                  LinkedIn
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="social-pill">
                  Email
                </a>
              )}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="social-pill">
                  Website
                </a>
              )}
            </div>
          </div>
        </header>
      )}

      {/* About Section */}
      {isVisible('about') && about && (
        <section id="about" className="portfolio-section">
          <h2 className="section-title">About Me</h2>
          <p className="about-text">{about}</p>
        </section>
      )}

      {/* Skills Section */}
      {isVisible('skills') && skills.length > 0 && (
        <section id="skills" className="portfolio-section">
          <h2 className="section-title">Skills & Technologies</h2>
          <div className="skills-badge-grid">
            {skills.map((skill, index) => (
              <span key={index} className="skill-chip">
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {isVisible('projects') && projects.length > 0 && (
        <section id="projects" className="portfolio-section">
          <h2 className="section-title">Featured Projects</h2>
          <div className="portfolio-grid">
            {projects.map((proj, idx) => (
              <div key={idx} className="portfolio-card">
                <h3>{proj.name || 'Project'}</h3>
                <p className="project-desc">{proj.description}</p>
                {proj.technologies && (
                  <p className="project-tech"><strong>Stack:</strong> {proj.technologies}</p>
                )}
                {proj.contributions && (
                  <p className="project-contributions"><strong>Impact:</strong> {proj.contributions}</p>
                )}
                <div className="project-links">
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="pill-link">
                      Source Code
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="pill-link primary">
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {isVisible('experience') && experience.length > 0 && (
        <section id="experience" className="portfolio-section">
          <h2 className="section-title">Work Experience</h2>
          <div className="timeline-list">
            {experience.map((exp, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-header">
                  <h3>{exp.title}</h3>
                  <span className="timeline-company">{exp.company}</span>
                  <span className="timeline-dates">
                    {exp.startDate} - {exp.endDate || 'Present'} {exp.location && `• ${exp.location}`}
                  </span>
                </div>
                {exp.description && <p className="timeline-desc">{exp.description}</p>}
                {exp.achievements && <p className="timeline-achievements"><strong>Key Achievements:</strong> {exp.achievements}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {isVisible('education') && education.length > 0 && (
        <section id="education" className="portfolio-section">
          <h2 className="section-title">Education</h2>
          <div className="timeline-list">
            {education.map((edu, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-header">
                  <h3>{edu.degree}</h3>
                  <span className="timeline-company">{edu.institution}</span>
                  <span className="timeline-dates">{edu.startYear} - {edu.endYear} {edu.score && `• ${edu.score}`}</span>
                </div>
                {edu.coursework && <p className="timeline-desc"><strong>Coursework:</strong> {edu.coursework}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications Section */}
      {isVisible('certifications') && certifications.length > 0 && (
        <section id="certifications" className="portfolio-section">
          <h2 className="section-title">Certifications</h2>
          <div className="portfolio-grid">
            {certifications.map((cert, idx) => (
              <div key={idx} className="portfolio-card compact">
                <h4>{cert.name}</h4>
                <p className="muted-text">{cert.organization} {cert.date && `• ${cert.date}`}</p>
                {cert.credentialUrl && (
                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="pill-link">
                    Verify Credential
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements Section */}
      {isVisible('achievements') && achievements.length > 0 && (
        <section id="achievements" className="portfolio-section">
          <h2 className="section-title">Honors & Achievements</h2>
          <ul className="achievement-bullet-list">
            {achievements.map((item, idx) => (
              <li key={idx}>{typeof item === 'string' ? item : item.name || item.description}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Contact Section */}
      {isVisible('contact') && (
        <section id="contact" className="portfolio-section contact-section">
          <h2 className="section-title">Get in Touch</h2>
          <p className="muted-text">Feel free to reach out directly through any of the channels below.</p>
          <div className="contact-details-grid">
            {contact.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            )}
            {contact.phone && (
              <div className="contact-item">
                <span className="contact-label">Phone:</span>
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.location && (
              <div className="contact-item">
                <span className="contact-label">Location:</span>
                <span>{contact.location}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="portfolio-footer">
        <p>Built with <Link to="/">CareerForge AI</Link> — Professional Career Platform</p>
      </footer>
    </div>
  );
};

export default PublicPortfolioPage;
