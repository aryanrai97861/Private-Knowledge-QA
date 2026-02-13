import { ChromaClient, CloudClient, Collection } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const COLLECTION_NAME = 'document_chunks';

let client: ChromaClient;
let collection: Collection;

function isCloudMode(): boolean {
  return !!process.env.CHROMA_API_KEY;
}

function createClient(): ChromaClient {
  const apiKey = process.env.CHROMA_API_KEY;

  if (apiKey) {
    // Chroma Cloud mode
    console.log('🌐 Using Chroma Cloud');
    return new CloudClient({
      apiKey,
      tenant: process.env.CHROMA_TENANT,
      database: process.env.CHROMA_DATABASE,
    });
  }

  // Local mode
  const host = process.env.CHROMA_HOST || 'localhost';
  const port = parseInt(process.env.CHROMA_PORT || '8000', 10);
  console.log(`🏠 Using local ChromaDB at ${host}:${port}`);
  return new ChromaClient({ host, port });
}

export async function initChroma(): Promise<void> {
  client = createClient();

  if (isCloudMode()) {
    // In Cloud mode, use the cloud embedding function
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ChromaCloudQwenEmbeddingFunction } = require('@chroma-core/chroma-cloud-qwen') as any;
    const embeddingFunction = new ChromaCloudQwenEmbeddingFunction({
      apiKey: process.env.CHROMA_API_KEY!,
    });
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction,
    });
  } else {
    // Local mode — use default embedding
    collection = await client.getOrCreateCollection({
      name: COLLECTION_NAME,
      metadata: { 'hnsw:space': 'cosine' },
    });
  }

  console.log('✅ ChromaDB collection initialized');
}

export async function getCollection(): Promise<Collection> {
  if (!collection) {
    await initChroma();
  }
  return collection;
}

export async function pingChroma(): Promise<boolean> {
  try {
    const tempClient = createClient();
    await tempClient.heartbeat();
    return true;
  } catch {
    return false;
  }
}

export { client };
