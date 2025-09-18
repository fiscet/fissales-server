import { Memory } from '@mastra/memory';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { MastraContext } from '@/types';
import { storage } from '@/ai/utils/storage';


export const memory = (runtimeContext: RuntimeContext<MastraContext>) => {
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
};