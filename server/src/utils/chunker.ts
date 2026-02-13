export interface TextChunk {
  text: string;
  index: number;
}

/**
 * Splits text into overlapping chunks based on paragraphs.
 * Targets ~500 characters per chunk with ~50 char overlap.
 */
export function chunkText(text: string, maxChunkSize: number = 500, overlap: number = 50): TextChunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    // If a single paragraph exceeds maxChunkSize, split it by sentences
    if (trimmed.length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
        currentChunk = currentChunk.slice(-overlap);
      }

      const sentences = trimmed.match(/[^.!?]+[.!?]+/g) || [trimmed];
      let sentenceChunk = '';

      for (const sentence of sentences) {
        if ((sentenceChunk + sentence).length > maxChunkSize && sentenceChunk.length > 0) {
          chunks.push({ text: sentenceChunk.trim(), index: chunkIndex++ });
          sentenceChunk = sentenceChunk.slice(-overlap) + sentence;
        } else {
          sentenceChunk += sentence;
        }
      }

      if (sentenceChunk.trim().length > 0) {
        currentChunk = sentenceChunk;
      }
    } else if ((currentChunk + '\n\n' + trimmed).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
      currentChunk = currentChunk.slice(-overlap) + '\n\n' + trimmed;
    } else {
      currentChunk = currentChunk.length > 0 ? currentChunk + '\n\n' + trimmed : trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ text: currentChunk.trim(), index: chunkIndex });
  }

  // Edge case: if the whole text is one chunk or empty
  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push({ text: text.trim(), index: 0 });
  }

  return chunks;
}
