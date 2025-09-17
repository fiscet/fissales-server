import { Router } from 'express';
import { logger } from '../utils/logger';
import { getProduct, updateProduct, getAllProducts, updateSyncMetadata, getSyncMetadata } from '../database/utils';
import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { QdrantVector } from '@mastra/qdrant';
import { v5 as uuidv5 } from 'uuid';

const router = Router();


const QDRANT_COLLECTION = 'products';
const QDRANT_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Fixed namespace for consistent UUIDs

async function initQdrant() {
  const qdrant = new QdrantVector({
    url: process.env['QDRANT_URL']!,
    apiKey: process.env['QDRANT_API_KEY']!,
  });

  // Create the collection in Qdrant if it doesn't exist
  try {
    await qdrant.createIndex({
      indexName: QDRANT_COLLECTION,
      dimension: 1536,
      metric: 'cosine',
    });
    logger.info(`Qdrant collection ${QDRANT_COLLECTION} created or verified`);
  } catch (error) {
    logger.info(`Qdrant collection ${QDRANT_COLLECTION} might already exist`);
  }

  return qdrant;
}

// Route to save descriptionExtra of a single product
router.put('/:productId/description-extra', async (req, res) => {
  try {
    const { productId } = req.params;
    const { descriptionExtra } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID Required',
        message: 'Product ID is required',
        code: 'PRODUCT_ID_REQUIRED',
        timestamp: new Date().toISOString(),
      });
    }

    if (typeof descriptionExtra !== 'string') {
      return res.status(400).json({
        error: 'Invalid Description Extra',
        message: 'descriptionExtra must be a string',
        code: 'INVALID_DESCRIPTION_EXTRA',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Updating descriptionExtra for product: ${productId}`);

    // Verifica che il prodotto esista
    const existingProduct = await getProduct(productId);
    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: `Product ${productId} not found`,
        code: 'PRODUCT_NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
    }

    // Aggiorna solo il campo descriptionExtra
    await updateProduct(productId, { descriptionExtra });

    logger.info(`DescriptionExtra updated successfully for product: ${productId}`);

    return res.status(200).json({
      message: 'Product description extra updated successfully',
      productId,
      descriptionExtra,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Update description extra failed:', error);
    return res.status(500).json({
      error: 'Update Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'UPDATE_DESCRIPTION_EXTRA_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Route per importare tutti i prodotti da Firestore a Qdrant
router.post('/sync-to-qdrant', async (req, res) => {
  try {
    logger.info('Starting sync of all products to Qdrant');

    // Initialize Qdrant
    const qdrant = await initQdrant();

    // Recupera tutti i prodotti da Firestore
    const products = await getAllProducts();

    if (products.length === 0) {
      return res.status(200).json({
        message: 'No products found to sync',
        synced: 0,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Found ${products.length} products to sync`);

    // Prepara i testi per l'embedding
    const textsToEmbed = products.map(product =>
      `${product.name} ${product.description} ${product.descriptionExtra}`.trim()
    );

    // Genera gli embeddings usando OpenAI
    logger.info('Generating embeddings for products');
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: textsToEmbed,
    });

    // Prepara i metadati per Qdrant
    const metadata = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      descriptionExtra: product.descriptionExtra,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      text: `${product.name} ${product.description} ${product.descriptionExtra}`.trim(),
    }));

    // Carica i dati in Qdrant
    logger.info('Uploading products to Qdrant');

    // Log detailed parameters for debugging
    console.log('Qdrant upsert params:', {
      indexName: QDRANT_COLLECTION,
      vectorsLength: embeddings.length,
      metadataLength: metadata.length,
      idsLength: products.map(p => p.id).length,
      firstEmbedding: embeddings[0] ? embeddings[0].slice(0, 5) : 'none',
      firstMetadata: metadata[0] || 'none',
      firstId: products[0]?.id || 'none'
    });

    await qdrant.upsert({
      indexName: QDRANT_COLLECTION,
      vectors: embeddings,
      metadata,
      ids: products.map(p => uuidv5(p.id, QDRANT_NAMESPACE)),
    });

    logger.info(`Successfully synced ${products.length} products to Qdrant`);

    // Update sync metadata on successful bulk sync
    if (products.length > 0) {
      await updateSyncMetadata('qdrant');
    }

    return res.status(200).json({
      message: 'Products synced to Qdrant successfully',
      synced: products.length,
      collection: QDRANT_COLLECTION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Sync to Qdrant failed:', error);
    return res.status(500).json({
      error: 'Sync Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SYNC_TO_QDRANT_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Route per importare solo un prodotto da Firestore a Qdrant
router.post('/:productId/sync-to-qdrant', async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID Required',
        message: 'Product ID is required',
        code: 'PRODUCT_ID_REQUIRED',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Starting sync of product ${productId} to Qdrant`);

    // Initialize Qdrant
    const qdrant = await initQdrant();

    // Verify collection exists and get info
    try {
      const collectionInfo = await qdrant.describeIndex({ indexName: QDRANT_COLLECTION });
      console.log('Collection info:', collectionInfo);

      // Check if dimensions match
      if (collectionInfo.dimension !== 1536) {
        throw new Error(`Dimension mismatch: collection has ${collectionInfo.dimension}, but embeddings will be ${1536}`);
      }
    } catch (describeError) {
      console.error('Failed to describe collection:', describeError);
      throw new Error(`Collection ${QDRANT_COLLECTION} does not exist or is not accessible`);
    }

    // Recupera il prodotto da Firestore
    const product = await getProduct(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product Not Found',
        message: `Product ${productId} not found`,
        code: 'PRODUCT_NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
    }

    // Prepara il testo per l'embedding
    const textToEmbed = `${product.name} ${product.description} ${product.descriptionExtra}`.trim();

    // Genera l'embedding usando OpenAI
    logger.info(`Generating embedding for product ${productId}`);
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: [textToEmbed],
    });

    // Prepara i metadati per Qdrant (ensure all values are serializable)
    const metadata = {
      id: String(product.id),
      name: String(product.name || ''),
      description: String(product.description || ''),
      descriptionExtra: String(product.descriptionExtra || ''),
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      imageUrl: String(product.imageUrl || ''),
      productUrl: String(product.productUrl || ''),
      text: String(textToEmbed),
    };

    // Carica il prodotto in Qdrant
    logger.info(`Uploading product ${productId} to Qdrant`);

    // Validate data before upsert
    const vectorToInsert = embeddings[0];
    // Generate a consistent UUID based on product ID (same product = same UUID)
    const idToInsert = uuidv5(product.id, QDRANT_NAMESPACE);

    console.log('Qdrant upsert validation:', {
      indexName: QDRANT_COLLECTION,
      vectorDimension: vectorToInsert.length,
      vectorSample: vectorToInsert.slice(0, 3),
      idType: typeof idToInsert,
      id: idToInsert,
      metadataKeys: Object.keys(metadata),
      metadataValues: metadata,
      textLength: textToEmbed.length
    });

    // Double-check the upsert parameters
    const upsertParams = {
      indexName: QDRANT_COLLECTION,
      vectors: [vectorToInsert],
      metadata: [metadata],
      ids: [idToInsert],
    };
    console.log('Final upsert params:', JSON.stringify(upsertParams, null, 2));

    try {
      const upsertResult = await qdrant.upsert({
        indexName: QDRANT_COLLECTION,
        vectors: [vectorToInsert],
        metadata: [metadata],
        ids: [idToInsert],
      });
      console.log('✅ Qdrant upsert successful:', upsertResult);
    } catch (qdrantError: any) {
      console.error('❌ Qdrant upsert error:', qdrantError);
      console.error('Error details:', JSON.stringify(qdrantError, null, 2));

      // Try to extract more detailed error info
      if (qdrantError.cause && qdrantError.cause.data) {
        console.error('Qdrant API response data:', qdrantError.cause.data);
      }
      if (qdrantError.cause && qdrantError.cause.status) {
        console.error('Qdrant API status:', qdrantError.cause.status);
        console.error('Qdrant API statusText:', qdrantError.cause.statusText);
      }

      throw qdrantError;
    }

    logger.info(`Successfully synced product ${productId} to Qdrant`);

    // Update sync metadata on successful individual sync
    await updateSyncMetadata('qdrant');

    return res.status(200).json({
      message: 'Product synced to Qdrant successfully',
      productId,
      collection: QDRANT_COLLECTION,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Sync single product to Qdrant failed:`, error);
    return res.status(500).json({
      error: 'Sync Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SYNC_SINGLE_PRODUCT_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Route per ricevere risultati di ricerca da Qdrant
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query Required',
        message: 'Query string is required',
        code: 'QUERY_REQUIRED',
        timestamp: new Date().toISOString(),
      });
    }

    logger.info(`Searching products in Qdrant with query: "${query}"`);

    // Initialize Qdrant
    const qdrant = await initQdrant();

    // Generate embedding for the query
    const { embeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: [query],
    });

    // Search in Qdrant
    const searchResults = await qdrant.query({
      indexName: QDRANT_COLLECTION,
      queryVector: embeddings[0],
      topK: limit,
    });

    logger.info(`Found ${searchResults.length} results for query: "${query}"`);

    // Format results
    const formattedResults = searchResults.map((result: any) => ({
      productId: result.id,
      score: result.score,
      product: result.metadata,
    }));

    return res.status(200).json({
      query,
      results: formattedResults,
      count: formattedResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Qdrant search failed:', error);
    return res.status(500).json({
      error: 'Search Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'QDRANT_SEARCH_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Route per ottenere statistiche Qdrant
router.get('/qdrant/stats', async (req, res) => {
  try {
    // Initialize Qdrant
    const qdrant = await initQdrant();

    // Get collection info
    const collectionInfo = await qdrant.describeIndex({ indexName: QDRANT_COLLECTION });

    return res.status(200).json({
      collection: QDRANT_COLLECTION,
      count: collectionInfo.count,
      dimension: collectionInfo.dimension,
      metric: collectionInfo.metric,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get Qdrant stats:', error);
    return res.status(500).json({
      error: 'Stats Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'QDRANT_STATS_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get sync metadata
router.get('/sync/stats', async (_req, res) => {
  try {
    const syncMetadata = await getSyncMetadata();

    return res.status(200).json({
      lastShopifySync: syncMetadata?.lastShopifySync?.toISOString(),
      lastQdrantSync: syncMetadata?.lastQdrantSync?.toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to get sync metadata:', error);
    return res.status(500).json({
      error: 'Sync Stats Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'SYNC_STATS_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as productsRouter };