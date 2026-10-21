import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const EMBEDDING_MODEL = 'gemini-embedding-2';
const EMBEDDING_DIMENSIONS = 768;
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;
const MAX_RETRIES = 5;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// gemini-embedding-2 has no taskType; the task goes in the text itself.
// Use the same format for stored documents everywhere.
const formatDocument = (title: string, text: string) =>
  `title: ${title} | text: ${text}`;

const formatQuery = (question: string) =>
  `task: question answering | query: ${question}`;

const embedBatch = async (contents: string[]): Promise<number[][]> => {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        // one Content per item -> one embedding per item
        contents: contents.map((text) => ({ parts: [{ text }] })),
        config: { outputDimensionality: EMBEDDING_DIMENSIONS },
      });
      return (response.embeddings ?? []).map((e) => e.values ?? []);
    } catch (error) {
      if (attempt >= MAX_RETRIES) throw error;
      const wait = attempt * 5000;
      console.warn(`Embedding failed (attempt ${attempt}), retrying in ${wait}ms`);
      await sleep(wait);
    }
  }
};

export const embedQuery = async (question: string): Promise<number[]> => {
  const [embedding] = await embedBatch([formatQuery(question)]);

  if (embedding?.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS}-dim query embedding, got ${embedding?.length ?? 0}`
    );
  }
  return embedding;
};

export const embedDocuments = async (
  title: string,
  chunks: string[]
): Promise<number[][]> => {
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks
      .slice(i, i + BATCH_SIZE)
      .map((chunk) => formatDocument(title, chunk));
    const result = await embedBatch(batch);

    if (result.length !== batch.length) {
      throw new Error(`Expected ${batch.length} embeddings, got ${result.length}`);
    }
    embeddings.push(...result);
    if (i + BATCH_SIZE < chunks.length) await sleep(BATCH_DELAY_MS);
  }

  return embeddings;
};
