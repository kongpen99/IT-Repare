import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  HardDrive,
  Monitor,
  ShieldCheck,
  Building2,
  Cpu,
  Layers,
  CheckCircle2,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { Computer, Department, User } from '../../types';
import { ComputerStatusBadge } from '../ui/Badge';

interface ComputerListViewProps {
  computers: Computer[];
  departments: Department[];
  currentUser: User | null;
  onSelectComputer: (computer: Computer) => void;
  onEditComputer: (computer: Computer) => void;
  onDeleteComputer: (computer: Computer) => void;
  onAddNewComputer: () => void;
  onNewRepairForPc: (computer: Computer) => void;
}

export const ComputerListView: React.FC<ComputerListViewProps> = ({
  computers,
  departments,
  currentUser,
  onSelectComputer,
  onEditComputer,
  onDeleteComputer,
  onAddNewComputer,
  onNewRepairForPc
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const brands = useMemo(() => {
    const set = new Set(computers.map((c) => c.brand).filter(Boolean));
    return Array.from(set);
  }, [computers]);

  // Multi-field search
  const filteredComputers = useMemo(() => {
    return computers.filter((c) => {
      const matchSearch =
        searchTerm.trim() === '' ||
        c.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.assignedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.departmentName && c.departmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDept = selectedDept === 'ALL' || c.departmentId === selectedDept;
      const matchStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchBrand = selectedBrand === 'ALL' || c.brand === selectedBrand;

      return matchSearch && matchDept && matchStatus && matchBrand;
    });
  }, [computers, searchTerm, selectedDept, selectedStatus, selectedBrand]);

  const totalPages = Math.ceil(filteredComputers.length / itemsPerPage) || 1;
  const paginatedComputers = filteredComputers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = [
      'Asset Code',
      'Serial Number',
      'Computer Name',
      'Brand',
      'Model',
      'CPU',
      'RAM',
      'Storage',
      'OS',
      'IP Address',
      'MAC Address',
      'Department',
      'Location',
      'User',
      'Status',
      'Warranty Expiry'
    ];

    const rows = filteredComputers.map((c) => [
      c.assetCode,
      c.serialNumber,
      c.computerName,
      c.brand,
      c.model,
      c.cpu,
      c.ram,
      c.storage,
      c.operatingSystem,
      c.ipAddress,
      c.macAddress,
      c.departmentName || '',
      c.location,
      c.assignedUser,
      c.status,
      c.warrantyExpiry
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Computer_Assets_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Monitor className="w-6 h-6 text-blue-600" />
            <span>จัดการข้อมูลเครื่องคอมพิวเตอร์ (Computer Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ลงทะเบียน ตรวจสอบสถานะครุภัณฑ์คอมพิวเตอร์ และประวัติการซ่อมบำรุง
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออก CSV (Export)</span>
          </button>
          <button
            onClick={onAddNewComputer}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเครื่องใหม่ (Add PC)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              placeholder="ค้นหา Asset Code, SN, ผู้ใช้, IP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกแผนก (All Departments)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกสถานะ (All Status)</option>
              <option value="NORMAL">พร้อมใช้งาน (Normal)</option>
              <option value="REPAIR">อยู่ระหว่างซ่อม (Repair)</option>
              <option value="DAMAGED">ชำรุดเสียหาย (Damaged)</option>
              <option value="RETIRED">ปลดประจำการ (Retired)</option>
              <option value="LOST">สูญหาย (Lost)</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกยี่ห้อ (All Brands)</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary chips */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            พบข้อมูลทั้งหมด <span className="font-semibold text-slate-900">{filteredComputers.length}</span> เครื่อง
            {(searchTerm || selectedDept !== 'ALL' || selectedStatus !== 'ALL' || selectedBrand !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('ALL');
                  setSelectedStatus('ALL');
                  setSelectedBrand('ALL');
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

      {/* Main Computer Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Asset Code / SN</th>
                <th className="px-4 py-3.5">ชื่อเครื่อง / ยี่ห้อรุ่น</th>
                <th className="px-4 py-3.5">สเปก (CPU/RAM/Storage)</th>
                <th className="px-4 py-3.5">แผนก / ผู้ใช้งาน</th>
                <th className="px-4 py-3.5">IP / MAC Address</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-4 py-3.5 text-center">ประวัติซ่อม</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComputers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <HardDrive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    ไม่พบข้อมูลเครื่องคอมพิวเตอร์ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                paginatedComputers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Asset & SN */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600">{c.assetCode}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.serialNumber}</div>
                    </td>

                    {/* Name & Model */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{c.computerName}</div>
                      <div className="text-[11px] text-slate-500">
                        {c.brand} {c.model}
                      </div>
                    </td>

                    {/* Hardware Specs */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 font-medium truncate max-w-[180px]">{c.cpu}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.ram} • {c.storage}
                      </div>
                    </td>

                    {/* Department & User */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{c.assignedUser}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {c.departmentName}
                      </div>
                    </td>

                    {/* Network */}
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      <div className="text-slate-700">{c.ipAddress || '-'}</div>
                      <div className="text-slate-400 text-[10px]">{c.macAddress || '-'}</div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <ComputerStatusBadge status={c.status} />
                    </td>

                    {/* Repair Count */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={() => onSelectComputer(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          (c.repairCount || 0) > 0
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="คลิกเพื่อดูประวัติการซ่อมของเครื่องนี้"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{c.repairCount || 0} ครั้ง</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectComputer(c)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ดูรายละเอียดและประวัติซ่อม"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onNewRepairForPc(c)}
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="แจ้งซ่อมเครื่องนี้"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditComputer(c)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteComputer(c)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบเครื่องนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            แสดง {filteredComputers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredComputers.length)} จาก {filteredComputers.length} รายการ
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
