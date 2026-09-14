import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getNeonSql, isNeonConfigured, initNeonTables } from './server/db/neon.ts';

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

    const { departments, users, computers, parts, repairs } = req.body;

    try {
      // 1. Sync Departments
      if (Array.isArray(departments)) {
        for (const dept of departments) {
          await sql`
            INSERT INTO departments (id, code, name, description, created_at, updated_at)
            VALUES (${dept.id}, ${dept.code}, ${dept.name}, ${dept.description || ''}, ${dept.createdAt || new Date().toISOString()}, ${dept.updatedAt || new Date().toISOString()})
            ON CONFLICT (id) DO UPDATE SET
              code = EXCLUDED.code,
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      // 2. Sync Users
      if (Array.isArray(users)) {
        for (const user of users) {
          await sql`
            INSERT INTO users (id, username, email, password, name, role, department_id, avatar_url, is_active, created_at, updated_at)
            VALUES (${user.id}, ${user.username}, ${user.email}, ${user.password || ''}, ${user.name}, ${user.role}, ${user.departmentId || null}, ${user.avatarUrl || null}, ${user.isActive ?? true}, ${user.createdAt || new Date().toISOString()}, ${user.updatedAt || new Date().toISOString()})
            ON CONFLICT (id) DO UPDATE SET
              username = EXCLUDED.username,
              email = EXCLUDED.email,
              name = EXCLUDED.name,
              role = EXCLUDED.role,
              department_id = EXCLUDED.department_id,
              is_active = EXCLUDED.is_active,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      // 3. Sync Computers
      if (Array.isArray(computers)) {
        for (const pc of computers) {
          await sql`
            INSERT INTO computers (
              id, asset_code, serial_number, computer_name, brand, model, cpu, ram, storage, operating_system, ip_address, mac_address, department_id, location, assigned_user, purchase_date, warranty_expiry, status, remark, created_at, updated_at
            )
            VALUES (
              ${pc.id}, ${pc.assetCode}, ${pc.serialNumber || ''}, ${pc.computerName}, ${pc.brand || ''}, ${pc.model || ''}, ${pc.cpu || ''}, ${pc.ram || ''}, ${pc.storage || ''}, ${pc.operatingSystem || ''}, ${pc.ipAddress || ''}, ${pc.macAddress || ''}, ${pc.departmentId || ''}, ${pc.location || ''}, ${pc.assignedUser || ''}, ${pc.purchaseDate || ''}, ${pc.warrantyExpiry || ''}, ${pc.status || 'NORMAL'}, ${pc.remark || ''}, ${pc.createdAt || new Date().toISOString()}, ${pc.updatedAt || new Date().toISOString()}
            )
            ON CONFLICT (id) DO UPDATE SET
              asset_code = EXCLUDED.asset_code,
              computer_name = EXCLUDED.computer_name,
              brand = EXCLUDED.brand,
              model = EXCLUDED.model,
              status = EXCLUDED.status,
              department_id = EXCLUDED.department_id,
              location = EXCLUDED.location,
              assigned_user = EXCLUDED.assigned_user,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      // 4. Sync Parts
      if (Array.isArray(parts)) {
        for (const part of parts) {
          await sql`
            INSERT INTO parts (
              id, part_code, name, category, brand, model, stock, minimum_stock, unit, price, supplier, remark, created_at, updated_at
            )
            VALUES (
              ${part.id}, ${part.partCode}, ${part.name}, ${part.category || ''}, ${part.brand || ''}, ${part.model || ''}, ${part.stock || 0}, ${part.minimumStock || 0}, ${part.unit || 'ชิ้น'}, ${part.price || 0}, ${part.supplier || ''}, ${part.remark || ''}, ${part.createdAt || new Date().toISOString()}, ${part.updatedAt || new Date().toISOString()}
            )
            ON CONFLICT (id) DO UPDATE SET
              part_code = EXCLUDED.part_code,
              name = EXCLUDED.name,
              stock = EXCLUDED.stock,
              minimum_stock = EXCLUDED.minimum_stock,
              price = EXCLUDED.price,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      // 5. Sync Repairs
      if (Array.isArray(repairs)) {
        for (const rep of repairs) {
          await sql`
            INSERT INTO repairs (
              id, repair_no, computer_id, requester_name, department_id, location, problem_type, problem_description, priority, technician_id, received_at, started_at, completed_at, returned_at, cause, solution, cost, status, remark, status_history, parts, attachments, created_at, updated_at
            )
            VALUES (
              ${rep.id}, ${rep.repairNo}, ${rep.computerId || ''}, ${rep.requesterName}, ${rep.departmentId || ''}, ${rep.location || ''}, ${rep.problemType}, ${rep.problemDescription}, ${rep.priority || 'MEDIUM'}, ${rep.technicianId || null}, ${rep.receivedAt || null}, ${rep.startedAt || null}, ${rep.completedAt || null}, ${rep.returnedAt || null}, ${rep.cause || ''}, ${rep.solution || ''}, ${rep.cost || 0}, ${rep.status || 'WAITING'}, ${rep.remark || ''}, ${JSON.stringify(rep.statusHistory || [])}::jsonb, ${JSON.stringify(rep.parts || [])}::jsonb, ${JSON.stringify(rep.attachments || [])}::jsonb, ${rep.createdAt || new Date().toISOString()}, ${rep.updatedAt || new Date().toISOString()}
            )
            ON CONFLICT (id) DO UPDATE SET
              status = EXCLUDED.status,
              technician_id = EXCLUDED.technician_id,
              cost = EXCLUDED.cost,
              cause = EXCLUDED.cause,
              solution = EXCLUDED.solution,
              completed_at = EXCLUDED.completed_at,
              returned_at = EXCLUDED.returned_at,
              status_history = EXCLUDED.status_history,
              parts = EXCLUDED.parts,
              updated_at = EXCLUDED.updated_at;
          `;
        }
      }

      return res.json({ success: true, message: 'All entities synchronized to Neon PostgreSQL' });
    } catch (error: any) {
      console.error('Error during Neon sync:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Pull all data from Neon PostgreSQL to Client
  app.get('/api/database/pull', async (req, res) => {
    const sql = getNeonSql();
    if (!sql) {
      return res.status(400).json({ success: false, message: 'Neon database not connected' });
    }

    try {
      const [departmentsRaw, usersRaw, computersRaw, partsRaw, repairsRaw] = await Promise.all([
        sql`SELECT * FROM departments ORDER BY code ASC`,
        sql`SELECT * FROM users ORDER BY name ASC`,
        sql`SELECT * FROM computers ORDER BY asset_code ASC`,
        sql`SELECT * FROM parts ORDER BY part_code ASC`,
        sql`SELECT * FROM repairs ORDER BY created_at DESC`
      ]);

      const departments = departmentsRaw as Record<string, any>[];
      const users = usersRaw as Record<string, any>[];
      const computers = computersRaw as Record<string, any>[];
      const parts = partsRaw as Record<string, any>[];
      const repairs = repairsRaw as Record<string, any>[];

      // Format column names back to camelCase expected by frontend
      const formattedComputers = computers.map((c: any) => ({
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

      const formattedUsers = users.map((u: any) => ({
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

      const formattedRepairs = repairs.map((r: any) => ({
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

      const formattedParts = parts.map((p: any) => ({
        id: p.id,
        partCode: p.part_code,
        name: p.name,
        category: p.category,
        brand: p.brand,
        model: p.model,
        stock: p.stock,
        minimumStock: p.minimum_stock,
        unit: p.unit,
        price: Number(p.price) || 0,
        supplier: p.supplier,
        remark: p.remark,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      return res.json({
        success: true,
        data: {
          departments,
          users: formattedUsers,
          computers: formattedComputers,
          parts: formattedParts,
          repairs: formattedRepairs
        }
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
