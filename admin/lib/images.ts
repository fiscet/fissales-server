export const remoteImagePatterns = [
  {
    protocol: 'https' as const,
    hostname: '**'
  },
  {
    protocol: 'http' as const,
    hostname: 'localhost'
  }
];
