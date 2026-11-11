import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ARTICLE_IDS, PDF_FILES } from '../../config/constants';

export const registerListKnowledgeSources = (server: McpServer) => {
  server.registerTool(
    'list_knowledge_sources',
    {
      title: 'List knowledge sources',
      description:
        'List all PDFs and articles available in the Lev-Boots knowledge base.',
    },
    async () => {
      const sources = {
        pdfs: PDF_FILES.map((name) => ({ type: 'pdf', name })),
        articles: ARTICLE_IDS.map((id) => ({ type: 'article', id })),
      };

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(sources, null, 2) },
        ],
      };
    }
  );
};
