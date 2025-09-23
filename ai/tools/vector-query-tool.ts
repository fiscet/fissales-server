import { openai } from '@ai-sdk/openai';
import { createVectorQueryTool } from '@mastra/rag';
import { QdrantVector } from '@mastra/qdrant';
import { logger } from '../../utils/logger.js';
import { trackToolUsage } from '../../routes/performance.js';

// Initialize Qdrant vector store (cloud)
const qdrantVectorStore = new QdrantVector({
  url: process.env.QDRANT_URL || 'https://your-cluster.qdrant.io:6333',
  apiKey: process.env.QDRANT_API_KEY,
  https: true
});

// Create the base vector query tool for product search
const baseProductSearchTool = createVectorQueryTool({
  id: 'product-search',
  vectorStoreName: 'qdrant',
  description:
    'Search through the product knowledge base to find relevant winter sports equipment based on customer needs and requirements',
  vectorStore: qdrantVectorStore, // Pass the vector store directly
  indexName: 'products', // This should match your index name
  model: openai.embedding('text-embedding-3-small'),
  enableFilter: true, // Enable metadata filtering
  includeSources: true, // Include source information
  includeVectors: false // Don't include vectors in response to save bandwidth
});

// Wrap the tool with custom logging
export const productSearchTool = {
  ...baseProductSearchTool,
  execute: async (input: any, context: any) => {
    try {
      logger.info('🔍 productSearchTool called', {
        tool: 'product-search',
        input: input,
        sessionId: context?.runtimeContext?.get('sessionId'),
        userId: context?.runtimeContext?.get('userId')
      });

      trackToolUsage('productSearchTool', true);

      // Call the original execute function
      const result = await baseProductSearchTool.execute(input, context);

      logger.info('🔍 productSearchTool completed', {
        tool: 'product-search',
        resultsCount: result?.length || 0,
        sessionId: context?.runtimeContext?.get('sessionId'),
        userId: context?.runtimeContext?.get('userId')
      });

      return result;
    } catch (error) {
      logger.error('🔍 productSearchTool error', {
        tool: 'product-search',
        error: error,
        sessionId: context?.runtimeContext?.get('sessionId'),
        userId: context?.runtimeContext?.get('userId')
      });

      trackToolUsage('productSearchTool', false);
      throw error;
    }
  }
};