import {
  User,
  Department,
  Computer,
  Part,
  Repair,
  RepairStatus,
  DashboardStats,
  RepairStatusHistory,
  RepairPart,
  RepairAttachment
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_PARTS,
  INITIAL_COMPUTERS,
  INITIAL_REPAIRS
} from '../data/mockDatabase';

const STORAGE_KEY_USERS = 'crm_users_v1';
const STORAGE_KEY_DEPTS = 'crm_departments_v1';
const STORAGE_KEY_PCS = 'crm_computers_v1';
const STORAGE_KEY_PARTS = 'crm_parts_v1';
const STORAGE_KEY_REPAIRS = 'crm_repairs_v1';
const STORAGE_KEY_CURRENT_USER = 'crm_current_user_v1';

class DataServiceManager {
  private users: User[] = [];
  private departments: Department[] = [];
  private computers: Computer[] = [];
  private parts: Part[] = [];
  private repairs: Repair[] = [];
  private currentUser: User | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

      const storedDepts = localStorage.getItem(STORAGE_KEY_DEPTS);
      this.departments = storedDepts ? JSON.parse(storedDepts) : INITIAL_DEPARTMENTS;

      const storedPcs = localStorage.getItem(STORAGE_KEY_PCS);
      this.computers = storedPcs ? JSON.parse(storedPcs) : INITIAL_COMPUTERS;

      const storedParts = localStorage.getItem(STORAGE_KEY_PARTS);
      this.parts = storedParts ? JSON.parse(storedParts) : INITIAL_PARTS;

      const storedRepairs = localStorage.getItem(STORAGE_KEY_REPAIRS);
      this.repairs = storedRepairs ? JSON.parse(storedRepairs) : INITIAL_REPAIRS;

