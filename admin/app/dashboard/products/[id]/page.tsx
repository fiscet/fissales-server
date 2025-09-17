import AdminGuard from '@/components/auth/AdminGuard';
import ProductEditClient from '@/components/products/ProductEditClient';

interface ProductPageProps {
  params: Promise<{ id: string; }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;

  return (
    <AdminGuard>
      <ProductEditClient productId={resolvedParams.id} />
    </AdminGuard>
  );
}