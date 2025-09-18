import AdminGuard from '@/components/auth/AdminGuard';
import ProductsListClient from '@/components/products/ProductsListClient';

export default function ProductsPage() {
  return (
    <AdminGuard>
      <ProductsListClient />
    </AdminGuard>
  );
}
