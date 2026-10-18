import { useEffect, useState } from 'react';
import api from '../services/api';
import { downloadPdf } from '../utils/downloadPdf';

const TONES = ['Professional', 'Confident', 'Friendly', 'Concise'];

const CoverLetterPage = () => {
  const [profile, setProfile] = useState({});
  const [form, setForm] = useState({
    company: '',
    jobTitle: '',
    recipientName: '',
    jobDescription: '',
    tone: 'Professional',
  });
  const [letterContent, setLetterContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile');
        if (response.data.profile) {
          setProfile(response.data.profile);
          if (response.data.profile.targetRole) {
            setForm((prev) => ({ ...prev, jobTitle: response.data.profile.targetRole }));
          }
        }
      } catch (err) {
        console.error('Failed to load profile for cover letter:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Generate / Regenerate Cover Letter
  const handleGenerate = async () => {
    if (!form.company.trim() || !form.jobTitle.trim()) {
      setStatus({ type: 'error', message: 'Company name and Job title are required.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await api.post('/cover-letter/generate', {
        ...form,
        profile,
      });

      const generated = response.data.coverLetter?.content || response.data.document?.content || '';
      setLetterContent(generated);
      setIsEditing(false);
      setStatus({ type: 'success', message: 'Personalized cover letter generated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to generate cover letter.' });
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!letterContent) return;
    try {
      await navigator.clipboard.writeText(letterContent);
      setStatus({ type: 'success', message: 'Cover letter copied to clipboard!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to copy text.' });
    }
  };

  // Save to MongoDB
  const handleSave = async () => {
    if (!letterContent) return;
    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/cover-letter/generate', {
        ...form,
        profile,
        content: letterContent,
      });
      setStatus({ type: 'success', message: 'Cover letter saved to MongoDB!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Unable to save cover letter.' });
    } finally {
      setSaving(false);
    }
  };

  // Download PDF
  const handleDownload = () => {
    if (!letterContent) return;

    const candidateName = profile?.fullName || 'Candidate';
    downloadPdf({
      filename: `${candidateName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${form.company.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-cover-letter.pdf`,
      header: null,
      sections: [{ title: '', body: letterContent }],
    });
  };

  return (
    <div className="cover-letter-layout">
      {/* Controls Column */}
      <div className="panel-card cover-controls-panel">
        <div className="panel-header">
          <h3>Cover Letter Generator</h3>
          <span className="badge-pill">Tone Adapted</span>
        </div>

        {status.message && (
          <div className={`form-status-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        <div className="form-stack">
          <label>Target Company *
            <input
              value={form.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="e.g. Stripe, Google, Acme Corp"
              required
            />
          </label>

          <label>Job Title *
            <input
              value={form.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              required
            />
          </label>

          <label>Recipient / Hiring Manager Name (Optional)
            <input
              value={form.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              placeholder="e.g. Jane Smith or Hiring Team"
            />
          </label>

          <label>Letter Tone
            <select
              value={form.tone}
              onChange={(e) => handleInputChange('tone', e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>Target Job Description
            <textarea
              rows="6"
              value={form.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              placeholder="Paste the job description so the AI can match your genuine skills to their requirements..."
            />
          </label>

          <button
            type="button"
            className="primary-button full-width cta-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⚡ Crafting Cover Letter...' : letterContent ? '🔄 Regenerate Letter' : '✨ Generate Cover Letter'}
          </button>
        </div>
      </div>

      {/* Generated Letter Display Column */}
      <div className="panel-card cover-preview-panel">
        <div className="panel-header">
          <div>
            <h3>Generated Letter Draft</h3>
            <span className="muted-text">Personalized without invented credentials</span>
          </div>

          {letterContent && (
            <div className="action-button-row">
              <button
                type="button"
                className="secondary-button-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '👁️ Preview' : '✏️ Edit'}
              </button>
              <button
                type="button"
                className="secondary-button-sm"
                onClick={handleGenerate}
                disabled={loading}
              >
                🔄 Regenerate
              </button>
              <button
                type="button"
                className="secondary-button-sm"
                onClick={handleCopy}
              >
                📋 Copy
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

        {!letterContent ? (
          <div className="empty-state-large">
            <span className="empty-state-icon">✉️</span>
            <h4>No Cover Letter Draft Yet</h4>
            <p>Enter the company name, target position, and click "Generate Cover Letter".</p>
          </div>
        ) : isEditing ? (
          <div className="letter-editor-box">
            <textarea
              rows="20"
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              className="raw-resume-textarea"
            />
          </div>
        ) : (
          <div className="letter-preview-sheet">
            <pre className="letter-preview-formatted">{letterContent}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPage;
