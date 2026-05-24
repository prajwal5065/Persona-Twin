import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { useEffect, lazy, Suspense } from 'react';

// Components
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { CustomSpinner } from './components/ui/CustomSpinner';

// Lazy Loaded Pages
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })));
const NotesPage = lazy(() => import('./pages/NotesPage').then((m) => ({ default: m.NotesPage })));
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SimulationPage = lazy(() => import('./pages/SimulationPage').then((m) => ({ default: m.SimulationPage })));

// Eagerly prefetch Dashboard + Sidebar when user is authenticated
// This kicks off the chunk fetch in parallel with the initial module parse,
// dramatically reducing time-to-interactive for logged-in users.
if (localStorage.getItem('token')) {
  import('./pages/DashboardPage');
  import('./components/layout/Sidebar');
}

const PageLoader = () => (
  <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream-soft)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="none"/>
          <rect x="8" y="5" width="10" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="rgba(0,0,0,0.2)"/>
          <path d="M8 9h5.5a2 2 0 010 4H8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <CustomSpinner className="w-6 h-6" />
    </div>
  </div>
);

function App() {
  const { token, user, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (loading && token && !user) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
          <Route path="/landing" element={<LandingPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/simulation" element={<SimulationPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
