import { readFile } from 'fs/promises';
import path from 'path';
// Import the lib file directly: pdf-parse's index.js runs a debug routine
// that tries to read a test PDF when loaded outside CommonJS.
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { PDF_DIR, PDF_FILES } from '../../config/constants';

export interface LoadedSource {
  source: string;
  sourceId: string;
  text: string;
}

export const loadPdf = async (fileName: string): Promise<string> => {
  const { text } = await pdfParse(await readFile(path.join(PDF_DIR, fileName)));
  return text;
};

export const loadPdfs = async (): Promise<LoadedSource[]> => {
  const sources: LoadedSource[] = [];

  for (const file of PDF_FILES) {
    sources.push({ source: 'pdf', sourceId: file, text: await loadPdf(file) });
  }

  return sources;
};
