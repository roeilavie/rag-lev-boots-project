import path from 'path';
import { fileURLToPath } from 'url';

export const PDF_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../knowledge_pdfs'
);

export const PDF_FILES = [
  'OpEd - A Revolution at Our Feet.pdf',
  'Research Paper - Gravitational Reversal Physics.pdf',
  'White Paper - The Development of Localized Gravity Reversal Technology.pdf',
];

export const ARTICLES_BASE_URL =
  'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

// Order matters: the gist file name is `article-${position}_${id}.md`.
export const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety',
];
