import { ChromaClient, Collection } from 'chromadb';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
const CHROMA_PORT = parseInt(process.env.CHROMA_PORT || '8000', 10);
const COLLECTION_NAME = 'document_chunks';

let client: ChromaClient;
let collection: Collection;

export async function initChroma(): Promise<void> {
  client = new ChromaClient({ host: CHROMA_HOST, port: CHROMA_PORT });
  collection = await client.getOrCreateCollection({
    name: COLLECTION_NAME,
    metadata: { 'hnsw:space': 'cosine' },
  });
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
    const tempClient = new ChromaClient({ host: CHROMA_HOST, port: CHROMA_PORT });
    await tempClient.heartbeat();
    return true;
  } catch {
    return false;
  }
}

export { client };
