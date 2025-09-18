import { logger } from '../utils/logger';
import { importAllProducts, importCompanyInfo } from './shopify';

// Synchronization status
interface SyncStatus {
  lastProductSync: Date | null;
  lastCompanySync: Date | null;
  productCount: number;
  errors: string[];
  isRunning: boolean;
}

let syncStatus: SyncStatus = {
  lastProductSync: null,
  lastCompanySync: null,
  productCount: 0,
  errors: [],
  isRunning: false
};

// Synchronize all data from Shopify
export const syncAllData = async (): Promise<SyncStatus> => {
  if (syncStatus.isRunning) {
    throw new Error('Synchronization already in progress');
  }

  syncStatus.isRunning = true;
  syncStatus.errors = [];

  try {
    logger.info('Starting full data synchronization...');

    // Sync company information
    try {
      await importCompanyInfo();
      syncStatus.lastCompanySync = new Date();
      logger.info('Company information synchronized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      syncStatus.errors.push(`Company sync failed: ${errorMessage}`);
      logger.error('Company information sync failed:', error);
    }

    // Sync products
    try {
      const result = await importAllProducts();
      syncStatus.lastProductSync = new Date();
      syncStatus.productCount = result.success;

      if (result.errors > 0) {
        syncStatus.errors.push(
          `Product sync: ${result.errors} errors occurred`
        );
      }

      logger.info(
        `Product synchronization completed: ${result.success} products, ${result.errors} errors`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      syncStatus.errors.push(`Product sync failed: ${errorMessage}`);
      logger.error('Product synchronization failed:', error);
    }

    logger.info('Data synchronization completed');
    return syncStatus;
  } finally {
    syncStatus.isRunning = false;
  }
};

// Synchronize only products
export const syncProducts = async (): Promise<{
  success: number;
  errors: number;
}> => {
  try {
    logger.info('Starting product synchronization...');

    const result = await importAllProducts();
    syncStatus.lastProductSync = new Date();
    syncStatus.productCount = result.success;

    logger.info(
      `Product synchronization completed: ${result.success} products, ${result.errors} errors`
    );
    return result;
  } catch (error) {
    logger.error('Product synchronization failed:', error);
    throw error;
  }
};

// Synchronize only company information
export const syncCompanyInfo = async (): Promise<void> => {
  try {
    logger.info('Starting company information synchronization...');

    await importCompanyInfo();
    syncStatus.lastCompanySync = new Date();

    logger.info('Company information synchronized successfully');
  } catch (error) {
    logger.error('Company information synchronization failed:', error);
    throw error;
  }
};

// Get synchronization status
export const getSyncStatus = (): SyncStatus => {
  return { ...syncStatus };
};

// Reset synchronization status
export const resetSyncStatus = (): void => {
  syncStatus = {
    lastProductSync: null,
    lastCompanySync: null,
    productCount: 0,
    errors: [],
    isRunning: false
  };
  logger.info('Synchronization status reset');
};

// Schedule periodic synchronization (for future use)
export const schedulePeriodicSync = (
  intervalMinutes: number = 60
): NodeJS.Timeout => {
  logger.info(`Scheduling periodic sync every ${intervalMinutes} minutes`);

  return setInterval(
    async () => {
      try {
        await syncAllData();
      } catch (error) {
        logger.error('Periodic synchronization failed:', error);
      }
    },
    intervalMinutes * 60 * 1000
  );
};

// Stop periodic synchronization
export const stopPeriodicSync = (intervalId: NodeJS.Timeout): void => {
  clearInterval(intervalId);
  logger.info('Periodic synchronization stopped');
};
