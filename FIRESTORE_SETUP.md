# Setup Database Firestore

Questo documento spiega come ricreare il database Firestore per il progetto FisSales.

## 🚀 Comandi Disponibili

### Ricreare il Database
```bash
npm run recreate-firestore recreate
```

### Testare la Connessione
```bash
npm run recreate-firestore test
```

### Pulire e Ricreare Tutto
```bash
npm run recreate-firestore clean
```

## 📊 Struttura del Database

### Collezioni Create

1. **user_roles** - Gestione ruoli utenti
   - `email`: Email dell'utente
   - `name`: Nome dell'utente
   - `role`: Ruolo (admin, user, viewer)
   - `createdAt`: Data di creazione
   - `updatedAt`: Data ultimo aggiornamento
   - `isActive`: Stato attivo/inattivo

2. **chat_sessions** - Sessioni di chat
   - `userId`: ID utente
   - `sessionId`: ID sessione
   - `messages`: Array messaggi
   - `createdAt`: Data creazione
   - `updatedAt`: Data ultimo aggiornamento

3. **activity_logs** - Log delle attività
   - `userId`: ID utente
   - `action`: Azione eseguita
   - `timestamp`: Timestamp
   - `details`: Dettagli aggiuntivi

4. **configurations** - Configurazioni sistema
   - `key`: Chiave configurazione
   - `value`: Valore configurazione
   - `type`: Tipo di dato
   - `updatedAt`: Data ultimo aggiornamento

## 👤 Utente Principale

L'utente principale viene creato automaticamente:
- **Email**: contatto@fiscet.it
- **Nome**: gionni
- **Ruolo**: admin
- **Stato**: attivo

## 🔒 Regole di Sicurezza

Le regole di sicurezza Firestore sono configurate in `firestore.rules`:

- Solo utenti autenticati possono accedere
- Gli admin hanno privilegi completi
- Gli utenti possono gestire solo le proprie risorse
- I log sono accessibili solo agli admin

## 🛠️ Configurazione

### Variabili d'Ambiente Richieste

Assicurati di avere configurate queste variabili:

```env
FIREBASE_PROJECT_ID=fissales-chatbot
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### Deploy delle Regole

Per deployare le regole di sicurezza:

```bash
firebase deploy --only firestore:rules
```

Per deployare gli indici:

```bash
firebase deploy --only firestore:indexes
```

## 🔍 Verifica

Dopo aver eseguito lo script, puoi verificare la creazione:

1. Vai alla console Firebase
2. Seleziona il progetto "fissales-chatbot"
3. Vai su Firestore Database
4. Verifica che le collezioni siano presenti
5. Controlla che l'utente principale sia stato creato

## 🚨 Troubleshooting

### Errore di Connessione
- Verifica le variabili d'ambiente
- Controlla che il progetto Firebase sia attivo
- Verifica le credenziali di servizio

### Errore di Permessi
- Assicurati che l'account di servizio abbia i permessi necessari
- Verifica che il progetto sia configurato correttamente

### Database Vuoto
- Esegui il comando `clean` per pulire e ricreare tutto
- Verifica i log per eventuali errori

## 📝 Log

I log dello script sono disponibili in:
- Console output
- File di log del sistema (se configurato)

Per debug dettagliato, controlla i log con:
```bash
tail -f logs/combined.log
```
