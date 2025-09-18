import { logger } from '../../utils/logger.js';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

// Prompt loader implementation
class PromptLoaderClass {
  private cache: Map<string, string> = new Map();
  private promptsDir: string;
  private db: FirebaseFirestore.Firestore | null = null;

  constructor() {
    this.promptsDir = path.join(process.cwd(), 'ai', 'prompts');
  }

  private initializeFirebase(): void {
    if (this.db) return; // Already initialized

    try {
      // Check if Firebase is already initialized
      if (getApps().length === 0) {
        // Use the same config as the main app
        const firebaseConfig = {
          projectId: process.env['FIREBASE_PROJECT_ID'],
          privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
          clientEmail: process.env['FIREBASE_CLIENT_EMAIL']
        };

        // Validate required environment variables
        if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
          throw new Error('Missing Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)');
        }

        // Initialize Firebase Admin
        initializeApp({
          credential: cert({
            projectId: firebaseConfig.projectId,
            privateKey: firebaseConfig.privateKey,
            clientEmail: firebaseConfig.clientEmail
          })
        });
      }

      this.db = getFirestore();
      logger.info('Firebase initialized for PromptLoader');
    } catch (error) {
      logger.warn('Failed to initialize Firebase, Firestore features disabled:', error);
      this.db = null;
    }
  }

  async loadPrompt(promptName: string): Promise<string> {
    try {
      // Check cache first
      if (this.cache.has(promptName)) {
        return this.cache.get(promptName)!;
      }

      // Try Firestore first (for live updates)
      this.initializeFirebase();
      if (this.db) {
        try {
          const doc = await this.db.collection('prompts').doc(promptName).get();

          if (doc.exists) {
            const data = doc.data();
            const prompt = data?.content;

            if (prompt && typeof prompt === 'string') {
              this.cache.set(promptName, prompt);
              logger.info(`Prompt loaded from Firestore: ${promptName}`);
              return prompt;
            }
          }
        } catch (firestoreError) {
          logger.warn(`Firestore prompt not found: ${promptName}, falling back to file`, firestoreError);
        }
      }

      // Fallback to file system
      const promptPath = path.join(this.promptsDir, `${promptName}.prompt`);
      const promptContent = await fs.promises.readFile(promptPath, 'utf-8');

      // Cache the prompt
      this.cache.set(promptName, promptContent);

      logger.debug(`Prompt loaded from file: ${promptName}`);
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

  // Firestore management methods
  async savePromptToFirestore(promptName: string, content: string): Promise<void> {
    this.initializeFirebase();
    if (!this.db) {
      throw new Error('Firestore not available');
    }

    try {
      await this.db.collection('prompts').doc(promptName).set({
        content,
        updatedAt: new Date(),
        version: Date.now()
      });

      // Clear cache to force reload
      this.cache.delete(promptName);

      logger.info(`Prompt saved to Firestore: ${promptName}`);
    } catch (error) {
      logger.error(`Failed to save prompt to Firestore: ${promptName}`, error);
      throw error;
    }
  }

  async syncFileToFirestore(promptName: string): Promise<void> {
    try {
      const promptPath = path.join(this.promptsDir, `${promptName}.prompt`);
      const content = await fs.promises.readFile(promptPath, 'utf-8');
      await this.savePromptToFirestore(promptName, content);
      logger.info(`Synced file to Firestore: ${promptName}`);
    } catch (error) {
      logger.error(`Failed to sync file to Firestore: ${promptName}`, error);
      throw error;
    }
  }

  async listFirestorePrompts(): Promise<string[]> {
    this.initializeFirebase();
    if (!this.db) {
      logger.warn('Firestore not available');
      return [];
    }

    try {
      const snapshot = await this.db.collection('prompts').get();
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      logger.error('Failed to list Firestore prompts', error);
      return [];
    }
  }

  async deletePromptFromFirestore(promptName: string): Promise<void> {
    this.initializeFirebase();
    if (!this.db) {
      throw new Error('Firestore not available');
    }

    try {
      await this.db.collection('prompts').doc(promptName).delete();

      // Clear cache to ensure it's not loaded from cache
      this.cache.delete(promptName);

      logger.info(`Prompt deleted from Firestore: ${promptName}`);
    } catch (error) {
      logger.error(`Failed to delete prompt from Firestore: ${promptName}`, error);
      throw error;
    }
  }
}

export const PromptLoader = new PromptLoaderClass();
