'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

interface ProductSearchCardProps {
  result: SearchResult;
}

export default function ProductSearchCard({ result }: ProductSearchCardProps) {
  const router = useRouter();

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
            {result.product?.description || 'No description available'}
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
            <span>ID: {result.product?.id || result.productId}</span>
          </div>
        </div>

        {result.product?.imageUrl && (
          <div className="ml-4">
            <Image
              src={result.product.imageUrl}
              alt={result.product.name}
              width={80}
              height={80}
              className="object-cover rounded-lg"
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
  );
}
