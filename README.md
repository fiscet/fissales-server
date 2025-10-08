# FisSales - AI-Powered Multi-Agent Sales System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.7+-orange.svg)](https://firebase.google.com/)
[![Mastra](https://img.shields.io/badge/Mastra-0.16+-purple.svg)](https://mastra.ai/)

A sophisticated AI-powered sales system that combines multiple specialized AI agents with a modern admin dashboard for e-commerce businesses, specifically designed for winter sports equipment retailers.

## 🎯 Overview

FisSales is a comprehensive multi-agent AI system that provides intelligent sales assistance through specialized agents, each designed to handle different aspects of the customer journey. The system integrates with Shopify for product management and uses advanced vector search capabilities for intelligent product recommendations.

## 🏗️ Architecture

The project is structured as a **single-instance deployment** that combines:

- **Express API Server** - Handles HTTP requests, AI agents, and Shopify integration
- **Admin Dashboard** - Next.js-based management interface (deployed separately on Vercel)

## 🤖 AI Agents System

The system employs six specialized AI agents, each with distinct responsibilities:

### 1. **Frontend Agent** 🎯

- **Role**: Intent detection and message routing
- **Function**: Analyzes incoming user messages and routes them to appropriate specialized agents
- **Routing Logic**: Company info → CompanyAgent, Product inquiries → RagAgent, Problems → PreSalesAgent, History → HistoryAgent

### 2. **History Agent** 📚

- **Role**: Conversation history management
- **Function**: Manages chat history for returning users and provides context from previous conversations
- **Features**: Session tracking, conversation continuity, user experience enhancement

### 3. **Company Agent** 🏢

- **Role**: Company information specialist
- **Function**: Provides accurate information about company policies, contact details, and general business information
- **Knowledge Base**: Company policies, contact information, business values

### 4. **Pre-Sales Agent** 💼

- **Role**: Customer needs analysis and guidance
- **Function**: Understands customer needs and guides them toward appropriate solutions
- **Capabilities**: Intent analysis, product guidance, pricing information, decision support

### 5. **Sales Agent** 🛒

- **Role**: Sales conversation handling
- **Function**: Manages the sales process and helps convert inquiries into purchases
- **Features**: Sales process management, customer engagement, conversion optimization

### 6. **RAG Agent** 🔍

- **Role**: Product recommendation specialist
- **Function**: Uses Retrieval-Augmented Generation to provide intelligent product recommendations
- **Technology**: Vector search with Qdrant, product matching, availability verification

## 🚀 Features

### Core Functionality

- **Multi-Agent Conversation System** - Intelligent routing and specialized responses
- **Vector-Based Product Search** - Advanced product recommendations using Qdrant
- **Session Management** - Anonymous session tracking and conversation history
- **Shopify Integration** - Real-time product data synchronization
- **Firebase Backend** - Secure data storage and user management
- **Admin Dashboard** - Complete product and system management interface

### Admin Dashboard Features

- **Product Management** - View, edit, and manage all products
- **Vector Search Testing** - Test and validate search functionality
- **Data Synchronization** - Sync products between Shopify, Firebase, and Qdrant
- **Authentication System** - Secure admin access with Firebase Auth
- **Real-time Statistics** - Monitor system performance and data status

## 🛠️ Technology Stack

### Backend

- **Node.js** (18+) - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and development experience
- **Mastra** - AI agent orchestration framework
- **Firebase Admin SDK** - Backend services and authentication
- **Qdrant** - Vector database for product search
- **Winston** - Logging system

### Frontend (Admin)

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Heroicons** - Icon library
- **Firebase SDK** - Client-side authentication

### AI & ML

- **OpenAI GPT** - Primary language model
- **Google Gemini** - Alternative AI model
- **Mastra Core** - AI agent framework
- **Qdrant** - Vector similarity search
- **RAG (Retrieval-Augmented Generation)** - Enhanced AI responses

### Integrations

- **Shopify API** - E-commerce platform integration
- **Firebase Firestore** - Document database
- **Firebase Authentication** - User management

## 📦 Installation

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Firebase project setup
- Shopify store with API access
- Qdrant instance (cloud or self-hosted)
- OpenAI API key

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fissales-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp env_example .env
   ```

   Configure the following environment variables:
   - **Firebase**: `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
   - **AI Models**: `OPENAI_API_KEY`, `GOOGLE_API_KEY`
   - **Shopify**: `WEBSHOP_URL`, `API_TOKEN`
   - **Qdrant**: `QDRANT_URL`, `QDRANT_API_KEY`

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### API Server

The main API server runs on `http://localhost:8080` and provides:

- **Chat Endpoint**: `POST /api/chat` - Main conversation interface
- **Product Search**: `POST /api/products/search` - Vector-based product search
- **Shopify Sync**: `GET /api/shopify/sync` - Synchronize product data
- **Health Check**: `GET /api/health` - System status monitoring
- **Documentation**: `GET /api/docs` - API documentation

### Chat Integration

Integrate the chat system into your frontend:

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'I need winter sports equipment',
    sessionId: 'user-session-id'
  })
});
```

## 📝 Scripts

### Development

```bash
npm run dev          # Start API server with hot reload
npm run dev:api      # Alternative API server start command
```

### Production

```bash
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
```

### Testing & Quality

```bash
npm test             # Run test suite
npm run lint         # Check code style
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking
```

### Maintenance

```bash
npm run clean        # Clean build artifacts and cache
```

### Database Management

```bash
npm run setup-firestore setup    # Setup completo Firestore
npm run setup-firestore check   # Verifica configurazione
npm run recreate-firestore recreate  # Ricrea database Firestore
npm run recreate-firestore test     # Testa connessione database
npm run recreate-firestore clean    # Pulisce e ricrea tutto
```

## 🔧 Configuration

### Environment Variables

#### Required

- `FIREBASE_PROJECT_ID` - Firebase project identifier
- `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- `WEBSHOP_URL` - Shopify store URL
- `API_TOKEN` - Shopify API access token
- `OPENAI_API_KEY` - OpenAI API key for GPT models
- `QDRANT_URL` - Qdrant instance URL
- `QDRANT_API_KEY` - Qdrant API key

