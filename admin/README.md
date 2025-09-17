# FisSales Admin Dashboard

Next.js-based admin dashboard for managing products and monitoring the AI sales system.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3001`

## 🔧 Environment Setup

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

## 📱 Features

- **Product Management**: View and edit product catalog
- **Vector Search Testing**: Test product search functionality
- **Data Synchronization**: Sync between Shopify, Firebase, and Qdrant
- **Authentication**: Secure admin access with Firebase Auth
- **Real-time Statistics**: Monitor system performance

## 🛠️ Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

## 🏗️ Architecture

Built with:
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Authentication and data
- **Heroicons** - Icons
