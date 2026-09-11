import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  HardDrive,
  Wrench,
  Building2,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Repair, Computer, Department, User, Part } from '../../types';

interface ReportsViewProps {
  repairs: Repair[];
  computers: Computer[];
  departments: Department[];
  technicians: User[];
  parts: Part[];
  initialSubTab?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  repairs,
  computers,
  departments,
  technicians,
  parts,
  initialSubTab = 'repairs'
}) => {
  const [activeTab, setActiveTab] = useState<'repairs' | 'computers' | 'cost'>(
    initialSubTab === 'computers' ? 'computers' : initialSubTab === 'cost' ? 'cost' : 'repairs'
  );
  const [dateRange, setDateRange] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Repair Statistics Breakdown
  const departmentStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; cost: number; completed: number }> = {};
    departments.forEach((d) => {
      map[d.id] = { name: d.name, count: 0, cost: 0, completed: 0 };
    });

    repairs.forEach((r) => {
      if (r.departmentId && map[r.departmentId]) {
        map[r.departmentId].count += 1;
        map[r.departmentId].cost += r.cost;
        if (r.status === 'COMPLETED' || r.status === 'RETURNED') {
          map[r.departmentId].completed += 1;
        }
      }
    });

    return Object.values(map).filter((item) => item.count > 0);
  }, [repairs, departments]);

  // Tech Performance
  const techStats = useMemo(() => {
    const map: Record<string, { name: string; totalJobs: number; completedJobs: number; avgCost: number }> = {};
    technicians.forEach((t) => {
      map[t.id] = { name: t.name, totalJobs: 0, completedJobs: 0, avgCost: 0 };
    });

    repairs.forEach((r) => {
      if (r.technicianId && map[r.technicianId]) {
        map[r.technicianId].totalJobs += 1;
        if (r.status === 'COMPLETED' || r.status === 'RETURNED') {
          map[r.technicianId].completedJobs += 1;
        }
      }
    });

    return Object.values(map);
  }, [repairs, technicians]);

  // Computer status and warranty breakdown
  const computerWarrantyStats = useMemo(() => {
    let inWarranty = 0;
    let outOfWarranty = 0;
    const now = new Date();

    computers.forEach((c) => {
      if (c.warrantyExpiry && new Date(c.warrantyExpiry) > now) {
        inWarranty += 1;
      } else {
        outOfWarranty += 1;
      }
    });

    return [
      { name: 'อยู่ในระยะประกัน (In Warranty)', value: inWarranty, color: '#10B981' },
      { name: 'หมดระยะประกันแล้ว (Expired)', value: outOfWarranty, color: '#F59E0B' }
    ];
  }, [computers]);

  // Brand Distribution
  const brandStats = useMemo(() => {
    const map: Record<string, number> = {};
    computers.forEach((c) => {
      map[c.brand] = (map[c.brand] || 0) + 1;
    });

    const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#64748B'];
    return Object.entries(map).map(([brand, count], i) => ({
      name: brand,
      value: count,
      color: colors[i % colors.length]
    }));
  }, [computers]);

  // Top Costly Computers
  const topCostlyComputers = useMemo(() => {
    const map: Record<string, { assetCode: string; name: string; dept: string; count: number; totalCost: number }> = {};

    computers.forEach((c) => {
      map[c.id] = { assetCode: c.assetCode, name: c.computerName, dept: c.departmentName || '', count: 0, totalCost: 0 };
    });

    repairs.forEach((r) => {
      if (map[r.computerId]) {
        map[r.computerId].count += 1;
        map[r.computerId].totalCost += r.cost;
      }
    });

    return Object.values(map)
      .filter((c) => c.totalCost > 0 || c.count > 0)
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
  }, [computers, repairs]);

  const totalSystemCost = repairs.reduce((acc, r) => acc + r.cost, 0);

  const exportCurrentReport = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `Report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'repairs') {
      headers = ['Department', 'Total Repairs', 'Completed', 'Total Cost (THB)'];
      rows = departmentStats.map((d) => [d.name, d.count, d.completed, d.cost]);
    } else if (activeTab === 'computers') {
      headers = ['Asset Code', 'Computer Name', 'Brand', 'Department', 'Repair Count', 'Total Cost (THB)'];
      rows = topCostlyComputers.map((c) => [c.assetCode, c.name, c.dept, c.count, c.totalCost]);
    } else {
      headers = ['Technician', 'Assigned Jobs', 'Completed Jobs'];
      rows = techStats.map((t) => [t.name, t.totalJobs, t.completedJobs]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>รายงานและสถิติเชิงลึก (System Reports & Analytics)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลสถิติงานซ่อม ค่าใช้จ่าย และสภาพครุภัณฑ์คอมพิวเตอร์ในองค์กร
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน</span>
          </button>
          <button
            onClick={exportCurrentReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ส่งออกรายงาน (CSV)</span>
          </button>
        </div>
      </div>

      {/* Report Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'repairs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>รายงานงานซ่อมบำรุง (Repair Report)</span>
        </button>

        <button
          onClick={() => setActiveTab('computers')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'computers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>รายงานครุภัณฑ์คอมพิวเตอร์ (Computer Asset Report)</span>
        </button>

        <button
          onClick={() => setActiveTab('cost')}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'cost'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>รายงานสรุปค่าใช้จ่าย (Cost Report)</span>
        </button>
      </div>

      {/* Tab 1: Repair Report */}
      {activeTab === 'repairs' && (
        <div className="space-y-6">
          {/* Department Breakdown Bar Chart */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  จำนวนงานซ่อมจำแนกตามแผนก (Repairs by Department)
                </h3>
                <p className="text-xs text-slate-400">เปรียบเทียบยอดแจ้งซ่อมกับงานที่เสร็จสิ้นของแต่ละแผนก</p>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    formatter={(val: number) => [`${val} รายการ`, 'จำนวน']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="count" name="งานแจ้งซ่อมทั้งหมด" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="completed" name="งานที่สำเร็จแล้ว" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Details Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              ตารางสรุปงานซ่อมและงบประมาณรายแผนก
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">แผนก / ฝ่าย</th>
                  <th className="px-4 py-3 text-center">งานซ่อมทั้งหมด</th>
                  <th className="px-4 py-3 text-center">ซ่อมเสร็จแล้ว</th>
                  <th className="px-4 py-3 text-right">ค่าใช้จ่ายรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentStats.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-800">{d.name}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-600">{d.count}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">{d.completed}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {d.cost.toLocaleString()} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Computer Report */}
      {activeTab === 'computers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Warranty Status Chart */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  สัดส่วนสถานะการรับประกัน (Warranty Status)
                </h3>
                <p className="text-xs text-slate-400">ภาพรวมเครื่องในประกันและหมดประกัน</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={computerWarrantyStats} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {computerWarrantyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} เครื่อง`, 'จำนวน']}
                      contentStyle={{ borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Brand Distribution */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  สัดส่วนยี่ห้อคอมพิวเตอร์ในระบบ (Brand Distribution)
                </h3>
                <p className="text-xs text-slate-400">จำแนกตาม Brand ครุภัณฑ์</p>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={brandStats} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value">
                      {brandStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [`${val} เครื่อง`, 'จำนวน']}
                      contentStyle={{ borderRadius: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Most Repaired Computers */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              5 อันดับเครื่องที่มีการส่งซ่อมบ่อยและค่าใช้จ่ายสูงสุด (Top Repaired Assets)
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Asset Code</th>
                  <th className="px-4 py-3">ชื่อเครื่อง</th>
                  <th className="px-4 py-3">แผนก</th>
                  <th className="px-4 py-3 text-center">จำนวนครั้งที่ซ่อม</th>
                  <th className="px-4 py-3 text-right">ยอดค่าซ่อมสะสม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topCostlyComputers.map((c) => (
                  <tr key={c.assetCode} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600">{c.assetCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.dept}</td>
                    <td className="px-4 py-3 text-center font-bold text-amber-600">{c.count} ครั้ง</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">
                      {c.totalCost.toLocaleString()} บาท
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Cost Report */}
      {activeTab === 'cost' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-300 font-medium">ยอดงบประมาณค่าซ่อมบำรุงสะสมในระบบ</span>
              <h2 className="text-3xl font-bold font-heading mt-1">{totalSystemCost.toLocaleString()} บาท</h2>
              <p className="text-xs text-emerald-200/80 mt-1">
                รวมค่าอะไหล่ ค่าแรง และค่าบริการทางเทคนิคทั้งหมด {repairs.length} งาน
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 backdrop-blur-md">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>

          {/* Performance of Techs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
              ประสิทธิภาพการทำงานของช่างเทคนิค (Technician Workload & Completion)
            </div>
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ชื่อช่างเทคนิค</th>
                  <th className="px-4 py-3 text-center">งานที่ได้รับมอบหมาย</th>
                  <th className="px-4 py-3 text-center">งานที่ปิดสำเร็จ</th>
                  <th className="px-4 py-3 text-center">อัตราสำเร็จ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {techStats.map((t) => {
                  const rate = t.totalJobs > 0 ? Math.round((t.completedJobs / t.totalJobs) * 100) : 100;
                  return (
                    <tr key={t.name} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{t.totalJobs}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{t.completedJobs}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
