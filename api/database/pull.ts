import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) {
    return res.status(400).json({ success: false, message: 'DATABASE_URL is not set' });
  }

  try {
    const sql = neon(connectionString);
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

    return res.status(200).json({
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
    return res.status(500).json({ success: false, error: error.message });
  }
}
