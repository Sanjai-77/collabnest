import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeProvider as AppThemeProvider, useTheme } from './components/ThemeContext';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { lazy, Suspense, useMemo } from 'react';
import { Spin } from 'antd';

// Eager-load entry points (landing + auth) for instant first paint
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Lazy-load dashboard pages — only fetched when user navigates to them
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/DashboardHome'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'));
const MyProjectsPage = lazy(() => import('./pages/MyProjectsPage'));
const JoinRequestsPage = lazy(() => import('./pages/JoinRequestsPage'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Full-screen loading fallback while lazy chunks are being fetched
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--bg-app)',
  }}>
    <Spin size="large" />
  </div>
);

function AppContent() {
  const { theme } = useTheme();

  // MUI theme synced with the app's dark/light mode
  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode: theme === 'dark' ? 'dark' : 'light',
      primary: { main: '#8b5cf6' },
      background: {
        default: theme === 'dark' ? '#030409' : '#f6f8fa',
        paper: theme === 'dark' ? '#0c0e1a' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#f8fafc' : '#1f2328',
        secondary: theme === 'dark' ? '#94a3b8' : '#57606a',
      },
    },
    typography: {
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    },
  }), [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </BrowserRouter>
    </ConfigProvider>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}

export default App;
