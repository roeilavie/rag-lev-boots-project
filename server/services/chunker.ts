export const chunkText = (
  text: string,
  size = 400,
  overlap = 50
): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const step = size - overlap;
  const chunks: string[] = [];

  for (let start = 0; start < words.length; start += step) {
    chunks.push(words.slice(start, start + size).join(' '));
    if (start + size >= words.length) break;
  }

  return chunks;
};
