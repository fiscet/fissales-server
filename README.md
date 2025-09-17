# FisSales - AI-Powered Multi-Agent Sales System

This repository contains two independent projects:

## 📁 Project Structure

```
fissales/
├── admin/          # Next.js Admin Dashboard
│   ├── package.json
│   ├── components/
│   ├── app/
│   └── ...
└── server/         # Express API Server & AI Agents
    ├── package.json
    ├── server.ts
    ├── ai/
    ├── routes/
    └── ...
```

## 🚀 Quick Start

### Admin Dashboard
```bash
cd admin
npm install
npm run dev
# Runs on http://localhost:3001
```

### Server API
```bash
cd server
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📖 Documentation

- **Server Documentation**: See `server/README.md` for detailed API and server documentation
- **Admin Documentation**: See `admin/README.md` for admin dashboard documentation

## 🔧 Development

Each project is completely independent:
- Has its own `package.json` and dependencies
- Has its own configuration files
- Can be developed and deployed separately

## 🌐 Architecture

- **Admin Dashboard** (`admin/`): Next.js-based management interface for products and system monitoring
- **API Server** (`server/`): Express server with AI agents, Shopify integration, and vector search capabilities

---

For detailed documentation about each component, see the README files in their respective directories.