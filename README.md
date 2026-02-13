# Private Knowledge Q&A

A web application for uploading text documents, asking questions about them, and receiving AI-powered answers with source attribution. Built with a RAG (Retrieval-Augmented Generation) pipeline.

## Tech Stack

| Layer       | Technology                  |
|-------------|----------------------------|
| Frontend    | React + TypeScript (Vite)   |
| Backend     | Node.js + Express + TypeScript |
| Vector DB   | ChromaDB                    |
| Metadata DB | PostgreSQL (Neon.tech)      |
| AI Model    | Google Gemini 2.0 Flash     |

## Architecture

```
React Frontend → Express API → ChromaDB (vector search)
                             → PostgreSQL (document metadata)
                             → Gemini API (answer generation)
```

**RAG Flow:**
1. Upload → text split into chunks → stored in ChromaDB (auto-embedded) + metadata in PostgreSQL
2. Ask → ChromaDB similarity search → top-K chunks → Gemini generates answer → response with sources

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.8 (for ChromaDB server)
- **Neon.tech** PostgreSQL database
- **Google Gemini API** key

## Setup

### 1. Clone & install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` in the project root and fill in your credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
GEMINI_API_KEY=your_gemini_api_key
CHROMA_URL=http://localhost:8000
PORT=3001
```

### 3. Start ChromaDB

```bash
pip install chromadb
chroma run --port 8000
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Health:** http://localhost:3001/api/health

## Features

### ✅ Done
- Upload text-based documents (.txt, .md, .csv, .log, .json)
- View list of uploaded documents with metadata
- Delete uploaded documents
- Ask questions in natural language
- AI-powered answers via Gemini 2.0 Flash
- Source attribution: shows which document and passage contributed to the answer
- Similarity scores for each source
- Health/status page monitoring backend, database, ChromaDB, and LLM
- Drag-and-drop file upload
- Error handling for empty/wrong input
- Responsive design (mobile + desktop)
- Dark theme with premium UI

### ❌ Not Done
- User authentication / multi-tenancy
- PDF / DOCX file support
- Conversation history / follow-up questions
- Document editing after upload
- Streaming responses
- Rate limiting
- Deployment to production

## API Endpoints

| Method   | Endpoint              | Description              |
|----------|-----------------------|--------------------------|
| `GET`    | `/api/documents`      | List all documents       |
| `POST`   | `/api/documents`      | Upload a text file       |
| `DELETE` | `/api/documents/:id`  | Delete a document        |
| `POST`   | `/api/ask`            | Ask a question           |
| `GET`    | `/api/health`         | System health check      |
