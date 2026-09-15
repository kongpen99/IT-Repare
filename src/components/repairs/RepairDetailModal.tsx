import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Monitor,
  User as UserIcon,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  Plus,
  Trash2,
  Printer,
  FileText,
  DollarSign,
  Image as ImageIcon,
  Edit3,
  Check,
  Send,
  CornerUpLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Repair, RepairStatus, Computer, Part, User, Priority } from '../../types';
import { RepairStatusBadge, PriorityBadge } from '../ui/Badge';
import { motion, AnimatePresence } from 'motion/react';

interface RepairDetailModalProps {
  repair: Repair | null;
  computer?: Computer;
  allParts: Part[];
  allTechnicians: User[];
  currentUser: User | null;
  onClose: () => void;
  onUpdateStatus: (repairId: string, status: RepairStatus, note?: string) => void;
  onAssignTech: (repairId: string, technicianId: string) => void;
  onUpdateResolution: (repairId: string, solution: string, diagnosisNote: string, cost: number) => void;
  onAddPart: (repairId: string, partId: string, quantity: number) => void;
  onRemovePart: (repairId: string, repairPartId: string) => void;
  onAddAttachment: (repairId: string, url: string, name: string) => void;
  onOpenPrint: (repair: Repair) => void;
}

export const RepairDetailModal: React.FC<RepairDetailModalProps> = ({
  repair,
  computer,
  allParts,
  allTechnicians,
  currentUser,
  onClose,
  onUpdateStatus,
  onAssignTech,
  onUpdateResolution,
  onAddPart,
  onRemovePart,
  onAddAttachment,
  onOpenPrint
}) => {
  const repairParts = repair?.parts || (repair as any)?.partsUsed || [];
  const currentPartsCost = repairParts.reduce(
    (acc: number, p: any) => acc + (p.total ?? (p.quantity * (p.price ?? p.unitPrice ?? 0))),
    0
  );

  const [activeTab, setActiveTab] = useState<'info' | 'parts' | 'timeline' | 'photos'>('info');
  const [statusNote, setStatusNote] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<RepairStatus>(repair?.status || 'WAITING');
  const [solutionText, setSolutionText] = useState(repair?.solution || '');
  const [diagnosisText, setDiagnosisText] = useState(repair?.cause || (repair as any)?.diagnosisNote || '');
  const [laborCost, setLaborCost] = useState<number>(() => Math.max(0, (repair?.cost || 0) - currentPartsCost));
  const [selectedPartId, setSelectedPartId] = useState(allParts[0]?.id || '');
  const [partQty, setPartQty] = useState(1);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isSavingResolution, setIsSavingResolution] = useState(false);

  // Sync state when repair changes
  useEffect(() => {
    if (repair) {
      setSelectedNewStatus(repair.status);
      setSolutionText(repair.solution || '');
      setDiagnosisText(repair.cause || (repair as any).diagnosisNote || '');
      const pCost = (repair.parts || (repair as any).partsUsed || []).reduce(
        (acc: number, p: any) => acc + (p.total ?? (p.quantity * (p.price ?? p.unitPrice ?? 0))),
        0
      );
      setLaborCost(Math.max(0, (repair.cost || 0) - pCost));
    }
  }, [repair?.id]);

  if (!repair) return null;

  const statuses: RepairStatus[] = [
    'WAITING',
    'ASSIGNED',
    'DIAGNOSING',
    'REPAIRING',
    'WAITING_PART',
    'COMPLETED',
    'RETURNED',
    'CANCELLED'
  ];

  const handleStatusChange = (newSt: RepairStatus) => {
    onUpdateStatus(repair.id, newSt, statusNote || `เปลี่ยนสถานะเป็น ${newSt}`);
    setStatusNote('');
  };

  const handleSaveResolution = () => {
    setIsSavingResolution(true);
    const partsCost = repairParts.reduce(
      (acc: number, p: any) => acc + (p.total ?? (p.quantity * (p.price ?? p.unitPrice ?? 0))),
      0
    );
    const totalCost = partsCost + Number(laborCost || 0);

    onUpdateResolution(repair.id, solutionText, diagnosisText, totalCost);
    setTimeout(() => setIsSavingResolution(false), 300);
  };

  const handleAddPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || partQty <= 0) return;
    onAddPart(repair.id, selectedPartId, Number(partQty));
    setPartQty(1);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    onAddAttachment(repair.id, newPhotoUrl.trim(), 'รูปถ่ายหน้างาน / อาการเสีย');
    setNewPhotoUrl('');
  };

  const samplePhotos = [
    'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80'
  ];

  const totalPartsCost = currentPartsCost;

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
          <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-blue-400 font-bold">{repair.repairNo}</span>
                  <RepairStatusBadge status={repair.status} />
                  <PriorityBadge priority={repair.priority} />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-heading text-white mt-0.5">
                  {repair.computerName} ({repair.computerAssetCode})
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onOpenPrint(repair)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-colors"
                title="พิมพ์ใบแจ้งซ่อม / ใบส่งมอบ"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์ใบซ่อม</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workflow Status Bar (Quick State Buttons) */}
          <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 overflow-x-auto flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-600 shrink-0">เปลี่ยนสถานะงาน:</span>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                disabled={repair.status === st}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  repair.status === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold text-slate-500 bg-white">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ข้อมูลการแจ้งซ่อม & การแก้ไข</span>
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'parts' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>อะไหล่และค่าใช้จ่าย ({(repair.partsUsed || []).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>บันทึกประวัติ (Timeline {(repair.logs || []).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'photos' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>รูปภาพแนบ ({(repair.attachments || []).length})</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Section 1: Problem & Requester Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requester Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <UserIcon className="w-4 h-4 text-blue-600" />
                      <span>ข้อมูลผู้ส่งซ่อม</span>
                    </div>
                    <div><span className="text-slate-400">ผู้แจ้ง:</span> <strong className="text-slate-900">{repair.requesterName}</strong></div>
                    <div><span className="text-slate-400">แผนก:</span> <span className="text-slate-800">{repair.departmentName}</span></div>
                    <div><span className="text-slate-400">เบอร์ติดต่อ:</span> <span className="text-slate-800">{repair.requesterPhone || '-'}</span></div>
                    <div><span className="text-slate-400">สถานที่:</span> <span className="text-slate-800">{repair.requesterLocation || '-'}</span></div>
                    <div><span className="text-slate-400">วันที่แจ้ง:</span> <span className="text-slate-800">{new Date(repair.createdAt).toLocaleString('th-TH')}</span></div>
                  </div>

                  {/* Technician Assign Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-indigo-600" />
                      <span>ช่างผู้รับผิดชอบงาน</span>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">มอบหมายช่างผู้รับผิดชอบ:</label>
                      <select
                        value={repair.technicianId || ''}
                        onChange={(e) => onAssignTech(repair.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-900"
                      >
                        <option value="">-- ยังไม่มอบหมายช่าง --</option>
                        {allTechnicians.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.role === 'ADMIN' ? 'Admin' : 'ช่างเทคนิค'})
                          </option>
                        ))}
                      </select>
                    </div>
                    {repair.completedAt && (
                      <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        ✓ ซ่อมเสร็จเมื่อ: {new Date(repair.completedAt).toLocaleString('th-TH')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem Description */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                    <span>อาการเสียที่ได้รับแจ้ง (Problem Description)</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px]">
                      หมวด: {repair.problemType}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                    {repair.problemDescription}
                  </p>
                </div>

                {/* Resolution & Diagnosis Section (Editable by Tech) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-blue-600" />
                      <span>บันทึกผลการตรวจเช็คและการแก้ไข (Diagnosis & Resolution)</span>
                    </h4>
                    <button
                      onClick={handleSaveResolution}
                      disabled={isSavingResolution}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingResolution ? 'กำลังบันทึก...' : 'บันทึกวิธีแก้ไข'}</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        สาเหตุของปัญหา / ผลการตรวจเช็ค (Diagnosis Note)
                      </label>
                      <textarea
                        rows={2}
                        value={diagnosisText}
                        onChange={(e) => setDiagnosisText(e.target.value)}
                        placeholder="เช่น พัดลม CPU ฝุ่นเกาะหนาแน่น / Windows System File เสียหาย..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        วิธีแก้ไขและขั้นตอนการซ่อม (Solution & Actions Taken)
                      </label>
                      <textarea
                        rows={3}
                        value={solutionText}
                        onChange={(e) => setSolutionText(e.target.value)}
                        placeholder="เช่น ทำความสะอาด ทาซิลิโคนใหม่ / ติดตั้ง Windows 11 และโปรแกรมใช้งานพื้นฐานใหม่..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          ค่าบริการ / ค่าแรงช่าง (Labor Cost)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={laborCost}
                            onChange={(e) => setLaborCost(Number(e.target.value))}
                            className="w-full pl-3 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">บาท</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 block text-[11px]">รวมค่าใช้จ่ายทั้งหมด (อะไหล่+ค่าแรง):</span>
                          <span className="text-base font-bold text-blue-900">
                            {(totalPartsCost + Number(laborCost || 0)).toLocaleString()} บาท
                          </span>
                        </div>
                        <DollarSign className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Parts & Inventory Replacement */}
            {activeTab === 'parts' && (
              <div className="space-y-6">
                {/* Add Part Form */}
                <form
                  onSubmit={handleAddPartSubmit}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>เบิกและตัดสต็อกอะไหล่เพื่อใช้ในงานซ่อมนี้</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        เลือกรายการอะไหล่ในคลัง
                      </label>
                      <select
                        value={selectedPartId}
                        onChange={(e) => setSelectedPartId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      >
                        {allParts.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                            {p.name} ({p.partCode}) - คงเหลือ {p.stock} {p.unit} [{p.price} บ.]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวน</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={partQty}
                        onChange={(e) => setPartQty(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>เพิ่มอะไหล่ & ตัดสต็อก</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Used Parts List */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">รหัส / ชื่ออะไหล่</th>
                        <th className="px-4 py-3 text-center">จำนวน</th>
                        <th className="px-4 py-3 text-right">ราคาต่อหน่วย</th>
                        <th className="px-4 py-3 text-right">รวมเงิน</th>
                        <th className="px-4 py-3 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {repairParts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            ยังไม่มีการเบิกใช้อะไหล่ในงานซ่อมนี้
                          </td>
                        </tr>
                      ) : (
                        repairParts.map((p: any) => {
                          const unitPrice = Number(p.price ?? p.unitPrice ?? 0);
                          const total = Number(p.total ?? (p.quantity * unitPrice));
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/60">
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {p.partName}
                                {p.partCode && <span className="ml-2 font-mono text-slate-400 text-[11px]">({p.partCode})</span>}
                              </td>
                              <td className="px-4 py-3 text-center font-bold text-slate-900">{p.quantity}</td>
                              <td className="px-4 py-3 text-right">{unitPrice.toLocaleString()} บ.</td>
                              <td className="px-4 py-3 text-right font-bold text-blue-600">
                                {total.toLocaleString()} บ.
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => onRemovePart(repair.id, p.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="คืนสต็อกและลบรายการ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {repairParts.length > 0 && (
                      <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right text-slate-700">
                            รวมค่าอะไหล่ทั้งหมด:
                          </td>
                          <td className="px-4 py-3 text-right text-blue-900 text-sm">
                            {totalPartsCost.toLocaleString()} บ.
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Timeline Logs */}
            {activeTab === 'timeline' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {(!repair.logs || repair.logs.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 text-xs">ไม่มีประวัติบันทึก</div>
                  ) : (
                    repair.logs.map((log, idx) => (
                      <div key={log.id} className="flex items-start gap-3.5 relative">
                        {idx !== repair.logs.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200" />
                        )}
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10 border-2 border-white shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{log.action}</span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(log.timestamp).toLocaleString('th-TH')}
                            </span>
                          </div>
                          {log.note && <p className="text-slate-600 mt-1">{log.note}</p>}
                          <div className="text-[10px] text-slate-400 mt-1.5">
                            โดย: <span className="font-semibold text-slate-700">{log.userName}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Photos & Attachments */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                {/* Upload Form */}
                <form
                  onSubmit={handleAddPhotoSubmit}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>แนบรูปภาพหน้างาน / สภาพเครื่องเสีย</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="ใส่ URL รูปภาพ หรือเลือกจากตัวอย่างด้านล่าง..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      แนบรูป
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>รูปภาพตัวอย่าง:</span>
                    {samplePhotos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewPhotoUrl(url)}
                        className="text-blue-600 hover:underline"
                      >
                        ตัวอย่าง {i + 1}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(!repair.attachments || repair.attachments.length === 0) ? (
                    <div className="col-span-3 p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed">
                      ยังไม่มีรูปภาพแนบในงานซ่อมนี้
                    </div>
                  ) : (
                    repair.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-2xl border border-slate-200 overflow-hidden group relative bg-slate-900 shadow-xs"
                      >
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          referrerPolicy="no-referrer"
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="p-2.5 bg-white text-xs">
                          <p className="font-semibold text-slate-800 truncate">{att.fileName}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(att.uploadedAt).toLocaleDateString('th-TH')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
