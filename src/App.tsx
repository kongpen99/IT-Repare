import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DataService } from './services/dataService';
import {
  User,
  Role,
  Computer,
  Repair,
  Part,
  Department,
  RepairStatus,
  DashboardStats
} from './types';
import { ToastProvider, useToast } from './components/ui/Toast';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { ComputerListView } from './components/computers/ComputerListView';
import { ComputerDetailModal } from './components/computers/ComputerDetailModal';
import { ComputerFormModal } from './components/computers/ComputerFormModal';
import { RepairListView } from './components/repairs/RepairListView';
import { RepairDetailModal } from './components/repairs/RepairDetailModal';
import { RepairFormModal } from './components/repairs/RepairFormModal';
import { RepairJobSheetPrint } from './components/repairs/RepairJobSheetPrint';
import { PartsListView } from './components/parts/PartsListView';
import { PartFormModal, StockAdjustModal } from './components/parts/PartFormModal';
import { ReportsView } from './components/reports/ReportsView';
import { UsersManagement } from './components/settings/UsersManagement';
import { DepartmentsManagement } from './components/settings/DepartmentsManagement';
import { SystemSettings } from './components/settings/SystemSettings';

function MainApp() {
  const { success, error, info, warning } = useToast();

  // Core State from DataService
  const [currentUser, setCurrentUser] = useState<User | null>(DataService.getCurrentUser());
  const [computers, setComputers] = useState<Computer[]>(DataService.getComputers());
  const [repairs, setRepairs] = useState<Repair[]>(DataService.getRepairs());
  const [parts, setParts] = useState<Part[]>(DataService.getParts());
  const [departments, setDepartments] = useState<Department[]>(DataService.getDepartments());
  const [users, setUsers] = useState<User[]>(DataService.getUsers());

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentSubView, setCurrentSubView] = useState<string | undefined>(undefined);
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

  // Modals & Selected items state
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [isComputerFormOpen, setIsComputerFormOpen] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);

  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isRepairFormOpen, setIsRepairFormOpen] = useState(false);
  const [preselectedCompForRepair, setPreselectedCompForRepair] = useState<Computer | null>(null);
  const [printingRepair, setPrintingRepair] = useState<Repair | null>(null);

  const [isPartFormOpen, setIsPartFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [adjustingStockPart, setAdjustingStockPart] = useState<Part | null>(null);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Refresh all state from DataService
  const refreshData = useCallback(() => {
    setComputers(DataService.getComputers());
    setRepairs(DataService.getRepairs());
    setParts(DataService.getParts());
    setDepartments(DataService.getDepartments());
    setUsers(DataService.getUsers());
  }, []);

  // Subscribe to DataService changes (auto-sync, Neon pull, CRUD mutations)
  useEffect(() => {
    const unsubscribe = DataService.subscribe(() => {
      refreshData();
    });
    return () => {
      unsubscribe();
    };
  }, [refreshData]);

  // Dashboard Stats
  const dashboardStats: DashboardStats = useMemo(() => {
    return DataService.getDashboardStats();
  }, [computers, repairs, parts]);

  // Technicians list
  const technicians = useMemo(() => {
    return users.filter((u) => u.role === 'TECHNICIAN' || u.role === 'ADMIN');
  }, [users]);

  // Urgent and low stock for Header badges
  const lowStockParts = useMemo(() => {
    return parts.filter((p) => p.stock <= p.minimumStock);
  }, [parts]);

  const urgentRepairs = useMemo(() => {
    return repairs.filter(
      (r) => (r.priority === 'CRITICAL' || r.priority === 'HIGH') && r.status !== 'COMPLETED' && r.status !== 'RETURNED'
    );
  }, [repairs]);

  // Navigation handler
  const handleNavigate = (view: string, sub?: string, params?: Record<string, unknown>) => {
    setCurrentView(view);
    setCurrentSubView(sub);

    if (view === 'computers' && sub === 'add') {
      setEditingComputer(null);
      setIsComputerFormOpen(true);
    } else if (view === 'repairs' && sub === 'new') {
      setPreselectedCompForRepair(null);
      setIsRepairFormOpen(true);
    } else if (params?.repairId) {
      const rep = repairs.find((r) => r.id === params.repairId);
      if (rep) setSelectedRepair(rep);
    } else if (params?.computerId) {
      const comp = computers.find((c) => c.id === params.computerId);
      if (comp) setSelectedComputer(comp);
    }
  };

  // Auth Handlers
  const handleLogin = (identifier: string, pass: string) => {
    const res = DataService.login(identifier, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      success(`ยินดีต้อนรับ ${res.user.name}`, 'เข้าสู่ระบบสำเร็จ');
    }
    return res;
  };

  const handleQuickLogin = (userId: string) => {
    const user = DataService.switchUser(userId);
    if (user) {
      setCurrentUser(user);
      success(`เข้าสู่ระบบในฐานะ ${user.name} (${user.role})`);
    }
  };

  const handleRegister = (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: Role;
    departmentId?: string;
  }) => {
    const res = DataService.registerUser(data);
    if (res.success && res.user) {
      refreshData();
      setCurrentUser(res.user);
      success(`ยินดีต้อนรับ ${res.user.name}`, 'สมัครสมาชิกและเข้าสู่ระบบสำเร็จ');
    }
    return res;
  };

  const handleResetPassword = (identifier: string, newPass: string) => {
    const res = DataService.resetPassword(identifier, newPass);
    if (res.success) {
      refreshData();
      success(res.message);
    }
    return res;
  };

  const handleLogout = () => {
    DataService.logout();
    setCurrentUser(null);
    info('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Computer Actions
  const handleSaveComputer = (data: Partial<Computer>) => {
    try {
      const saved = DataService.saveComputer(data);
      refreshData();
      success(`บันทึกข้อมูลเครื่อง [${saved.assetCode}] ${saved.computerName} เรียบร้อยแล้ว`);
    } catch (e) {
      error((e as Error).message || 'เกิดข้อผิดพลาดในการบันทึกคอมพิวเตอร์');
    }
  };

  const handleDeleteComputer = (computer: Computer) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบเครื่องคอมพิวเตอร์',
      message: `คุณต้องการลบเครื่อง "${computer.computerName}" (รหัสครุภัณฑ์: ${computer.assetCode}) ใช่หรือไม่? การลบนี้จะไม่สามารถย้อนกลับได้`,
      isDestructive: true,
      onConfirm: () => {
        try {
          DataService.deleteComputer(computer.id);
          refreshData();
          success(`ลบเครื่อง ${computer.computerName} เรียบร้อยแล้ว`);
        } catch (e) {
          error((e as Error).message);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Repair Actions
  const handleSaveRepair = (data: Partial<Repair>) => {
    try {
      const saved = DataService.saveRepair(data);
      refreshData();
      success(`เปิดใบแจ้งซ่อมเลขที่ ${saved.repairNo} เรียบร้อยแล้ว`);
      // Open detail modal right away
      setSelectedRepair(saved);
    } catch (e) {
      error((e as Error).message || 'เกิดข้อผิดพลาดในการสร้างใบแจ้งซ่อม');
    }
  };

  const handleUpdateRepairStatus = (repairId: string, status: RepairStatus, note?: string) => {
    try {
      const updated = DataService.updateRepairStatus(repairId, status, note);
      refreshData();
      setSelectedRepair(updated);
      success(`อัปเดตสถานะงานซ่อม ${updated.repairNo} เป็น "${status}"`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleAssignTech = (repairId: string, technicianId: string) => {
    try {
      const updated = DataService.assignTechnician(repairId, technicianId);
      refreshData();
      setSelectedRepair(updated);
      success(`มอบหมายงานให้ช่าง ${updated.technicianName} แล้ว`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleUpdateRepairResolution = (
    repairId: string,
    solution: string,
    diagnosisNote: string,
    cost: number
  ) => {
    try {
      const updated = DataService.updateRepairResolution(repairId, solution, diagnosisNote, cost);
      refreshData();
      setSelectedRepair(updated);
      success(`บันทึกผลการซ่อมแซมและค่าใช้จ่ายเรียบร้อยแล้ว`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleAddPartToRepair = (repairId: string, partId: string, quantity: number) => {
    try {
      const updated = DataService.addPartToRepair(repairId, partId, quantity);
      refreshData();
      setSelectedRepair(updated);
      success(`เบิกอะไหล่และตัดสต็อก ${quantity} รายการเรียบร้อย`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleRemovePartFromRepair = (repairId: string, repairPartId: string) => {
    try {
      const updated = DataService.removePartFromRepair(repairId, repairPartId);
      refreshData();
      setSelectedRepair(updated);
      info('ลบรายการอะไหล่และคืนยอดสต็อกเรียบร้อย');
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleAddAttachment = (repairId: string, url: string, name: string) => {
    try {
      const updated = DataService.addAttachment(repairId, url, name);
      refreshData();
      setSelectedRepair(updated);
      success('แนบรูปภาพเข้ากับงานซ่อมสำเร็จ');
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleDeleteRepair = (repair: Repair) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบรายการแจ้งซ่อม',
      message: `คุณต้องการลบใบแจ้งซ่อมเลขที่ "${repair.repairNo}" (${repair.computerName}) ใช่หรือไม่?`,
      isDestructive: true,
      onConfirm: () => {
        try {
          DataService.deleteRepair(repair.id);
          refreshData();
          if (selectedRepair?.id === repair.id) setSelectedRepair(null);
          success(`ลบใบแจ้งซ่อม ${repair.repairNo} เรียบร้อยแล้ว`);
        } catch (e) {
          error((e as Error).message);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Part Actions
  const handleSavePart = (data: Partial<Part>) => {
    try {
      const saved = DataService.savePart(data);
      refreshData();
      success(`บันทึกข้อมูลอะไหล่ [${saved.partCode}] ${saved.name} เรียบร้อยแล้ว`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleAdjustStock = (partId: string, delta: number, note: string) => {
    try {
      const updated = DataService.adjustPartStock(partId, delta, note);
      refreshData();
      success(`ปรับยอดสต็อก [${updated.partCode}] ${updated.name} คงเหลือ ${updated.stock} ${updated.unit}`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleDeletePart = (part: Part) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบอะไหล่',
      message: `คุณต้องการลบอะไหล่ "${part.name}" (${part.partCode}) ใช่หรือไม่?`,
      isDestructive: true,
      onConfirm: () => {
        try {
          DataService.deletePart(part.id);
          refreshData();
          success(`ลบอะไหล่ ${part.name} เรียบร้อยแล้ว`);
        } catch (e) {
          error((e as Error).message);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // User & Department settings
  const handleSaveUser = (userData: Partial<User>) => {
    try {
      const saved = DataService.saveUser(userData);
      refreshData();
      success(`บันทึกบัญชีผู้ใช้ "${saved.name}" (@${saved.username}) สำเร็จ`);
    } catch (e) {
      error((e as Error).message || 'เกิดข้อผิดพลาดในการบันทึกผู้ใช้');
      throw e;
    }
  };

  const handleDeleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบผู้ใช้',
      message: `คุณต้องการลบบัญชี "${target?.name || 'ผู้ใช้งาน'}" (@${target?.username || ''}) ออกจากระบบใช่หรือไม่?`,
      isDestructive: true,
      onConfirm: () => {
        try {
          DataService.deleteUser(userId);
          refreshData();
          success(`ลบบัญชีผู้ใช้ "${target?.name || ''}" สำเร็จ`);
        } catch (e) {
          error((e as Error).message || 'ไม่สามารถลบผู้ใช้งานได้');
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveDepartment = (deptData: Partial<Department>) => {
    try {
      const saved = DataService.saveDepartment(deptData);
      refreshData();
      success(`บันทึกแผนก [${saved.code}] ${saved.name} สำเร็จ`);
    } catch (e) {
      error((e as Error).message);
    }
  };

  const handleDeleteDepartment = (deptId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ยืนยันการลบแผนก',
      message: 'คุณต้องการลบแผนกนี้ใช่หรือไม่?',
      isDestructive: true,
      onConfirm: () => {
        try {
          DataService.deleteDepartment(deptId);
          refreshData();
          success('ลบแผนกสำเร็จ');
        } catch (e) {
          error((e as Error).message);
        }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'รีเซ็ตข้อมูลตัวอย่าง (Reset Seed Data)',
      message: 'ต้องการล้างและคืนค่าข้อมูลคอมพิวเตอร์และงานซ่อมเริ่มต้นทั้งหมด 20+ เครื่องและ 15+ งานซ่อมใช่หรือไม่?',
      isDestructive: true,
      onConfirm: () => {
        DataService.resetToSeedData();
        refreshData();
        success('รีเซ็ตข้อมูลตัวอย่างทั้งหมดเรียบร้อยแล้ว');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportAllJson = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      computers,
      repairs,
      parts,
      departments,
      users
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IT_Repair_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('ดาวน์โหลดไฟล์สำรองข้อมูล JSON สำเร็จ');
  };

  // Global search filtering for computers/repairs
  const activeComputers = useMemo(() => {
    if (!globalSearchTerm.trim()) return computers;
    const term = globalSearchTerm.toLowerCase();
    return computers.filter(
      (c) =>
        c.assetCode.toLowerCase().includes(term) ||
        c.serialNumber.toLowerCase().includes(term) ||
        c.computerName.toLowerCase().includes(term) ||
        c.assignedUser.toLowerCase().includes(term) ||
        (c.departmentName && c.departmentName.toLowerCase().includes(term)) ||
        c.ipAddress.toLowerCase().includes(term)
    );
  }, [computers, globalSearchTerm]);

  const activeRepairs = useMemo(() => {
    if (!globalSearchTerm.trim()) return repairs;
    const term = globalSearchTerm.toLowerCase();
    return repairs.filter(
      (r) =>
        r.repairNo.toLowerCase().includes(term) ||
        r.computerAssetCode.toLowerCase().includes(term) ||
        r.computerName.toLowerCase().includes(term) ||
        r.requesterName.toLowerCase().includes(term) ||
        r.problemDescription.toLowerCase().includes(term) ||
        (r.technicianName && r.technicianName.toLowerCase().includes(term))
    );
  }, [repairs, globalSearchTerm]);

  // If not logged in, render Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        onResetPassword={handleResetPassword}
        demoUsers={users}
        departments={departments}
        onQuickLogin={handleQuickLogin}
      />
    );
  }

  return (
    <AppLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      onSwitchUser={handleQuickLogin}
      allUsers={users}
      lowStockParts={lowStockParts}
      urgentRepairs={urgentRepairs}
      currentView={currentView}
      currentSubView={currentSubView}
      onNavigate={handleNavigate}
      onGlobalSearch={setGlobalSearchTerm}
      globalSearchTerm={globalSearchTerm}
    >
      {/* 1. Dashboard View */}
      {currentView === 'dashboard' && (
        <DashboardView
          stats={dashboardStats}
          currentUser={currentUser}
          onNavigate={handleNavigate}
          onSelectRepair={(r) => setSelectedRepair(r)}
        />
      )}

      {/* 2. Computer Management */}
      {currentView === 'computers' && (
        <ComputerListView
          computers={activeComputers}
          departments={departments}
          currentUser={currentUser}
          onSelectComputer={(c) => setSelectedComputer(c)}
          onEditComputer={(c) => {
            setEditingComputer(c);
            setIsComputerFormOpen(true);
          }}
          onDeleteComputer={handleDeleteComputer}
          onAddNewComputer={() => {
            setEditingComputer(null);
            setIsComputerFormOpen(true);
          }}
          onNewRepairForPc={(c) => {
            setPreselectedCompForRepair(c);
            setIsRepairFormOpen(true);
          }}
        />
      )}

      {/* 3. Repair Management */}
      {currentView === 'repairs' && (
        <RepairListView
          repairs={activeRepairs}
          departments={departments}
          technicians={technicians}
          currentUser={currentUser}
          onSelectRepair={(r) => setSelectedRepair(r)}
          onAddNewRepair={() => {
            setPreselectedCompForRepair(null);
            setIsRepairFormOpen(true);
          }}
          onDeleteRepair={handleDeleteRepair}
          onPrintRepair={(r) => setPrintingRepair(r)}
          initialTab={currentSubView === 'history' ? 'history' : currentSubView === 'jobs' ? 'active' : 'all'}
        />
      )}

      {/* 4. Spare Parts Inventory */}
      {currentView === 'parts' && (
        <PartsListView
          parts={parts}
          currentUser={currentUser}
          onAddNewPart={() => {
            setEditingPart(null);
            setIsPartFormOpen(true);
          }}
          onEditPart={(p) => {
            setEditingPart(p);
            setIsPartFormOpen(true);
          }}
          onDeletePart={handleDeletePart}
          onAdjustStock={(p) => setAdjustingStockPart(p)}
          initialFilterLowStock={currentSubView === 'stock'}
        />
      )}

      {/* 5. Reports & Analytics */}
      {currentView === 'reports' && (
        <ReportsView
          repairs={repairs}
          computers={computers}
          departments={departments}
          technicians={technicians}
          parts={parts}
          initialSubTab={currentSubView || 'repairs'}
        />
      )}

      {/* 6. Settings */}
      {currentView === 'settings' && (
        <>
          {currentSubView === 'users' && (
            <UsersManagement
              users={users}
              departments={departments}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentSubView === 'departments' && (
            <DepartmentsManagement
              departments={departments}
              onSaveDepartment={handleSaveDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {(!currentSubView || currentSubView === 'system') && (
            <SystemSettings
              onResetData={handleResetData}
              onExportAllJson={handleExportAllJson}
            />
          )}
        </>
      )}

      {/* MODALS */}
      {/* Computer Detail Modal */}
      {selectedComputer && (
        <ComputerDetailModal
          computer={selectedComputer}
          repairs={repairs.filter((r) => r.computerId === selectedComputer.id)}
          onClose={() => setSelectedComputer(null)}
          onNewRepair={(c) => {
            setSelectedComputer(null);
            setPreselectedCompForRepair(c);
            setIsRepairFormOpen(true);
          }}
          onSelectRepair={(r) => {
            setSelectedComputer(null);
            setSelectedRepair(r);
          }}
        />
      )}

      {/* Computer Add/Edit Form Modal */}
      <ComputerFormModal
        isOpen={isComputerFormOpen}
        onClose={() => setIsComputerFormOpen(false)}
        onSave={handleSaveComputer}
        initialData={editingComputer}
        departments={departments}
      />

      {/* Repair Detail Modal */}
      {selectedRepair && (
        <RepairDetailModal
          repair={selectedRepair}
          computer={computers.find((c) => c.id === selectedRepair.computerId)}
          allParts={parts}
          allTechnicians={technicians}
          currentUser={currentUser}
          onClose={() => setSelectedRepair(null)}
          onUpdateStatus={handleUpdateRepairStatus}
          onAssignTech={handleAssignTech}
          onUpdateResolution={handleUpdateRepairResolution}
          onAddPart={handleAddPartToRepair}
          onRemovePart={handleRemovePartFromRepair}
          onAddAttachment={handleAddAttachment}
          onOpenPrint={(r) => setPrintingRepair(r)}
        />
      )}

      {/* Repair Add Ticket Form Modal */}
      <RepairFormModal
        isOpen={isRepairFormOpen}
        onClose={() => setIsRepairFormOpen(false)}
        onSave={handleSaveRepair}
        computers={computers}
        departments={departments}
        technicians={technicians}
        preselectedComputer={preselectedCompForRepair}
      />

      {/* Part Add/Edit Modal */}
      <PartFormModal
        isOpen={isPartFormOpen}
        onClose={() => setIsPartFormOpen(false)}
        onSave={handleSavePart}
        initialData={editingPart}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        isOpen={!!adjustingStockPart}
        part={adjustingStockPart}
        onClose={() => setAdjustingStockPart(null)}
        onConfirm={handleAdjustStock}
      />

      {/* Print Job Sheet Modal */}
      {printingRepair && (
        <RepairJobSheetPrint
          repair={printingRepair}
          computer={computers.find((c) => c.id === printingRepair.computerId)}
          onClose={() => setPrintingRepair(null)}
        />
      )}

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
