import type { LoadedSource } from './pdfLoader';

const BASE_URL =
  'https://gist.githubusercontent.com/JonaCodes/394d01021d1be03c9fe98cd9696f5cf3/raw';

const ARTICLE_IDS = [
  'military-deployment-report',
  'urban-commuting',
  'hover-polo',
  'warehousing',
  'consumer-safety',
];

export const loadArticles = async (): Promise<LoadedSource[]> => {
  const sources: LoadedSource[] = [];

  for (const [i, id] of ARTICLE_IDS.entries()) {
    const fileName = `article-${i + 1}_${id}.md`;
    const response = await fetch(`${BASE_URL}/${fileName}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${fileName}: ${response.status} ${response.statusText}`
      );
    }

    sources.push({
      source: 'article',
      sourceId: fileName,
      text: await response.text(),
    });
  }

  return sources;
};
