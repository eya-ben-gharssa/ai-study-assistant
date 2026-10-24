
const { PDFParse } = require("pdf-parse");
const fs = require("fs");

function chunkText(text, pageNumber, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const step = chunkSize - overlap;

  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + chunkSize);

    chunks.push({
      content: chunkWords.join(" "),
      page: pageNumber,
    });
  }

  return chunks;
}

async function main() {
  const data = new Uint8Array(
    fs.readFileSync("./rnn-course.pdf")
  );

  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();

    console.log("Total pages:", result.pages.length);

    const allChunks = [];

    result.pages.forEach((page, index) => {
      const pageNumber = index + 1;

      console.log(`\n--- Page ${pageNumber} ---`);
      console.log(page.text.slice(0, 300));

      const pageChunks = chunkText(page.text, pageNumber);
      allChunks.push(...pageChunks);
    });

    console.log("\nTotal chunks:", allChunks.length);

    console.log("\nFirst 3 chunks:");
    console.dir(allChunks.slice(0, 3), { depth: null });
  } finally {
    await parser.destroy();
  }
}

main().catch(console.error);
