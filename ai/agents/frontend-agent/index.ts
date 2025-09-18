import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from './memory';
import { instructions } from './instructions';

export const frontendAgent = new Agent({
  name: 'frontend-agent',
  description:
    'Frontend orchestrator agent that routes customers through the pre-sales → sales agent pipeline or the company agent',
  model: openai('gpt-4o-mini'),
  instructions: async ({ runtimeContext }) => {
    return await instructions(runtimeContext);
  },
  memory: ({ runtimeContext }) => {
    return memory(runtimeContext);
  }
});
