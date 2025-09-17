import { Metadata } from 'next';
import Header from '@/components/ui/Header';

export const metadata: Metadata = {
  title: 'Dashboard - FisSales Admin',
  description: 'Admin dashboard for managing products and AI sales agents',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
