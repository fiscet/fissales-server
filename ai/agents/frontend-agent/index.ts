import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from '../../utils/memory.js';
import { instructions } from './instructions.js';

export const frontendAgent = new Agent({
  name: 'frontend-agent',
  description:
    'Frontend agent that interacts with the user and guides him to provide all the necessary information.',
  model: openai('gpt-4o-mini'),
  instructions: async ({ runtimeContext }) => {
    return await instructions(runtimeContext);
  },
  memory: ({ runtimeContext }) => {
    return memory(runtimeContext);
  }
});
