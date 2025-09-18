import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PromptLoader } from '../utils/prompt-loader';

export const salesAgent = new Agent({
  name: 'sales-agent',
  description:
    'Master sales professional trained in Zig Ziglar methodology who helps customers achieve their winter sports dreams while closing sales with genuine care and expertise',
  instructions: async ({ runtimeContext }) => {
    const companyName = String(
      runtimeContext?.get('companyName') || 'FisSales'
    );
    const companyDescription = String(
      runtimeContext?.get('companyDescription') ||
        'Winter sports equipment retailer'
    );
    const userMessage = String(runtimeContext?.get('userMessage') || '');
    const conversationHistory = String(
      runtimeContext?.get('conversationHistory') || ''
    );
    const preSalesData = String(runtimeContext?.get('preSalesData') || '{}');

    let prompt = await PromptLoader.loadPrompt('sales-agent');

    // Replace placeholders
    prompt = prompt.replaceAll('{companyName}', companyName);
    prompt = prompt.replaceAll('{companyDescription}', companyDescription);
    prompt = prompt.replaceAll('{userMessage}', userMessage);
    prompt = prompt.replaceAll('{conversationHistory}', conversationHistory);
    prompt = prompt.replaceAll('{preSalesData}', preSalesData);

    return prompt;
  },
  model: openai('gpt-4o-mini')
});
