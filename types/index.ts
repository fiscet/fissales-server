// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  descriptionExtra: string;
  price: number;
  stock: number;
  imageUrl: string;
  productUrl: string;
  embeddings?: number[];
}

// Company types
export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  policies: string[];
  contactInfo: Record<string, any>;
  updatedAt: Date;
}

// Agent types
export interface AgentContext {
  sessionId: string;
  message: string;
  chatHistory?: ChatMessage[];
  requestType?: 'company_info' | 'product_info' | 'problem_solving' | 'other';
  products?: Product[];
  companyInfo?: CompanyInfo;
  // AI-specific context fields
  userIntent?: string;
  productQuery?: string;
  recommendations?: any[];
}

export interface AgentResponse {
  response: string;
  products?: Product[];
  context?: AgentContext;
  nextAction?: string;
  // AI-specific response fields
  shouldEnd?: boolean;
}

// Request/Response types
export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  products: Product[];
  sessionId: string;
  timestamp: Date;
}

export interface CreateSessionRequest {
  // No parameters needed for anonymous sessions
}

export interface CreateSessionResponse {
  sessionId: string;
  createdAt: Date;
}

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Error types
export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: Date;
  stack?: string;
}

// Environment types
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  WEBSHOP_URL: string;
  API_TOKEN: string;
  SHOPIFY_API_VERSION: string;
  GOOGLE_API_KEY: string;
  OPENAI_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
}

// Mastra types
export interface MastraContext {
  sessionId: string;
  userId?: string;
  companyName?: string;
  companyDescription?: string;
}