#### Optional

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode (development/production)
- `SHOPIFY_API_VERSION` - Shopify API version (default: 2025-04)
- `LOG_LEVEL` - Logging level (default: info)

### Firebase Setup

1. Create a Firebase project
2. Enable Firestore Database
3. Enable Authentication
4. Generate service account credentials
5. Configure Firebase web app settings

### Shopify Integration

1. Create a Shopify private app
2. Enable required API permissions:
   - Products: Read access
   - Orders: Read access (if needed)
3. Generate API access token

## 🗂️ Project Structure

```
fissales-server/
├── ai/                             # AI integration and agents
│   ├── agents/                     # Agent implementations
│   ├── prompts/                    # Agent prompt templates
│   ├── tools/                      # AI tools and utilities
│   └── utils/                      # AI utility functions
├── config/                         # Configuration files
├── database/                       # Database utilities
├── middleware/                     # Express middleware
├── routes/                         # API route handlers
├── services/                       # Business logic services
├── types/                          # TypeScript type definitions
├── utils/                          # Utility functions
├── dist/                           # Compiled JavaScript output
└── logs/                           # Application logs
```

## 🔌 API Documentation

### Chat API

**POST** `/api/chat`

```json
{
  "message": "I'm looking for ski equipment",
  "sessionId": "unique-session-id"
}
```

### Product Search

**POST** `/api/products/search`

```json
{
  "query": "winter sports helmet",
  "limit": 10
}
```

### Health Check

**GET** `/api/health`
Returns system status and service availability.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the API documentation at `/api/docs`
- Review the deployment guide in `deploy.md`

## 🔄 Version History

- **v1.0.0** - Initial release with multi-agent system and admin dashboard
- Features: AI agents, Shopify integration, vector search, admin interface

---

**Built with ❤️ for modern e-commerce businesses**
