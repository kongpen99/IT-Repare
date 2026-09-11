import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { User, Part, Repair } from '../../types';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: User[];
  lowStockParts: Part[];
  urgentRepairs: Repair[];
  currentView: string;
  currentSubView?: string;
  onNavigate: (view: string, sub?: string, params?: Record<string, unknown>) => void;
  onGlobalSearch: (term: string) => void;
  globalSearchTerm: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers,
  lowStockParts,
  urgentRepairs,
  currentView,
  currentSubView,
  onNavigate,
  onGlobalSearch,
  globalSearchTerm,
  children
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar (Desktop fixed, Mobile off-canvas) */}
      <Sidebar
        currentView={currentView}
        currentSubView={currentSubView}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Mobile Header Bar trigger */}
        <div className="no-print lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200 sticky top-0 z-20">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-heading font-bold text-sm text-slate-800">
            ระบบซ่อมคอมพิวเตอร์ (IT Service)
          </span>
          <div className="w-8" />
        </div>

        {/* Global Desktop Header */}
        <Header
          currentUser={currentUser}
          onLogout={onLogout}
          onSwitchUser={onSwitchUser}
          allUsers={allUsers}
          lowStockParts={lowStockParts}
          urgentRepairs={urgentRepairs}
          onNavigate={onNavigate}
          onGlobalSearch={onGlobalSearch}
          globalSearchTerm={globalSearchTerm}
        />

        {/* Main Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
