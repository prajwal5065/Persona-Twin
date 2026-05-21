import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Sidebar } from './Sidebar';
import { useEffect } from 'react';
import { CustomSpinner } from '../ui/CustomSpinner';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    if (token && !user) {
      fetchMe();
    }
  }, [token, user, fetchMe]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (loading && !user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <CustomSpinner className="w-12 h-12 relative z-10" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Ambient Background Orbs */}
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
