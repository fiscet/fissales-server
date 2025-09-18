import { Router } from 'express';
import { logger } from '../utils/logger.js';
import { invalidateCompanyInfoCache } from '../utils/company-cache.js';
import { importCompanyInfo } from '../services/shopify.js';
import { getSingleCompanyInfo } from '../database/utils.js';

const router = Router();

// Import company information from Shopify and update database
router.post('/import', async (_req, res) => {
  try {
    logger.info('Company information import requested');

    // Import company info from Shopify
    const companyInfo = await importCompanyInfo();

    // Invalida la cache dopo l'import
    invalidateCompanyInfoCache();

    res.status(200).json({
      message: 'Company information imported successfully',
      company: companyInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Company information import failed:', error);
    res.status(500).json({
      error: 'Company Import Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'COMPANY_IMPORT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Get current company information from database
router.get('/', async (_req, res) => {
  try {
    logger.info('Company information requested');

    const companyInfo = await getSingleCompanyInfo();

    if (!companyInfo) {
      return res.status(404).json({
        error: 'Company Information Not Found',
        message:
          'No company information found in database. Use POST /api/company/import to import from Shopify.',
        code: 'COMPANY_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      company: companyInfo,
      message: 'Company information retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Company information retrieval failed:', error);
    res.status(500).json({
      error: 'Company Retrieval Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'COMPANY_RETRIEVAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as companyRouter };
