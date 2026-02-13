import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const GENERATION_MODEL = 'gemini-2.5-flash';

let genai: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!genai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.');
    }
    genai = new GoogleGenAI({ apiKey });
  }
  return genai;
}

interface Source {
  documentId: string;
  documentName: string;
  chunkText: string;
  similarity: number;
}

interface QAResult {
  answer: string;
  sources: Source[];
}

/**
 * Generates an answer using Gemini with context from retrieved chunks.
 */
export async function generateAnswer(
  question: string,
  contexts: { text: string; documentId: string; documentName: string; similarity: number }[]
): Promise<QAResult> {
  if (contexts.length === 0) {
    return {
      answer: 'I could not find any relevant information in the uploaded documents to answer your question. Please try uploading more documents or rephrasing your question.',
      sources: [],
    };
  }

  const contextText = contexts
    .map((ctx, i) => `[Source ${i + 1} - ${ctx.documentName}]:\n${ctx.text}`)
    .join('\n\n---\n\n');

  const prompt = `You are a helpful Q&A assistant. Answer the user's question based ONLY on the provided context from their documents. If the context doesn't contain enough information to answer the question, say so clearly.

Be specific and cite which source(s) you're drawing from.

CONTEXT:
${contextText}

QUESTION: ${question}

ANSWER:`;

  const client = getClient();
  const response = await client.models.generateContent({
    model: GENERATION_MODEL,
    contents: prompt,
  });

  const answer = response.text || 'Sorry, I was unable to generate an answer.';

  const sources: Source[] = contexts.map((ctx) => ({
    documentId: ctx.documentId,
    documentName: ctx.documentName,
    chunkText: ctx.text,
    similarity: ctx.similarity,
  }));

  return { answer, sources };
}

/**
 * Tests if Gemini API is accessible.
 */
export async function pingGemini(): Promise<boolean> {
  try {
    const client = getClient();
    // Use a lightweight metadata call instead of generateContent to avoid burning quota
    const model = await client.models.get({ model: GENERATION_MODEL });
    return !!model;
  } catch (err: any) {
    console.error('Gemini ping failed:', err.message || err);
    return false;
  }
}
