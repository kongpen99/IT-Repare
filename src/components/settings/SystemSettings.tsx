import React, { useState } from 'react';
import { Sliders, Database, RotateCcw, ShieldCheck, Download, CheckCircle2, HardDrive } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface SystemSettingsProps {
  onResetData: () => void;
  onExportAllJson: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onResetData, onExportAllJson }) => {
  const { success } = useToast();
  const [orgName, setOrgName] = useState('บริษัท องค์กรตัวอย่าง จำกัด (มหาชน)');
  const [itEmail, setItEmail] = useState('itsupport@company.local');
  const [slaHours, setSlaHours] = useState('24');
  const [autoDeductStock, setAutoDeductStock] = useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    success('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          <span>ตั้งค่าระบบและการบำรุงรักษา (System Settings)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          กำหนดค่าองค์กร ข้อตกลงระดับการบริการ (SLA) และการสำรองฐานข้อมูล
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <h3 className="font-heading font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
            ข้อมูลองค์กรและพารามิเตอร์ระบบ
          </h3>

          <form onSubmit={handleSavePreferences} className="mt-4 space-y-4 text-xs text-slate-800">
            <div>
              <label className="block font-semibold mb-1">ชื่อหน่วยงาน / บริษัท</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">อีเมลติดต่อฝ่าย IT Service</label>
                <input
                  type="email"
                  value={itEmail}
                  onChange={(e) => setItEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">เป้าหมายเวลาซ่อมเฉลี่ย (SLA Target)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">ชั่วโมง</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoDeductStock}
                  onChange={(e) => setAutoDeductStock(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">
                  ตัดสต็อกอะไหล่อัตโนมัติเมื่อเพิ่มรายการในใบแจ้งซ่อม
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </form>
        </div>

        {/* Database & Maintenance Box (1 col) */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>ฐานข้อมูลและการสำรอง</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-semibold font-mono text-slate-900">PostgreSQL / Prisma</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Persistence:</span>
                <span className="font-semibold text-emerald-600">Local Cache & Sync</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onExportAllJson}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>สำรองข้อมูลระบบทั้งหมด (JSON)</span>
              </button>

              <button
                onClick={onResetData}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-rose-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>รีเซ็ตข้อมูลตัวอย่าง (Reset Seed)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
