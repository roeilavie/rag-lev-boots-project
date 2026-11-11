import './bootstrap';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './createMcpServer';

await createMcpServer().connect(new StdioServerTransport());
console.error('Lev-Boots MCP server running on stdio');
