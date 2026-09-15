import React, { useState } from 'react';
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Wrench,
  ChevronDown,
  Monitor,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { User, Part, Repair } from '../../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: User[];
  lowStockParts: Part[];
  urgentRepairs: Repair[];
  onNavigate: (view: string, sub?: string, params?: Record<string, unknown>) => void;
  onGlobalSearch: (term: string) => void;
  globalSearchTerm: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers,
  lowStockParts,
  urgentRepairs,
  onNavigate,
  onGlobalSearch,
  globalSearchTerm
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const totalNotifications = lowStockParts.length + urgentRepairs.length;

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Global Quick Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchTerm}
              onChange={(e) => onGlobalSearch(e.target.value)}
              placeholder="ค้นหาด่วน (Asset Code, Serial No, ชื่อเครื่อง, Repair ID, ผู้ใช้, ช่าง)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
            {globalSearchTerm && (
              <button
                onClick={() => onGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded"
              >
                ล้าง
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications, User Profile */}
        <div className="flex items-center gap-3 ml-4">
          {/* Quick Create Repair Button */}
          <button
            onClick={() => onNavigate('repairs', 'new')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>+ แจ้งซ่อมใหม่</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowUserDropdown(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="การแจ้งเตือน"
            >
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {totalNotifications}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>การแจ้งเตือนระบบ ({totalNotifications})</span>
                  </div>
                  <span className="text-xs text-slate-400">อัตโนมัติ</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {totalNotifications === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      <Sparkles className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      ไม่มีการแจ้งเตือนคงค้าง ระบบทำงานปกติ
                    </div>
                  ) : (
                    <>
                      {urgentRepairs.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            onNavigate('repairs', 'detail', { repairId: r.id });
                          }}
                          className="p-3 hover:bg-rose-50/50 cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                              <span>งานซ่อมเร่งด่วน ({r.priority})</span>
                              <span className="text-[10px] text-slate-400">#{r.repairNo}</span>
                            </div>
                            <p className="text-xs text-slate-700 truncate">{r.problemDescription}</p>
                            <span className="text-[10px] text-slate-400">{r.computerName} • {r.departmentName}</span>
                          </div>
                        </div>
                      ))}

                      {lowStockParts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            onNavigate('parts', 'list');
                          }}
                          className="p-3 hover:bg-amber-50/50 cursor-pointer transition-colors flex items-start gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-amber-800">
                              อะไหล่ใกล้หมดสต็อก!
                            </div>
                            <p className="text-xs text-slate-700 truncate">{p.name}</p>
                            <span className="text-[10px] text-amber-600 font-medium">
                              เหลือ {p.stock} {p.unit} (เกณฑ์ต่ำสุด {p.minimumStock})
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

            {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotificationDropdown(false);
              }}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 line-clamp-1">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  {currentUser?.role === 'ADMIN' ? (
                    <span className="text-blue-600 font-medium flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" /> Admin
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <Wrench className="w-2.5 h-2.5" /> ช่างเทคนิค
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={onLogout}
              title="ออกจากระบบ เพื่อไปยังหน้า Login"
              className="hidden lg:inline-flex items-center gap-1.5 ml-1 px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs text-slate-400">เข้าสู่ระบบโดย</p>
                  <p className="text-sm font-semibold text-slate-900">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                    บทบาท: {currentUser?.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ช่างเทคนิค (Technician)'}
                  </div>
                </div>

                {/* Quick Switch User (Demo/Evaluation helper) */}
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    สลับผู้ใช้งาน (Test Roles)
                  </p>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          u.id === currentUser?.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {u.role === 'ADMIN' ? 'Admin' : 'Tech'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('settings', 'system');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>ตั้งค่าระบบ (Settings)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ออกจากระบบ (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
