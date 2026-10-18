import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './components/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ResumeBuilderPage from './pages/ResumeBuilderPage.jsx';
import ATSPage from './pages/ATSPage.jsx';
import CoverLetterPage from './pages/CoverLetterPage.jsx';
import CareerAdvisorPage from './pages/CareerAdvisorPage.jsx';
import SavedDocumentsPage from './pages/SavedDocumentsPage.jsx';
import PortfolioPage from './pages/PortfolioPage.jsx';
import SkillGapPage from './pages/SkillGapPage.jsx';
import PublicPortfolioPage from './pages/PublicPortfolioPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Public Portfolio Route */}
      <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/resume-builder" element={<ResumeBuilderPage />} />
        <Route path="/ats-analyzer" element={<ATSPage />} />
        <Route path="/cover-letter" element={<CoverLetterPage />} />
        <Route path="/career-ai" element={<CareerAdvisorPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/saved-documents" element={<SavedDocumentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
