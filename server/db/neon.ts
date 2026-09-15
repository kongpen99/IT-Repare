import { neon } from '@neondatabase/serverless';

// Lazy client initialization for Neon PostgreSQL
let sqlClient: ReturnType<typeof neon> | null = null;

const DEFAULT_NEON_URL =
  'postgresql://neondb_owner:npg_ODlXJKp2ds3u@ep-rough-bread-b3xue2nx-pooler.c-4.ap-southeast-1.aws.neon.tech/computer-MG?sslmode=require&channel_binding=require';

export function getDatabaseUrl(): string {
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

export function getNeonSql() {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

export function isNeonConfigured(): boolean {
  return true;
}


// Initial DDL Script to create tables in Neon PostgreSQL if not exist
export async function initNeonTables(customSql?: ReturnType<typeof neon>) {
  const sql = customSql || getNeonSql();
  if (!sql) return { success: false, message: 'DATABASE_URL or POSTGRES_URL is not set' };

  try {
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

    return { success: true, message: 'Neon tables initialized successfully' };
  } catch (error: any) {
    console.error('Failed to init Neon tables:', error);
    return { success: false, error: error.message || 'Error executing DDL' };
  }
}

// Full entity sync with comprehensive column UPSERT and deletion synchronization
export async function syncAllEntities(
  sql: ReturnType<typeof neon>,
  payload: {
    departments?: any[];
    users?: any[];
    computers?: any[];
    parts?: any[];
    repairs?: any[];
    deletedIds?: {
      computers?: string[];
      repairs?: string[];
      parts?: string[];
      departments?: string[];
      users?: string[];
    };
  }
) {
  // Ensure tables exist before inserting
  await initNeonTables(sql);

  const { departments, users, computers, parts, repairs, deletedIds } = payload;

  // 1. Process explicit deletions first if provided
  if (deletedIds) {
    if (Array.isArray(deletedIds.computers) && deletedIds.computers.length > 0) {
      for (const id of deletedIds.computers) {
        await sql`DELETE FROM computers WHERE id = ${id}`;
      }
    }
    if (Array.isArray(deletedIds.repairs) && deletedIds.repairs.length > 0) {
      for (const id of deletedIds.repairs) {
        await sql`DELETE FROM repairs WHERE id = ${id}`;
      }
    }
    if (Array.isArray(deletedIds.parts) && deletedIds.parts.length > 0) {
      for (const id of deletedIds.parts) {
        await sql`DELETE FROM parts WHERE id = ${id}`;
      }
    }
    if (Array.isArray(deletedIds.departments) && deletedIds.departments.length > 0) {
      for (const id of deletedIds.departments) {
        await sql`DELETE FROM departments WHERE id = ${id}`;
      }
    }
    if (Array.isArray(deletedIds.users) && deletedIds.users.length > 0) {
      for (const id of deletedIds.users) {
        await sql`DELETE FROM users WHERE id = ${id}`;
      }
    }
  }

  // 2. Sync Departments
  if (Array.isArray(departments)) {
    for (const dept of departments) {
      await sql`
        INSERT INTO departments (id, code, name, description, created_at, updated_at)
        VALUES (
          ${dept.id},
          ${dept.code},
          ${dept.name},
          ${dept.description || ''},
          ${dept.createdAt || new Date().toISOString()},
          ${dept.updatedAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = EXCLUDED.updated_at;
      `;
    }
  }

  // 3. Sync Users
  if (Array.isArray(users)) {
    for (const user of users) {
      await sql`
        INSERT INTO users (
          id, username, email, password, name, role, department_id, avatar_url, is_active, created_at, updated_at
        )
        VALUES (
          ${user.id},
          ${user.username},
          ${user.email},
          ${user.password || ''},
          ${user.name},
          ${user.role},
          ${user.departmentId || null},
          ${user.avatarUrl || null},
          ${user.isActive ?? true},
          ${user.createdAt || new Date().toISOString()},
          ${user.updatedAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          password = CASE WHEN EXCLUDED.password <> '' THEN EXCLUDED.password ELSE users.password END,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          department_id = EXCLUDED.department_id,
          avatar_url = EXCLUDED.avatar_url,
          is_active = EXCLUDED.is_active,
          updated_at = EXCLUDED.updated_at;
      `;
    }
  }

  // 4. Sync Computers
  if (Array.isArray(computers)) {
    for (const pc of computers) {
      await sql`
        INSERT INTO computers (
          id, asset_code, serial_number, computer_name, brand, model, cpu, ram, storage,
          operating_system, ip_address, mac_address, department_id, location, assigned_user,
          purchase_date, warranty_expiry, status, remark, created_at, updated_at
        )
        VALUES (
          ${pc.id},
          ${pc.assetCode},
          ${pc.serialNumber || ''},
          ${pc.computerName},
          ${pc.brand || ''},
          ${pc.model || ''},
          ${pc.cpu || ''},
          ${pc.ram || ''},
          ${pc.storage || ''},
          ${pc.operatingSystem || ''},
          ${pc.ipAddress || ''},
          ${pc.macAddress || ''},
          ${pc.departmentId || ''},
          ${pc.location || ''},
          ${pc.assignedUser || ''},
          ${pc.purchaseDate || ''},
          ${pc.warrantyExpiry || ''},
          ${pc.status || 'NORMAL'},
          ${pc.remark || ''},
          ${pc.createdAt || new Date().toISOString()},
          ${pc.updatedAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          asset_code = EXCLUDED.asset_code,
          serial_number = EXCLUDED.serial_number,
          computer_name = EXCLUDED.computer_name,
          brand = EXCLUDED.brand,
          model = EXCLUDED.model,
          cpu = EXCLUDED.cpu,
          ram = EXCLUDED.ram,
          storage = EXCLUDED.storage,
          operating_system = EXCLUDED.operating_system,
          ip_address = EXCLUDED.ip_address,
          mac_address = EXCLUDED.mac_address,
          department_id = EXCLUDED.department_id,
          location = EXCLUDED.location,
          assigned_user = EXCLUDED.assigned_user,
          purchase_date = EXCLUDED.purchase_date,
          warranty_expiry = EXCLUDED.warranty_expiry,
          status = EXCLUDED.status,
          remark = EXCLUDED.remark,
          updated_at = EXCLUDED.updated_at;
      `;
    }
  }

  // 5. Sync Parts
  if (Array.isArray(parts)) {
    for (const part of parts) {
      await sql`
        INSERT INTO parts (
          id, part_code, name, category, brand, model, stock, minimum_stock, unit, price, supplier, remark, created_at, updated_at
        )
        VALUES (
          ${part.id},
          ${part.partCode},
          ${part.name},
          ${part.category || ''},
          ${part.brand || ''},
          ${part.model || ''},
          ${Number(part.stock) || 0},
          ${Number(part.minimumStock) || 0},
          ${part.unit || 'ชิ้น'},
          ${Number(part.price) || 0},
          ${part.supplier || ''},
          ${part.remark || ''},
          ${part.createdAt || new Date().toISOString()},
          ${part.updatedAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          part_code = EXCLUDED.part_code,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          brand = EXCLUDED.brand,
          model = EXCLUDED.model,
          stock = EXCLUDED.stock,
          minimum_stock = EXCLUDED.minimum_stock,
          unit = EXCLUDED.unit,
          price = EXCLUDED.price,
          supplier = EXCLUDED.supplier,
          remark = EXCLUDED.remark,
          updated_at = EXCLUDED.updated_at;
      `;
    }
  }

  // 6. Sync Repairs
  if (Array.isArray(repairs)) {
    for (const rep of repairs) {
      await sql`
        INSERT INTO repairs (
          id, repair_no, computer_id, requester_name, department_id, location,
          problem_type, problem_description, priority, technician_id,
          received_at, started_at, completed_at, returned_at, cause, solution,
          cost, status, remark, status_history, parts, attachments, created_at, updated_at
        )
        VALUES (
          ${rep.id},
          ${rep.repairNo},
          ${rep.computerId || ''},
          ${rep.requesterName},
          ${rep.departmentId || ''},
          ${rep.location || ''},
          ${rep.problemType},
          ${rep.problemDescription},
          ${rep.priority || 'MEDIUM'},
          ${rep.technicianId || null},
          ${rep.receivedAt || null},
          ${rep.startedAt || null},
          ${rep.completedAt || null},
          ${rep.returnedAt || null},
          ${rep.cause || ''},
          ${rep.solution || ''},
          ${Number(rep.cost) || 0},
          ${rep.status || 'WAITING'},
          ${rep.remark || ''},
          ${JSON.stringify(rep.statusHistory || [])}::jsonb,
          ${JSON.stringify(rep.parts || [])}::jsonb,
          ${JSON.stringify(rep.attachments || [])}::jsonb,
          ${rep.createdAt || new Date().toISOString()},
          ${rep.updatedAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO UPDATE SET
          repair_no = EXCLUDED.repair_no,
          computer_id = EXCLUDED.computer_id,
          requester_name = EXCLUDED.requester_name,
          department_id = EXCLUDED.department_id,
          location = EXCLUDED.location,
          problem_type = EXCLUDED.problem_type,
          problem_description = EXCLUDED.problem_description,
          priority = EXCLUDED.priority,
          technician_id = EXCLUDED.technician_id,
          received_at = EXCLUDED.received_at,
          started_at = EXCLUDED.started_at,
          completed_at = EXCLUDED.completed_at,
          returned_at = EXCLUDED.returned_at,
          cause = EXCLUDED.cause,
          solution = EXCLUDED.solution,
          cost = EXCLUDED.cost,
          status = EXCLUDED.status,
          remark = EXCLUDED.remark,
          status_history = EXCLUDED.status_history,
          parts = EXCLUDED.parts,
          attachments = EXCLUDED.attachments,
          updated_at = EXCLUDED.updated_at;
      `;
    }
  }

  return { success: true, message: 'All entities successfully synchronized to Neon PostgreSQL' };
}

// Pull all entities from Neon and map to camelCase
export async function pullAllEntities(sql: ReturnType<typeof neon>) {
  // Ensure tables exist before querying
  await initNeonTables(sql);

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

  return {
    departments,
    users,
    computers,
    parts,
    repairs
  };
}

