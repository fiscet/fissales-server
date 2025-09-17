'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toaster';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product } from '@/types';
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

interface ProductEditClientProps {
  productId: string;
}

export default function ProductEditClient({ productId }: ProductEditClientProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [descriptionExtra, setDescriptionExtra] = useState('');
  const { addToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);

      // Get all products and find the specific one
      const response = await fetch(`${API_BASE}/api/shopify/products`);
      const data = await response.json();

      if (response.ok) {
        const foundProduct = data.products.find((p: Product) => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          setDescriptionExtra(foundProduct.descriptionExtra || '');
        } else {
          throw new Error('Product not found');
        }
      } else {
        throw new Error(data.message || 'Failed to load product');
      }
    } catch (error: any) {
      console.error('Failed to load product:', error);
      addToast('Failed to load product', 'error');
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!productId) return;

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE}/api/products/${productId}/description-extra`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ descriptionExtra }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Description updated successfully!', 'success');
        // Update local state
        if (product) {
          setProduct({ ...product, descriptionExtra });
        }
      } else {
        throw new Error(data.message || 'Failed to update description');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      addToast(error.message || 'Failed to save description', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToQdrant = async () => {
    if (!productId) return;

    setSyncing(true);

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
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link href="/dashboard/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const hasChanges = descriptionExtra !== (product.descriptionExtra || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/products"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Products</span>
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">
                  {product.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {product.productUrl && (
                <a
                  href={product.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  View in Store
                </a>
              )}

              <button
                onClick={handleSyncToQdrant}
                disabled={syncing}
                className="btn-success"
              >
                {syncing ? (
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Details */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Product Details</h2>

            {product.imageUrl && (
              <div className="mb-6">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{product.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{product.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <p className="mt-1 text-lg font-bold text-primary-600">${product.price}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock</label>
                <p className="mt-1 text-sm text-gray-900">{product.stock} units</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div
                  className="mt-1 text-sm text-gray-900 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>
          </div>

          {/* Editable Description Extra */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Description</h2>
            <p className="text-sm text-gray-600 mb-4">
              Add extra details, features, or selling points for this product. This will be used for AI-powered search and recommendations.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="descriptionExtra" className="block text-sm font-medium text-gray-700">
                  Extra Description
                </label>
                <textarea
                  id="descriptionExtra"
                  rows={8}
                  className="input-field mt-1 resize-none"
                  placeholder="Add additional product details, features, benefits, use cases, or any other information that would help customers find and understand this product..."
                  value={descriptionExtra}
                  onChange={(e) => setDescriptionExtra(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {descriptionExtra.length} characters
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSaveDescription}
                  disabled={saving || !hasChanges}
                  className="flex-1 btn-primary"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>

                {hasChanges && (
                  <button
                    onClick={() => setDescriptionExtra(product.descriptionExtra || '')}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                )}
              </div>

              {hasChanges && (
                <p className="text-xs text-warning-600">
                  You have unsaved changes
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
