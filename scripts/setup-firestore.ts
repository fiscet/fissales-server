#!/usr/bin/env tsx

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

/**
 * Script di setup completo per Firestore
 * Include la creazione del file .env e la ricreazione del database
 */
async function setupFirestore() {
  try {
    logger.info('🚀 Setup completo Firestore...');

    // 1. Verificare se esiste il file .env
    const envPath = join(process.cwd(), '.env');
    const envExamplePath = join(process.cwd(), 'env_example');

    if (!existsSync(envPath)) {
      logger.info('📝 Creazione file .env...');

      if (existsSync(envExamplePath)) {
        const envExample = readFileSync(envExamplePath, 'utf8');
        writeFileSync(envPath, envExample);
        logger.info('✅ File .env creato da env_example');
        logger.warn('⚠️ Ricorda di configurare le variabili d\'ambiente!');
      } else {
        logger.error('❌ File env_example non trovato');
        return false;
      }
    } else {
      logger.info('✅ File .env già esistente');
    }

    // 2. Verificare le variabili d'ambiente necessarie
    logger.info('🔍 Verifica variabili d\'ambiente...');

    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.error('❌ Variabili d\'ambiente mancanti:');
      missingVars.forEach(varName => {
        logger.error(`   - ${varName}`);
      });
      logger.info('📝 Configura le variabili nel file .env e riprova');
      return false;
    }

    logger.info('✅ Tutte le variabili d\'ambiente sono configurate');

    // 3. Importare e eseguire lo script di ricreazione
    logger.info('🔄 Esecuzione script di ricreazione database...');

    const { recreateFirestoreDatabase } = await import('./recreate-firestore.js');
    await recreateFirestoreDatabase();

    logger.info('🎉 Setup Firestore completato con successo!');
    return true;

  } catch (error) {
    logger.error('❌ Errore durante setup Firestore:', error);
    return false;
  }
}

/**
 * Funzione per verificare la configurazione
 */
async function checkConfiguration() {
  try {
    logger.info('🔍 Verifica configurazione...');

    // Verificare file di configurazione
    const configFiles = [
      'firebase.json',
      'firestore.rules',
      'firestore.indexes.json',
      'apphosting.yaml'
    ];

    const missingFiles = configFiles.filter(file => !existsSync(join(process.cwd(), file)));

    if (missingFiles.length > 0) {
      logger.error('❌ File di configurazione mancanti:');
      missingFiles.forEach(file => {
        logger.error(`   - ${file}`);
      });
      return false;
    }

    logger.info('✅ Tutti i file di configurazione sono presenti');

    // Verificare variabili d'ambiente
    const requiredVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      logger.warn('⚠️ Variabili d\'ambiente mancanti:');
      missingVars.forEach(varName => {
        logger.warn(`   - ${varName}`);
      });
      logger.info('📝 Configura le variabili nel file .env');
      return false;
    }

    logger.info('✅ Configurazione completa');
    return true;

  } catch (error) {
    logger.error('❌ Errore durante verifica configurazione:', error);
    return false;
  }
}

/**
 * Funzione per mostrare le istruzioni di setup
 */
function showSetupInstructions() {
  logger.info('📖 Istruzioni per il setup Firestore:');
  logger.info('');
  logger.info('1. 📝 Configura le variabili d\'ambiente nel file .env:');
  logger.info('   FIREBASE_PROJECT_ID=fissales-chatbot');
  logger.info('   FIREBASE_PRIVATE_KEY=your_private_key');
  logger.info('   FIREBASE_CLIENT_EMAIL=your_client_email');
  logger.info('');
  logger.info('2. 🚀 Esegui il setup completo:');
  logger.info('   npm run setup-firestore');
  logger.info('');
  logger.info('3. 🔍 Verifica la configurazione:');
  logger.info('   npm run setup-firestore check');
  logger.info('');
  logger.info('4. 🧪 Testa la connessione:');
  logger.info('   npm run recreate-firestore test');
  logger.info('');
  logger.info('5. 🗑️ Per pulire e ricreare tutto:');
  logger.info('   npm run recreate-firestore clean');
}

// Esecuzione dello script
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'setup';

  try {
    switch (command) {
      case 'setup':
        await setupFirestore();
        break;

      case 'check':
        await checkConfiguration();
        break;

      case 'help':
        showSetupInstructions();
        break;

      default:
        logger.info('📖 Comandi disponibili:');
        logger.info('   npm run setup-firestore setup  - Setup completo');
        logger.info('   npm run setup-firestore check  - Verifica configurazione');
        logger.info('   npm run setup-firestore help   - Mostra istruzioni');
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
  setupFirestore,
  checkConfiguration,
  showSetupInstructions
};
