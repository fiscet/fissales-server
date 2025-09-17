import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import { remoteImagePatterns } from '@/lib/images';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImagePatterns,
  },
  outputFileTracingRoot: path.join(__dirname, '../'),
};

export default nextConfig;
