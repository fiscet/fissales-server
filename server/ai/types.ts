// AI-specific types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AgentContext {
  userIntent?: string;
  productQuery?: string;
  companyInfo?: any;
  chatHistory?: ChatMessage[];
  recommendations?: any[];
}

export interface AgentResponse {
  response: string;
  context?: AgentContext;
  shouldEnd?: boolean;
}


