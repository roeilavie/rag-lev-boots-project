// Make sure you've reviewd the README.md file to understand the task and the RAG flow
import { loadPdfs, type LoadedSource } from './loaders/pdfLoader';
import { loadArticles } from './loaders/articleLoader';
import { loadSlackChannels } from './loaders/slackLoader';
import { chunkText } from './chunker';
import { embedDocuments, embedQuery } from './embeddings';
import { insertChunks, searchSimilarChunks, sourceExists } from './knowledgeStore';
import { generateAnswer, NOT_FOUND_MARKER } from './answerService';

const TOP_K = 5;

const ingest = async (sources: LoadedSource[]) => {
  for (const { source, sourceId, text } of sources) {
    if (await sourceExists(sourceId)) {
      console.log(`Skipping ${sourceId}: already loaded`);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`Embedding ${chunks.length} chunks from ${sourceId}`);
    const embeddings = await embedDocuments(sourceId, chunks);

    await insertChunks(
      chunks.map((content, chunkIndex) => ({
        source,
        sourceId,
        chunkIndex,
        content,
        embedding: embeddings[chunkIndex],
      }))
    );
    console.log(`Stored ${chunks.length} chunks from ${sourceId}`);
  }
};

export const loadAllData = async () => {
  await ingest(await loadPdfs());
  await ingest(await loadArticles());
  await ingest(await loadSlackChannels());
};

export const ask = async (userQuestion: string): Promise<string> => {
  const embedding = await embedQuery(userQuestion);
  const chunks = await searchSimilarChunks(embedding, TOP_K);

  const notFound = `I couldn't find any information in your resources about "${userQuestion}"`;
  if (chunks.length === 0) return notFound;

  const answer = await generateAnswer(userQuestion, chunks);
  return answer.includes(NOT_FOUND_MARKER) ? notFound : answer;
};
