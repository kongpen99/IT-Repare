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
    return res.status(400).json({ success: false, message: 'DATABASE_URL or POSTGRES_URL is not set' });
  }

  try {
    const sql = neon(connectionString);

    // Ensure tables exist
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

    const [departmentsRaw, usersRaw, computersRaw, partsRaw, repairsRaw] = await Promise.all([
      sql`SELECT * FROM departments ORDER BY code ASC`,
      sql`SELECT * FROM users ORDER BY name ASC`,
      sql`SELECT * FROM computers ORDER BY asset_code ASC`,
      sql`SELECT * FROM parts ORDER BY part_code ASC`,
      sql`SELECT * FROM repairs ORDER BY created_at DESC`
    ]);

    const departments = (departmentsRaw as Record<string, any>[]).map((d: any) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      description: d.description,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));

    const users = (usersRaw as Record<string, any>[]).map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      password: u.password,
      name: u.name,
      role: u.role,
      departmentId: u.department_id,
      avatarUrl: u.avatar_url,
      isActive: u.is_active,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }));

    const computers = (computersRaw as Record<string, any>[]).map((c: any) => ({
      id: c.id,
      assetCode: c.asset_code,
      serialNumber: c.serial_number,
      computerName: c.computer_name,
      brand: c.brand,
      model: c.model,
      cpu: c.cpu,
      ram: c.ram,
      storage: c.storage,
      operatingSystem: c.operating_system,
      ipAddress: c.ip_address,
      macAddress: c.mac_address,
      departmentId: c.department_id,
      location: c.location,
      assignedUser: c.assigned_user,
      purchaseDate: c.purchase_date,
      warrantyExpiry: c.warranty_expiry,
      status: c.status,
      remark: c.remark,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    const parts = (partsRaw as Record<string, any>[]).map((p: any) => ({
      id: p.id,
      partCode: p.part_code,
      name: p.name,
      category: p.category,
      brand: p.brand,
      model: p.model,
      stock: Number(p.stock) || 0,
      minimumStock: Number(p.minimum_stock) || 0,
      unit: p.unit,
      price: Number(p.price) || 0,
      supplier: p.supplier,
      remark: p.remark,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    const repairs = (repairsRaw as Record<string, any>[]).map((r: any) => ({
      id: r.id,
      repairNo: r.repair_no,
      computerId: r.computer_id,
      requesterName: r.requester_name,
      departmentId: r.department_id,
      location: r.location,
      problemType: r.problem_type,
      problemDescription: r.problem_description,
      priority: r.priority,
      technicianId: r.technician_id,
      receivedAt: r.received_at,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      returnedAt: r.returned_at,
      cause: r.cause,
      solution: r.solution,
      cost: Number(r.cost) || 0,
      status: r.status,
      remark: r.remark,
      statusHistory: r.status_history || [],
      parts: r.parts || [],
      attachments: r.attachments || [],
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        departments,
        users,
        computers,
        parts,
        repairs
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

