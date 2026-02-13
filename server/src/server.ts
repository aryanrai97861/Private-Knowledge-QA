import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db';
import { initChroma } from './chromaClient';
import documentsRouter from './routes/documents';
import qaRouter from './routes/qa';
import healthRouter from './routes/health';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/documents', documentsRouter);
app.use('/api/ask', qaRouter);
app.use('/api/health', healthRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  if (err.message?.includes('Only text-based files')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error.' });
});

// Start server
async function start() {
  try {
    console.log('🚀 Starting server...');

    // Initialize database
    try {
      await initDatabase();
    } catch (err) {
      console.warn('⚠️  Database initialization failed. Some features may be limited:', (err as Error).message);
    }

    // Initialize ChromaDB
    try {
      await initChroma();
    } catch (err) {
      console.warn('⚠️  ChromaDB initialization failed. Document upload/search may be limited:', (err as Error).message);
    }

    app.listen(PORT, () => {
      console.log(`\n✅ Server running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
