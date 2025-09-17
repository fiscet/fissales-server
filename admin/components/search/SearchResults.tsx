'use client';

import LoadingSpinner from '../ui/LoadingSpinner';
import ProductSearchCard from './ProductSearchCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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

interface SearchResultsProps {
  lastQuery: string;
  searchResults: SearchResult[];
  searching: boolean;
}

export default function SearchResults({ lastQuery, searchResults, searching }: SearchResultsProps) {
  if (!lastQuery) return null;

  return (
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
            <ProductSearchCard key={index} result={result} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found for "{lastQuery}"</p>
          <p className="text-sm text-gray-400 mt-2">
            Try a different search term or make sure products are synced to Qdrant
          </p>
        </div>
      )}
    </div>
  );
}
