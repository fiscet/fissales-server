import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { PromptLoader } from '../utils/prompt-loader';
import { storage } from '../utils/storage';

export const frontendAgent = new Agent({
  name: 'frontend-agent',
  description:
    'Frontend orchestrator agent that routes customers through the pre-sales → sales agent pipeline or the company agent',
  instructions: async ({ runtimeContext }) => {
    const companyName = String(
      runtimeContext?.get('companyName') || 'FisSales'
    );
    const companyDescription = String(
      runtimeContext?.get('companyDescription') ||
      'Winter sports equipment retailer'
    );

    let prompt = await PromptLoader.loadPrompt('frontend-agent');

    // Replace placeholders
    prompt = prompt.replaceAll('{companyName}', companyName);
    prompt = prompt.replaceAll('{companyDescription}', companyDescription);

    return prompt;
  },
  model: openai('gpt-4o-mini'),
  memory: ({ runtimeContext }) => {
    const userId = runtimeContext?.get('userId') || 'anonymous';
    const isAuthenticated = userId !== 'anonymous';

    return new Memory({
      storage,
      options: {
        lastMessages: 10,
        semanticRecall: { topK: 10, messageRange: 5 },
        workingMemory: {
          enabled: true,
          scope: isAuthenticated ? 'resource' : 'thread',
          template: `# User Profile
                    - **Interests**:
                    - **Current Goal**:
                    - **Budget**:
                    - **Experience Level**: [beginner, intermediate, expert]
                    - **Other Preferences**:
                    `
        }
      }
    });
  }
});
