import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { RetrievedChunk } from './knowledgeStore';

dotenv.config();

const ANSWER_MODEL = 'gemini-3.1-flash-lite';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const NOT_FOUND_MARKER = 'NOT_FOUND';

const SYSTEM_INSTRUCTION = `You answer questions about Lev-Boots.
Use ONLY the information in the provided context. Do not use outside knowledge.
If the context does not contain the answer, reply with exactly ${NOT_FOUND_MARKER} and nothing else.
Reply in plain text without markdown, because the answer is shown as raw text.`;

const buildContext = (chunks: RetrievedChunk[]) =>
  chunks
    .map(
      (chunk, i) =>
        `[${i + 1}] (source: ${chunk.source} - ${chunk.sourceId}, chunk ${chunk.chunkIndex})\n${chunk.content}`
    )
    .join('\n\n---\n\n');

export const generateAnswer = async (
  userQuestion: string,
  chunks: RetrievedChunk[]
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: ANSWER_MODEL,
    contents: `Context:\n${buildContext(chunks)}\n\nQuestion: ${userQuestion}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const answer = response.text?.trim();
  if (!answer) throw new Error('Gemini returned an empty answer');
  return answer;
};
