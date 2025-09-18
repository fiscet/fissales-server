import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToasterProvider } from '@/components/ui/Toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FisSales Agents - Admin Dashboard',
  description: 'Admin dashboard for managing products and AI sales agents',
  icons: {
    icon: [
      {
        url: '/images/favicons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/images/favicons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      }
    ],
    shortcut: '/images/favicons/favicon.ico',
    apple: '/images/favicons/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome',
        url: '/images/favicons/android-chrome-192x192.png',
        sizes: '192x192'
      },
      {
        rel: 'android-chrome',
        url: '/images/favicons/android-chrome-512x512.png',
        sizes: '512x512'
      }
    ]
  },
  manifest: '/images/favicons/site.webmanifest'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToasterProvider>{children}</ToasterProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
