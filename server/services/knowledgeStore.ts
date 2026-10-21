import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import KnowledgeBase from '../models/KnowledgeBase';

export interface ChunkRow {
  source: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export interface RetrievedChunk {
  source: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

const IVFFLAT_PROBES = 10;

// Cosine distance (<=>) matches the index's vector_cosine_ops. The index was
// built on an empty table, so probe more lists to avoid missing neighbours.
export const searchSimilarChunks = async (
  embedding: number[],
  k: number
): Promise<RetrievedChunk[]> =>
  sequelize.transaction(async (transaction) => {
    await sequelize.query(`SET LOCAL ivfflat.probes = ${IVFFLAT_PROBES}`, {
      transaction,
    });

    const rows = await sequelize.query<{
      source: string;
      source_id: string;
      chunk_index: number;
      chunk_content: string;
      similarity: number;
    }>(
      `SELECT source, source_id, chunk_index, chunk_content,
              1 - (embeddings_768 <=> CAST(:embedding AS vector)) AS similarity
       FROM knowledge_base
       WHERE embeddings_768 IS NOT NULL
       ORDER BY embeddings_768 <=> CAST(:embedding AS vector)
       LIMIT :k`,
      {
        replacements: { embedding: `[${embedding.join(',')}]`, k },
        type: QueryTypes.SELECT,
        transaction,
      }
    );

    return rows.map((row) => ({
      source: row.source,
      sourceId: row.source_id,
      chunkIndex: row.chunk_index,
      content: row.chunk_content,
      similarity: Number(row.similarity),
    }));
  });

export const sourceExists = async (sourceId: string): Promise<boolean> =>
  (await KnowledgeBase.count({ where: { source_id: sourceId } })) > 0;

// Raw SQL: the model types embeddings_768 as ARRAY(REAL), but the column is
// pgvector's vector(768), which expects a '[v1,v2,...]' literal.
export const insertChunks = async (rows: ChunkRow[]): Promise<void> => {
  await sequelize.transaction(async (transaction) => {
    for (const row of rows) {
      await sequelize.query(
        `INSERT INTO knowledge_base
           (source, source_id, chunk_index, chunk_content, embeddings_768)
         VALUES (:source, :sourceId, :chunkIndex, :content, CAST(:embedding AS vector))`,
        {
          replacements: {
            source: row.source,
            sourceId: row.sourceId,
            chunkIndex: row.chunkIndex,
            content: row.content,
            embedding: `[${row.embedding.join(',')}]`,
          },
          transaction,
        }
      );
    }
  });
};
