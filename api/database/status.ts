import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DEFAULT_NEON_URL =
  'postgresql://neondb_owner:npg_ODlXJKp2ds3u@ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech/computer-MG?sslmode=require&channel_binding=require';

function getDatabaseUrl(): string {
  let url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url || url.trim().length === 0) {
    return DEFAULT_NEON_URL;
  }

  url = url.trim();

  // Target database name: computer-MG
  const targetDb = process.env.NEON_DATABASE || process.env.POSTGRES_DATABASE || 'computer-MG';

  if (url.includes('.neon.tech')) {
    try {
      const parsed = new URL(url);
      if (!parsed.pathname || parsed.pathname === '/' || parsed.pathname.toLowerCase() === '/neondb') {
        parsed.pathname = `/${targetDb}`;
        return parsed.toString();
      }
    } catch {
      if (url.includes('/neondb')) {
        return url.replace(/\/neondb(\?|$)/, `/${targetDb}$1`);
      }
    }
  }

  return url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = getDatabaseUrl();

  try {
    const sql = neon(connectionString);
    const result = await sql`SELECT NOW() as current_time, version() as pg_version, current_database() as db_name`;
    const dbName = result[0]?.db_name || 'computer-MG';
    return res.status(200).json({
      provider: 'neon-postgresql',
      connected: true,
      databaseName: dbName,
      projectName: process.env.VERCEL_PROJECT_NAME || process.env.VERCEL_GIT_REPO_SLUG || 'computer-repair -01',
      currentTime: result[0]?.current_time,
      version: result[0]?.pg_version,
      message: `Successfully connected to Neon PostgreSQL (${dbName}) on Vercel`
    });
  } catch (error: any) {
    return res.status(500).json({
      provider: 'neon-postgresql',
      connected: false,
      databaseName: 'computer-MG',
      projectName: process.env.VERCEL_PROJECT_NAME || 'computer-repair -01',
      error: error.message || 'Failed to query Neon PostgreSQL'
    });
  }
}


