import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ARTICLE_IDS, PDF_FILES } from '../../config/constants';
import { loadPdf } from '../../services/loaders/pdfLoader';
import { fetchArticle } from '../../services/loaders/articleLoader';

// Case-insensitive; the ".pdf" extension is optional.
const findPdf = (name: string) => {
  const n = name.trim().toLowerCase();
  return PDF_FILES.find((f) => {
    const file = f.toLowerCase();
    return file === n || file === `${n}.pdf`;
  });
};

// Case-insensitive; a trailing ".md" is ignored.
const findArticle = (name: string) => {
  const n = name.trim().toLowerCase().replace(/\.md$/, '');
  return ARTICLE_IDS.find((id) => id === n);
};

const text = (t: string, isError = false) => ({
  content: [{ type: 'text' as const, text: t }],
  ...(isError && { isError }),
});

export const registerReadSource = (server: McpServer) => {
  server.registerTool(
    'read_source',
    {
      title: 'Read a knowledge source',
      description:
        'Read the full raw text of a PDF (by file name) or an article (by id). Use list_knowledge_sources to see valid names.',
      inputSchema: {
        sourceName: z.string().min(1).describe('PDF file name or article id'),
        sourceType: z
          .enum(['pdf', 'article'])
          .optional()
          .describe('Optional. If omitted, the type is auto-detected.'),
      },
    },
    async ({ sourceName, sourceType }) => {
      // With an explicit type search only that list; otherwise try PDFs, then articles.
      const pdf = sourceType !== 'article' ? findPdf(sourceName) : undefined;
      const article =
        !pdf && sourceType !== 'pdf' ? findArticle(sourceName) : undefined;

      if (!pdf && !article) {
        return text(
          `Source "${sourceName}"${sourceType ? ` (type: ${sourceType})` : ''} not found.\n` +
            `Valid PDFs: ${PDF_FILES.join(', ')}\n` +
            `Valid articles: ${ARTICLE_IDS.join(', ')}`,
          true
        );
      }

      try {
        return text(pdf ? await loadPdf(pdf) : await fetchArticle(article!));
      } catch (e) {
        return text(`Failed to read source: ${(e as Error).message}`, true);
      }
    }
  );
};
