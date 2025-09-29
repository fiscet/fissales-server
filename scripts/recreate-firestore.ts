#!/usr/bin/env tsx

import { config } from 'dotenv';
import { getFirestoreInstance } from '../config/firebase.js';
import { getAuth } from 'firebase-admin/auth';
import { logger } from '../utils/logger.js';

// Carica le variabili d'ambiente
config();

interface UserRole {
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Script per ricreare il database Firestore con le collezioni necessarie
 */
async function recreateFirestoreDatabase() {
  try {
    logger.info('🚀 Inizio ricreazione database Firestore...');

    const db = getFirestoreInstance();

    // 1. Creare la collezione user_roles
    logger.info('📝 Creazione collezione user_roles...');

    const userRolesCollection = db.collection('user_roles');

    // 2. Collegare l'utente esistente in Firebase Authentication
    const auth = getAuth();
    const existingUserUid = 'Zets50DCthXqUkP6TCkX6djg9JW2';

    logger.info('👤 Collegamento utente esistente in Firebase Authentication...');

    // Verificare che l'utente esista in Firebase Authentication
    try {
      const userRecord = await auth.getUser(existingUserUid);
      logger.info(`✅ Utente trovato in Firebase Auth: ${userRecord.email}`);

      // Creare il documento user_roles con l'UID dell'utente esistente
      const mainUser: UserRole = {
        email: userRecord.email || 'contatto@fiscet.it',
        name: 'gionni',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      // Usare l'UID come ID del documento per collegare i due sistemi
      const userDocRef = userRolesCollection.doc(existingUserUid);
      await userDocRef.set(mainUser);

      logger.info(`✅ Utente principale collegato con UID: ${existingUserUid}`);

    } catch (error) {
      logger.error('❌ Errore nel collegamento utente Firebase Auth:', error);

      // Fallback: creare un nuovo documento se l'utente non esiste
      logger.info('🔄 Creazione nuovo utente...');
      const mainUser: UserRole = {
        email: 'contatto@fiscet.it',
        name: 'gionni',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };

      const userDoc = await userRolesCollection.add(mainUser);
      logger.info(`✅ Utente principale creato con ID: ${userDoc.id}`);
    }

    // 3. Verificare la creazione
    logger.info('🔍 Verifica creazione collezione...');
    const snapshot = await userRolesCollection.get();

    if (snapshot.empty) {
      throw new Error('La collezione user_roles è vuota');
    }

    logger.info(`✅ Collezione user_roles creata con ${snapshot.size} documenti`);

    // 4. Mostrare i dati creati
    snapshot.forEach(doc => {
      const data = doc.data();
      logger.info(`📄 Documento ID: ${doc.id}`);
      logger.info(`   Email: ${data.email}`);
      logger.info(`   Nome: ${data.name}`);
      logger.info(`   Ruolo: ${data.role}`);
      logger.info(`   Attivo: ${data.isActive}`);
    });

    // 5. Creare altre collezioni se necessarie
    logger.info('📚 Creazione altre collezioni...');

    // Collezione per le sessioni di chat
    const chatSessionsCollection = db.collection('chat_sessions');
    logger.info('✅ Collezione chat_sessions pronta');

    // Collezione per i log delle attività
    const activityLogsCollection = db.collection('activity_logs');
    logger.info('✅ Collezione activity_logs pronta');

    // Collezione per le configurazioni
    const configurationsCollection = db.collection('configurations');
    logger.info('✅ Collezione configurations pronta');

    logger.info('🎉 Database Firestore ricreato con successo!');
    logger.info('📊 Collezioni create:');
    logger.info('   - user_roles (con utente principale)');
    logger.info('   - chat_sessions');
    logger.info('   - activity_logs');
    logger.info('   - configurations');

    return true;

  } catch (error) {
    logger.error('❌ Errore durante la ricreazione del database:', error);
    throw error;
  }
}

/**
 * Funzione per testare la connessione al database
 */
async function testDatabaseConnection() {
  try {
    logger.info('🔌 Test connessione database...');

    const db = getFirestoreInstance();

    // Test di lettura
    const userRolesCollection = db.collection('user_roles');
    const snapshot = await userRolesCollection.limit(1).get();

    if (!snapshot.empty) {
      logger.info('✅ Connessione database funzionante');
      return true;
    } else {
      logger.warn('⚠️ Database vuoto - potrebbe essere necessario ricreare le collezioni');
      return false;
    }

  } catch (error) {
    logger.error('❌ Errore connessione database:', error);
    return false;
  }
}

/**
 * Funzione per sincronizzare tutti gli utenti da Firebase Authentication
 */
async function syncUsersFromAuth() {
  try {
    logger.info('🔄 Sincronizzazione utenti da Firebase Authentication...');

    const db = getFirestoreInstance();
    const auth = getAuth();
    const userRolesCollection = db.collection('user_roles');

    // Ottenere tutti gli utenti da Firebase Authentication
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;

    logger.info(`👥 Trovati ${users.length} utenti in Firebase Authentication`);

    for (const userRecord of users) {
      try {
        // Verificare se l'utente esiste già in user_roles
        const userDocRef = userRolesCollection.doc(userRecord.uid);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          logger.info(`✅ Utente ${userRecord.email} già sincronizzato`);
          continue;
        }

        // Creare il documento user_roles per l'utente
        const userRole: UserRole = {
          email: userRecord.email || '',
          name: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
          role: userRecord.email === 'contatto@fiscet.it' ? 'admin' : 'user',
          createdAt: new Date(userRecord.metadata.creationTime),
          updatedAt: new Date(),
          isActive: !userRecord.disabled
        };

        await userDocRef.set(userRole);
        logger.info(`✅ Utente sincronizzato: ${userRecord.email} (${userRole.role})`);

      } catch (error) {
        logger.error(`❌ Errore sincronizzazione utente ${userRecord.email}:`, error);
      }
    }

    logger.info('🎉 Sincronizzazione utenti completata!');
    return true;

  } catch (error) {
    logger.error('❌ Errore durante sincronizzazione utenti:', error);
    throw error;
  }
}

/**
 * Funzione per pulire e ricreare tutto
 */
async function cleanAndRecreate() {
  try {
    logger.info('🧹 Pulizia database esistente...');

    const db = getFirestoreInstance();

    // Eliminare tutte le collezioni esistenti
    const collections = ['user_roles', 'chat_sessions', 'activity_logs', 'configurations'];

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const snapshot = await collection.get();

        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          logger.info(`🗑️ Collezione ${collectionName} pulita`);
        }
      } catch (error) {
        logger.warn(`⚠️ Errore pulizia collezione ${collectionName}:`, error);
      }
    }

    // Ricreare tutto
    await recreateFirestoreDatabase();

  } catch (error) {
    logger.error('❌ Errore durante pulizia e ricreazione:', error);
    throw error;
  }
}

// Esecuzione dello script
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'recreate';

  try {
    switch (command) {
      case 'recreate':
        await recreateFirestoreDatabase();
        break;

      case 'test':
        await testDatabaseConnection();
        break;

      case 'clean':
        await cleanAndRecreate();
        break;

      case 'sync':
        await syncUsersFromAuth();
        break;

      default:
        logger.info('📖 Comandi disponibili:');
        logger.info('   npm run recreate-firestore recreate  - Ricrea il database');
        logger.info('   npm run recreate-firestore test      - Testa la connessione');
        logger.info('   npm run recreate-firestore clean     - Pulisce e ricrea tutto');
        logger.info('   npm run recreate-firestore sync      - Sincronizza utenti da Firebase Auth');
        break;
    }

    process.exit(0);

  } catch (error) {
    logger.error('💥 Errore fatale:', error);
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  recreateFirestoreDatabase,
  testDatabaseConnection,
  cleanAndRecreate,
  syncUsersFromAuth
};
