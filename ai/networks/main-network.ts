import { openai } from '@ai-sdk/openai';
import { NewAgentNetwork } from '@mastra/core/network/vNext';
import { frontendAgent } from '../agents/frontend-agent/index.js';
import { presalesAgent } from '../agents/presales-agent.js';
import { salesAgent } from '../agents/sales-agent.js';
import { salesFunnelWorkflow } from '../workflows/sales-funnel-workflow.js';
import { memory } from '../utils/memory.js';
import { PromptLoader } from '../utils/prompt-loader.js';

export const mainNetwork = new NewAgentNetwork({
  id: 'mainNetwork',
  name: 'Main Network',
  instructions: async ({ runtimeContext }) => {
    const companyName = String(
      runtimeContext?.get('companyName') || 'My Company'
    );
    const companyDescription = String(
      runtimeContext?.get('companyDescription') ||
      ''
    );

    let prompt = await PromptLoader.loadPrompt('main-network');

    // Replace placeholders with correct format
    prompt = prompt.replaceAll('${companyName}', companyName);
    prompt = prompt.replaceAll('${companyDescription}', companyDescription);

    return prompt;
  },
  model: openai('gpt-4o-mini'),  // ✅ Cambiato da gpt-4o a gpt-4o-mini (3x più veloce)
  agents: {
    frontendAgent,
    presalesAgent,
    salesAgent,
  },
  workflows: {
    salesFunnelWorkflow,
  },
  memory: ({ runtimeContext }) => memory(runtimeContext),
});