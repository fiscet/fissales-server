'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { isAdmin, getUserRole, UserRole } from '@/lib/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!authLoading && user) {
        try {
          const hasAdminRole = await isAdmin(user);
          const role = await getUserRole(user);

          setUserRole(role);

          if (!hasAdminRole) {
            router.push('/access-denied');
            return;
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          router.push('/access-denied');
          return;
        }
      } else if (!authLoading && !user) {
        router.push('/login');
        return;
      }

      setLoading(false);
    };

    checkAdminRole();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirecting to login
  }

  if (userRole?.role !== 'admin') {
    return null; // Redirecting to access denied
  }

  return <>{children}</>;
}
