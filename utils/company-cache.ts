import { getSingleCompanyInfo } from '../database/utils.js';
import { logger } from './logger.js';
import type { CompanyInfo } from '../types/index.js';

interface CompanyInfoCache {
  data: CompanyInfo | null;
  timestamp: number;
}

// Cache con TTL di 5 minuti
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti
let companyInfoCache: CompanyInfoCache | null = null;

/**
 * Ottiene le informazioni dell'azienda con cache
 * I dati vengono cachati per 5 minuti per ridurre le query al database
 */
export const getCompanyInfoCached = async (): Promise<CompanyInfo | null> => {
  const now = Date.now();

  // Controlla se abbiamo una cache valida
  if (companyInfoCache && now - companyInfoCache.timestamp < CACHE_TTL) {
    logger.debug('Company info retrieved from cache');
    return companyInfoCache.data;
  }

  try {
    // Carica i dati dal database
    logger.debug('Loading company info from database');
    const data = await getSingleCompanyInfo();

    // Aggiorna la cache
    companyInfoCache = {
      data,
      timestamp: now
    };

    logger.info('Company info cached successfully', {
      hasData: !!data,
      companyName: data?.name || 'N/A'
    });

    return data;
  } catch (error) {
    logger.error('Error loading company info:', error);

    // Se abbiamo una cache scaduta, usala come fallback
    if (companyInfoCache) {
      logger.warn('Using expired cache as fallback');
      return companyInfoCache.data;
    }

    return null;
  }
};

/**
 * Invalida la cache delle informazioni azienda
 * Utile quando i dati azienda vengono aggiornati
 */
export const invalidateCompanyInfoCache = (): void => {
  companyInfoCache = null;
  logger.info('Company info cache invalidated');
};

// Funzione di status rimossa - non necessaria per il funzionamento base
