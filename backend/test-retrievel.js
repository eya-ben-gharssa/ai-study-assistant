
const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function main() {
  const { pipeline } = await import("@huggingface/transformers");

  // 1. Load the embedding model once.
  console.log("Loading embedding model...");

  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  // 2. Extract text from your PDF.
  const data = new Uint8Array(
    fs.readFileSync("./rnn-course.pdf")
  );

  const parser = new PDFParse({ data });

  let pages;

  try {
    const result = await parser.getText();
    pages = result.pages;
  } finally {
    await parser.destroy();
  }

  // 3. Split each page into chunks.
  function chunkText(text, pageNumber, chunkSize = 500, overlap = 50) {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks = [];
    const step = chunkSize - overlap;

    for (let start = 0; start < words.length; start += step) {
      chunks.push({
        content: words.slice(start, start + chunkSize).join(" "),
        page: pageNumber,
      });
    }

    return chunks;
  }

  const chunks = pages.flatMap((page, index) =>
    chunkText(page.text, index + 1)
  );

  if (chunks.length === 0) {
    throw new Error("No text chunks found in the PDF.");
  }

  console.log("Pages:", pages.length);
  console.log("Chunks:", chunks.length);

  // 4. Embed the chunks in batches.
  const batchSize = 16;

  for (let start = 0; start < chunks.length; start += batchSize) {
    const batch = chunks.slice(start, start + batchSize);
    const texts = batch.map((chunk) => chunk.content);

    const output = await embedder(texts, {
      pooling: "mean",
      normalize: true,
    });

    const dimensions = output.dims[1];

    batch.forEach((chunk, index) => {
      const offset = index * dimensions;

      chunk.embedding = Array.from(
        output.data.slice(offset, offset + dimensions)
      );
    });

    console.log(
      `Embedded ${Math.min(start + batch.length, chunks.length)}/${chunks.length}`
    );
  }

  // 5. Embed a student's question.
  const question =
    "How does a recurrent neural network maintain information from previous time steps?";

  const questionOutput = await embedder(question, {
    pooling: "mean",
    normalize: true,
  });

  const questionVector = Array.from(questionOutput.data);

  // 6. Calculate cosine similarity.
  function cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // 7. Rank chunks by similarity.
  const results = chunks
    .map((chunk) => ({
      content: chunk.content,
      page: chunk.page,
      score: cosineSimilarity(questionVector, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log("\nQuestion:", question);
  console.log("\nTop 3 retrieved chunks:");

  results.forEach((result, index) => {
    console.log(`\n--- Result ${index + 1} ---`);
    console.log("Page:", result.page);
    console.log("Similarity:", result.score.toFixed(4));
    console.log("Content:", result.content);
  });
}

main().catch(console.error);
