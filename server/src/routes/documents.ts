import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import pool from '../db';
import { getCollection } from '../chromaClient';
import { chunkText } from '../utils/chunker';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.log', '.json', '.pdf'];

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Only these files are allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for PDFs
});

/**
 * Extract text content from an uploaded file.
 */
async function extractContent(filePath: string, originalname: string): Promise<string> {
  const ext = path.extname(originalname).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const { PDFParse } = require('pdf-parse') as any;
    const parser = new PDFParse({ data: dataBuffer });
    const result = await parser.getText();
    return result.text || '';
  }

  // All other text-based files
  return fs.readFileSync(filePath, 'utf-8');
}

// POST /api/documents — Upload a document
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Please select a file.' });
      return;
    }

    const filePath = req.file.path;
    let content: string;

    try {
      content = await extractContent(filePath, req.file.originalname);
    } catch (err: any) {
      fs.unlinkSync(filePath);
      res.status(400).json({ error: `Could not read file: ${err.message}` });
      return;
    }

    if (content.trim().length === 0) {
      fs.unlinkSync(filePath);
      res.status(400).json({ error: 'The uploaded file is empty or has no extractable text.' });
      return;
    }

    const docId = uuidv4();
    const filename = req.file.originalname;
    const chunks = chunkText(content);

    // Store document metadata in PostgreSQL
    await pool.query(
      'INSERT INTO documents (id, filename, content, chunk_count) VALUES ($1, $2, $3, $4)',
      [docId, filename, content, chunks.length]
    );

    // Store chunks in ChromaDB (it auto-embeds)
    const collection = await getCollection();
    const ids = chunks.map((_, i) => `${docId}_chunk_${i}`);
    const documents = chunks.map((c) => c.text);
    const metadatas = chunks.map((c) => ({
      document_id: docId,
      document_name: filename,
      chunk_index: c.index,
    }));

    await collection.add({
      ids,
      documents,
      metadatas,
    });

    // Clean up uploaded file from disk
    fs.unlinkSync(filePath);

    res.status(201).json({
      id: docId,
      filename,
      chunkCount: chunks.length,
      message: `Document "${filename}" uploaded and indexed successfully (${chunks.length} chunks).`,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload document.' });
  }
});

// GET /api/documents — List all documents
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, filename, chunk_count, uploaded_at FROM documents ORDER BY uploaded_at DESC'
    );
    res.json({ documents: result.rows });
  } catch (error: any) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
});

// DELETE /api/documents/:id — Delete a document
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const docId = req.params.id;
    console.log('Deleting document:', docId);

    // Delete from PostgreSQL
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING filename', [docId]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    // Delete chunks from ChromaDB
    try {
      const collection = await getCollection();
      const existing = await collection.get({
        where: { document_id: docId as string },
      });

      if (existing.ids.length > 0) {
        await collection.delete({ ids: existing.ids });
      }
    } catch (chromaErr: any) {
      console.warn('ChromaDB delete warning:', chromaErr.message);
      // Don't fail the whole delete if ChromaDB has issues
    }

    res.json({ message: `Document "${result.rows[0].filename}" deleted successfully.` });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete document.' });
  }
});

export default router;
