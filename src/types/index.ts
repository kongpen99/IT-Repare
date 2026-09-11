export type UserRole = 'ADMIN' | 'TECHNICIAN';
export type Role = UserRole;

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  computerCount?: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ComputerStatus = 'NORMAL' | 'REPAIR' | 'DAMAGED' | 'RETIRED' | 'LOST';

export interface Computer {
  id: string;
  assetCode: string;
  serialNumber: string;
  computerName: string;
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  operatingSystem: string;
  ipAddress: string;
  macAddress: string;
  departmentId: string;
  departmentName?: string;
  location: string;
  assignedUser: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: ComputerStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  repairCount?: number;
}

export type RepairStatus =
  | 'WAITING'
  | 'ASSIGNED'
  | 'DIAGNOSING'
  | 'REPAIRING'
  | 'WAITING_PART'
  | 'COMPLETED'
  | 'RETURNED'
  | 'CANCELLED';

export type ProblemType =
  | 'Hardware'
  | 'Software'
  | 'Network'
  | 'Windows'
  | 'Printer'
  | 'Virus / Malware'
  | 'Other';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RepairAttachment {
  id: string;
  repairId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  caption?: string;
  createdAt: string;
}

export interface RepairPart {
  id: string;
  repairId: string;
  partId: string;
  partCode: string;
  partName: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

export interface RepairStatusHistory {
  id: string;
  repairId: string;
  status: RepairStatus;
  description: string;
  changedBy: string;
  changedByName?: string;
  createdAt: string;
}

export interface Repair {
  id: string;
  repairNo: string;
  computerId: string;
  computerAssetCode?: string;
  computerName?: string;
  computerBrandModel?: string;
  requesterName: string;
  departmentId: string;
  departmentName?: string;
  location?: string;
  problemType: ProblemType;
  problemDescription: string;
  priority: Priority;
  technicianId?: string;
  technicianName?: string;
  receivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  returnedAt?: string;
  cause?: string;
  solution?: string;
  cost: number;
  status: RepairStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: RepairStatusHistory[];
  parts: RepairPart[];
  attachments: RepairAttachment[];
}

export interface Part {
  id: string;
  partCode: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  stock: number;
  minimumStock: number;
  unit: string;
  price: number;
  supplier: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface DashboardStats {
  totalComputers: number;
  totalRepairs: number;
  waitingRepairs: number;
  repairingRepairs: number;
  completedRepairs: number;
  returnedRepairs: number;
  currentMonthRepairs: number;
  damagedComputers: number;
  monthlyTrends: { month: string; count: number; completed: number }[];
  problemTypeDistribution: { name: string; value: number; color: string }[];
  statusDistribution: { name: string; value: number; color: string; labelTh: string }[];
  recentRepairs: Repair[];
  lowStockParts: Part[];
}
