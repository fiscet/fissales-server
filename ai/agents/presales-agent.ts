import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PromptLoader } from '../utils/prompt-loader.js';
import { memory } from '../utils/memory.js';
import { productSearchTool } from '../tools/vector-query-tool.js';

export const presalesAgent = new Agent({
  name: 'presales-agent',
  description:
    'Pre-sales agent that researches products and prepares comprehensive recommendations for the sales agent when customer needs are clear and specific',
  instructions: async ({ runtimeContext }) => {
    const companyName = String(
      runtimeContext?.get('companyName') || 'FisSales'
    );
    const companyDescription = String(
      runtimeContext?.get('companyDescription') ||
      'Winter sports equipment retailer'
    );

    let prompt = await PromptLoader.loadPrompt('presales-agent');

    // Replace placeholders with correct format
    prompt = prompt.replaceAll('${companyName}', companyName);
    prompt = prompt.replaceAll('${companyDescription}', companyDescription);

    return prompt;
  },
  model: openai('gpt-4o-mini'),
  tools: {
    productSearchTool
  }
});
