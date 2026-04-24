import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Sidebar } from './Sidebar';
import { useEffect } from 'react';

export function ProtectedRoute() {
  const { token, user, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading && !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}
