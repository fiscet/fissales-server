import { Metadata } from 'next';
import CompanyImportClient from '@/components/company/CompanyImportClient';

export const metadata: Metadata = {
  title: 'Company Import - FisSales Admin',
  description: 'Import company information from Shopify to Firestore'
};

export default function CompanyImportPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <CompanyImportClient />
    </div>
  );
}
