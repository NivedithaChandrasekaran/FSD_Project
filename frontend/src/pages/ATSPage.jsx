import { useEffect, useState } from 'react';
import api from '../services/api';

const ATSPage = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if coming from Resume Builder
  useEffect(() => {
    const passedResume = sessionStorage.getItem('ats_resume_text');
    const passedJd = sessionStorage.getItem('ats_job_description');

    if (passedResume) {
      setResumeText(passedResume);
      sessionStorage.removeItem('ats_resume_text');
    }
    if (passedJd) {
      setJobDescription(passedJd);
      sessionStorage.removeItem('ats_job_description');
    }

    const fetchSavedResumes = async () => {
      try {
        const response = await api.get('/resumes');
        if (response.data.resumes) {
          setSavedResumes(response.data.resumes);
        }
      } catch (err) {
        console.error('Failed to load saved resumes:', err);
      }
    };

    fetchSavedResumes();
  }, []);

  // Handle selecting a saved resume
  const handleSelectSavedResume = (resumeId) => {
    setSelectedResumeId(resumeId);
    if (!resumeId) return;

    const found = savedResumes.find((r) => r._id === resumeId);
    if (found) {
      // Build plain text representation
      const text = [
        found.title,
        found.targetRole,
        found.summary,
        'SKILLS',
        Array.isArray(found.skills) ? found.skills.join(', ') : '',
        'EXPERIENCE',
        Array.isArray(found.experience)
          ? found.experience.map((e) => `${e.title || ''} at ${e.company || ''} - ${e.description || ''}`).join('\n')
          : '',
        'PROJECTS',
        Array.isArray(found.projects)
          ? found.projects.map((p) => `${p.name || ''} - ${p.description || ''}`).join('\n')
          : '',
      ].filter(Boolean).join('\n\n');

      setResumeText(text);
      if (found.jobDescription) {
        setJobDescription(found.jobDescription);
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setFileName(file.name);

    try {
      const text = await file.text();
      setResumeText(text);
    } catch (err) {
      setError('Unable to read resume file. Please upload a plain-text (.txt) file.');
    }
  };

  // Run ATS analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste or upload your resume text to begin analysis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/ats/analyze', {
        resumeText,
        jobDescription,
        resumeId: selectedResumeId || undefined,
      });

      const data = response.data.analysis || response.data.report;
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete ATS analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ats-page-layout">
      {/* Inputs Column */}
      <div className="panel-card ats-input-panel">
        <div className="panel-header">
          <h3>ATS Resume Diagnostics</h3>
          <span className="badge-pill">Deterministic Engine</span>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <div className="form-stack">
          {savedResumes.length > 0 && (
            <label>Load from Saved Resumes
              <select
                value={selectedResumeId}
                onChange={(e) => handleSelectSavedResume(e.target.value)}
              >
                <option value="">Select a saved resume...</option>
                {savedResumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.title || 'Resume'}</option>
                ))}
              </select>
            </label>
          )}

          <div className="file-upload-box">
            <label className="file-upload-label">
              <span>📁 Or Upload Plain-Text Resume (.txt)</span>
              <input type="file" accept=".txt,text/plain" onChange={handleFileUpload} />
            </label>
            {fileName && <span className="file-name-badge">Attached: {fileName}</span>}
          </div>

          <label>Resume Content *
            <textarea
              rows="10"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your complete resume text here (Summary, Skills, Experience, Education)..."
              required
            />
          </label>

          <label>Target Job Description (Optional, for Keyword Matching)
            <textarea
              rows="6"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description to analyze keyword coverage and identify missing skills..."
            />
          </label>

          <button
            type="button"
            className="primary-button full-width cta-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? '⚡ Running Multi-Factor Diagnostic...' : '🎯 Calculate Estimated ATS Score'}
          </button>
        </div>
      </div>

      {/* Results Column */}
      <div className="panel-card ats-results-panel">
        <div className="panel-header">
          <h3>ATS Diagnostics & Keyword Matching</h3>
          {result && <span className="score-badge-pill">{result.overallScore || result.estimatedScore}/100</span>}
        </div>

        {!result ? (
          <div className="empty-state-large">
            <span className="empty-state-icon">🎯</span>
            <h4>No Analysis Results Yet</h4>
            <p>Paste your resume and optional job description, then click "Calculate Estimated ATS Score".</p>
          </div>
        ) : (
          <div className="ats-score-dashboard">
            {/* Overall Score Header */}
            <div className="overall-score-card">
              <div className="score-radial">
                <span className="score-num">{result.overallScore || result.estimatedScore}</span>
                <span className="score-denom">/ 100</span>
              </div>
              <div className="score-summary-text">
                <h4>Estimated ATS Optimization Score</h4>
                <p className="score-disclaimer">
                  ⚠️ <strong>Disclaimer:</strong> {result.disclaimer || 'Estimated optimization score based on ATS heuristics. Does not guarantee job interview outcomes.'}
                </p>
              </div>
            </div>

            {/* Score Breakdown Bars (Requirement #10 & #11) */}
            <div className="breakdown-section">
              <h4>Score Breakdown by Dimension</h4>
              <div className="score-bars-list">
                {Object.entries(result.breakdown || {}).map(([key, item]) => (
                  <div key={key} className="score-dimension-row">
                    <span className="dimension-label">{item.label || key}</span>
                    <div className="dimension-bar-track">
                      <div
                        className="dimension-bar-fill"
                        style={{ width: `${Math.min(100, (item.score / item.max) * 100)}%` }}
                      />
                    </div>
                    <span className="dimension-pts">
                      <strong>{item.score}</strong> / {item.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Description Matching (Requirement #12) */}
            {jobDescription.trim() && (
              <div className="job-matching-section">
                <h4>Job Description Skill & Keyword Match</h4>

                {/* Keyword Coverage Visual Bar */}
                <div className="keyword-coverage-box">
                  <div className="coverage-header">
                    <span>Keyword Coverage</span>
                    <strong>{result.keywordCoverage || 0}%</strong>
                  </div>
                  <div className="coverage-bar-track">
                    <div
                      className="coverage-bar-fill"
                      style={{ width: `${result.keywordCoverage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Matched Skills */}
                <div className="skills-match-grid">
                  <div className="matched-box">
                    <h5>Matched Skills ({result.matchedSkills?.length || 0})</h5>
                    <div className="skill-pills-row">
                      {(result.matchedSkills || []).length === 0 ? (
                        <span className="muted-text">No direct skills matched yet</span>
                      ) : (
                        result.matchedSkills.map((sk) => (
                          <span key={sk} className="skill-pill-green">
                            {sk} ✓
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="missing-box">
                    <h5>Missing / Recommended Skills ({result.missingSkills?.length || 0})</h5>
                    <div className="skill-pills-row">
                      {(result.missingSkills || []).length === 0 ? (
                        <span className="skill-pill-green">All critical skills matched! ✓</span>
                      ) : (
                        result.missingSkills.map((sk) => (
                          <span key={sk} className="skill-pill-amber">
                            {sk}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Resume Improvements */}
            <div className="suggestions-section">
              <h4>Recommended Resume Improvements</h4>
              <ul className="ats-recommendations-list">
                {(result.suggestions || []).map((sug, i) => (
                  <li key={i} className="suggestion-bullet">
                    <span className="suggestion-icon">💡</span>
                    <p>{sug}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSPage;
