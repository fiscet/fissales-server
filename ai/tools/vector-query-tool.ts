import { openai } from '@ai-sdk/openai';
import { createVectorQueryTool } from '@mastra/rag';

// Create the vector query tool for product search
export const productSearchTool: any = createVectorQueryTool({
  id: 'product-search',
  description:
    'Search through the product knowledge base to find relevant winter sports equipment based on customer needs and requirements',
  vectorStoreName: 'qdrant', // This should match your vector store configuration
  indexName: 'products', // This should match your index name
  model: openai.embedding('text-embedding-3-small'),
  enableFilter: true, // Enable metadata filtering
  includeSources: true, // Include source information
  includeVectors: false // Don't include vectors in response to save bandwidth
});
