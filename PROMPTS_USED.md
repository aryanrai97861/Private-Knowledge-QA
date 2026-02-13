# Prompts Used During Development

Below are the key prompts I used during development, organized by phase. Minor follow-up questions and debugging exchanges are omitted for brevity.

---

## 1. Project Setup & Architecture

**Prompt**: "How should I structure a RAG-based Q&A app with React frontend, Node/Express backend, PostgreSQL for metadata, and ChromaDB for vector storage? What's a clean folder structure?"

**Prompt**: "What's the best way to set up a TypeScript Node.js project with Express? I want nodemon for hot reload and ts-node for dev."

---

## 2. Backend — Database & ChromaDB

**Prompt**: "Write a PostgreSQL connection module using the pg library that connects to Neon.tech with SSL. It should create a documents table if it doesn't exist."

**Prompt**: "How do I connect to a local ChromaDB server from Node.js using the chromadb npm package v3? The docs seem outdated."

**Prompt**: "What's the difference between `path` and `host`/`port` in the ChromaDB JS client constructor? I'm getting a deprecation warning."

---

## 3. Backend — Document Processing

**Prompt**: "Help me write a text chunking function that splits on paragraph boundaries first, then sentences, with configurable chunk size and overlap."

**Prompt**: "How do I use the pdf-parse npm package to extract text from a PDF buffer in Node.js?"

---

## 4. Backend — Gemini Integration

**Prompt**: "How do I use the @google/genai SDK to call Gemini 2.5 Flash for text generation? I need a simple function that takes a prompt string and returns the response text."

**Prompt**: "What's a good RAG prompt template that instructs the LLM to only answer from provided context and cite sources?"

---

## 5. Frontend — UI Components

**Prompt**: "Suggest a dark theme color palette with glassmorphism effects for a modern AI dashboard. I want purple/blue accent gradients."

**Prompt**: "How do I implement drag-and-drop file upload in React with visual feedback for dragover state?"

---

## 6. Debugging

**Prompt**: "I'm getting a TypeScript error with ChromaDB's `where` clause: 'Type string is not assignable to type LiteralValue'. How do I fix the type for the $eq operator?"

**Prompt**: "My Express server crashes on startup with 'API key must be set'. How can I make the Gemini client initialize lazily so the server starts without it?"

---

## Tools Used

- **AI Assistant**: Used for boilerplate scaffolding, API documentation lookups, and debugging assistance
- **Manual work**: Architecture design, prompt engineering, UX design, testing, security review
