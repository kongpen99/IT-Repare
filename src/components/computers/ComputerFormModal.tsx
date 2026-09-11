import React, { useState, useEffect } from 'react';
import { X, Monitor, HardDrive, Check, AlertCircle } from 'lucide-react';
import { Computer, Department, ComputerStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface ComputerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Computer>) => void;
  initialData?: Computer | null;
  departments: Department[];
}

export const ComputerFormModal: React.FC<ComputerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  departments
}) => {
  const [formData, setFormData] = useState<Partial<Computer>>({
    assetCode: '',
    serialNumber: '',
    computerName: '',
    brand: 'Dell',
    model: '',
    cpu: 'Intel Core i5',
    ram: '16GB DDR4',
    storage: '512GB NVMe SSD',
    operatingSystem: 'Windows 11 Pro 64-bit',
    ipAddress: '',
    macAddress: '',
    departmentId: '',
    location: '',
    assignedUser: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyExpiry: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'NORMAL',
    remark: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Default new asset code
      setFormData({
        assetCode: `COM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        serialNumber: '',
        computerName: '',
        brand: 'Dell',
        model: '',
        cpu: 'Intel Core i5-13400',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
        operatingSystem: 'Windows 11 Pro 64-bit',
        ipAddress: '192.168.1.100',
        macAddress: '',
        departmentId: departments[0]?.id || '',
        location: 'สำนักงานใหญ่ ชั้น 2',
        assignedUser: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyExpiry: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'NORMAL',
        remark: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen, departments]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.assetCode?.trim()) newErrors.assetCode = 'กรุณาระบุรหัสครุภัณฑ์ (Asset Code)';
    if (!formData.serialNumber?.trim()) newErrors.serialNumber = 'กรุณาระบุหมายเลขซีเรียล (Serial Number)';
    if (!formData.computerName?.trim()) newErrors.computerName = 'กรุณาระบุชื่อเครื่องคอมพิวเตอร์';
    if (!formData.assignedUser?.trim()) newErrors.assignedUser = 'กรุณาระบุชื่อผู้ใช้งานประจำเครื่อง';
    if (!formData.departmentId) newErrors.departmentId = 'กรุณาเลือกแผนก';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
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
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading">
                  {initialData ? 'แก้ไขข้อมูลคอมพิวเตอร์' : 'ลงทะเบียนเครื่องคอมพิวเตอร์ใหม่'}
                </h3>
                <p className="text-xs text-slate-400">กรอกรายละเอียดครุภัณฑ์และสเปกเครื่อง</p>
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
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Asset Identity */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. ข้อมูลพื้นฐานและรหัสครุภัณฑ์
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสครุภัณฑ์ (Asset Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assetCode}
                    onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono font-bold"
                  />
                  {errors.assetCode && <p className="text-[11px] text-rose-500 mt-0.5">{errors.assetCode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Serial Number (S/N) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="เช่น 8X92KM3"
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-mono"
                  />
                  {errors.serialNumber && <p className="text-[11px] text-rose-500 mt-0.5">{errors.serialNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อเครื่อง (Computer Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.computerName}
                    onChange={(e) => setFormData({ ...formData, computerName: e.target.value })}
                    placeholder="เช่น PC-ACC-01"
                    className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {errors.computerName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.computerName}</p>}
                </div>
              </div>
            </div>

            {/* Hardware Specs */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. ข้อมูลฮาร์ดแวร์ & สเปกเครื่อง
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Acer">Acer</option>
                    <option value="Asus">Asus</option>
                    <option value="Apple">Apple</option>
                    <option value="Custom Built">Custom Built (ประกอบ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รุ่น (Model)</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="เช่น OptiPlex 7090"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CPU</label>
                  <input
                    type="text"
                    value={formData.cpu}
                    onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                    placeholder="เช่น Intel Core i5-12400"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RAM</label>
                  <input
                    type="text"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                    placeholder="เช่น 16GB DDR4"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Harddisk / SSD</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    placeholder="เช่น 512GB M.2 NVMe"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">OS (ระบบปฏิบัติการ)</label>
                  <input
                    type="text"
                    value={formData.operatingSystem}
                    onChange={(e) => setFormData({ ...formData, operatingSystem: e.target.value })}
                    placeholder="เช่น Windows 11 Pro 64-bit"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    placeholder="192.168.1.xxx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MAC Address</label>
                  <input
                    type="text"
                    value={formData.macAddress}
                    onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                    placeholder="00:1A:2B:3C:4D:5E"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Department, User & Location */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. แผนก สถานที่ และผู้ใช้งาน
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    แผนก / ฝ่าย <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">-- เลือกแผนก --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-[11px] text-rose-500 mt-0.5">{errors.departmentId}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ผู้ใช้งานประจำเครื่อง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.assignedUser}
                    onChange={(e) => setFormData({ ...formData, assignedUser: e.target.value })}
                    placeholder="เช่น คุณวิภาดา ใจดี"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  {errors.assignedUser && <p className="text-[11px] text-rose-500 mt-0.5">{errors.assignedUser}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานที่ตั้ง / โต๊ะทำงาน</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="เช่น ชั้น 3 ฝ่ายบัญชี โต๊ะ 04"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Purchase, Warranty & Status */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. วันที่จัดซื้อ การรับประกัน และสถานะ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่จัดซื้อ</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">วันหมดประกัน</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะเครื่อง</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ComputerStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="NORMAL">พร้อมใช้งาน (Normal)</option>
                    <option value="REPAIR">อยู่ระหว่างซ่อม (Repair)</option>
                    <option value="DAMAGED">ชำรุดเสียหาย (Damaged)</option>
                    <option value="RETIRED">ปลดประจำการ (Retired)</option>
                    <option value="LOST">สูญหาย (Lost)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมายเหตุเพิ่มเติม (Remark)</label>
                <textarea
                  rows={2}
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="รายละเอียดเพิ่มเติม หรือประวัติเดิม..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Submit buttons */}
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
                <span>บันทึกข้อมูลเครื่อง</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
