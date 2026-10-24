# AI Study Assistant

An AI-powered study assistant that helps students understand course material by asking questions about their PDF documents.

## Features

- **PDF Upload:** Upload course documents in PDF format.
- **Document-Based Question Answering:** Ask questions about uploaded course material.
- **Retrieval-Augmented Generation (RAG):** Retrieve relevant text chunks from documents to provide context for AI-generated answers.
- **Semantic Search:** Use text embeddings to find content relevant to a student's question.
- **Page References:** Identify the pages associated with retrieved content.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- pgvector
- Groq API
- PDF text extraction
- Text embeddings

## How It Works

1. The student uploads a PDF document.
2. The backend extracts the document's text.
3. The text is divided into smaller chunks.
4. Each chunk is converted into a vector embedding.
5. The embeddings and document chunks are stored in the database.
6. When the student asks a question, the system retrieves relevant chunks using semantic similarity.
7. The retrieved content is provided to the AI model to generate a contextual answer.

## Project Structure

```text
ai-study-assistant/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └──.gitignore
├── frontend/
│   ├── src/
│   │   └── app/
│   │       └── page.tsx
│   ├── package.json
│   └──.gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL
- pgvector extension
- A Groq API key

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by the application, including your Groq API key and database connection settings.

Start the backend using the command configured in `backend/package.json`.

### Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Environment Variables

Keep API keys and database credentials in local environment files. Never commit secrets to GitHub.

## Project Status

Under development.

## Author

Developed as a full-stack AI engineering portfolio project.