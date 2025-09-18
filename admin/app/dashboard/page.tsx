import AdminGuard from '@/components/auth/AdminGuard';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default function DashboardPage() {
  return (
    <AdminGuard>
      <DashboardClient />
    </AdminGuard>
  );
}