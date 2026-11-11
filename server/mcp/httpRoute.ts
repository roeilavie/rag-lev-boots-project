import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './createMcpServer';

const router = Router();

// Optional protection: if MCP_API_KEY is set, require `Authorization: Bearer <key>`.
const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const key = process.env.MCP_API_KEY;
  if (key && req.headers.authorization !== `Bearer ${key}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

// Stateless mode (required on serverless): a fresh server + transport per request.
router.post('/', requireApiKey, async (req: Request, res: Response) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    console.error('MCP request failed:', e);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// No sessions / server-initiated streams in stateless mode.
const methodNotAllowed = (_: Request, res: Response) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
};
router.get('/', methodNotAllowed);
router.delete('/', methodNotAllowed);

export default router;
