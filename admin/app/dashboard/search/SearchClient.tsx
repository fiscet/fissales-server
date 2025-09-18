'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/ui/Toaster';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

interface SearchResult {
  productId: string;
  score: number;
  product: {
    id: string;
    name: string;
    description: string;
    descriptionExtra?: string;
    price: number;
    stock: number;
    imageUrl: string;
    productUrl: string;
  };
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
  relevantContext?: string;
  timestamp: string;
  message?: string;
  error?: string;
}

export default function SearchClient() {
  const router = useRouter();
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      addToast('Please enter a search query', 'error');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`${API_BASE}/api/products/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 20
        })
      });

      const data: SearchResponse = await response.json();

      if (response.ok) {
        setSearchResults(data.results || []);
        setLastQuery(searchQuery);
        addToast(`Found ${data.count || 0} results`, 'success');
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      addToast(error.message || 'Failed to search products', 'error');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setLastQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Search Products
        </h2>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products (e.g., 'winter sports equipment', 'ski boots', 'snowboards under $500')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px]"
          >
            {searching ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5" />
            )}
            {searching ? 'Searching...' : 'Search'}
          </button>
          {searchResults.length > 0 && (
            <button
              onClick={clearSearch}
              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Examples */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Search Examples:
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'winter sports gear',
              'ski equipment',
              'snowboard boots',
              'expensive products',
              'items under $200',
              'outdoor gear'
            ].map((example) => (
              <button
                key={example}
                onClick={() => setSearchQuery(example)}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {lastQuery && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results for "{lastQuery}"
            </h2>
            <span className="text-sm text-gray-500">
              {searchResults.length} results found
            </span>
          </div>

          {searching ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.product?.name || 'Unknown Product'}
                        </h3>
                        <span className="text-sm text-gray-500 bg-green-100 px-3 py-1 rounded-full">
                          {(result.score * 100).toFixed(1)}% match
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">
                        {result.product?.description ||
                          'No description available'}
                      </p>

                      {result.product?.descriptionExtra && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                          <p className="text-sm text-blue-800">
                            <strong>Additional Info:</strong>{' '}
                            {result.product.descriptionExtra}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="font-medium text-green-600">
                          ${result.product?.price || 0}
                        </span>
                        <span>Stock: {result.product?.stock || 0}</span>
                        <span>
                          ID: {result.product?.id || result.productId}
                        </span>
                      </div>
                    </div>

                    {result.product?.imageUrl && (
                      <div className="ml-4">
                        <img
                          src={result.product.imageUrl}
                          alt={result.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/products/${result.product?.id}`)
                      }
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit Product
                    </button>
                    {result.product?.productUrl && (
                      <a
                        href={result.product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                      >
                        View in Store
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No products found for "{lastQuery}"
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Try a different search term or make sure products are synced to
                Qdrant
              </p>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!lastQuery && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How to Use Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Semantic Search
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Search uses AI to understand meaning, not just keywords. You can
                search for:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product categories: "winter sports equipment"</li>
                <li>• Features: "waterproof jackets"</li>
                <li>• Use cases: "beginner ski gear"</li>
                <li>• Price ranges: "affordable snowboards"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use natural language descriptions</li>
                <li>• Be specific about what you're looking for</li>
                <li>• Include price, brand, or feature preferences</li>
                <li>• Results are ranked by relevance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
