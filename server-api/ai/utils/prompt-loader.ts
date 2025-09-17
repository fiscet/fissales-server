import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';

// Prompt loader implementation
class PromptLoaderClass {
  private cache: Map<string, string> = new Map();
  private promptsDir: string;

  constructor() {
    this.promptsDir = path.join(process.cwd(), 'server-ai', 'prompts');
  }

  async loadPrompt(promptName: string): Promise<string> {
    try {
      // Check cache first
      if (this.cache.has(promptName)) {
        return this.cache.get(promptName)!;
      }

      // Load from file
      const promptPath = path.join(this.promptsDir, `${promptName}.prompt`);
      const promptContent = await fs.promises.readFile(promptPath, 'utf-8');

      // Cache the prompt
      this.cache.set(promptName, promptContent);

      logger.debug(`Prompt loaded: ${promptName}`);
      return promptContent;
    } catch (error) {
      logger.error(`Failed to load prompt: ${promptName}`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('Prompt cache cleared');
  }

  getCacheStats(): { size: number; keys: string[]; } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const PromptLoader = new PromptLoaderClass();
