import { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Product Search - Admin Dashboard',
  description: 'AI-powered semantic search for products'
};

export default function SearchPage() {
  return <SearchClient />;
}
