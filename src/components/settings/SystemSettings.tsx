import React, { useState, useEffect } from 'react';
import { Sliders, Database, RotateCcw, Download, RefreshCw, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { DataService } from '../../services/dataService';

interface SystemSettingsProps {
  onResetData: () => void;
  onExportAllJson: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ onResetData, onExportAllJson }) => {
  const { success, error, info } = useToast();
  const [orgName, setOrgName] = useState('บริษัท องค์กรตัวอย่าง จำกัด (มหาชน)');
  const [itEmail, setItEmail] = useState('itsupport@company.local');
  const [slaHours, setSlaHours] = useState('24');
  const [autoDeductStock, setAutoDeductStock] = useState(true);

  // Neon DB state
  const [neonStatus, setNeonStatus] = useState<{ connected: boolean; message?: string; version?: string } | null>(null);
  const [isCheckingNeon, setIsCheckingNeon] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsCheckingNeon(true);
    try {
      const status = await DataService.checkNeonDatabaseStatus();
      setNeonStatus(status);
    } catch {
      setNeonStatus({ connected: false, message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' });
    } finally {
      setIsCheckingNeon(false);
    }
  };

  const handleSyncToNeon = async () => {
    setIsSyncing(true);
    info('กำลังบันทึกและซิงค์ข้อมูลไปยัง Neon PostgreSQL...');
    try {
      const res = await DataService.syncToNeon();
      if (res.success) {
        success('ซิงค์ข้อมูลไปยัง Neon PostgreSQL สำเร็จ!');
        checkStatus();
      } else {
        error(res.error || res.message || 'ซิงค์ข้อมูลไม่สำเร็จ');
      }
    } catch (e: any) {
      error(e.message || 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromNeon = async () => {
    setIsSyncing(true);
    try {
      const res = await DataService.pullFromNeon();
      if (res.success) {
        success(res.message || 'ดึงข้อมูลล่าสุดจาก Neon สำเร็จ!');
      } else {
        error(res.error || res.message || 'ดึงข้อมูลไม่สำเร็จ');
      }
    } catch (e: any) {
      error(e.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsSyncing(false);
    }
  };

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
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>ฐานข้อมูล Neon PostgreSQL</span>
              </h3>
              <button
                onClick={checkStatus}
                disabled={isCheckingNeon}
                title="ตรวจสอบสถานะการเชื่อมต่อ"
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNeon ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Engine:</span>
                <span className="font-semibold font-mono text-emerald-700">Neon PostgreSQL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Database Name:</span>
                <span className="font-semibold font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[11px]">
                  {neonStatus?.databaseName || 'computer-MG'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vercel Project:</span>
                <span className="font-semibold font-mono px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px]">
                  {neonStatus?.projectName || 'computer-repair -01'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">สถานะการเชื่อมต่อ:</span>
                {neonStatus?.connected ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    เชื่อมต่อแล้ว
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    รอการเชื่อมต่อ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed border-t border-slate-200/60">
                {neonStatus?.connected
                  ? `ระบบเชื่อมต่อฐานข้อมูล ${neonStatus?.databaseName || 'computer-MG'} บน Neon PostgreSQL เรียบร้อยแล้ว ข้อมูลจะซิงค์และบันทึกลงฐานข้อมูลจริง`
                  : 'กำลังเชื่อมต่อไปยังฐานข้อมูล computer-MG บน Neon...'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleSyncToNeon}
                disabled={isSyncing}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isSyncing ? 'กำลังประมวลผล...' : 'ซิงค์ข้อมูลไปยัง Neon PostgreSQL'}</span>
              </button>

              <button
                onClick={handlePullFromNeon}
                disabled={isSyncing}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ดึงข้อมูลล่าสุดจาก Neon (Pull)</span>
              </button>

              <button
                onClick={onExportAllJson}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
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
