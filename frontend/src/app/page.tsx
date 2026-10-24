
"use client";

import { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  async function uploadPDF(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setAnswer("");
    setUploadMessage("");
    setFilename("");
    setDocumentId("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const response = await fetch(`${API_URL}/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "PDF upload failed.");
      }

      setDocumentId(data.documentId);
      setFilename(data.filename);
      setUploadMessage(
        `PDF processed successfully: ${data.pages} pages, ${data.chunks} chunks.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function askQuestion() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          ...(documentId ? { documentId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-2xl pt-16">
        <p className="text-sm text-blue-400 mb-3">
          YOUR PERSONAL LEARNING SPACE
        </p>

        <h1 className="text-4xl font-bold mb-3">
          AI Study Assistant
        </h1>

        <p className="text-slate-400 mb-8">
          Ask questions. Understand concepts. Learn deeply.
        </p>

        <section className="mb-8 rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold mb-3">
            Your course material
          </h2>

          <label
            htmlFor="pdf"
            className="block mb-2 text-sm text-slate-300"
          >
            Upload a PDF course or set of notes (max 15 MB)
          </label>

          <input
            id="pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={uploadPDF}
            disabled={uploading}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500 disabled:opacity-50"
          />

          {uploading && (
            <p className="mt-3 text-blue-400">
              Processing PDF and generating embeddings...
            </p>
          )}

          {uploadMessage && (
            <p className="mt-3 text-green-400">
              {uploadMessage}
            </p>
          )}

          {filename && (
            <p className="mt-2 text-sm text-slate-300">
              Active document: {filename}
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Without a PDF, you can still ask general questions.
          </p>
        </section>

        <label
          htmlFor="question"
          className="block mb-2 font-medium"
        >
          What do you want to understand exactly?
        </label>

        <textarea
          id="question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Explain vanishing gradients..."
          rows={4}
          className="w-full rounded-xl bg-slate-900 border border-slate-700 p-4 outline-none focus:border-blue-500"
        />

        <button
          onClick={askQuestion}
          disabled={loading || uploading || !question.trim()}
          className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask question"}
        </button>

        {error && (
          <p role="alert" className="mt-6 text-red-400">
            {error}
          </p>
        )}

        {answer && (
          <section className="mt-8 rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold mb-3">
              Answer
            </h2>

            <div className="whitespace-pre-wrap leading-7 text-slate-300">
              {answer}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
