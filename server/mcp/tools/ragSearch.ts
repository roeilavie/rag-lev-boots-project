import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ask } from '../../services/ragService';

export const registerRagSearch = (server: McpServer) => {
  server.registerTool(
    'rag_search',
    {
      title: 'Ask about Lev-Boots',
      description:
        'Answer a question about Lev-Boots using the RAG knowledge base (PDFs, articles, Slack).',
      inputSchema: { question: z.string().min(1).describe('The question to ask') },
    },
    async ({ question }) => {
      try {
        return { content: [{ type: 'text' as const, text: await ask(question) }] };
      } catch (e) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `RAG search failed: ${(e as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
};
