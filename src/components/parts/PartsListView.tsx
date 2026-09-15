import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Download,
  Edit2,
  Trash2,
  Boxes,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Part, User } from '../../types';

interface PartsListViewProps {
  parts: Part[];
  currentUser: User | null;
  onAddNewPart: () => void;
  onEditPart: (part: Part) => void;
  onDeletePart: (part: Part) => void;
  onAdjustStock: (part: Part) => void;
  initialFilterLowStock?: boolean;
}

export const PartsListView: React.FC<PartsListViewProps> = ({
  parts,
  currentUser,
  onAddNewPart,
  onEditPart,
  onDeletePart,
  onAdjustStock,
  initialFilterLowStock = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(initialFilterLowStock);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setOnlyLowStock(initialFilterLowStock);
    setCurrentPage(1);
  }, [initialFilterLowStock]);

  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category));
    return Array.from(set);
  }, [parts]);

  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        p.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchLowStock = !onlyLowStock || p.stock <= p.minimumStock;

      return matchSearch && matchCategory && matchLowStock;
    });
  }, [parts, searchTerm, selectedCategory, onlyLowStock]);

  const totalPages = Math.ceil(filteredParts.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedParts = filteredParts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const lowStockCount = parts.filter((p) => p.stock <= p.minimumStock).length;
  const totalStockValue = parts.reduce((acc, p) => acc + p.stock * p.price, 0);

  const exportToCSV = () => {
    const headers = ['Part Code', 'Part Name', 'Category', 'Stock', 'Min Stock', 'Unit', 'Price (THB)', 'Total Value'];
    const rows = filteredParts.map((p) => [
      p.partCode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.stock,
      p.minimumStock,
      p.unit,
      p.price,
      p.stock * p.price
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spare_Parts_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span>จัดการคลังอะไหล่และอุปกรณ์ (Spare Parts Inventory)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกรายการอะไหล่ ตรวจสอบยอดคงเหลือ และแจ้งเตือนเมื่อสต็อกต่ำกว่าเกณฑ์
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV</span>
          </button>
          <button
            onClick={onAddNewPart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มอะไหล่ใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">รายการอะไหล่ทั้งหมด</div>
            <div className="text-xl font-bold font-heading text-slate-900">{parts.length} รายการ</div>
          </div>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-4 rounded-2xl border shadow-xs flex items-center gap-3 cursor-pointer transition-all ${
            onlyLowStock
              ? 'bg-amber-100/60 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">อะไหล่ใกล้หมดสต็อก (ต่ำกว่าเกณฑ์)</div>
            <div className="text-xl font-bold font-heading text-amber-700">{lowStockCount} รายการ</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">มูลค่าอะไหล่ในคลังรวม</div>
            <div className="text-xl font-bold font-heading text-emerald-700">
              {totalStockValue.toLocaleString()} บาท
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหารหัสอะไหล่, ชื่อสินค้า, หมวด..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกหมวดหมู่ (All Categories)</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Low Stock */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => {
                  setOnlyLowStock(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>แสดงเฉพาะอะไหล่ที่ต้องสั่งซื้อเพิ่ม (สต็อกต่ำ)</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            พบข้อมูลทั้งหมด <span className="font-semibold text-slate-900">{filteredParts.length}</span> รายการ
            {(searchTerm || selectedCategory !== 'ALL' || onlyLowStock) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setOnlyLowStock(false);
                  setCurrentPage(1);
                }}
                className="ml-3 text-blue-600 hover:underline"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
          <div>หน้า {currentPage} จาก {totalPages}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Part Code</th>
                <th className="px-4 py-3.5">ชื่อรายการอะไหล่</th>
                <th className="px-4 py-3.5">หมวดหมู่</th>
                <th className="px-4 py-3.5 text-center">คงเหลือ (Stock)</th>
                <th className="px-4 py-3.5 text-center">เกณฑ์ต่ำสุด</th>
                <th className="px-4 py-3.5 text-right">ราคาต่อหน่วย</th>
                <th className="px-4 py-3.5 text-center">สถานะสต็อก</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    ไม่พบข้อมูลอะไหล่ตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                paginatedParts.map((p) => {
                  const isLow = p.stock <= p.minimumStock;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {p.partCode}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {p.description && <div className="text-[11px] text-slate-400">{p.description}</div>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className={`font-mono text-sm font-bold ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                          {p.stock}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400">{p.unit}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap text-slate-500">
                        {p.minimumStock} {p.unit}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap font-medium text-slate-800">
                        {p.price.toLocaleString()} บ.
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                            <span>ใกล้หมดสต็อก</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>สต็อกเพียงพอ</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onAdjustStock(p)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors"
                            title="ปรับสต็อก เติม/ตัดของ"
                          >
                            ปรับสต็อก
                          </button>
                          <button
                            onClick={() => onEditPart(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลอะไหล่"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => onDeletePart(p)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบรายการอะไหล่"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            แสดง {filteredParts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredParts.length)} จาก {filteredParts.length} รายการ
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
