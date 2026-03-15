import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import JoinRequestsPage from './pages/JoinRequestsPage';
import WorkspacePage from './pages/WorkspacePage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

function AppContent() {
  const { theme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#8b5cf6',
          borderRadius: 12,
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
          colorBgContainer: theme === 'dark' ? '#0c0e1a' : '#ffffff',
          colorBgElevated: theme === 'dark' ? '#111425' : '#ffffff',
          colorBorder: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#d0d7de',
          colorText: theme === 'dark' ? '#f8fafc' : '#1f2328',
          colorTextSecondary: theme === 'dark' ? '#94a3b8' : '#57606a',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/create" element={<CreateProjectPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="my-projects" element={<MyProjectsPage />} />
            <Route path="join-requests" element={<JoinRequestsPage />} />
            <Route path="workspace/:id" element={<WorkspacePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
