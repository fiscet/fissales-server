import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger.js';

// Firebase configuration - lazy loading
const getFirebaseConfig = () => ({
  projectId: process.env['FIREBASE_PROJECT_ID'],
  privateKey: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
  clientEmail: process.env['FIREBASE_CLIENT_EMAIL']
});

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      const firebaseConfig = getFirebaseConfig();

      // Validate required environment variables
      if (!firebaseConfig.projectId) {
        throw new Error('FIREBASE_PROJECT_ID is required');
      }
      if (!firebaseConfig.privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is required');
      }
      if (!firebaseConfig.clientEmail) {
        throw new Error('FIREBASE_CLIENT_EMAIL is required');
      }

      // Initialize Firebase Admin
      const app = initializeApp({
        credential: cert({
          projectId: firebaseConfig.projectId,
          privateKey: firebaseConfig.privateKey,
          clientEmail: firebaseConfig.clientEmail
        })
      });

      logger.info('Firebase Admin SDK initialized successfully');
      return app;
    } else {
      logger.info('Firebase Admin SDK already initialized');
      return getApps()[0];
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
};

// Get Firestore instance
const getFirestoreInstance = () => {
  try {
    const app = initializeFirebase();
    if (!app) {
      throw new Error('Failed to initialize Firebase app');
    }
    const db = getFirestore(app);
    logger.info('Firestore instance created successfully');
    return db;
  } catch (error) {
    logger.error('Failed to get Firestore instance:', error);
    throw error;
  }
};

// Test Firebase connection
const testFirebaseConnection = async () => {
  try {
    const db = getFirestoreInstance();
    // Try to access a collection to test connection
    await db.collection('test').limit(1).get();
    logger.info('Firebase connection test successful');
    return true;
  } catch (error) {
    logger.error('Firebase connection test failed:', error);
    return false;
  }
};

export {
  initializeFirebase,
  getFirestoreInstance,
  testFirebaseConnection,
  getFirebaseConfig
};
