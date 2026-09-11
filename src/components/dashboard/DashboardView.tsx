import React from 'react';
import {
  Monitor,
  Wrench,
  Clock,
  CheckCircle2,
  CornerUpLeft,
  AlertTriangle,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Boxes,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DashboardStats, Repair, User } from '../../types';
import { RepairStatusBadge, PriorityBadge } from '../ui/Badge';

interface DashboardViewProps {
  stats: DashboardStats;
  currentUser: User | null;
  onNavigate: (view: string, sub?: string, params?: Record<string, unknown>) => void;
  onSelectRepair: (repair: Repair) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  currentUser,
  onNavigate,
  onSelectRepair
}) => {
  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 mb-3 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>IT Operations & Service Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading">
            สวัสดี, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            ยินดีต้อนรับสู่ระบบบริหารจัดการเครื่องคอมพิวเตอร์และงานซ่อมบำรุง ตรวจสอบสถานะงานและสรุปผลประจำวัน
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => onNavigate('repairs', 'new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>แจ้งซ่อมใหม่</span>
          </button>
          <button
            onClick={() => onNavigate('reports', 'repairs')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md border border-white/10 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>รายงานสรุป</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {stats.lowStockParts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                แจ้งเตือนอะไหล่ใกล้หมดสต็อก ({stats.lowStockParts.length} รายการ)
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                รายการ: {stats.lowStockParts.slice(0, 3).map((p) => `${p.name} (เหลือ ${p.stock})`).join(', ')}
                {stats.lowStockParts.length > 3 && ` และอีก ${stats.lowStockParts.length - 3} รายการ`}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('parts', 'stock')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
          >
            จัดการสต็อกอะไหล่
          </button>
        </div>
      )}

      {/* 8 Metric Summary Cards (Section 3 of Prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Computers */}
        <div
          onClick={() => onNavigate('computers', 'list')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">คอมพิวเตอร์ทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 mt-2">
            {stats.totalComputers}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>เครื่องในระบบ</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
          </div>
        </div>

        {/* Total Repairs */}
        <div
          onClick={() => onNavigate('repairs', 'jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">งานซ่อมทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900 mt-2">
            {stats.totalRepairs}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>สะสมทั้งหมด</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
          </div>
        </div>

        {/* Waiting Repairs */}
        <div
          onClick={() => onNavigate('repairs', 'jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รอดำเนินการ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600 mt-2">
            {stats.waitingRepairs}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1 flex items-center gap-1 font-medium">
            <span>รอช่างรับงาน</span>
          </div>
        </div>

        {/* Repairing */}
        <div
          onClick={() => onNavigate('repairs', 'jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">กำลังซ่อม/รออะไหล่</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-sky-600 mt-2">
            {stats.repairingRepairs}
          </div>
          <div className="text-[11px] text-sky-600/80 mt-1 flex items-center gap-1 font-medium">
            <span>อยู่ระหว่างดำเนินการ</span>
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigate('repairs', 'jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ซ่อมเสร็จแล้ว</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-600 mt-2">
            {stats.completedRepairs}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1 flex items-center gap-1 font-medium">
            <span>พร้อมส่งคืน</span>
          </div>
        </div>

        {/* Returned */}
        <div
          onClick={() => onNavigate('repairs', 'jobs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ส่งคืนผู้ใช้แล้ว</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CornerUpLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-teal-700 mt-2">
            {stats.returnedRepairs}
          </div>
          <div className="text-[11px] text-teal-600/80 mt-1 flex items-center gap-1 font-medium">
            <span>ปิดงานสมบูรณ์</span>
          </div>
        </div>

        {/* Current Month Repairs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">งานซ่อมเดือนนี้</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-purple-700 mt-2">
            {stats.currentMonthRepairs}
          </div>
          <div className="text-[11px] text-purple-600/80 mt-1 flex items-center gap-1">
            <span>รายการในเดือนปัจจุบัน</span>
          </div>
        </div>

        {/* Damaged Computers */}
        <div
          onClick={() => onNavigate('computers', 'list')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">เครื่องมีปัญหา/ชำรุด</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-rose-600 mt-2">
            {stats.damagedComputers}
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1 flex items-center gap-1 font-medium">
            <span>ต้องการการดูแล</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Repair Volume Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>สถิติจำนวนงานซ่อมรายเดือน (Monthly Repair Trends)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">เปรียบเทียบยอดแจ้งซ่อมกับงานที่ซ่อมสำเร็จย้อนหลัง 6 เดือน</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              สถิติภาพรวม
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#CBD5E1' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} รายการ`,
                    name === 'count' ? 'งานซ่อมทั้งหมด' : 'ซ่อมเสร็จ/ส่งคืน'
                  ]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend
                  formatter={(value) => (value === 'count' ? 'งานแจ้งซ่อมทั้งหมด' : 'ซ่อมเสร็จแล้ว')}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar dataKey="count" name="count" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="completed" name="completed" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problem Types Chart (1 column on lg) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>สัดส่วนประเภทปัญหา (Problem Types)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">จำแนกตามหมวดหมู่อาการเสีย</p>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.problemTypeDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.problemTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} รายการ`, 'จำนวน']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', lineHeight: '18px' }}
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Repair Status Distribution Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900">
              สถานะงานซ่อมปัจจุบัน (Repair Job Status Breakdown)
            </h3>
            <p className="text-xs text-slate-400">ภาพรวมสถานะงานในระบบขณะนี้</p>
          </div>
          <button
            onClick={() => onNavigate('repairs', 'jobs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {stats.statusDistribution.map((st) => (
            <div
              key={st.name}
              onClick={() => onNavigate('repairs', 'jobs')}
              className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 cursor-pointer transition-all text-center"
            >
              <div className="text-lg font-bold" style={{ color: st.color }}>
                {st.value}
              </div>
              <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                {st.labelTh}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Repair Jobs Table (Matching Section 13 Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>รายการแจ้งซ่อมล่าสุด (Recent Repair Jobs)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">7 รายการล่าสุดที่ส่งเข้าระบบ</p>
          </div>
          <button
            onClick={() => onNavigate('repairs', 'jobs')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>ดูประวัติทั้งหมด ({stats.totalRepairs})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Repair ID</th>
                <th className="px-4 py-3">วันที่แจ้ง</th>
                <th className="px-4 py-3">เครื่อง / Asset Code</th>
                <th className="px-4 py-3">ผู้แจ้ง / แผนก</th>
                <th className="px-4 py-3">อาการเสีย (Problem)</th>
                <th className="px-4 py-3">ความเร่งด่วน</th>
                <th className="px-4 py-3">ช่างผู้รับผิดชอบ</th>
                <th className="px-4 py-3">สถานะ (Status)</th>
                <th className="px-4 py-3 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentRepairs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-blue-600 whitespace-nowrap">
                    {r.repairNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString('th-TH', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{r.computerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{r.computerAssetCode}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 font-medium">{r.requesterName}</div>
                    <div className="text-[10px] text-slate-400">{r.departmentName}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <span className="inline-block font-medium text-slate-700 truncate max-w-[200px]" title={r.problemDescription}>
                      {r.problemDescription}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PriorityBadge priority={r.priority} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                    {r.technicianName || <span className="text-slate-400 italic">ยังไม่มอบหมาย</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RepairStatusBadge status={r.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectRepair(r)}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-semibold rounded-lg transition-colors"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
