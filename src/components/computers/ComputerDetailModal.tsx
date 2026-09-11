import React from 'react';
import {
  X,
  Monitor,
  Cpu,
  HardDrive,
  Globe,
  MapPin,
  User as UserIcon,
  Calendar,
  Shield,
  Clock,
  Wrench,
  AlertCircle,
  FileText,
  DollarSign,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Computer, Repair } from '../../types';
import { ComputerStatusBadge, RepairStatusBadge, PriorityBadge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';

interface ComputerDetailModalProps {
  computer: Computer | null;
  repairs: Repair[];
  onClose: () => void;
  onNewRepair: (computer: Computer) => void;
  onSelectRepair: (repair: Repair) => void;
}

export const ComputerDetailModal: React.FC<ComputerDetailModalProps> = ({
  computer,
  repairs,
  onClose,
  onNewRepair,
  onSelectRepair
}) => {
  if (!computer) return null;

  const totalCost = repairs.reduce((sum, r) => sum + r.cost, 0);

  // Warranty calculation
  const isWarrantyValid = computer.warrantyExpiry
    ? new Date(computer.warrantyExpiry) > new Date()
    : false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Monitor className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-heading">{computer.computerName}</h3>
                  <ComputerStatusBadge status={computer.status} />
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-3 mt-1 font-mono">
                  <span>รหัสครุภัณฑ์: {computer.assetCode}</span>
                  <span>•</span>
                  <span>S/N: {computer.serialNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNewRepair(computer)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>แจ้งซ่อมเครื่องนี้</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Hardware Specs */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>ข้อมูลฮาร์ดแวร์และระบบปฏิบัติการ</span>
                </div>

                <div className="grid grid-cols-3 text-xs gap-y-2">
                  <span className="text-slate-400">ยี่ห้อ / รุ่น:</span>
                  <span className="col-span-2 font-medium text-slate-900">
                    {computer.brand} {computer.model}
                  </span>

                  <span className="text-slate-400">หน่วยประมวลผล (CPU):</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.cpu}</span>

                  <span className="text-slate-400">หน่วยความจำ (RAM):</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.ram}</span>

                  <span className="text-slate-400">ความจุ (Storage):</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.storage}</span>

                  <span className="text-slate-400">ระบบปฏิบัติการ (OS):</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.operatingSystem}</span>
                </div>
              </div>

              {/* Box 2: Network & User Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>การเชื่อมต่อและผู้รับผิดชอบ</span>
                </div>

                <div className="grid grid-cols-3 text-xs gap-y-2">
                  <span className="text-slate-400">ผู้ใช้งานประจำ:</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.assignedUser}</span>

                  <span className="text-slate-400">แผนก / ฝ่าย:</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.departmentName}</span>

                  <span className="text-slate-400">สถานที่ติดตั้ง:</span>
                  <span className="col-span-2 font-medium text-slate-900">{computer.location}</span>

                  <span className="text-slate-400">IP Address:</span>
                  <span className="col-span-2 font-mono font-medium text-slate-900">
                    {computer.ipAddress || '-'}
                  </span>

                  <span className="text-slate-400">MAC Address:</span>
                  <span className="col-span-2 font-mono font-medium text-slate-900">
                    {computer.macAddress || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 3: Procurement, Warranty & Remarks */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">วันที่จัดซื้อ (Purchase Date):</span>
                <span className="font-semibold text-slate-800">
                  {computer.purchaseDate ? new Date(computer.purchaseDate).toLocaleDateString('th-TH') : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">วันหมดอายุประกัน (Warranty Expiry):</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  {computer.warrantyExpiry ? new Date(computer.warrantyExpiry).toLocaleDateString('th-TH') : '-'}
                  {isWarrantyValid ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 font-medium">
                      อยู่ในประกัน
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-600 font-medium">
                      หมดประกันแล้ว
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">หมายเหตุ (Remark):</span>
                <span className="text-slate-700">{computer.remark || '-'}</span>
              </div>
            </div>

            {/* Section: Complete Repair History for THIS Computer (Prompt Section 4 Requirement) */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    ประวัติการซ่อมบำรุงทั้งหมดของเครื่องนี้ ({repairs.length} รายการ)
                  </h4>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  ค่าใช้จ่ายซ่อมสะสม:{' '}
                  <span className="text-blue-600 font-bold">{totalCost.toLocaleString()} บาท</span>
                </div>
              </div>

              {repairs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  เครื่องนี้ยังไม่มีประวัติการแจ้งซ่อม สภาพการใช้งานปกติ
                </div>
              ) : (
                <div className="space-y-3">
                  {repairs.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onSelectRepair(r)}
                      className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-600">{r.repairNo}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(r.createdAt).toLocaleDateString('th-TH', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <PriorityBadge priority={r.priority} />
                        </div>
                        <p className="text-xs font-semibold text-slate-800">{r.problemDescription}</p>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>ช่าง: {r.technicianName || 'ยังไม่ระบุ'}</span>
                          <span>•</span>
                          <span>ประเภท: {r.problemType}</span>
                          {r.cost > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-medium">
                                ค่าซ่อม: {r.cost.toLocaleString()} บาท
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <RepairStatusBadge status={r.status} size="sm" />
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
