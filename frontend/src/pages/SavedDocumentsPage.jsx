import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TABS = ['All', 'Resumes', 'Cover Letters', 'Portfolios', 'ATS Reports'];

const SavedDocumentsPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeModalDoc, setActiveModalDoc] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [resumesRes, lettersRes, reportsRes, portRes] = await Promise.all([
        api.get('/resumes').catch(() => ({ data: {} })),
        api.get('/cover-letter').catch(() => ({ data: {} })),
        api.get('/ats').catch(() => ({ data: {} })),
        api.get('/portfolio').catch(() => ({ data: {} })),
      ]);

      const items = [
        ...(resumesRes.data.resumes || []).map((r) => ({
          id: r._id,
          name: r.title || 'Resume',
          type: 'Resume',
          createdAt: r.createdAt,
          updatedAt: r.updatedAt || r.createdAt,
          raw: r,
          editRoute: '/resume-builder',
        })),
        ...(lettersRes.data.coverLetters || []).map((l) => ({
          id: l._id,
          name: `${l.company} - ${l.jobTitle}`,
          type: 'Cover Letter',
          createdAt: l.createdAt,
          updatedAt: l.updatedAt || l.createdAt,
          raw: l,
          editRoute: '/cover-letter',
        })),
        ...(reportsRes.data.reports || []).map((a) => ({
          id: a._id,
          name: `ATS Report: ${a.overallScore}/100 Score`,
          type: 'ATS Report',
          createdAt: a.createdAt,
          updatedAt: a.updatedAt || a.createdAt,
          raw: a,
          editRoute: '/ats-analyzer',
        })),
        ...(portRes.data.portfolio ? [{
          id: portRes.data.portfolio._id,
          name: `Portfolio: @${portRes.data.portfolio.username}`,
          type: 'Portfolio',
          createdAt: portRes.data.portfolio.createdAt,
          updatedAt: portRes.data.portfolio.updatedAt || portRes.data.portfolio.createdAt,
          raw: portRes.data.portfolio,
          editRoute: '/portfolio',
        }] : []),
      ];

      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setDocuments(items);
    } catch (err) {
      console.error('Failed to load saved documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents by active tab
  const filteredDocs = selectedTab === 'All'
    ? documents
    : documents.filter((d) => {
        if (selectedTab === 'Resumes') return d.type === 'Resume';
        if (selectedTab === 'Cover Letters') return d.type === 'Cover Letter';
        if (selectedTab === 'Portfolios') return d.type === 'Portfolio';
        if (selectedTab === 'ATS Reports') return d.type === 'ATS Report';
        return true;
      });

  // Action: Open / View Modal
  const handleOpen = (doc) => {
    setActiveModalDoc(doc);
  };

  // Action: Edit
  const handleEdit = (doc) => {
    if (doc.type === 'Resume') {
      sessionStorage.setItem('ats_resume_text', doc.raw.summary || '');
      navigate('/resume-builder');
    } else if (doc.type === 'Cover Letter') {
      navigate('/cover-letter');
    } else if (doc.type === 'Portfolio') {
      navigate('/portfolio');
    } else if (doc.type === 'ATS Report') {
      navigate('/ats-analyzer');
    }
  };

  // Action: Duplicate
  const handleDuplicate = async (doc) => {
    setStatus({ type: '', message: '' });
    try {
      if (doc.type === 'Resume') {
        await api.post(`/resumes/${doc.id}/duplicate`);
      } else if (doc.type === 'Cover Letter') {
        await api.post(`/cover-letter/${doc.id}/duplicate`);
      } else {
        setStatus({ type: 'error', message: `Duplicate action not applicable for ${doc.type}.` });
        return;
      }
      setStatus({ type: 'success', message: `${doc.type} duplicated successfully!` });
      fetchDocuments();
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to duplicate document.' });
    }
  };

  // Action: Delete
  const handleDelete = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.name}"?`)) return;

    setStatus({ type: '', message: '' });
    try {
      if (doc.type === 'Resume') {
        await api.delete(`/resumes/${doc.id}`);
      } else if (doc.type === 'Cover Letter') {
        await api.delete(`/cover-letter/${doc.id}`);
      } else if (doc.type === 'ATS Report') {
        await api.delete(`/ats/${doc.id}`);
      }
      setStatus({ type: 'success', message: `${doc.type} deleted successfully!` });
      fetchDocuments();
    } catch (err) {
      setStatus({ type: 'error', message: 'Unable to delete document.' });
    }
  };

  return (
    <div className="saved-documents-layout">
      {/* Top Banner */}
      <div className="panel-card wide">
        <div className="panel-header">
          <div>
            <h3>Saved Career Documents</h3>
            <span className="muted-text">Manage, view, duplicate, and organize all your career assets</span>
          </div>
        </div>

        {status.message && (
          <div className={`form-status-alert ${status.type}`}>
            {status.message}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="document-filter-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`doc-tab-btn ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="documents-container" style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="empty-state">Loading your saved documents...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="empty-state-large panel-card wide">
            <span className="empty-state-icon">📁</span>
            <h4>No {selectedTab === 'All' ? 'Career' : selectedTab} Documents Found</h4>
            <p>Generate a resume, cover letter, or portfolio to see them managed here.</p>
          </div>
        ) : (
          <div className="document-grid">
            {filteredDocs.map((item) => (
              <div key={`${item.type}-${item.id}`} className="document-card">
                <div className="document-topline">
                  <span className={`doc-tag ${item.type.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.type}
                  </span>
                  <span className="doc-date-small">
                    Updated: {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="doc-card-title">{item.name}</h4>
                <p className="doc-meta-text">Created: {new Date(item.createdAt).toLocaleDateString()}</p>

                {/* 4 Required Action Buttons: Open, Edit, Duplicate, Delete */}
                <div className="doc-actions-footer">
                  <button
                    type="button"
                    className="action-pill-btn open-btn"
                    onClick={() => handleOpen(item)}
                  >
                    👁️ Open
                  </button>
                  <button
                    type="button"
                    className="action-pill-btn edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    ✏️ Edit
                  </button>
                  {item.type !== 'Portfolio' && item.type !== 'ATS Report' && (
                    <button
                      type="button"
                      className="action-pill-btn duplicate-btn"
                      onClick={() => handleDuplicate(item)}
                    >
                      📋 Duplicate
                    </button>
                  )}
                  {item.type !== 'Portfolio' && (
                    <button
                      type="button"
                      className="action-pill-btn delete-btn"
                      onClick={() => handleDelete(item)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document View Modal */}
      {activeModalDoc && (
        <div className="modal-overlay" onClick={() => setActiveModalDoc(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className={`doc-tag ${activeModalDoc.type.toLowerCase().replace(/\s+/g, '-')}`}>
                  {activeModalDoc.type}
                </span>
                <h3>{activeModalDoc.name}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModalDoc(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {activeModalDoc.type === 'Resume' && (
                <div className="modal-content-pre">
                  <p><strong>Target Role:</strong> {activeModalDoc.raw.targetRole}</p>
                  <p><strong>Summary:</strong> {activeModalDoc.raw.summary}</p>
                  <p><strong>Skills:</strong> {Array.isArray(activeModalDoc.raw.skills) ? activeModalDoc.raw.skills.join(', ') : ''}</p>
                  {activeModalDoc.raw.experience?.length > 0 && (
                    <div>
                      <strong>Experience:</strong>
                      <ul>
                        {activeModalDoc.raw.experience.map((e, idx) => (
                          <li key={idx}><strong>{e.title} at {e.company}:</strong> {e.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeModalDoc.type === 'Cover Letter' && (
                <div className="modal-content-pre">
                  <pre className="letter-preview-formatted">{activeModalDoc.raw.content}</pre>
                </div>
              )}

              {activeModalDoc.type === 'ATS Report' && (
                <div className="modal-content-pre">
                  <h4>Overall Score: {activeModalDoc.raw.overallScore} / 100</h4>
                  <p><strong>Keyword Match:</strong> {activeModalDoc.raw.keywordScore} / 30</p>
                  <p><strong>Skills Match:</strong> {activeModalDoc.raw.skillsScore} / 20</p>
                  <p><strong>Matched Skills:</strong> {activeModalDoc.raw.matchedSkills?.join(', ') || 'None'}</p>
                  <p><strong>Missing Skills:</strong> {activeModalDoc.raw.missingSkills?.join(', ') || 'None'}</p>
                  {activeModalDoc.raw.suggestions?.length > 0 && (
                    <div>
                      <strong>Suggestions:</strong>
                      <ul>
                        {activeModalDoc.raw.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeModalDoc.type === 'Portfolio' && (
                <div className="modal-content-pre">
                  <p><strong>Username:</strong> @{activeModalDoc.raw.username}</p>
                  <p><strong>Theme:</strong> {activeModalDoc.raw.theme}</p>
                  <p><strong>Status:</strong> {activeModalDoc.raw.published ? 'Published' : 'Draft'}</p>
                  <p><strong>About:</strong> {activeModalDoc.raw.about}</p>
                  <p>
                    <a
                      href={`/portfolio/${activeModalDoc.raw.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="primary-button-sm"
                    >
                      Open Public Page →
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setActiveModalDoc(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  const doc = activeModalDoc;
                  setActiveModalDoc(null);
                  handleEdit(doc);
                }}
              >
                Edit Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedDocumentsPage;
