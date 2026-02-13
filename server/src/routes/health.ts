import { Router, Request, Response } from 'express';
import { pingDatabase } from '../db';
import { pingChroma } from '../chromaClient';
import { pingGemini } from '../utils/gemini';

const router = Router();

interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

// GET /api/health — Check health of all services
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const results: Record<string, ServiceStatus> = {};

  // Check backend (always healthy if we got here)
  results.backend = { status: 'healthy', latency: 0 };

  // Check database
  const dbStart = Date.now();
  try {
    const dbOk = await pingDatabase();
    results.database = {
      status: dbOk ? 'healthy' : 'unhealthy',
      latency: Date.now() - dbStart,
      ...(dbOk ? {} : { error: 'Could not connect to PostgreSQL' }),
    };
  } catch (err: any) {
    results.database = {
      status: 'unhealthy',
      latency: Date.now() - dbStart,
      error: err.message,
    };
  }

  // Check ChromaDB
  const chromaStart = Date.now();
  try {
    const chromaOk = await pingChroma();
    results.chromadb = {
      status: chromaOk ? 'healthy' : 'unhealthy',
      latency: Date.now() - chromaStart,
      ...(chromaOk ? {} : { error: 'Could not connect to ChromaDB' }),
    };
  } catch (err: any) {
    results.chromadb = {
      status: 'unhealthy',
      latency: Date.now() - chromaStart,
      error: err.message,
    };
  }

  // Check Gemini LLM
  const llmStart = Date.now();
  try {
    const llmOk = await pingGemini();
    results.llm = {
      status: llmOk ? 'healthy' : 'unhealthy',
      latency: Date.now() - llmStart,
      ...(llmOk ? {} : { error: 'Could not reach Gemini API' }),
    };
  } catch (err: any) {
    results.llm = {
      status: 'unhealthy',
      latency: Date.now() - llmStart,
      error: err.message,
    };
  }

  const allHealthy = Object.values(results).every((s) => s.status === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    overall: allHealthy ? 'healthy' : 'degraded',
    services: results,
    timestamp: new Date().toISOString(),
  });
});

export default router;
