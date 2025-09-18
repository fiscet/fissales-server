import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check all environment variables (both Next.js and server-side)
    const envStatus = {
      // Next.js Environment
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',

      // Firebase Configuration
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length + ')' : 'NOT SET',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'NOT SET',

      // Server-side Firebase (if available)
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? 'SET (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET',
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET',

      // API Configuration
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      API_URL: process.env.API_URL || 'NOT SET',

      // Other common variables
      VERCEL: process.env.VERCEL || 'NOT SET',
      VERCEL_URL: process.env.VERCEL_URL || 'NOT SET',
      PORT: process.env.PORT || 'NOT SET',
    };

    // Count total environment variables
    const totalEnvVars = Object.keys(process.env).length;

    // Get some sample non-sensitive environment variables for debugging
    const samples = {
      NODE_ENV: process.env.NODE_ENV || 'NOT SET',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET',
    };

    return NextResponse.json({
      message: 'Admin Environment variables status',
      timestamp: new Date().toISOString(),
      totalEnvironmentVariables: totalEnvVars,
      checkedVariables: envStatus,
      samples,
      info: {
        platform: 'Next.js Admin Panel',
        runtime: 'Node.js',
        nextVersion: process.env.npm_package_dependencies_next || 'Unknown',
      }
    });

  } catch (error) {
    console.error('Environment variables check error:', error);

    return NextResponse.json({
      error: 'Environment Check Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Also support POST for testing
export async function POST(request: NextRequest) {
  return GET(request);
}
