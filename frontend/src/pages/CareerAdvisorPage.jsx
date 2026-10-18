import { useEffect, useState } from 'react';
import api from '../services/api';

const PRESET_QUESTIONS = [
  'What career suits my skills?',
  'What should I learn next?',
  'Am I ready for a full stack developer role?',
  'How can I improve my resume?',
  'What projects should I build?',
  'Which technologies should I learn?',
];

const CareerAdvisorPage = () => {
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'recommendations'
  const [profile, setProfile] = useState(null);

  // Advisor State
  const [question, setQuestion] = useState(PRESET_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [adviceResult, setAdviceResult] = useState(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // Recommendation Engine State
  const [recommendations, setRecommendations] = useState(null);
  const [recLoading, setRecLoading] = useState(false);

  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.profile) {
          setProfile(response.data.profile);
        }
      } catch (err) {
        console.error('Failed to load profile for career guidance:', err);
      }
    };

    fetchProfile();
  }, []);

  // Ask AI Advisor
  const handleAskAdvisor = async (queryToAsk) => {
    const query = queryToAsk || customQuestion.trim() || question;
    if (!query) return;

    setAdvisorLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/career/advice', {
        question: query,
        profile,
      });

      setAdviceResult(response.data.advice);
      if (customQuestion.trim()) setCustomQuestion('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to generate career advice.' });
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Run Recommendation Engine
  const handleGenerateRecommendations = async () => {
    setRecLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/career/recommend', { profile });
      setRecommendations(response.data);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to generate career recommendations.' });
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="career-ai-layout">
      {/* Tab Switcher */}
      <div className="profile-top-controls">
        <div className="tab-pill-group">
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'advisor' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisor')}
          >
            💡 AI Career Advisor
          </button>
          <button
            type="button"
            className={`tab-pill-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('recommendations');
              if (!recommendations) handleGenerateRecommendations();
            }}
          >
            🚀 Role Compatibility Engine
          </button>
        </div>

        {profile && (
          <span className="muted-text">
            Context: {profile.fullName || 'Candidate'} ({profile.technicalSkills?.length || 0} skills)
          </span>
        )}
      </div>

      {status.message && (
        <div className={`form-status-alert ${status.type}`}>
          {status.message}
        </div>
      )}

      {/* TAB 1: AI Career Advisor */}
      {activeTab === 'advisor' && (
        <div className="page-grid">
          {/* Question Selector Panel */}
          <div className="panel-card advisor-input-panel">
            <div className="panel-header">
              <h3>Ask Your AI Career Advisor</h3>
              <span className="ai-tag">Profile Context Aware</span>
            </div>

            <div className="form-stack">
              <label>Select a Common Question
                <select
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                >
                  {PRESET_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="secondary-button full-width"
                onClick={() => handleAskAdvisor(question)}
                disabled={advisorLoading}
              >
                Ask Selected Question
              </button>

              <div className="or-divider"><span>OR ASK A CUSTOM QUESTION</span></div>

              <label>Custom Career Query
                <textarea
                  rows="3"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. How can I transition from Frontend to Full Stack in 3 months?"
                />
              </label>

              <button
                type="button"
                className="primary-button full-width cta-btn"
                onClick={() => handleAskAdvisor(customQuestion)}
                disabled={advisorLoading || !customQuestion.trim()}
              >
                {advisorLoading ? '⚡ Consulting AI Advisor...' : '✨ Ask Custom Question'}
              </button>
            </div>
          </div>

          {/* Advice Output Panel */}
          <div className="panel-card advisor-output-panel">
            <div className="panel-header">
              <h3>Personalized Guidance</h3>
              {adviceResult && <span className="badge-pill">AI Advice Ready</span>}
            </div>

            {!adviceResult ? (
              <div className="empty-state-large">
                <span className="empty-state-icon">💡</span>
                <h4>Your Career Advisor is Ready</h4>
                <p>Choose any common career question or ask a custom question to receive tailored career guidance based on your profile.</p>
              </div>
            ) : (
              <div className="advice-results-content">
                {adviceResult.message && (
                  <div className="advice-lead-box">
                    <p>{adviceResult.message}</p>
                  </div>
                )}

                {/* Suitable Roles */}
                {adviceResult.suitableRoles?.length > 0 && (
                  <div className="advice-block">
                    <h4>🎯 Suitable Roles</h4>
                    <div className="tag-pills-row">
                      {adviceResult.suitableRoles.map((role) => (
                        <span key={role} className="role-tag-pill">{role}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Priorities */}
                {adviceResult.learningPriorities?.length > 0 && (
                  <div className="advice-block">
                    <h4>📚 Learning Priorities</h4>
                    <ul className="bullet-checklist">
                      {adviceResult.learningPriorities.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Project Recommendations */}
                {adviceResult.projectRecommendations?.length > 0 && (
                  <div className="advice-block">
                    <h4>🛠️ Recommended Projects to Build</h4>
                    <ul className="bullet-checklist">
                      {adviceResult.projectRecommendations.map((proj, i) => (
                        <li key={i}>{proj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resume Recommendations */}
                {adviceResult.resumeRecommendations?.length > 0 && (
                  <div className="advice-block">
                    <h4>📄 Resume Optimization Recommendations</h4>
                    <ul className="bullet-checklist">
                      {adviceResult.resumeRecommendations.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interview Preparation Topics */}
                {adviceResult.interviewPreparation?.length > 0 && (
                  <div className="advice-block">
                    <h4>🎤 Interview Preparation Topics</h4>
                    <ul className="bullet-checklist">
                      {adviceResult.interviewPreparation.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Career Recommendation Engine */}
      {activeTab === 'recommendations' && (
        <div className="panel-card wide recommendations-container">
          <div className="panel-header">
            <div>
              <h3>Role Compatibility Engine</h3>
              <p className="muted-text">
                Evaluates your skills, projects, and work experience against industry standard developer roles.
              </p>
            </div>
            <button
              type="button"
              className="primary-button-sm"
              onClick={handleGenerateRecommendations}
              disabled={recLoading}
            >
              {recLoading ? '⚡ Calculating...' : '🔄 Refresh Compatibility'}
            </button>
          </div>

          <div className="disclaimer-alert">
            ℹ️ <strong>Disclaimer:</strong> {recommendations?.disclaimer || 'Compatibility percentages are AI-generated estimates based on skills and profile heuristics, not guaranteed predictions.'}
          </div>

          {!recommendations?.roles ? (
            <div className="empty-state-large">
              <span className="empty-state-icon">🚀</span>
              <h4>Analyzing Role Compatibility...</h4>
              <p>Evaluating your profile skills, experience, and projects.</p>
            </div>
          ) : (
            <div className="roles-compatibility-grid">
              {recommendations.roles.map((r) => (
                <div key={r.role} className="role-compat-card">
                  <div className="compat-card-header">
                    <div>
                      <h4>{r.role}</h4>
                      <span className="compat-percent">{r.compatibility}% Compatibility</span>
                    </div>
                    <div className="compat-radial-mini">
                      <span>{r.compatibility}%</span>
                    </div>
                  </div>

                  <div className="compat-bar-track">
                    <div className="compat-bar-fill" style={{ width: `${r.compatibility}%` }} />
                  </div>

                  <p className="compat-why"><strong>Why it matches:</strong> {r.why}</p>

                  <div className="compat-skills-split">
                    <div className="strengths-box">
                      <h6>Existing Strengths</h6>
                      <div className="skill-pills-row">
                        {(r.strengths || []).map((s) => (
                          <span key={s} className="skill-pill-green">{s} ✓</span>
                        ))}
                      </div>
                    </div>

                    <div className="missing-skills-box">
                      <h6>Skills to Develop</h6>
                      <div className="skill-pills-row">
                        {(r.missingSkills || []).map((s) => (
                          <span key={s} className="skill-pill-amber">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {r.recommendedNextSteps?.length > 0 && (
                    <div className="next-steps-box">
                      <h6>Recommended Next Steps:</h6>
                      <ul>
                        {r.recommendedNextSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerAdvisorPage;
