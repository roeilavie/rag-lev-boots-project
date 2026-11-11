import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerRagSearch } from './tools/ragSearch';
import { registerListKnowledgeSources } from './tools/listKnowledgeSources';
import { registerReadSource } from './tools/readSource';

// Transport-agnostic: used by both the stdio entry (server.ts) and the HTTP route.
export const createMcpServer = (): McpServer => {
  const server = new McpServer({ name: 'lev-boots-rag', version: '1.0.0' });

  registerRagSearch(server);
  registerListKnowledgeSources(server);
  registerReadSource(server);

  return server;
};
