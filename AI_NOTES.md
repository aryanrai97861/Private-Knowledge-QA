# AI Usage Notes

## What I Used AI For

- **Boilerplate generation**: Used AI to scaffold the initial Express server setup and React page templates to save time on repetitive setup code.
- **CSS styling assistance**: Got suggestions for the glassmorphism card styles and gradient color palette. I iterated on the final values manually to match my design vision.
- **ChromaDB integration**: Asked AI for help with the ChromaDB client API since the documentation was sparse for the newer JS client version.
- **Debugging**: Used AI to help diagnose a TypeScript type mismatch in the ChromaDB `where` clause filter — turned out the types expected a different format than the docs showed.
- **PDF parsing**: Got guidance on how to use the `pdf-parse` library's class-based API (`PDFParse`), since the v2 API changed significantly from v1.

## What I Built / Checked Myself

- **Architecture design**: Designed the full RAG pipeline architecture myself — choosing to separate metadata (PostgreSQL) from vectors (ChromaDB) for better scalability.
- **Chunking strategy**: Implemented the text chunking logic with paragraph-aware splitting and overlap, tuned the chunk size (500 chars) and overlap (50 chars) based on testing with real documents.
- **Prompt engineering**: Wrote and refined the RAG prompt template for Gemini to ensure proper source attribution and factual grounding.
- **Database schema**: Designed the PostgreSQL schema and decided what metadata to store vs. what goes into ChromaDB.
- **Frontend UX flow**: Designed the 3-step user flow (Upload → Ask → Get Answers) and the overall page layout. Manually tuned all animations, transitions, and responsive breakpoints.
- **Error handling**: Implemented graceful degradation — the app starts even if ChromaDB or Gemini aren't available, with clear status indicators.
- **Security**: Verified CORS configuration, file type validation, upload size limits, and SQL injection prevention (parameterized queries).
- **Testing**: Manually tested all API endpoints, file upload edge cases (empty files, large files, invalid formats), and the full Q&A pipeline end-to-end.

## LLM Choice: Google Gemini 2.5 Flash

**Provider**: Google AI Studio (via `@google/genai` SDK)

**Why Gemini 2.5 Flash**:
1. **Speed**: Flash models are optimized for low-latency responses, which is critical for a Q&A app where users expect near-instant answers.
2. **Cost**: The free tier is generous enough for development and small-scale usage, and paid pricing is very competitive compared to alternatives.
3. **Context window**: Gemini 2.5 Flash supports a large context window, which is important when passing multiple document chunks as context for RAG.
4. **Quality**: Despite being a "lite" model, Flash produces well-structured, coherent answers with good instruction following — essential for citing sources accurately.
5. **Simple SDK**: The `@google/genai` package is straightforward to integrate with Node.js, with clean async/await patterns.

I considered OpenAI's GPT-4o-mini and Anthropic's Claude Haiku as alternatives, but Gemini offered the best balance of speed, cost, and context window size for this specific RAG use case.
