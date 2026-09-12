import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Wrench,
  Clock,
  Printer,
  Calendar,
  CheckCircle2,
  UserCheck,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { Repair, Department, User, RepairStatus, ProblemType, Priority } from '../../types';
import { RepairStatusBadge, PriorityBadge } from '../ui/Badge';

interface RepairListViewProps {
  repairs: Repair[];
  departments: Department[];
  technicians: User[];
  currentUser: User | null;
  onSelectRepair: (repair: Repair) => void;
  onAddNewRepair?: () => void;
  onDeleteRepair: (repair: Repair) => void;
  onPrintRepair: (repair: Repair) => void;
  initialTab?: string;
}

export const RepairListView: React.FC<RepairListViewProps> = ({
  repairs,
  departments,
  technicians,
  currentUser,
  onSelectRepair,
  onAddNewRepair,
  onDeleteRepair,
  onPrintRepair,
  initialTab = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedTech, setSelectedTech] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter logic
  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      // Tab filter
      if (activeTab === 'active') {
        if (r.status === 'COMPLETED' || r.status === 'RETURNED' || r.status === 'CANCELLED') return false;
      } else if (activeTab === 'waiting') {
        if (r.status !== 'WAITING') return false;
      } else if (activeTab === 'history') {
        if (r.status !== 'RETURNED' && r.status !== 'COMPLETED' && r.status !== 'CANCELLED') return false;
      }

      // Search
      const matchSearch =
        searchTerm.trim() === '' ||
        r.repairNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.computerAssetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.computerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.problemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.technicianName && r.technicianName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
      const matchType = selectedType === 'ALL' || r.problemType === selectedType;
      const matchPriority = selectedPriority === 'ALL' || r.priority === selectedPriority;
      const matchTech = selectedTech === 'ALL' || r.technicianId === selectedTech;
      const matchDept = selectedDept === 'ALL' || r.departmentId === selectedDept;

      return matchSearch && matchStatus && matchType && matchPriority && matchTech && matchDept;
    });
  }, [repairs, activeTab, searchTerm, selectedStatus, selectedType, selectedPriority, selectedTech, selectedDept]);

  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage) || 1;
  const paginatedRepairs = filteredRepairs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = [
      'Repair No',
      'Date',
      'Asset Code',
      'Computer Name',
      'Requester',
      'Department',
      'Problem Type',
      'Description',
      'Priority',
      'Technician',
      'Status',
      'Cost',
      'Completed Date'
    ];

    const rows = filteredRepairs.map((r) => [
      r.repairNo,
      new Date(r.createdAt).toISOString().split('T')[0],
      r.computerAssetCode,
      r.computerName,
      r.requesterName,
      r.departmentName,
      r.problemType,
      `"${r.problemDescription.replace(/"/g, '""')}"`,
      r.priority,
      r.technicianName || '',
      r.status,
      r.cost,
      r.completedAt ? new Date(r.completedAt).toISOString().split('T')[0] : ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Repair_Jobs_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Wrench className="w-6 h-6 text-blue-600" />
            <span>ระบบติดตามและบันทึกงานซ่อม (Repair Job Tracking)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการคำขอแจ้งซ่อม ติดตามขั้นตอนการทำงาน และบันทึกประวัติการแก้ไข
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
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('all');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>งานซ่อมทั้งหมด (All)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
            {repairs.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('active');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>กำลังดำเนินการ (Active)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}>
            {repairs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'RETURNED' && r.status !== 'CANCELLED').length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('waiting');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'waiting'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>รอดำเนินการ (Waiting)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'waiting' ? 'bg-white/20' : 'bg-rose-100 text-rose-800'}`}>
            {repairs.filter((r) => r.status === 'WAITING').length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setCurrentPage(1);
          }}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>ประวัติที่ปิดงานแล้ว (History)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'history' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>
            {repairs.filter((r) => r.status === 'RETURNED' || r.status === 'COMPLETED' || r.status === 'CANCELLED').length}
          </span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
              placeholder="ค้นหา Repair ID, เครื่อง, อาการ, ช่าง..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl outline-none"
            />
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
              <option value="WAITING">WAITING (รอดำเนินการ)</option>
              <option value="ASSIGNED">ASSIGNED (มอบหมายงาน)</option>
              <option value="DIAGNOSING">DIAGNOSING (ตรวจเช็ค)</option>
              <option value="REPAIRING">REPAIRING (กำลังซ่อม)</option>
              <option value="WAITING_PART">WAITING_PART (รออะไหล่)</option>
              <option value="COMPLETED">COMPLETED (ซ่อมเสร็จ)</option>
              <option value="RETURNED">RETURNED (ส่งคืนแล้ว)</option>
              <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
            </select>
          </div>

          {/* Problem Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกประเภทปัญหา (All Types)</option>
              <option value="HARDWARE">Hardware (ฮาร์ดแวร์)</option>
              <option value="SOFTWARE">Software (ซอฟต์แวร์)</option>
              <option value="NETWORK">Network (เครือข่าย)</option>
              <option value="WINDOWS">Windows (ระบบปฏิบัติการ)</option>
              <option value="PRINTER">Printer (เครื่องพิมพ์)</option>
              <option value="VIRUS">Virus (ไวรัส)</option>
              <option value="OTHER">Other (อื่นๆ)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ทุกระดับความเร่งด่วน</option>
              <option value="LOW">LOW (ต่ำ)</option>
              <option value="MEDIUM">MEDIUM (ปานกลาง)</option>
              <option value="HIGH">HIGH (สูง)</option>
              <option value="CRITICAL">CRITICAL (วิกฤต)</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div>
            <select
              value={selectedTech}
              onChange={(e) => {
                setSelectedTech(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none"
            >
              <option value="ALL">ช่างทั้งหมด (All Techs)</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div>
            พบรายการงานซ่อมทั้งหมด <span className="font-semibold text-slate-900">{filteredRepairs.length}</span> รายการ
          </div>
          <div>หน้า {currentPage} จาก {totalPages}</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Repair ID / วันที่</th>
                <th className="px-4 py-3.5">เครื่อง / Asset Code</th>
                <th className="px-4 py-3.5">ผู้แจ้ง / แผนก</th>
                <th className="px-4 py-3.5">อาการเสีย (Problem)</th>
                <th className="px-4 py-3.5">ประเภท / ความเร่งด่วน</th>
                <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-4 py-3.5 text-right">ค่าซ่อม</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRepairs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    ไม่พบรายการงานซ่อมตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                paginatedRepairs.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-600">{r.repairNo}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Computer */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{r.computerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{r.computerAssetCode}</div>
                    </td>

                    {/* Requester */}
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{r.requesterName}</div>
                      <div className="text-[11px] text-slate-500">{r.departmentName}</div>
                    </td>

                    {/* Problem */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="inline-block font-medium text-slate-700 truncate max-w-[200px]" title={r.problemDescription}>
                        {r.problemDescription}
                      </span>
                    </td>

                    {/* Type & Priority */}
                    <td className="px-4 py-3.5 whitespace-nowrap space-y-1">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {r.problemType}
                        </span>
                      </div>
                      <PriorityBadge priority={r.priority} />
                    </td>

                    {/* Tech */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {r.technicianName ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>{r.technicianName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ยังไม่มอบหมาย</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <RepairStatusBadge status={r.status} size="sm" />
                    </td>

                    {/* Cost */}
                    <td className="px-4 py-3.5 text-right font-medium whitespace-nowrap">
                      {r.cost > 0 ? (
                        <span className="text-slate-900 font-bold">{r.cost.toLocaleString()} บ.</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectRepair(r)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ดูรายละเอียดและอัปเดตสถานะ"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintRepair(r)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="พิมพ์ใบแจ้งซ่อม"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onDeleteRepair(r)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบงานซ่อมนี้"
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

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            แสดง {filteredRepairs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredRepairs.length)} จาก {filteredRepairs.length} รายการ
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
