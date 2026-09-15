import React from 'react';
import { Repair, Computer, Part } from '../../types';
import { Printer, Monitor, CheckCircle, Wrench, Shield, Calendar, User } from 'lucide-react';

interface RepairJobSheetPrintProps {
  repair: Repair;
  computer?: Computer;
  onClose: () => void;
}

export const RepairJobSheetPrint: React.FC<RepairJobSheetPrintProps> = ({
  repair,
  computer,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Print Action Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Printer className="w-5 h-5 text-blue-400" />
            <span>ใบแจ้งซ่อมและส่งมอบงานคอมพิวเตอร์ (IT Service Job Sheet)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

        {/* Printable Paper Area (A4 layout styling) */}
        <div className="print-area p-8 sm:p-10 overflow-y-auto flex-1 font-serif text-slate-800 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="text-xl font-bold font-heading text-slate-900 uppercase tracking-tight">
                บริษัท องค์กรตัวอย่าง จำกัด (มหาชน)
              </div>
              <div className="text-xs text-slate-600">ฝ่ายเทคโนโลยีสารสนเทศ (IT Department) • แผนกซ่อมบำรุงและบริการ</div>
              <div className="text-xs text-slate-500">โทรศัพท์ภายใน: 1100-1102 | อีเมล: itsupport@company.local</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold font-mono text-blue-900">
                เลขที่ใบแจ้งซ่อม: {repair.repairNo}
              </div>
              <div className="text-xs text-slate-500">
                วันที่: {new Date(repair.createdAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
              </div>
              <div className="mt-1 inline-block px-2.5 py-0.5 rounded border border-slate-300 text-[11px] font-bold text-slate-700">
                สถานะ: {repair.status}
              </div>
            </div>
          </div>

          <h2 className="text-center text-lg font-bold text-slate-900 underline underline-offset-4">
            ใบรายงานการแจ้งซ่อมและส่งมอบเครื่องคอมพิวเตอร์
          </h2>

          {/* Section 1: User & Computer Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                ข้อมูลผู้แจ้งซ่อม (Requester Information)
              </div>
              <div><span className="text-slate-500">ชื่อผู้แจ้ง:</span> <strong className="text-slate-900">{repair.requesterName}</strong></div>
              <div><span className="text-slate-500">แผนก/ฝ่าย:</span> <strong className="text-slate-900">{repair.departmentName}</strong></div>
              <div><span className="text-slate-500">เบอร์ติดต่อ/สถานที่:</span> {repair.requesterPhone || '-'} / {repair.requesterLocation || '-'}</div>
            </div>

            <div className="border border-slate-300 rounded-lg p-3 space-y-1.5 bg-slate-50/50">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
                ข้อมูลเครื่องคอมพิวเตอร์ (Asset Details)
              </div>
              <div><span className="text-slate-500">รหัสครุภัณฑ์ (Asset):</span> <strong className="font-mono text-blue-900">{repair.computerAssetCode}</strong></div>
              <div><span className="text-slate-500">ชื่อเครื่อง / รุ่น:</span> {repair.computerName} ({computer?.brand} {computer?.model})</div>
              <div><span className="text-slate-500">Serial Number:</span> <span className="font-mono">{computer?.serialNumber || '-'}</span></div>
            </div>
          </div>

          {/* Section 2: Problem & Diagnosis */}
          <div className="border border-slate-300 rounded-lg p-3.5 text-xs space-y-2">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              รายละเอียดอาการเสียและการประเมิน (Problem & Diagnosis)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><span className="text-slate-500">ประเภทปัญหา:</span> <span className="font-semibold text-slate-800">{repair.problemType}</span></div>
              <div><span className="text-slate-500">ความเร่งด่วน:</span> <span className="font-semibold text-slate-800">{repair.priority}</span></div>
              <div><span className="text-slate-500">ช่างผู้รับผิดชอบ:</span> <span className="font-semibold text-slate-800">{repair.technicianName || 'ยังไม่ระบุ'}</span></div>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">อาการเสียที่แจ้ง:</span>
              <div className="p-2 bg-slate-100 rounded border border-slate-200 font-medium text-slate-800">
                {repair.problemDescription}
              </div>
            </div>
            {repair.solution && (
              <div>
                <span className="text-slate-500 block mb-0.5">ผลการตรวจเช็คและวิธีแก้ไข (Resolution):</span>
                <div className="p-2 bg-blue-50/50 rounded border border-blue-200 text-slate-800">
                  {repair.solution}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Parts & Cost */}
          {(() => {
            const repairParts = repair.parts || (repair as any).partsUsed || [];
            if (repairParts.length === 0) return null;
            return (
              <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-300">
                  รายการอะไหล่และอุปกรณ์ที่ใช้ (Spare Parts Used)
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="px-3 py-1.5">รหัส/ชื่ออะไหล่</th>
                      <th className="px-3 py-1.5 text-center">จำนวน</th>
                      <th className="px-3 py-1.5 text-right">ราคาต่อหน่วย</th>
                      <th className="px-3 py-1.5 text-right">รวมเงิน (บาท)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {repairParts.map((p: any) => {
                      const unitPrice = Number(p.price ?? p.unitPrice ?? 0);
                      const total = Number(p.total ?? (p.quantity * unitPrice));
                      return (
                        <tr key={p.id}>
                          <td className="px-3 py-1.5">
                            {p.partName} {p.partCode && <span className="font-mono text-slate-500">({p.partCode})</span>}
                          </td>
                          <td className="px-3 py-1.5 text-center">{p.quantity}</td>
                          <td className="px-3 py-1.5 text-right">{unitPrice.toLocaleString()}</td>
                          <td className="px-3 py-1.5 text-right font-medium">{total.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={3} className="px-3 py-2 text-right">ยอดรวมค่าอะไหล่และบริการทั้งสิ้น:</td>
                      <td className="px-3 py-2 text-right text-blue-900">{repair.cost.toLocaleString()} บาท</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Section 4: Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
            <div className="space-y-10">
              <div className="border-b border-slate-400 pb-1 mx-4"></div>
              <div>
                <p className="font-semibold text-slate-900">( {repair.requesterName} )</p>
                <p className="text-slate-500">ผู้ส่งซ่อม / ผู้ใช้งาน</p>
                <p className="text-[10px] text-slate-400">วันที่ ...../...../.........</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="border-b border-slate-400 pb-1 mx-4"></div>
              <div>
                <p className="font-semibold text-slate-900">( {repair.technicianName || '................................'} )</p>
                <p className="text-slate-500">ช่างเทคนิคผู้ดำเนินการ</p>
                <p className="text-[10px] text-slate-400">วันที่ ...../...../.........</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="border-b border-slate-400 pb-1 mx-4"></div>
              <div>
                <p className="font-semibold text-slate-900">( ............................................ )</p>
                <p className="text-slate-500">ผู้รับมอบเครื่องคืน / ตรวจสอบงาน</p>
                <p className="text-[10px] text-slate-400">วันที่ ...../...../.........</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
