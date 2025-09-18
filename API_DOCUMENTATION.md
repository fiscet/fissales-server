# FisSales Server - API Documentation

## Base URL
```
http://localhost:4111/api
```

---

## 🏥 Health Check

### GET `/health`
Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345,
  "memory": {
    "rss": 50000000,
    "heapTotal": 30000000,
    "heapUsed": 20000000,
    "external": 1000000
  }
}
```

---

## 💬 Chat

### POST `/chat`
Main chat endpoint for AI agent conversations.

**Request Body:**
```json
{
  "message": "Hello, I need help with winter sports equipment",
  "sessionId": "session_123",
  "userId": "user_456"
}
```

**Response:**
```json
{
  "response": "Hello! I'd be happy to help you find the perfect winter sports equipment...",
  "sessionId": "session_123",
  "userId": "user_456",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid message or missing sessionId
- `500`: Chat processing failed

---

## 📝 Prompts Management

### GET `/prompts`
List all available prompts.

**Response:**
```json
{
  "success": true,
  "data": ["frontend-agent", "sales-agent", "company-agent"],
  "count": 3,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET `/prompts/:name`
Get specific prompt content.

**Parameters:**
- `name` (string): Prompt name (e.g., "frontend-agent")

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "frontend-agent",
    "content": "You are the Frontend Orchestrator Agent...",
    "loadedFrom": "cache"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST `/prompts/:name`
Create or update a prompt.

**Parameters:**
- `name` (string): Prompt name

**Request Body:**
```json
{
  "content": "You are an AI assistant that helps with..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "frontend-agent",
    "message": "Prompt saved successfully",
    "version": 1642234200000
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Validation:**
- Content must be a string
- Content must be less than 50,000 characters

### PUT `/prompts/:name`
Update a prompt (same as POST).

### DELETE `/prompts/:name`
Delete a prompt from Firestore.

### POST `/prompts/:name/sync`
Sync prompt file to Firestore.

### GET `/prompts/cache/stats`
Get prompt cache statistics.

### POST `/prompts/cache/clear`
Clear prompt cache.

---

## 🏢 Company

### GET `/company`
Get company information.

### POST `/company/import`
Import company data from external source.

---

## 🛍️ Shopify Integration

### GET `/shopify/products`
Get products from Shopify store.

### POST `/shopify/webhook`
Handle Shopify webhooks.

---

## 📦 Products

### GET `/products`
Get product catalog.

### GET `/products/:id`
Get specific product details.

### POST `/products/search`
Search products.

---

## 📊 Performance

### GET `/performance/metrics`
Get performance metrics.

---

## 📚 Documentation

### GET `/docs`
Get API documentation.

---

## 🚫 Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

---

## 🔐 Authentication

Most endpoints are currently open, but rate-limited:
- **Rate Limit**: 100 requests per 15 minutes per IP

---

## 📝 Usage Examples

### JavaScript/TypeScript
```javascript
// Get all prompts
const response = await fetch('/api/prompts');
const data = await response.json();

// Update a prompt
await fetch('/api/prompts/frontend-agent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'New prompt content...'
  })
});

// Chat with AI
const chatResponse = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'I need ski boots',
    sessionId: 'session_123',
    userId: 'user_456'
  })
});
```

### cURL
```bash
# List prompts
curl -X GET http://localhost:4111/api/prompts

# Update prompt
curl -X POST http://localhost:4111/api/prompts/frontend-agent \
  -H "Content-Type: application/json" \
  -d '{"content": "You are a helpful assistant..."}'

# Chat
curl -X POST http://localhost:4111/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "test_123"}'
```

---

## 🏗️ Architecture

- **Framework**: Express.js with TypeScript
- **AI**: Mastra framework with OpenAI GPT-4
- **Memory**: Firestore for conversation persistence
- **Storage**: Firebase/Firestore
- **Rate Limiting**: express-rate-limit
- **Logging**: Winston logger
- **Deployment**: Firebase App Hosting

---

*Last Updated: September 2024*
