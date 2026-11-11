// MUST be the first import of mcp/server.ts.
// ESM evaluates imports in order, so this runs before config/database.ts,
// which throws on import if DATABASE_URL is missing.
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// The stdio transport uses stdout for protocol messages only.
// Any stray console.log would corrupt it, so send all logging to stderr.
console.log = console.error;
console.info = console.error;
console.debug = console.error;

// Load server/.env by absolute path: the MCP client may start us from any cwd.
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env'),
});