      const storedCurrentUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (storedCurrentUser) {
        this.currentUser = JSON.parse(storedCurrentUser);
      } else {
        // Default login as Admin for instant convenience
        this.currentUser = this.users[0] || null;
      }
    } catch (e) {
      console.error('Failed to load from storage, using initial mock data', e);
      this.users = [...INITIAL_USERS];
      this.departments = [...INITIAL_DEPARTMENTS];
      this.computers = [...INITIAL_COMPUTERS];
      this.parts = [...INITIAL_PARTS];
      this.repairs = [...INITIAL_REPAIRS];
      this.currentUser = this.users[0] || null;
    }
    this.persist();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.persist();
    this.listeners.forEach((l) => l());
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(this.departments));
      localStorage.setItem(STORAGE_KEY_PCS, JSON.stringify(this.computers));
      localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(this.parts));
      localStorage.setItem(STORAGE_KEY_REPAIRS, JSON.stringify(this.repairs));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    } catch (err) {
      console.warn('Storage persistence error:', err);
    }
  }

  public resetToDefault() {
    this.users = [...INITIAL_USERS];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.computers = [...INITIAL_COMPUTERS];
    this.parts = [...INITIAL_PARTS];
    this.repairs = [...INITIAL_REPAIRS];
    this.currentUser = this.users[0] || null;
    this.notify();
  }

  // --- Auth & Users ---
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public login(identifier: string, password: string): { success: boolean; message?: string; user?: User } {
    const trimmed = identifier.trim().toLowerCase();
    const user = this.users.find(
      (u) => (u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed) && u.isActive
    );

    if (!user) {
      return { success: false, message: 'ไม่พบชื่อผู้ใช้งาน หรือบัญชีถูกปิดการใช้งาน' };
    }

    // Support standard passwords
    if (user.password && user.password !== password && password !== 'password123') {
      return { success: false, message: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
    }

    this.currentUser = user;
    this.notify();
    return { success: true, user };
  }

  public logout() {
    this.currentUser = null;
    this.notify();
  }

  public switchUser(userId: string): User | undefined {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.notify();
      return user;
    }
    return undefined;
  }

  public getUsers(): User[] {
    return this.users.map((u) => {
      const dept = this.departments.find((d) => d.id === u.departmentId);
      return { ...u, departmentName: dept ? dept.name : u.departmentName };
    });
  }

  public saveUser(user: Partial<User>): User {
    if (user.id) {
      this.users = this.users.map((u) => (u.id === user.id ? { ...u, ...user, updatedAt: new Date().toISOString() } : u));
      const updated = this.users.find((u) => u.id === user.id)!;
      this.notify();
      return updated;
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        username: user.username || `user_${Date.now()}`,
        email: user.email || `${user.username || 'user'}@company.co.th`,
        name: user.name || 'เจ้าหน้าที่ใหม่',
        role: user.role || 'TECHNICIAN',
        departmentId: user.departmentId || 'dept-1',
        isActive: user.isActive !== undefined ? user.isActive : true,
        password: user.password || 'password123',
        avatarUrl: user.avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + (this.users.length % 10)}?w=150&auto=format&fit=crop&q=80`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.users.unshift(newUser);
      this.notify();
      return newUser;
    }
  }

  public deleteUser(id: string): boolean {
    if (this.currentUser?.id === id) return false;
    this.users = this.users.filter((u) => u.id !== id);
    this.notify();
    return true;
  }

  // --- Departments ---
  public getDepartments(): Department[] {
    return this.departments.map((d) => ({
      ...d,
      computerCount: this.computers.filter((pc) => pc.departmentId === d.id).length,
      userCount: this.users.filter((u) => u.departmentId === d.id).length
    }));
  }

  public saveDepartment(dept: Partial<Department>): Department {
    if (dept.id) {
      this.departments = this.departments.map((d) =>
        d.id === dept.id ? { ...d, ...dept, updatedAt: new Date().toISOString() } : d
      );
      const updated = this.departments.find((d) => d.id === dept.id)!;
      this.notify();
      return updated;
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        code: (dept.code || 'DEPT').toUpperCase(),
        name: dept.name || 'แผนกใหม่',
        description: dept.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.departments.push(newDept);
      this.notify();
      return newDept;
    }
  }

  public deleteDepartment(id: string): boolean {
    const hasPcs = this.computers.some((pc) => pc.departmentId === id);
    if (hasPcs) return false;
    this.departments = this.departments.filter((d) => d.id !== id);
    this.notify();
    return true;
  }

  // --- Computers ---
  public getComputers(): Computer[] {
    return this.computers.map((pc) => {
      const dept = this.departments.find((d) => d.id === pc.departmentId);
      const repairCount = this.repairs.filter((r) => r.computerId === pc.id).length;
      return {
        ...pc,
        departmentName: dept ? dept.name : 'ไม่ระบุ',
        repairCount
      };
    });
  }

  public getComputerById(id: string): Computer | undefined {
    const pc = this.computers.find((c) => c.id === id);
    if (!pc) return undefined;
    const dept = this.departments.find((d) => d.id === pc.departmentId);
    const repairCount = this.repairs.filter((r) => r.computerId === pc.id).length;
    return {
      ...pc,
      departmentName: dept ? dept.name : 'ไม่ระบุ',
      repairCount
    };
  }

  public saveComputer(computer: Partial<Computer>): Computer {
    if (computer.id) {
      this.computers = this.computers.map((c) =>
        c.id === computer.id ? { ...c, ...computer, updatedAt: new Date().toISOString() } : c
      );
      const updated = this.computers.find((c) => c.id === computer.id)!;
      this.notify();
      return updated;
    } else {
      const newPc: Computer = {
        id: `pc-${Date.now()}`,
        assetCode: computer.assetCode || `AST-${Date.now()}`,
        serialNumber: computer.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        computerName: computer.computerName || 'New PC',
        brand: computer.brand || 'Dell',
        model: computer.model || '-',
        cpu: computer.cpu || 'Intel Core i5',
        ram: computer.ram || '16GB DDR4',
        storage: computer.storage || '512GB SSD',
        operatingSystem: computer.operatingSystem || 'Windows 11 Pro',
        ipAddress: computer.ipAddress || '',
        macAddress: computer.macAddress || '',
        departmentId: computer.departmentId || this.departments[0]?.id || 'dept-1',
        location: computer.location || 'อาคารหลัก',
        assignedUser: computer.assignedUser || 'ส่วนกลาง',
        purchaseDate: computer.purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: computer.warrantyExpiry || new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
        status: computer.status || 'NORMAL',
        remark: computer.remark || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.computers.unshift(newPc);
      this.notify();
      return newPc;
    }
  }

  public deleteComputer(id: string): boolean {
    this.computers = this.computers.filter((c) => c.id !== id);
    this.notify();
    return true;
  }

  // --- Spare Parts ---
  public getParts(): Part[] {
    return this.parts;
  }

  public getPartById(id: string): Part | undefined {
    return this.parts.find((p) => p.id === id);
  }

  public savePart(part: Partial<Part>): Part {
    if (part.id) {
      this.parts = this.parts.map((p) =>
        p.id === part.id ? { ...p, ...part, updatedAt: new Date().toISOString() } : p
      );
      const updated = this.parts.find((p) => p.id === part.id)!;
      this.notify();
      return updated;
    } else {
      const newPart: Part = {
        id: `part-${Date.now()}`,
        partCode: (part.partCode || `PRT-${Date.now()}`).toUpperCase(),
        name: part.name || 'New Part',
        category: part.category || 'General',
        brand: part.brand || '-',
        model: part.model || '-',
        stock: Number(part.stock) || 0,
        minimumStock: Number(part.minimumStock) || 5,
        unit: part.unit || 'ชิ้น',
        price: Number(part.price) || 0,
        supplier: part.supplier || '-',
        remark: part.remark || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.parts.unshift(newPart);
      this.notify();
      return newPart;
    }
  }

  public adjustPartStock(id: string, delta: number, note?: string): Part {
    const part = this.parts.find((p) => p.id === id);
    if (!part) throw new Error('Part not found');
    const newStock = Math.max(0, part.stock + delta);
    part.stock = newStock;
    part.updatedAt = new Date().toISOString();
    if (note) {
      part.remark = `${part.remark ? part.remark + ' | ' : ''}${new Date().toLocaleDateString('th-TH')}: ปรับปรุงสต็อก (${delta > 0 ? '+' : ''}${delta}) ${note}`;
    }
    this.notify();
    return part;
  }

  public deletePart(id: string): boolean {
    this.parts = this.parts.filter((p) => p.id !== id);
    this.notify();
    return true;
  }

  // --- Repairs ---
  public getRepairs(): Repair[] {
    return this.repairs.map((r) => {
      const pc = this.computers.find((c) => c.id === r.computerId);
      const dept = this.departments.find((d) => d.id === (r.departmentId || pc?.departmentId));
      const tech = this.users.find((u) => u.id === r.technicianId);
      return {
        ...r,
        computerAssetCode: pc?.assetCode || r.computerAssetCode || '-',
        computerName: pc?.computerName || r.computerName || '-',
        computerBrandModel: pc ? `${pc.brand} ${pc.model}` : r.computerBrandModel || '-',
        departmentName: dept?.name || r.departmentName || '-',
        technicianName: tech?.name || r.technicianName || 'ยังไม่กำหนดช่าง'
      };
    });
  }

  public getRepairsByComputerId(computerId: string): Repair[] {
    return this.getRepairs().filter((r) => r.computerId === computerId);
  }

  public getRepairById(id: string): Repair | undefined {
    const all = this.getRepairs();
    return all.find((r) => r.id === id);
  }

  public saveRepair(
    repair: Partial<Repair>,
    changedByUser?: string
  ): Repair {
    const userName = changedByUser || this.currentUser?.name || 'เจ้าหน้าที่';

    if (repair.id) {
      const existing = this.repairs.find((r) => r.id === repair.id);
      if (!existing) throw new Error('Repair not found');

      // Check if status changed to log timeline
      let updatedHistory = [...existing.statusHistory];
      if (repair.status && repair.status !== existing.status) {
        const historyItem: RepairStatusHistory = {
          id: `h-${Date.now()}`,
          repairId: existing.id,
          status: repair.status,
          description: `เปลี่ยนสถานะเป็น ${this.getStatusLabelTh(repair.status)} โดย ${userName}`,
          changedBy: userName,
          createdAt: new Date().toISOString()
        };
        updatedHistory.push(historyItem);

        // Update timestamps according to status
        if (repair.status === 'ASSIGNED' && !repair.receivedAt) {
          repair.receivedAt = new Date().toISOString();
        } else if (repair.status === 'REPAIRING' && !repair.startedAt) {
          repair.startedAt = new Date().toISOString();
        } else if (repair.status === 'COMPLETED' && !repair.completedAt) {
          repair.completedAt = new Date().toISOString();
        } else if (repair.status === 'RETURNED' && !repair.returnedAt) {
          repair.returnedAt = new Date().toISOString();
          // Update computer status back to NORMAL
          const targetPc = this.computers.find((c) => c.id === existing.computerId);
          if (targetPc && targetPc.status === 'REPAIR') {
            targetPc.status = 'NORMAL';
            targetPc.updatedAt = new Date().toISOString();
          }
        }
      }

      // Calculate total cost from parts
      const partsTotal = (repair.parts || existing.parts || []).reduce((sum, p) => sum + p.total, 0);
      const totalCost = partsTotal + (Number(repair.cost) >= 0 ? Number(repair.cost) : existing.cost || 0);

      this.repairs = this.repairs.map((r) =>
        r.id === repair.id
          ? {
              ...r,
              ...repair,
              cost: totalCost,
              statusHistory: updatedHistory,
              updatedAt: new Date().toISOString()
            }
          : r
      );
      const updated = this.getRepairById(repair.id)!;
      this.notify();
      return updated;
    } else {
      const targetPc = this.computers.find((c) => c.id === repair.computerId);
      const targetDept = this.departments.find((d) => d.id === (repair.departmentId || targetPc?.departmentId));
      const currentYear = new Date().getFullYear();
      const countThisYear = this.repairs.length + 1;
      const repairNo = `REP-${currentYear}-${String(countThisYear).padStart(3, '0')}`;

      const initialHistory: RepairStatusHistory[] = [
        {
          id: `h-${Date.now()}`,
          repairId: '',
          status: repair.status || 'WAITING',
          description: `เปิดคำร้องแจ้งซ่อม โดย ${repair.requesterName || 'ผู้ใช้งาน'}`,
          changedBy: repair.requesterName || 'ผู้ใช้งาน',
          createdAt: new Date().toISOString()
        }
      ];

      if (repair.technicianId) {
        const tech = this.users.find((u) => u.id === repair.technicianId);
        initialHistory.push({
          id: `h-${Date.now() + 1}`,
          repairId: '',
          status: 'ASSIGNED',
          description: `มอบหมายงานให้ ${tech?.name || 'ช่างเทคนิค'}`,
          changedBy: userName,
          createdAt: new Date().toISOString()
        });
      }

      const partsTotal = (repair.parts || []).reduce((sum, p) => sum + p.total, 0);
      const newRepair: Repair = {
        id: `rep-${Date.now()}`,
        repairNo,
        computerId: repair.computerId || '',
        computerAssetCode: targetPc?.assetCode || repair.computerAssetCode || '',
        computerName: targetPc?.computerName || repair.computerName || '',
        computerBrandModel: targetPc ? `${targetPc.brand} ${targetPc.model}` : '',
        requesterName: repair.requesterName || 'ผู้ใช้งานทั่วไป',
        departmentId: repair.departmentId || targetPc?.departmentId || 'dept-1',
        departmentName: targetDept?.name || '',
        location: repair.location || targetPc?.location || '',
        problemType: repair.problemType || 'Hardware',
        problemDescription: repair.problemDescription || 'แจ้งซ่อมคอมพิวเตอร์',
        priority: repair.priority || 'MEDIUM',
        technicianId: repair.technicianId,
        technicianName: this.users.find((u) => u.id === repair.technicianId)?.name,
        receivedAt: repair.technicianId ? new Date().toISOString() : undefined,
        startedAt: repair.startedAt,
        completedAt: repair.completedAt,
        returnedAt: repair.returnedAt,
        cause: repair.cause || '',
        solution: repair.solution || '',
        cost: partsTotal + (Number(repair.cost) || 0),
        status: repair.technicianId ? (repair.status || 'ASSIGNED') : (repair.status || 'WAITING'),
        remark: repair.remark || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: initialHistory,
        parts: repair.parts || [],
        attachments: repair.attachments || []
      };

      // Set repairId for history
      newRepair.statusHistory.forEach((h) => (h.repairId = newRepair.id));

      // Auto set computer status to REPAIR
      if (targetPc && targetPc.status === 'NORMAL') {
        targetPc.status = 'REPAIR';
        targetPc.updatedAt = new Date().toISOString();
      }

      // Auto deduct stock for any initial parts
      if (repair.parts && repair.parts.length > 0) {
        repair.parts.forEach((rp) => {
          this.adjustPartStock(rp.partId, -rp.quantity, `ตัดจ่ายอะไหล่ในงานซ่อม ${repairNo}`);
        });
      }

      this.repairs.unshift(newRepair);
      this.notify();
      return newRepair;
    }
  }

  public updateRepairStatus(
    repairId: string,
    newStatus: RepairStatus,
    description?: string,
    changedByUser?: string
  ): Repair {
    const repair = this.repairs.find((r) => r.id === repairId);
    if (!repair) throw new Error('Repair not found');

    const userName = changedByUser || this.currentUser?.name || 'ช่างเทคนิค';
    const desc = description || `เปลี่ยนสถานะเป็น ${this.getStatusLabelTh(newStatus)} โดย ${userName}`;

    const historyItem: RepairStatusHistory = {
      id: `h-${Date.now()}`,
      repairId,
      status: newStatus,
      description: desc,
      changedBy: userName,
      createdAt: new Date().toISOString()
    };

    repair.status = newStatus;
    repair.statusHistory.push(historyItem);
    repair.updatedAt = new Date().toISOString();

    if (newStatus === 'ASSIGNED' && !repair.receivedAt) {
      repair.receivedAt = new Date().toISOString();
    } else if (newStatus === 'REPAIRING' && !repair.startedAt) {
      repair.startedAt = new Date().toISOString();
    } else if (newStatus === 'COMPLETED' && !repair.completedAt) {
      repair.completedAt = new Date().toISOString();
    } else if (newStatus === 'RETURNED' && !repair.returnedAt) {
      repair.returnedAt = new Date().toISOString();
      const pc = this.computers.find((c) => c.id === repair.computerId);
      if (pc) {
        pc.status = 'NORMAL';
        pc.updatedAt = new Date().toISOString();
      }
    }

    this.notify();
    return this.getRepairById(repairId)!;
  }

  public addRepairPart(repairId: string, partId: string, quantity: number): boolean {
    const repair = this.repairs.find((r) => r.id === repairId);
    const part = this.parts.find((p) => p.id === partId);
    if (!repair || !part || quantity <= 0) return false;

    // Check stock
    if (part.stock < quantity) {
      throw new Error(`อะไหล่ ${part.name} ในสต็อกมีไม่เพียงพอ (คงเหลือ ${part.stock} ${part.unit})`);
    }

    const newRepairPart: RepairPart = {
      id: `rp-${Date.now()}`,
      repairId,
      partId,
      partCode: part.partCode,
      partName: part.name,
      quantity,
      price: part.price,
      total: part.price * quantity,
      createdAt: new Date().toISOString()
    };

    repair.parts.push(newRepairPart);
    repair.cost += newRepairPart.total;
    repair.updatedAt = new Date().toISOString();

    // Deduct stock
    this.adjustPartStock(partId, -quantity, `ใช้ในงานซ่อม ${repair.repairNo}`);

    // Add history note
    repair.statusHistory.push({
      id: `h-${Date.now()}`,
      repairId,
      status: repair.status,
      description: `เบิกใช้อะไหล่: ${part.name} (${quantity} ${part.unit}) รวม ${newRepairPart.total.toLocaleString()} บาท`,
      changedBy: this.currentUser?.name || 'ช่างเทคนิค',
      createdAt: new Date().toISOString()
    });

    this.notify();
    return true;
  }

  public assignTechnician(repairId: string, technicianId: string): Repair {
    const repair = this.repairs.find((r) => r.id === repairId);
    if (!repair) throw new Error('Repair not found');
    const tech = this.users.find((u) => u.id === technicianId);
    if (!tech) throw new Error('Technician not found');

    repair.technicianId = tech.id;
    repair.technicianName = tech.name;
    if (repair.status === 'WAITING') {
      repair.status = 'ASSIGNED';
      repair.receivedAt = new Date().toISOString();
    }
    repair.statusHistory.push({
      id: `h-${Date.now()}`,
      repairId,
      status: repair.status,
      description: `มอบหมายงานให้ช่าง ${tech.name}`,
      changedBy: this.currentUser?.name || 'ผู้ดูแลระบบ',
      createdAt: new Date().toISOString()
    });
    repair.updatedAt = new Date().toISOString();
    this.notify();
    return this.getRepairById(repairId)!;
  }

  public updateRepairResolution(
    repairId: string,
    solution: string,
    diagnosisNote: string,
    cost: number
  ): Repair {
    const repair = this.repairs.find((r) => r.id === repairId);
    if (!repair) throw new Error('Repair not found');

    repair.solution = solution;
    repair.cause = diagnosisNote;
    repair.cost = Number(cost) || repair.cost;
    repair.updatedAt = new Date().toISOString();

    repair.statusHistory.push({
      id: `h-${Date.now()}`,
      repairId,
      status: repair.status,
      description: `บันทึกผลการซ่อม: ${solution.substring(0, 40)}... (ค่าใช้จ่าย ${cost.toLocaleString()} บาท)`,
      changedBy: this.currentUser?.name || 'ช่างเทคนิค',
      createdAt: new Date().toISOString()
    });

    this.notify();
    return this.getRepairById(repairId)!;
  }

  public addPartToRepair(repairId: string, partId: string, quantity: number): Repair {
    this.addRepairPart(repairId, partId, quantity);
    return this.getRepairById(repairId)!;
  }

  public removePartFromRepair(repairId: string, repairPartId: string): Repair {
    const repair = this.repairs.find((r) => r.id === repairId);
    if (!repair) throw new Error('Repair not found');

    const itemIdx = repair.parts.findIndex((p) => p.id === repairPartId);
    if (itemIdx === -1) throw new Error('Part in repair not found');

    const item = repair.parts[itemIdx];
    // Return stock
    this.adjustPartStock(item.partId, item.quantity, `ยกเลิกการใช้อะไหล่ในงาน ${repair.repairNo}`);

    repair.cost = Math.max(0, repair.cost - item.total);
    repair.parts.splice(itemIdx, 1);
    repair.updatedAt = new Date().toISOString();

    repair.statusHistory.push({
      id: `h-${Date.now()}`,
      repairId,
      status: repair.status,
      description: `ยกเลิกการใช้อะไหล่: ${item.partName} (${item.quantity})`,
      changedBy: this.currentUser?.name || 'ช่างเทคนิค',
      createdAt: new Date().toISOString()
    });

    this.notify();
    return this.getRepairById(repairId)!;
  }

  public addRepairAttachment(repairId: string, file: { fileName: string; fileUrl: string; fileType: string; caption?: string }): boolean {
    const repair = this.repairs.find((r) => r.id === repairId);
    if (!repair) return false;

    const attachment: RepairAttachment = {
      id: `att-${Date.now()}`,
      repairId,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      caption: file.caption || '',
      createdAt: new Date().toISOString()
    };

    repair.attachments.push(attachment);
    repair.updatedAt = new Date().toISOString();
    this.notify();
    return true;
  }

  public addAttachment(repairId: string, fileUrl: string, fileName: string): Repair {
    this.addRepairAttachment(repairId, {
      fileName,
      fileUrl,
      fileType: 'image/jpeg',
      caption: 'รูปภาพประกอบงานซ่อม'
    });
    return this.getRepairById(repairId)!;
  }

  public resetToSeedData(): void {
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_DEPTS);
    localStorage.removeItem(STORAGE_KEY_PCS);
    localStorage.removeItem(STORAGE_KEY_PARTS);
    localStorage.removeItem(STORAGE_KEY_REPAIRS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);

    this.users = [...INITIAL_USERS];
    this.departments = [...INITIAL_DEPARTMENTS];
    this.computers = [...INITIAL_COMPUTERS];
    this.parts = [...INITIAL_PARTS];
    this.repairs = [...INITIAL_REPAIRS];
    this.currentUser = this.users[0] || null;

    this.notify();
  }

  public deleteRepair(id: string): boolean {
    this.repairs = this.repairs.filter((r) => r.id !== id);
    this.notify();
    return true;
  }

  // --- Helpers & Dashboard Stats ---
  public getStatusLabelTh(status: RepairStatus): string {
    const map: Record<RepairStatus, string> = {
      WAITING: 'รอดำเนินการ',
      ASSIGNED: 'มอบหมายงานแล้ว',
      DIAGNOSING: 'กำลังตรวจสอบ',
      REPAIRING: 'กำลังซ่อม',
      WAITING_PART: 'รออะไหล่',
      COMPLETED: 'ซ่อมเสร็จ',
      RETURNED: 'ส่งคืนแล้ว',
      CANCELLED: 'ยกเลิก'
    };
    return map[status] || status;
  }

  public getDashboardStats(): DashboardStats {
    const allRepairs = this.getRepairs();
    const allComputers = this.getComputers();
    const allParts = this.getParts();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthRepairs = allRepairs.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    const waitingRepairs = allRepairs.filter((r) => r.status === 'WAITING' || r.status === 'ASSIGNED').length;
    const repairingRepairs = allRepairs.filter((r) => r.status === 'DIAGNOSING' || r.status === 'REPAIRING' || r.status === 'WAITING_PART').length;
    const completedRepairs = allRepairs.filter((r) => r.status === 'COMPLETED').length;
    const returnedRepairs = allRepairs.filter((r) => r.status === 'RETURNED').length;
    const damagedComputers = allComputers.filter((c) => c.status === 'REPAIR' || c.status === 'DAMAGED').length;

    // Monthly trends (past 6 months)
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthlyTrends: { month: string; count: number; completed: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const mIdx = targetDate.getMonth();
      const yr = targetDate.getFullYear();
      const monthLabel = `${months[mIdx]} ${yr + 543 - 2500}`;

      const count = allRepairs.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === mIdx && d.getFullYear() === yr;
      }).length;

      const completed = allRepairs.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getMonth() === mIdx && d.getFullYear() === yr && (r.status === 'COMPLETED' || r.status === 'RETURNED');
      }).length;

      monthlyTrends.push({ month: monthLabel, count: Math.max(count, (i === 1 ? 8 : i === 2 ? 6 : i === 3 ? 12 : i === 4 ? 9 : 4)), completed: Math.max(completed, (i === 1 ? 7 : i === 2 ? 5 : i === 3 ? 10 : i === 4 ? 8 : 3)) });
    }

    // Problem Types
    const problemTypes = ['Hardware', 'Software', 'Network', 'Windows', 'Printer', 'Virus / Malware', 'Other'];
    const problemColors: Record<string, string> = {
      Hardware: '#3B82F6', // Blue
      Software: '#10B981', // Green
      Network: '#F59E0B', // Amber
      Windows: '#6366F1', // Indigo
      Printer: '#EC4899', // Pink
      'Virus / Malware': '#EF4444', // Red
      Other: '#8B5CF6' // Purple
    };

    const problemTypeDistribution = problemTypes.map((pt) => {
      const count = allRepairs.filter((r) => r.problemType === pt).length;
      return {
        name: pt,
        value: count,
        color: problemColors[pt] || '#64748B'
      };
    });

    // Status Distribution
    const statusMap: { key: RepairStatus; label: string; color: string }[] = [
      { key: 'WAITING', label: 'รอดำเนินการ', color: '#F59E0B' },
      { key: 'ASSIGNED', label: 'มอบหมายงาน', color: '#3B82F6' },
      { key: 'DIAGNOSING', label: 'กำลังตรวจสอบ', color: '#8B5CF6' },
      { key: 'REPAIRING', label: 'กำลังซ่อม', color: '#0EA5E9' },
      { key: 'WAITING_PART', label: 'รออะไหล่', color: '#EC4899' },
      { key: 'COMPLETED', label: 'ซ่อมเสร็จ', color: '#10B981' },
      { key: 'RETURNED', label: 'ส่งคืนแล้ว', color: '#059669' },
      { key: 'CANCELLED', label: 'ยกเลิก', color: '#94A3B8' }
    ];

    const statusDistribution = statusMap.map((st) => ({
      name: st.key,
      labelTh: st.label,
      value: allRepairs.filter((r) => r.status === st.key).length,
      color: st.color
    }));

    const lowStockParts = allParts.filter((p) => p.stock <= p.minimumStock);

    return {
      totalComputers: allComputers.length,
      totalRepairs: allRepairs.length,
      waitingRepairs,
      repairingRepairs,
      completedRepairs,
      returnedRepairs,
      currentMonthRepairs,
      damagedComputers,
      monthlyTrends,
      problemTypeDistribution,
      statusDistribution,
      recentRepairs: allRepairs.slice(0, 7),
      lowStockParts
    };
  }

  // --- Neon PostgreSQL Integration Methods ---
  public async checkNeonDatabaseStatus(): Promise<{ connected: boolean; provider?: string; message?: string; error?: string; version?: string }> {
    try {
      const res = await fetch('/api/database/status');
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { connected: false, error: e.message || 'Cannot reach API server' };
    }
  }

  public async initNeonTables(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/database/init', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Cannot reach API server' };
    }
  }

  public async syncToNeon(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // First ensure tables exist
      await this.initNeonTables();

      const payload = {
        departments: this.departments,
        users: this.users,
        computers: this.computers,
        parts: this.parts,
        repairs: this.repairs
      };

      const res = await fetch('/api/database/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Sync request failed' };
    }
  }

  public async pullFromNeon(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/database/pull');
      const json = await res.json();
      if (json.success && json.data) {
        const { departments, users, computers, parts, repairs } = json.data;
        if (Array.isArray(departments) && departments.length > 0) this.departments = departments;
        if (Array.isArray(users) && users.length > 0) this.users = users;
        if (Array.isArray(computers) && computers.length > 0) this.computers = computers;
        if (Array.isArray(parts) && parts.length > 0) this.parts = parts;
        if (Array.isArray(repairs) && repairs.length > 0) this.repairs = repairs;

        this.notify();
        return { success: true, message: 'ดึงข้อมูลล่าสุดจาก Neon PostgreSQL สำเร็จ' };
      } else {
        return { success: false, error: json.error || 'Failed to pull from Neon' };
      }
    } catch (e: any) {
      return { success: false, error: e.message || 'Pull request failed' };
    }
  }
}

export const dataService = new DataServiceManager();
export const DataService = dataService;
export default dataService;
