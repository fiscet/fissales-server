'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toaster';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product } from '@/types';
import {
  ArrowLeftIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export default function ProductsListClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/shopify/products`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (error: any) {
      console.error('Failed to load products:', error);
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncProduct = async (productId: string) => {
    setSyncing(productId);

    try {
      const response = await fetch(`${API_BASE}/api/products/${productId}/sync-to-qdrant`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Product synced to Qdrant successfully!', 'success');
      } else {
        throw new Error(data.message || 'Sync failed');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      addToast(error.message || 'Failed to sync product', 'error');
    } finally {
      setSyncing(null);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descriptionExtra.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              </div>
            </div>

            <button
              onClick={loadProducts}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ArrowPathIcon className="w-4 h-4" />
              )}
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, description..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="card text-center py-12">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Import products from Shopify to get started'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="card hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  {product.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary-600 mt-1">
                        ${product.price}
                      </p>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>Stock:</strong> {product.stock}</p>
                      <p className="line-clamp-3 mt-2">{product.description}</p>
                      {product.descriptionExtra && (
                        <p className="line-clamp-2 mt-2 text-primary-600">
                          <strong>Extra:</strong> {product.descriptionExtra}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="flex-1 btn-secondary text-center"
                      >
                        <PencilIcon className="w-4 h-4 inline" />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleSyncProduct(product.id)}
                        disabled={syncing === product.id}
                        className="flex-1 btn-success"
                      >
                        {syncing === product.id ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <ArrowPathIcon className="w-4 h-4" />
                            Sync to Qdrant
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
