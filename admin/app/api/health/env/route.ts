import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all environment variables (be careful with sensitive data)
    const allEnvVars: Record<string, string> = {};
    const sensitivePatterns = [
      /key/i, /secret/i, /token/i, /password/i, /private/i,
      /credential/i, /auth/i, /api.*key/i
    ];

    // Process all environment variables
    Object.keys(process.env).forEach(key => {
      const value = process.env[key];
      const isSensitive = sensitivePatterns.some(pattern => pattern.test(key));

      if (isSensitive && value) {
        // Show only that it's set and its length for sensitive vars
        allEnvVars[key] = `SET (length: ${value.length})`;
      } else {
        // Show full value for non-sensitive vars
        allEnvVars[key] = value || 'NOT SET';
      }
    });

    // Categorize environment variables
    const categorized = {
      nextjs: {} as Record<string, string>,
      firebase: {} as Record<string, string>,
      vercel: {} as Record<string, string>,
      api: {} as Record<string, string>,
      system: {} as Record<string, string>,
      other: {} as Record<string, string>,
    };

    Object.entries(allEnvVars).forEach(([key, value]) => {
      if (key.startsWith('NEXT_')) {
        categorized.nextjs[key] = value;
      } else if (key.includes('FIREBASE')) {
        categorized.firebase[key] = value;
      } else if (key.includes('VERCEL')) {
        categorized.vercel[key] = value;
      } else if (key.includes('API') || key.includes('URL')) {
        categorized.api[key] = value;
      } else if (['NODE_ENV', 'PORT', 'PWD', 'HOME', 'PATH'].includes(key)) {
        categorized.system[key] = value;
      } else {
        categorized.other[key] = value;
      }
    });

    return NextResponse.json({
      message: 'Admin Detailed Environment Variables',
      timestamp: new Date().toISOString(),
      totalVariables: Object.keys(allEnvVars).length,
      categorized,
      summary: {
        nextjs: Object.keys(categorized.nextjs).length,
        firebase: Object.keys(categorized.firebase).length,
        vercel: Object.keys(categorized.vercel).length,
        api: Object.keys(categorized.api).length,
        system: Object.keys(categorized.system).length,
        other: Object.keys(categorized.other).length,
      },
      info: {
        platform: 'Next.js Admin Panel - Detailed View',
        runtime: 'Node.js',
        warning: 'Sensitive variables show only length, not actual values',
      }
    });

  } catch (error) {
    console.error('Detailed environment check error:', error);

    return NextResponse.json({
      error: 'Detailed Environment Check Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
