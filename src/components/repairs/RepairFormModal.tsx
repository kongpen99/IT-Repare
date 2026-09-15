import React, { useState, useEffect } from 'react';
import { X, Wrench, Monitor, User as UserIcon, AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { Repair, Computer, Department, User, ProblemType, Priority } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface RepairFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Repair>) => void;
  computers: Computer[];
  departments: Department[];
  technicians: User[];
  preselectedComputer?: Computer | null;
}

export const RepairFormModal: React.FC<RepairFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  computers,
  departments,
  technicians,
  preselectedComputer
}) => {
  const [selectedComputerId, setSelectedComputerId] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('1102');
  const [requesterLocation, setRequesterLocation] = useState('');
  const [problemType, setProblemType] = useState<ProblemType>('Hardware');
  const [problemDescription, setProblemDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [technicianId, setTechnicianId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preselectedComputer) {
      setSelectedComputerId(preselectedComputer.id);
      setRequesterName(preselectedComputer.assignedUser || '');
      setDepartmentId(preselectedComputer.departmentId || '');
      setRequesterLocation(preselectedComputer.location || '');
    } else if (computers.length > 0) {
      setSelectedComputerId(computers[0].id);
      setRequesterName(computers[0].assignedUser || '');
      setDepartmentId(computers[0].departmentId || '');
      setRequesterLocation(computers[0].location || '');
    }
    setErrors({});
  }, [preselectedComputer, computers, isOpen]);

  // When selected computer changes, auto fill department & user
  const handleComputerChange = (compId: string) => {
    setSelectedComputerId(compId);
    const targetComp = computers.find((c) => c.id === compId);
    if (targetComp) {
      setRequesterName(targetComp.assignedUser || '');
      setDepartmentId(targetComp.departmentId || '');
      setRequesterLocation(targetComp.location || '');
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedComputerId) errs.computer = 'กรุณาเลือกเครื่องคอมพิวเตอร์ที่ต้องการแจ้งซ่อม';
    if (!requesterName.trim()) errs.requester = 'กรุณาระบุชื่อผู้แจ้งซ่อม';
    if (!departmentId) errs.department = 'กรุณาเลือกแผนกผู้แจ้ง';
    if (!problemDescription.trim()) errs.problem = 'กรุณาระบุอาการเสีย หรือปัญหาที่พบ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const comp = computers.find((c) => c.id === selectedComputerId);
    const dept = departments.find((d) => d.id === departmentId);
    const tech = technicians.find((t) => t.id === technicianId);

    onSave({
      computerId: selectedComputerId,
      computerName: comp?.computerName || 'Unknown PC',
      computerAssetCode: comp?.assetCode || '',
      departmentId,
      departmentName: dept?.name || '',
      requesterName,
      requesterPhone,
      requesterLocation,
      problemType,
      problemDescription,
      priority,
      technicianId: technicianId || undefined,
      technicianName: tech?.name || undefined,
      status: technicianId ? 'ASSIGNED' : 'WAITING'
    });

    onClose();
  };

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
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading">เปิดใบแจ้งซ่อมใหม่ (New Repair Ticket)</h3>
                <p className="text-xs text-slate-300">กรอกรายละเอียดเครื่องคอมพิวเตอร์และอาการเสีย</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
            {/* 1. Select Computer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span>1. เลือกเครื่องคอมพิวเตอร์ที่ต้องการแจ้งซ่อม</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกเครื่องในระบบ (Asset Code / Name / User) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedComputerId}
                  onChange={(e) => handleComputerChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none font-medium"
                >
                  <option value="">-- เลือกเครื่องคอมพิวเตอร์ --</option>
                  {computers.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.assetCode}] {c.computerName} - {c.brand} ({c.assignedUser} / {c.departmentName})
                    </option>
                  ))}
                </select>
                {errors.computer && <p className="text-[11px] text-rose-500 mt-0.5">{errors.computer}</p>}
              </div>
            </div>

            {/* 2. Requester Info */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span>2. ข้อมูลผู้ส่งซ่อมและสถานที่</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้แจ้งซ่อม <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="เช่น คุณสมชาย มุ่งมั่น"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  {errors.requester && <p className="text-[11px] text-rose-500 mt-0.5">{errors.requester}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แผนก / ฝ่าย <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="text-[11px] text-rose-500 mt-0.5">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ / เบอร์ภายใน</label>
                  <input
                    type="text"
                    value={requesterPhone}
                    onChange={(e) => setRequesterPhone(e.target.value)}
                    placeholder="เช่น 1102, 081-xxx-xxxx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่ตั้งเครื่อง / โต๊ะทำงาน</label>
                  <input
                    type="text"
                    value={requesterLocation}
                    onChange={(e) => setRequesterLocation(e.target.value)}
                    placeholder="เช่น ชั้น 4 ฝ่ายการตลาด โต๊ะ 12"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Problem Details */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>3. รายละเอียดปัญหาและอาการเสีย</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ประเภทปัญหา (Problem Type)
                  </label>
                  <select
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value as ProblemType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                  >
                    <option value="Hardware">ฮาร์ดแวร์ (Hardware - จอ, พัดลม, PSU, SSD)</option>
                    <option value="Software">ซอฟต์แวร์ (Software - โปรแกรมค้าง, Error)</option>
                    <option value="Network">เครือข่าย (Network - ต่อเน็ตไม่ได้, LAN หลุด)</option>
                    <option value="Windows">ระบบปฏิบัติการ (Windows - บูตไม่ติด, จอฟ้า)</option>
                    <option value="Printer">เครื่องพิมพ์ (Printer - ปริ้นไม่ออก, ไม่เจอไดรเวอร์)</option>
                    <option value="Virus / Malware">ไวรัส/มัลแวร์ (Virus / Security Threat)</option>
                    <option value="Other">อื่นๆ (Other Problems)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ระดับความเร่งด่วน (Priority)
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="LOW">ต่ำ (Low - ใช้งานได้บางส่วน)</option>
                    <option value="MEDIUM">ปานกลาง (Medium - ปกติ)</option>
                    <option value="HIGH">สูง (High - งานสำคัญต้องรีบใช้)</option>
                    <option value="CRITICAL">วิกฤต (Critical - ระบบหยุดชะงัก)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รายละเอียดอาการเสียอย่างละเอียด <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="เช่น เปิดเครื่องแล้วมีเสียงดังปี๊บ 3 ครั้ง หน้าจอดำมืด พัดลมหมุนเร็วผิดปกติ..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                />
                {errors.problem && <p className="text-[11px] text-rose-500 mt-0.5">{errors.problem}</p>}
              </div>
            </div>

            {/* 4. Assign Technician (Optional) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>4. มอบหมายช่างผู้รับผิดชอบ (Optional)</span>
              </h4>

              <div>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                >
                  <option value="">-- ยังไม่มอบหมาย (สถานะจะเป็น WAITING) --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.role === 'ADMIN' ? 'Admin IT' : 'ช่างเทคนิค'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>สร้างใบแจ้งซ่อม</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
