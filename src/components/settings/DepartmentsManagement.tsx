import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Department } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface DepartmentsManagementProps {
  departments: Department[];
  onSaveDepartment: (deptData: Partial<Department>) => void;
  onDeleteDepartment: (deptId: string) => void;
}

export const DepartmentsManagement: React.FC<DepartmentsManagementProps> = ({
  departments,
  onSaveDepartment,
  onDeleteDepartment
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setCode('');
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setName(d.name);
    setCode(d.code);
    setDescription(d.description || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('กรุณากรอกรหัสและชื่อแผนกให้ครบถ้วน');
      return;
    }

    const dup = departments.find(
      (d) => d.code.toUpperCase() === code.trim().toUpperCase() && d.id !== editingDept?.id
    );
    if (dup) {
      setErrorMsg(`รหัสแผนก "${code.trim().toUpperCase()}" ถูกใช้งานแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    onSaveDepartment({
      ...(editingDept ? { id: editingDept.id } : {}),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim()
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>จัดการโครงสร้างแผนก / ฝ่าย (Department Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดรายชื่อแผนกและรหัสฝ่ายสำหรับจัดหมวดหมู่คอมพิวเตอร์และงานซ่อม
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มแผนกใหม่ (Add Department)</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">รหัสแผนก (Code)</th>
              <th className="px-4 py-3.5">ชื่อแผนก / ฝ่าย</th>
              <th className="px-4 py-3.5">คำอธิบาย</th>
              <th className="px-4 py-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{d.code}</td>
                <td className="px-4 py-3.5 font-semibold text-slate-900">{d.name}</td>
                <td className="px-4 py-3.5 text-slate-500">{d.description || '-'}</td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(d)}
                      className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="แก้ไขแผนก"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteDepartment(d.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบแผนก"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-bold font-heading text-slate-900">
                  {editingDept ? 'แก้ไขข้อมูลแผนก' : 'เพิ่มแผนกใหม่'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs text-slate-800">
                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <span>{errorMsg}</span>
                  </div>
                )}
                <div>
                  <label className="block font-semibold mb-1">รหัสแผนก (Department Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น IT, HR, ACC"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">ชื่อแผนก / ฝ่าย (Department Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ฝ่ายการเงินและบัญชี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">คำอธิบาย</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-md"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
