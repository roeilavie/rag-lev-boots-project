import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the lib file directly: pdf-parse's index.js runs a debug routine
// that tries to read a test PDF when loaded outside CommonJS.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface LoadedSource {
  source: string;
  sourceId: string;
  text: string;
}

const PDF_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../knowledge_pdfs'
);

export const loadPdfs = async (): Promise<LoadedSource[]> => {
  const files = (await readdir(PDF_DIR)).filter((f) => f.endsWith('.pdf'));
  const sources: LoadedSource[] = [];

  for (const file of files) {
    const { text } = await pdfParse(await readFile(path.join(PDF_DIR, file)));
    sources.push({ source: 'pdf', sourceId: file, text });
  }

  return sources;
};
