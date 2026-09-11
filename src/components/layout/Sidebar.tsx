import React, { useState } from 'react';
import {
  LayoutDashboard,
  Monitor,
  Wrench,
  Package,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  List,
  History,
  Boxes,
  FileSpreadsheet,
  Users,
  Building2,
  Sliders,
  LogOut,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentView: string;
  currentSubView?: string;
  onNavigate: (view: string, sub?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentSubView,
  onNavigate,
  currentUser,
  onLogout,
  isMobileOpen,
  onCloseMobile
}) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    computers: true,
    repairs: true,
    parts: true,
    reports: true,
    settings: true
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  const navItemClass = (isActive: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const subItemClass = (isActive: boolean) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-sm text-slate-900 leading-tight">
              IT Repair System
            </div>
            <div className="text-[11px] text-slate-400 font-medium">ระบบซ่อมคอมพิวเตอร์</div>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {/* Dashboard */}
          <button
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className={`w-full ${navItemClass(currentView === 'dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="flex-1 text-left">Dashboard (แดชบอร์ด)</span>
          </button>

          {/* Computer Management */}
          <div>
            <button
              onClick={() => toggleMenu('computers')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <span>💻 Computer (คอมพิวเตอร์)</span>
              </div>
              {openMenus.computers ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openMenus.computers && (
              <div className="ml-4 pl-3 border-l border-slate-200 mt-1 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('computers', 'list');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'computers' && (!currentSubView || currentSubView === 'list'))}`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Computer List</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('computers', 'add');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'computers' && currentSubView === 'add')}`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>Add Computer</span>
                </button>
              </div>
            )}
          </div>

          {/* Repair Management */}
          <div>
            <button
              onClick={() => toggleMenu('repairs')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-slate-400" />
                <span>🔧 Repair (งานซ่อม)</span>
              </div>
              {openMenus.repairs ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openMenus.repairs && (
              <div className="ml-4 pl-3 border-l border-slate-200 mt-1 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('repairs', 'jobs');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'repairs' && currentSubView === 'jobs')}`}
                >
                  <Wrench className="w-3.5 h-3.5 text-sky-500" />
                  <span>Repair Jobs (งานซ่อม)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('repairs', 'new');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'repairs' && currentSubView === 'new')}`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span>New Repair (แจ้งซ่อมใหม่)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('repairs', 'history');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'repairs' && currentSubView === 'history')}`}
                >
                  <History className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Repair History (ประวัติการซ่อม)</span>
                </button>
              </div>
            )}
          </div>

          {/* Spare Parts */}
          <div>
            <button
              onClick={() => toggleMenu('parts')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-slate-400" />
                <span>📦 Spare Parts (อะไหล่)</span>
              </div>
              {openMenus.parts ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openMenus.parts && (
              <div className="ml-4 pl-3 border-l border-slate-200 mt-1 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('parts', 'list');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'parts' && currentSubView === 'list')}`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Parts (รายการอะไหล่)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('parts', 'stock');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'parts' && currentSubView === 'stock')}`}
                >
                  <Package className="w-3.5 h-3.5 text-amber-500" />
                  <span>Stock & Alerts (สต็อก)</span>
                </button>
              </div>
            )}
          </div>

          {/* Reports */}
          <div>
            <button
              onClick={() => toggleMenu('reports')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span>📈 Reports (รายงาน)</span>
              </div>
              {openMenus.reports ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openMenus.reports && (
              <div className="ml-4 pl-3 border-l border-slate-200 mt-1 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('reports', 'repairs');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'reports' && currentSubView === 'repairs')}`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Repair Report</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('reports', 'computers');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'reports' && currentSubView === 'computers')}`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                  <span>Computer Report</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('reports', 'cost');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'reports' && currentSubView === 'cost')}`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Cost Report (ค่าใช้จ่าย)</span>
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div>
            <button
              onClick={() => toggleMenu('settings')}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" />
                <span>⚙️ Settings (ตั้งค่า)</span>
              </div>
              {openMenus.settings ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
            {openMenus.settings && (
              <div className="ml-4 pl-3 border-l border-slate-200 mt-1 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('settings', 'users');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'settings' && currentSubView === 'users')}`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span>Users {!isAdmin && '(Admin only)'}</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings', 'departments');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'settings' && currentSubView === 'departments')}`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Departments</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings', 'system');
                    onCloseMobile();
                  }}
                  className={`w-full ${subItemClass(currentView === 'settings' && currentSubView === 'system')}`}
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>System Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between px-2 py-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] text-slate-500 font-medium">PostgreSQL Ready</span>
            </div>
            <span className="text-[10px] text-slate-400">v1.2.0</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
