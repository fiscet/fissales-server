import {
  getFirestoreInstance,
  testFirebaseConnection
} from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import {
  chatSessionToFirestore,
  firestoreToChatSession,
  productToFirestore,
  firestoreToProduct,
  companyInfoToFirestore,
  firestoreToCompanyInfo
} from './models';
import { ChatSession, Product, CompanyInfo } from '../types';
import { logger } from '../utils/logger';

// Collection names
const COLLECTIONS = {
  CHAT_SESSIONS: 'chat_sessions',
  PRODUCTS: 'products',
  COMPANY_INFO: 'company_info',
  PRODUCT_EMBEDDINGS: 'product_embeddings',
  SYNC_METADATA: 'sync_metadata'
} as const;

// Chat Session Operations
export const createChatSession = async (
  sessionId: string
): Promise<ChatSession> => {
  try {
    const db = getFirestoreInstance();
    const now = new Date();

    const session: ChatSession = {
      sessionId,
      messages: [],
      createdAt: now,
      updatedAt: now,
      lastActive: now
    };

    const firestoreSession = chatSessionToFirestore(session);
    await db
      .collection(COLLECTIONS.CHAT_SESSIONS)
      .doc(sessionId)
      .set(firestoreSession);

    logger.info(`Chat session created: ${sessionId}`);
    return session;
  } catch (error) {
    logger.error('Error creating chat session:', error);
    throw error;
  }
};

export const getChatSession = async (
  sessionId: string
): Promise<ChatSession | null> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db
      .collection(COLLECTIONS.CHAT_SESSIONS)
      .doc(sessionId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as any;
    return firestoreToChatSession(data);
  } catch (error) {
    logger.error('Error getting chat session:', error);
    throw error;
  }
};

export const updateChatSession = async (
  sessionId: string,
  session: Partial<ChatSession>
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const updates = {
      ...session,
      updatedAt: new Date(),
      lastActive: new Date()
    };

    await db
      .collection(COLLECTIONS.CHAT_SESSIONS)
      .doc(sessionId)
      .update(updates);
    logger.info(`Chat session updated: ${sessionId}`);
  } catch (error) {
    logger.error('Error updating chat session:', error);
    throw error;
  }
};

export const addMessageToSession = async (
  sessionId: string,
  message: any
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const sessionRef = db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId);

    await sessionRef.update({
      messages: FieldValue.arrayUnion(message),
      updatedAt: new Date(),
      lastActive: new Date()
    });

    logger.info(`Message added to session: ${sessionId}`);
  } catch (error) {
    logger.error('Error adding message to session:', error);
    throw error;
  }
};

// Product Operations
export const createProduct = async (product: Product): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const firestoreProduct = productToFirestore(product);

    await db
      .collection(COLLECTIONS.PRODUCTS)
      .doc(product.id)
      .set(firestoreProduct);
    logger.info(`Product created: ${product.id}`);
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
};

export const getProduct = async (
  productId: string
): Promise<Product | null> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db.collection(COLLECTIONS.PRODUCTS).doc(productId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as any;
    return firestoreToProduct(data);
  } catch (error) {
    logger.error('Error getting product:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const db = getFirestoreInstance();
    const snapshot = await db.collection(COLLECTIONS.PRODUCTS).get();

    return snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return firestoreToProduct(data);
    });
  } catch (error) {
    logger.error('Error getting all products:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).update(updateData);
    logger.info(`Product updated: ${productId}`);
  } catch (error) {
    logger.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    await db.collection(COLLECTIONS.PRODUCTS).doc(productId).delete();
    logger.info(`Product deleted: ${productId}`);
  } catch (error) {
    logger.error('Error deleting product:', error);
    throw error;
  }
};

// Company Info Operations
export const createCompanyInfo = async (
  company: CompanyInfo
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const firestoreCompany = companyInfoToFirestore(company);

    await db
      .collection(COLLECTIONS.COMPANY_INFO)
      .doc(company.id)
      .set(firestoreCompany);
    logger.info(`Company info created: ${company.id}`);
  } catch (error) {
    logger.error('Error creating company info:', error);
    throw error;
  }
};

export const getCompanyInfo = async (
  companyId: string = 'company'
): Promise<CompanyInfo | null> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db
      .collection(COLLECTIONS.COMPANY_INFO)
      .doc(companyId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as any;
    return firestoreToCompanyInfo(data);
  } catch (error) {
    logger.error('Error getting company info:', error);
    throw error;
  }
};

// Simplified function for getting the single company info
export const getSingleCompanyInfo = async (): Promise<CompanyInfo | null> => {
  return getCompanyInfo('company');
};

export const updateCompanyInfo = async (
  companyId: string,
  updates: Partial<CompanyInfo>
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await db
      .collection(COLLECTIONS.COMPANY_INFO)
      .doc(companyId)
      .update(updateData);
    logger.info(`Company info updated: ${companyId}`);
  } catch (error) {
    logger.error('Error updating company info:', error);
    throw error;
  }
};

// Utility Functions
export const cleanupOldSessions = async (
  daysOld: number = 30
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const snapshot = await db
      .collection(COLLECTIONS.CHAT_SESSIONS)
      .where('lastActive', '<', cutoffDate)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${snapshot.docs.length} old chat sessions`);
  } catch (error) {
    logger.error('Error cleaning up old sessions:', error);
    throw error;
  }
};

// Sync Metadata Operations
interface SyncMetadata {
  id: string;
  lastShopifySync?: Date;
  lastQdrantSync?: Date;
  updatedAt: Date;
}

export const updateSyncMetadata = async (
  type: 'shopify' | 'qdrant'
): Promise<void> => {
  try {
    const db = getFirestoreInstance();
    const docRef = db
      .collection(COLLECTIONS.SYNC_METADATA)
      .doc('sync_timestamps');

    const updateData: any = {
      updatedAt: new Date()
    };

    if (type === 'shopify') {
      updateData.lastShopifySync = new Date();
    } else {
      updateData.lastQdrantSync = new Date();
    }

    await docRef.set(updateData, { merge: true });
    logger.info(`Sync metadata updated: ${type}`);
  } catch (error) {
    logger.error('Error updating sync metadata:', error);
    throw error;
  }
};

export const getSyncMetadata = async (): Promise<SyncMetadata | null> => {
  try {
    const db = getFirestoreInstance();
    const doc = await db
      .collection(COLLECTIONS.SYNC_METADATA)
      .doc('sync_timestamps')
      .get();

    if (!doc.exists) {
      return {
        id: 'sync_timestamps',
        updatedAt: new Date()
      };
    }

    const data = doc.data() as any;
    return {
      id: 'sync_timestamps',
      lastShopifySync: data.lastShopifySync?.toDate(),
      lastQdrantSync: data.lastQdrantSync?.toDate(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };
  } catch (error) {
    logger.error('Error getting sync metadata:', error);
    throw error;
  }
};

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  return await testFirebaseConnection();
};

export { COLLECTIONS };
