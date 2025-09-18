import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { PromptLoader } from '../utils/prompt-loader';

export const presalesAgent = new Agent({
  name: 'presales-agent',
  description:
    'Pre-sales agent that understands customer needs, fetches relevant products using RAG tools, and prepares comprehensive information for the sales agent',
  instructions: async ({ runtimeContext }) => {
    const companyName = String(
      runtimeContext?.get('companyName') || 'FisSales'
    );
    const companyDescription = String(
      runtimeContext?.get('companyDescription') ||
        'Winter sports equipment retailer'
    );
    const userMessage = String(runtimeContext?.get('userMessage') || '');
    const userIntent = String(runtimeContext?.get('userIntent') || '');
    const customerRequirements = String(
      runtimeContext?.get('customerRequirements') || ''
    );
    const conversationHistory = String(
      runtimeContext?.get('conversationHistory') || ''
    );

    let prompt = await PromptLoader.loadPrompt('pre-sales-agent');

    // Replace placeholders
    prompt = prompt.replaceAll('{companyName}', companyName);
    prompt = prompt.replaceAll('{companyDescription}', companyDescription);
    prompt = prompt.replaceAll('{userMessage}', userMessage);
    prompt = prompt.replaceAll('{userIntent}', userIntent);
    prompt = prompt.replaceAll('{customerRequirements}', customerRequirements);
    prompt = prompt.replaceAll('{conversationHistory}', conversationHistory);

    return prompt;
  },
  model: openai('gpt-4o-mini')
});
