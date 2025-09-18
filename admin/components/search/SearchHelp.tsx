interface SearchHelpProps {
  show: boolean;
}

export default function SearchHelp({ show }: SearchHelpProps) {
  if (!show) return null;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        How to Use Search
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Semantic Search</h3>
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
  );
}
