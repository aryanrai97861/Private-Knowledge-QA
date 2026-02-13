import { Router, Request, Response } from 'express';
import { getCollection } from '../chromaClient';
import { generateAnswer } from '../utils/gemini';

const router = Router();

// POST /api/ask — Ask a question
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      res.status(400).json({ error: 'Please provide a valid question.' });
      return;
    }

    if (question.trim().length < 3) {
      res.status(400).json({ error: 'Question is too short. Please be more specific.' });
      return;
    }

    const collection = await getCollection();
    const count = await collection.count();

    if (count === 0) {
      res.status(400).json({
        error: 'No documents uploaded yet. Please upload some documents first before asking questions.',
      });
      return;
    }

    // Query ChromaDB for similar chunks (auto-embeds the query)
    const results = await collection.query({
      queryTexts: [question.trim()],
      nResults: Math.min(5, count),
    });

    // Build context from results
    const contexts = (results.documents?.[0] || []).map((doc, i) => ({
      text: doc || '',
      documentId: (results.metadatas?.[0]?.[i]?.document_id as string) || 'unknown',
      documentName: (results.metadatas?.[0]?.[i]?.document_name as string) || 'Unknown Document',
      similarity: results.distances ? 1 - (results.distances[0]?.[i] || 0) : 0,
    }));

    // Generate answer with Gemini
    const result = await generateAnswer(question.trim(), contexts);

    res.json({
      question: question.trim(),
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error: any) {
    console.error('QA error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate answer.' });
  }
});

export default router;
