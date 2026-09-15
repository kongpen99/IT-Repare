import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string | null {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  return url && url.trim().length > 0 ? url.trim() : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return res.status(200).json({
      provider: 'neon-postgresql',
      connected: false,
      message: 'DATABASE_URL or POSTGRES_URL is not set on Vercel environment'
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

