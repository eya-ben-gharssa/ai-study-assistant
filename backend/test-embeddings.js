
async function main() {
  const { pipeline } = await import("@huggingface/transformers");

  console.log("Loading embedding model...");

  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  const text = "Recurrent neural networks maintain a hidden state.";

  const output = await embedder(text, {
    pooling: "mean",
    normalize: true,
  });

  const vector = Array.from(output.data);

  console.log("Vector dimensions:", vector.length);
  console.log("First 10 values:", vector.slice(0, 10));
}

main().catch(console.error);
