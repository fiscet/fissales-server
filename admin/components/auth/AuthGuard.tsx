'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/login');
      } else if (!requireAuth && user) {
        // Don't auto-redirect authenticated users from auth pages
        // Let them navigate manually or use AdminGuard for role checking
        return;
      }
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return null; // Redirecting...
  }

  // Allow authenticated users to see auth pages (they can navigate manually)

  return <>{children}</>;
}
