import type { LoadedSource } from './pdfLoader';
import { ARTICLE_IDS, ARTICLES_BASE_URL } from '../../config/constants';

export const articleFileName = (id: string): string =>
  `article-${ARTICLE_IDS.indexOf(id) + 1}_${id}.md`;

export const fetchArticle = async (id: string): Promise<string> => {
  const fileName = articleFileName(id);
  const response = await fetch(`${ARTICLES_BASE_URL}/${fileName}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${fileName}: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
};

export const loadArticles = async (): Promise<LoadedSource[]> => {
  const sources: LoadedSource[] = [];

  for (const id of ARTICLE_IDS) {
    sources.push({
      source: 'article',
      sourceId: articleFileName(id),
      text: await fetchArticle(id),
    });
  }

  return sources;
};
