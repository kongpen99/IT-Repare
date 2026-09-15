import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getNeonSql, isNeonConfigured, initNeonTables, syncAllEntities, pullAllEntities } from './server/db/neon.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Health & Neon status check
  app.get('/api/database/status', async (req, res) => {
    const configured = isNeonConfigured();
    if (!configured) {
      return res.json({
        provider: 'neon-postgresql',
        connected: false,
        message: 'DATABASE_URL is not set. System is using browser local storage mode.'
      });
    }

    try {
      const sql = getNeonSql();
      if (!sql) {
        return res.json({
          provider: 'neon-postgresql',
          connected: false,
          message: 'Failed to initialize Neon client'
        });
      }

      const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
      return res.json({
        provider: 'neon-postgresql',
        connected: true,
        currentTime: result[0]?.current_time,
        version: result[0]?.pg_version,
        message: 'Successfully connected to Neon PostgreSQL'
      });
    } catch (error: any) {
      return res.status(500).json({
        provider: 'neon-postgresql',
        connected: false,
        error: error.message || 'Failed to query Neon database'
      });
    }
  });

  // Initialize/Migrate Tables in Neon
  app.post('/api/database/init', async (req, res) => {
    if (!isNeonConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'DATABASE_URL is not configured in environment'
      });
    }
    const result = await initNeonTables();
    return res.json(result);
  });

  // Sync / Seed data from client to Neon PostgreSQL
  app.post('/api/database/sync', async (req, res) => {
    const sql = getNeonSql();
    if (!sql) {
      return res.status(400).json({ success: false, message: 'Neon database not connected' });
    }

    const syncResult = await syncAllEntities(sql, req.body || {});
    if (!syncResult.success) {
      return res.status(500).json(syncResult);
    }
    return res.json(syncResult);
  });

  // Pull all data from Neon PostgreSQL to Client
  app.get('/api/database/pull', async (req, res) => {
    const sql = getNeonSql();
    if (!sql) {
      return res.status(400).json({ success: false, message: 'Neon database not connected' });
    }

    try {
      const data = await pullAllEntities(sql);
      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Error fetching data from Neon:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });


  // --- Vite Dev & Production Static Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
