import { UpstashStore } from '@mastra/upstash';
export const storage = new UpstashStore({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});
