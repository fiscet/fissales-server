import { Timestamp } from 'firebase-admin/firestore';
import { ChatSession, Product, CompanyInfo } from '../../types';

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp | null): Date | null => {
  return timestamp ? timestamp.toDate() : null;
};

// Convert Date to Firestore Timestamp
export const dateToTimestamp = (date: Date | null): Timestamp | null => {
  return date ? Timestamp.fromDate(date) : null;
};

// Chat Session Model
export interface FirestoreChatSession {
  sessionId: string;
  messages: FirestoreChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
}

export interface FirestoreChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  products?: Product[];
}

// Product Model
export interface FirestoreProduct {
  id: string;
  name: string;
  description: string;
  descriptionExtra?: string;
  price: number;
  stock: number;
  imageUrl: string;
  productUrl: string;
  embeddings?: number[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Company Info Model
export interface FirestoreCompanyInfo {
  id: string;
  name: string;
  description: string;
  policies: string[];
  contactInfo: Record<string, any>;
  updatedAt: Timestamp;
}

// Conversion functions
export const chatSessionToFirestore = (session: ChatSession): FirestoreChatSession => ({
  sessionId: session.sessionId,
  messages: session.messages.map(msg => ({
    ...msg,
    timestamp: dateToTimestamp(msg.timestamp)!
  })),
  createdAt: dateToTimestamp(session.createdAt)!,
  updatedAt: dateToTimestamp(session.updatedAt)!,
  lastActive: dateToTimestamp(session.lastActive)!
});

export const firestoreToChatSession = (data: FirestoreChatSession): ChatSession => ({
  sessionId: data.sessionId,
  messages: data.messages.map(msg => ({
    ...msg,
    timestamp: timestampToDate(msg.timestamp)!
  })),
  createdAt: timestampToDate(data.createdAt)!,
  updatedAt: timestampToDate(data.updatedAt)!,
  lastActive: timestampToDate(data.lastActive)!
});

export const productToFirestore = (product: Product): FirestoreProduct => ({
  ...product,
  createdAt: dateToTimestamp(new Date())!,
  updatedAt: dateToTimestamp(new Date())!
});

export const firestoreToProduct = (data: FirestoreProduct): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  descriptionExtra: data.descriptionExtra || '',
  price: data.price,
  stock: data.stock,
  imageUrl: data.imageUrl,
  productUrl: data.productUrl,
  embeddings: data.embeddings || []
});

export const companyInfoToFirestore = (company: CompanyInfo): FirestoreCompanyInfo => ({
  ...company,
  updatedAt: dateToTimestamp(company.updatedAt)!
});

export const firestoreToCompanyInfo = (data: FirestoreCompanyInfo): CompanyInfo => ({
  id: data.id,
  name: data.name,
  description: data.description,
  policies: data.policies,
  contactInfo: data.contactInfo,
  updatedAt: timestampToDate(data.updatedAt)!
});
