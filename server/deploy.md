# Deployment Guide - Single Instance

## Architettura

Il progetto è strutturato per girare in una **singola istanza** che combina:

- **Express API Server** (`server/`) - Gestisce le richieste HTTP, gli agenti AI e l'integrazione Shopify

## Struttura del Progetto

```
fissales/
├── package.json              # Package.json condiviso (root)
├── tsconfig.json             # Configurazione TypeScript condivisa
├── env_example               # Variabili d'ambiente
├── admin/                    # Dashboard amministrativo Next.js
└── server/                   # Express API Server & AI Agents
    ├── server.ts             # Entry point del server Express
    ├── ai/                   # Agenti AI e logica Mastra
    │   ├── prompts/          # Prompt templates per gli agenti
    │   └── types.ts          # Tipi TypeScript AI
    ├── routes/               # Route handlers
    ├── middleware/           # Middleware Express
    ├── config/               # Configurazioni (Firebase, Shopify)
    ├── database/             # Database utilities
    └── services/             # Business logic
```

## Vantaggi della Struttura Unificata

### 1. **Gestione Dipendenze Centralizzata**
- Un solo `package.json` nella root gestisce tutte le dipendenze
- Workspaces di npm per organizzare i moduli
- Evita duplicazioni e conflitti di versioni

### 2. **Deployment Semplificato**
- Una sola istanza da deployare
- Un solo processo da monitorare
- Configurazione unificata

### 3. **Integrazione Diretta**
- Il server Express può importare direttamente gli agenti Mastra
- Nessuna comunicazione di rete tra componenti
- Performance migliori

## Setup e Installazione

```bash
# Installazione di tutte le dipendenze
npm install

# Sviluppo (con hot reload)
npm run dev

# Produzione
npm start
```

## Configurazione Environment

Copia `env_example` in `.env` e configura:

```bash
cp env_example .env
```

## Scripts Disponibili

- `npm start` - Avvia il server in produzione
- `npm run dev` - Avvia in modalità sviluppo con hot reload
- `npm run build` - Compila TypeScript
- `npm test` - Esegue i test
- `npm run lint` - Controlla il codice
- `npm run type-check` - Verifica i tipi TypeScript

## Integrazione Mastra

Il server Express importa e utilizza gli agenti Mastra direttamente:

```typescript
// server/routes/chat.ts
import { processWithSupervisor } from '../ai/graph';

// Utilizzo diretto degli agenti
const { response, products } = await processWithSupervisor(sessionId, message);
```

## Deployment

### Opzione 1: Deploy Tradizionale
```bash
# Build del progetto
npm run build

# Avvio in produzione
npm start
```

### Opzione 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Opzione 3: Platform as a Service
- **Vercel**: Deploy automatico da Git
- **Railway**: Deploy con Docker
- **Heroku**: Deploy con buildpack Node.js

## Monitoraggio

Il server include endpoint di health check:
- `GET /api/health` - Status generale
- `GET /api/health/detailed` - Metriche dettagliate
- `GET /api/performance/metrics` - Performance e cache

## Vantaggi per il Deploy

1. **Semplicità**: Un solo servizio da gestire
2. **Performance**: Nessuna latenza di rete tra componenti
3. **Costi**: Un solo server/container
4. **Manutenzione**: Un solo punto di configurazione
5. **Scalabilità**: Facile da scalare orizzontalmente
