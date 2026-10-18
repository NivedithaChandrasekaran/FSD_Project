import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'My Profile', path: '/profile', icon: '👤' },
  { label: 'Resume Builder', path: '/resume-builder', icon: '📄' },
  { label: 'ATS Analyzer', path: '/ats-analyzer', icon: '🎯' },
  { label: 'Cover Letter', path: '/cover-letter', icon: '✉️' },
  { label: 'Career AI', path: '/career-ai', icon: '💡' },
  { label: 'Skill Gap', path: '/skill-gap', icon: '🔍' },
  { label: 'Portfolio', path: '/portfolio', icon: '🌐' },
  { label: 'Saved Documents', path: '/saved-documents', icon: '📁' },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <div className="brand-block-mini" onClick={() => navigate('/dashboard')}>
          <div className="brand-mark">CF</div>
          <span className="brand-title">CareerForge AI</span>
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="brand-block" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark">CF</div>
          <div>
            <h3 className="brand-title">CareerForge AI</h3>
            <span className="brand-badge">SaaS Platform</span>
          </div>
        </div>

        <nav className="nav-links">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-pill">
            <span className="user-avatar-badge">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Candidate'}</span>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <div className="sidebar-backdrop" onClick={closeMobileMenu} />}

      {/* Main Content Area */}
      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">CareerForge AI Platform</p>
            <h1>Welcome back, {user?.name || 'Candidate'}</h1>
          </div>
          <div className="topbar-actions">
            <button className="secondary-button" type="button" onClick={() => navigate('/profile')}>
              Career Profile
            </button>
            <button className="primary-button" type="button" onClick={() => navigate('/resume-builder')}>
              + New Resume
            </button>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
