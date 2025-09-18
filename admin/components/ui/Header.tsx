'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../auth/AuthProvider';
import {
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
}

export default function Header({
  title = 'FisSales Admin',
  subtitle,
  showNavigation = true
}: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left side - Logo and Title */}
          <div className="flex items-center space-x-4">
            <Image
              src="/images/Logo.png"
              alt="FisSales Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>

          {/* Center - Navigation */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => router.push('/dashboard/products')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <CubeIcon className="w-4 h-4" />
                Products
              </button>
              <button
                onClick={() => router.push('/dashboard/search')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                Search
              </button>
              <button
                onClick={() => router.push('/dashboard/company')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <BuildingOfficeIcon className="w-4 h-4" />
                Company
              </button>
            </nav>
          )}

          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>{user?.displayName || user?.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
