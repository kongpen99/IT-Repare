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

  const { departments, users, computers, parts, repairs } = req.body || {};

  try {
    const sql = neon(connectionString);

    // 1. Departments
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

    // 2. Users
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

    // 3. Computers
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

    // 4. Parts
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

    // 5. Repairs
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

    return res.status(200).json({ success: true, message: 'All entities synchronized to Neon PostgreSQL via Vercel' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
