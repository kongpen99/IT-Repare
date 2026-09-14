import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return res.status(200).json({
      provider: 'neon-postgresql',
      connected: false,
      message: 'DATABASE_URL is not set on Vercel environment'
    });
  }

  try {
    const sql = neon(connectionString);
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    return res.status(200).json({
      provider: 'neon-postgresql',
      connected: true,
      currentTime: result[0]?.current_time,
      version: result[0]?.pg_version,
      message: 'Successfully connected to Neon PostgreSQL on Vercel'
    });
  } catch (error: any) {
    return res.status(500).json({
      provider: 'neon-postgresql',
      connected: false,
      error: error.message || 'Failed to query Neon PostgreSQL'
    });
  }
}
