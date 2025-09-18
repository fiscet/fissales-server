import { UpstashStore } from '@mastra/upstash';
import dotenv from 'dotenv';

// Load environment variables first
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const storage = new UpstashStore({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});
