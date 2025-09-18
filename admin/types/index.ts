// Product types (matching server)
export interface Product {
  id: string;
  name: string;
  description: string;
  descriptionExtra: string;
  price: number;
  stock: number;
  imageUrl: string;
  productUrl: string;
}

// Company types (matching server)
export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  policies: string[];
  contactInfo: Record<string, any>;
  updatedAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  firebaseProducts: number;
  qdrantProducts: number;
  lastSyncFirebase?: Date;
  lastSyncQdrant?: Date;
}

// API response types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Sync response types
export interface SyncResponse {
  message: string;
  synced?: number;
  success?: number;
  errors?: number;
  timestamp: string;
}

// Search response types
export interface SearchResult {
  id: string;
  score: number;
  product: Product;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  count: number;
  timestamp: string;
}
