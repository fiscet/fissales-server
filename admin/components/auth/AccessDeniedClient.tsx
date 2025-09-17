'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { useToast } from '@/components/ui/Toaster';
import { ExclamationTriangleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function AccessDeniedClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      addToast('Logged out successfully', 'success');
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      addToast('Failed to logout', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this admin dashboard.
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Logged in as: <strong>{user.email}</strong>
            </p>
          )}
          <p className="mt-4 text-sm text-gray-500">
            Your account is pending approval. Please contact an administrator.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
            Logout & Try Different Account
          </button>

          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
