#!/usr/bin/env tsx
import 'dotenv/config';
import { PromptLoader } from '../ai/utils/prompt-loader.js';
import { logger } from '../utils/logger.js';

async function main() {
  const command = process.argv[2];
  const promptName = process.argv[3];
  const content = process.argv[4];

  try {
    switch (command) {
      case 'sync':
        if (!promptName) {
          console.log('Usage: npm run manage-prompts sync <prompt-name>');
          process.exit(1);
        }
        await PromptLoader.syncFileToFirestore(promptName);
        console.log(`✅ Synced ${promptName} to Firestore`);
        break;

      case 'save':
        if (!promptName || !content) {
          console.log('Usage: npm run manage-prompts save <prompt-name> "<content>"');
          process.exit(1);
        }
        await PromptLoader.savePromptToFirestore(promptName, content);
        console.log(`✅ Saved ${promptName} to Firestore`);
        break;

      case 'list':
        const prompts = await PromptLoader.listFirestorePrompts();
        console.log('📋 Firestore prompts:');
        prompts.forEach(name => console.log(`  - ${name}`));
        break;

      case 'load':
        if (!promptName) {
          console.log('Usage: npm run manage-prompts load <prompt-name>');
          process.exit(1);
        }
        const prompt = await PromptLoader.loadPrompt(promptName);
        console.log(`📄 Prompt: ${promptName}`);
        console.log('─'.repeat(50));
        console.log(prompt);
        break;

      case 'cache':
        const stats = PromptLoader.getCacheStats();
        console.log(`📊 Cache stats: ${stats.size} prompts cached`);
        stats.keys.forEach(key => console.log(`  - ${key}`));
        break;

      case 'clear-cache':
        PromptLoader.clearCache();
        console.log('🗑️  Cache cleared');
        break;

      default:
        console.log(`
🔧 Prompt Management Tool

Commands:
  sync <name>           Sync file to Firestore
  save <name> <content> Save prompt directly to Firestore  
  list                  List all Firestore prompts
  load <name>           Load and display a prompt
  cache                 Show cache statistics
  clear-cache           Clear prompt cache

Examples:
  npm run manage-prompts sync frontend-agent
  npm run manage-prompts list
  npm run manage-prompts load frontend-agent
        `);
    }
  } catch (error) {
    logger.error('Script failed:', error);
    process.exit(1);
  }
}

main();
