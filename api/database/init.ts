import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return res.status(400).json({ success: false, message: 'DATABASE_URL is not set' });
  }

  try {
    const sql = neon(connectionString);

    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(32) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'TECHNICIAN',
        department_id VARCHAR(64),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS computers (
        id VARCHAR(64) PRIMARY KEY,
        asset_code VARCHAR(64) NOT NULL UNIQUE,
        serial_number VARCHAR(128),
        computer_name VARCHAR(128) NOT NULL,
        brand VARCHAR(64),
        model VARCHAR(128),
        cpu VARCHAR(128),
        ram VARCHAR(64),
        storage VARCHAR(128),
        operating_system VARCHAR(64),
        ip_address VARCHAR(64),
        mac_address VARCHAR(64),
        department_id VARCHAR(64),
        location VARCHAR(128),
        assigned_user VARCHAR(128),
        purchase_date VARCHAR(32),
        warranty_expiry VARCHAR(32),
        status VARCHAR(32) DEFAULT 'NORMAL',
        remark TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS parts (
        id VARCHAR(64) PRIMARY KEY,
        part_code VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(128),
        brand VARCHAR(64),
        model VARCHAR(128),
        stock INTEGER DEFAULT 0,
        minimum_stock INTEGER DEFAULT 0,
        unit VARCHAR(32) DEFAULT 'ชิ้น',
        price NUMERIC(10,2) DEFAULT 0,
        supplier VARCHAR(255),
        remark TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS repairs (
        id VARCHAR(64) PRIMARY KEY,
        repair_no VARCHAR(64) NOT NULL UNIQUE,
        computer_id VARCHAR(64),
        requester_name VARCHAR(128) NOT NULL,
        department_id VARCHAR(64),
        location VARCHAR(128),
        problem_type VARCHAR(64) NOT NULL,
        problem_description TEXT NOT NULL,
        priority VARCHAR(32) DEFAULT 'MEDIUM',
        technician_id VARCHAR(64),
        received_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        returned_at TIMESTAMPTZ,
        cause TEXT,
        solution TEXT,
        cost NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(32) DEFAULT 'WAITING',
        remark TEXT,
        status_history JSONB DEFAULT '[]'::jsonb,
        parts JSONB DEFAULT '[]'::jsonb,
        attachments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    return res.status(200).json({ success: true, message: 'Neon tables initialized successfully on Vercel' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to init tables' });
  }
}
