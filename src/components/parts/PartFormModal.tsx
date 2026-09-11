import React, { useState, useEffect } from 'react';
import { X, Package, Check } from 'lucide-react';
import { Part } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface PartFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Part>) => void;
  initialData?: Part | null;
}

export const PartFormModal: React.FC<PartFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Part>>({
    partCode: '',
    name: '',
    category: 'STORAGE',
    stock: 10,
    minimumStock: 3,
    unit: 'ชิ้น',
    price: 1500,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        partCode: `PRT-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'STORAGE',
        stock: 5,
        minimumStock: 2,
        unit: 'ชิ้น',
        price: 900,
        description: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.partCode?.trim()) errs.partCode = 'กรุณาระบุรหัสอะไหล่';
    if (!formData.name?.trim()) errs.name = 'กรุณาระบุชื่อรายการอะไหล่';
    if ((formData.price || 0) < 0) errs.price = 'ราคาต้องไม่ต่ำกว่า 0';
    if ((formData.stock || 0) < 0) errs.stock = 'จำนวนสต็อกต้องไม่ติดลบ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
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
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading">
                  {initialData ? 'แก้ไขข้อมูลอะไหล่' : 'เพิ่มรายการอะไหล่ใหม่'}
                </h3>
                <p className="text-xs text-slate-400">ข้อมูลคลังอะไหล่และอุปกรณ์สิ้นเปลือง</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสอะไหล่ (Part Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partCode}
                  onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none"
                />
                {errors.partCode && <p className="text-[11px] text-rose-500 mt-0.5">{errors.partCode}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่อะไหล่</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="RAM">RAM (หน่วยความจำ)</option>
                  <option value="STORAGE">Storage (SSD / HDD)</option>
                  <option value="PSU">Power Supply Unit</option>
                  <option value="DISPLAY">Display / Screen</option>
                  <option value="KEYBOARD">Keyboard / Mouse</option>
                  <option value="NETWORK">Network Card / Dongle</option>
                  <option value="CONSUMABLE">Consumable (ซิลิโคน/ถ่าน/สาย)</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่ออะไหล่ / อุปกรณ์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น Kingston FURY Beast 16GB DDR4 3200MHz"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">สต็อกปัจจุบัน</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เกณฑ์เตือนสต็อกต่ำ</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">หน่วยนับ</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="ชิ้น, อัน, หลอด"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ราคาต่อหน่วย (บาท)</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายเพิ่มเติม</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดรุ่น ความเข้ากันได้ หรือตำแหน่งชั้นวาง..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกอะไหล่</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const StockAdjustModal: React.FC<{
  isOpen: boolean;
  part: Part | null;
  onClose: () => void;
  onConfirm: (partId: string, delta: number, note: string) => void;
}> = ({ isOpen, part, onClose, onConfirm }) => {
  const [delta, setDelta] = useState<number>(5);
  const [type, setType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [note, setNote] = useState('');

  if (!isOpen || !part) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDelta = type === 'ADD' ? Math.abs(delta) : -Math.abs(delta);
    onConfirm(part.id, finalDelta, note || (type === 'ADD' ? 'รับเข้าสต็อก' : 'ปรับลดยอดสต็อก'));
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
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
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold font-heading text-slate-900">ปรับยอดสต็อกอะไหล่</h3>
              <p className="text-xs text-slate-400 mt-0.5">{part.name} ({part.partCode})</p>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs text-slate-800">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">จำนวนคงเหลือปัจจุบัน:</span>
              <span className="text-base font-bold text-slate-900">{part.stock} {part.unit}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('ADD')}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  type === 'ADD'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                + เติมสต็อก (รับเข้า)
              </button>
              <button
                type="button"
                onClick={() => setType('DEDUCT')}
                className={`py-2 rounded-xl font-bold border transition-colors ${
                  type === 'DEDUCT'
                    ? 'bg-rose-50 border-rose-300 text-rose-700'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                - ปรับลดยอด (ตัดออก)
              </button>
            </div>

            <div>
              <label className="block font-semibold mb-1">จำนวนที่ต้องการปรับ ({part.unit})</label>
              <input
                type="number"
                min="1"
                required
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">บันทึกเหตุผล / เลขที่ใบสั่งซื้อ</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เช่น รับของตาม PO-2025-081, ปรับสต็อกประจำเดือน..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-xl font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-md"
              >
                ยืนยันการปรับสต็อก
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
