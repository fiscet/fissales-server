'use client';

import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface SearchInterfaceProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onClear: () => void;
  searching: boolean;
  hasResults: boolean;
}

const SEARCH_EXAMPLES = [
  'winter sports gear',
  'ski equipment',
  'snowboard boots',
  'expensive products',
  'items under $200',
  'outdoor gear'
];

export default function SearchInterface({
  searchQuery,
  setSearchQuery,
  onSearch,
  onClear,
  searching,
  hasResults
}: SearchInterfaceProps) {
  return (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Products</h2>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for products (e.g., 'winter sports equipment', 'ski boots', 'snowboards under $500')"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button
          onClick={onSearch}
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
        {hasResults && (
          <button
            onClick={onClear}
            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Search Examples:</h3>
        <div className="flex flex-wrap gap-2">
          {SEARCH_EXAMPLES.map((example) => (
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
  );
}
