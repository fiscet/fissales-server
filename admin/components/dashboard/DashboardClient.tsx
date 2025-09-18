'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/components/ui/Toaster';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DashboardStats } from '@/types';
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  CubeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import {
  getProductStats,
  importAllProductsFromShopify,
  syncAllProductsToQdrant
} from '@/lib/product-import';
import { testShopifyConnection, getShopInfo } from '@/lib/shopify-utils';

export default function DashboardClient() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');

  useEffect(() => {
    loadStats();
    loadShopInfo();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const result = await getProductStats();

      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      addToast('Failed to load dashboard stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (type: 'shopify' | 'qdrant') => {
    setSyncing(type);

    try {
      let result;
      let successMessage = '';

      if (type === 'shopify') {
        result = await importAllProductsFromShopify();
        successMessage = `Products synced from Shopify successfully! (${result.data?.success || 0} imported, ${result.data?.errors || 0} errors)`;
      } else {
        result = await syncAllProductsToQdrant();
        successMessage = `Products synced to Qdrant successfully! (${result.data?.synced || 0} synced)`;
      }

      if (result.success) {
        addToast(successMessage, 'success');
        await loadStats(); // Refresh stats
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error: any) {
      console.error(`${type} sync error:`, error);
      addToast(error.message || `Failed to sync ${type}`, 'error');
    } finally {
      setSyncing(null);
    }
  };

  const loadShopInfo = async () => {
    try {
      const result = await getShopInfo();

      if (result.success && result.data) {
        setShopInfo(result.data);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('Failed to load shop info:', error);
      setConnectionStatus('failed');
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');

    try {
      const result = await testShopifyConnection();

      if (result.success) {
        setConnectionStatus('connected');
        addToast('Shopify connection successful!', 'success');
        await loadShopInfo(); // Load shop info after successful connection
      } else {
        setConnectionStatus('failed');
        addToast(`Connection failed: ${result.error}`, 'error');
      }
    } catch (error: any) {
      setConnectionStatus('failed');
      addToast(`Connection test failed: ${error.message}`, 'error');
    }
  };

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
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CubeIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Products in Firebase</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.firebaseProducts || 0}</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MagnifyingGlassIcon className="w-8 h-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Products in Qdrant</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.qdrantProducts || 0}</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CloudArrowUpIcon className="w-8 h-8 text-warning-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Last Shopify Sync</p>
                  <p className="text-sm text-gray-900">
                    {stats?.lastSyncFirebase ? stats.lastSyncFirebase.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowPathIcon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Last Qdrant Sync</p>
                  <p className="text-sm text-gray-900">
                    {stats?.lastSyncQdrant ? stats.lastSyncQdrant.toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shopify Connection Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Shopify Connection</h3>
              <button
                onClick={handleTestConnection}
                disabled={connectionStatus === 'testing'}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${connectionStatus === 'connected'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : connectionStatus === 'failed'
                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {connectionStatus === 'testing' ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                )}
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {shopInfo && connectionStatus === 'connected' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Store Name:</span>
                  <p className="text-gray-900">{shopInfo.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Domain:</span>
                  <p className="text-gray-900">{shopInfo.domain}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{shopInfo.email || 'Not provided'}</p>
                </div>
              </div>
            )}

            {connectionStatus === 'failed' && (
              <p className="text-sm text-red-600">
                Connection failed. Please check your Shopify configuration.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/dashboard/products')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <CubeIcon className="w-5 h-5" />
                Manage Products
              </button>
              <button
                onClick={() => router.push('/dashboard/search')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search Products
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Refresh Stats
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shopify Integration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Import products from Shopify to Firebase database
              </p>
              <button
                onClick={() => handleSync('shopify')}
                disabled={syncing === 'shopify'}
                className="btn-primary w-full"
              >
                {syncing === 'shopify' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Syncing from Shopify...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4" />
                    Sync Products from Shopify
                  </>
                )}
              </button>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vector Search</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sync products to Qdrant for AI-powered search
              </p>
              <button
                onClick={() => handleSync('qdrant')}
                disabled={syncing === 'qdrant'}
                className="btn-success w-full"
              >
                {syncing === 'qdrant' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Syncing to Qdrant...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    Sync Products to Qdrant
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/dashboard/products"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">Products List</h4>
                  <p className="text-sm text-gray-600">View and manage all products</p>
                </div>
                <ArrowPathIcon className="w-5 h-5 text-gray-400" />
              </Link>

              <Link
                href="/dashboard/search"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">Product Search</h4>
                  <p className="text-sm text-gray-600">Test vector search functionality</p>
                </div>
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
