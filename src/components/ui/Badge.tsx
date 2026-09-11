import React from 'react';
import { RepairStatus, ComputerStatus, Priority } from '../../types';
import {
  Clock,
  UserCheck,
  Search,
  Wrench,
  Package,
  CheckCircle2,
  CornerUpLeft,
  XCircle,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface RepairStatusBadgeProps {
  status: RepairStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RepairStatusBadge: React.FC<RepairStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const configMap: Record<
    RepairStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    WAITING: {
      label: 'รอดำเนินการ (Waiting)',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
    },
    ASSIGNED: {
      label: 'มอบหมายงาน (Assigned)',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <UserCheck className="w-3.5 h-3.5 text-blue-600" />
    },
    DIAGNOSING: {
      label: 'กำลังตรวจสอบ (Diagnosing)',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: <Search className="w-3.5 h-3.5 text-purple-600" />
    },
    REPAIRING: {
      label: 'กำลังซ่อม (Repairing)',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: <Wrench className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
    },
    WAITING_PART: {
      label: 'รออะไหล่ (Waiting Part)',
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      icon: <Package className="w-3.5 h-3.5 text-pink-600" />
    },
    COMPLETED: {
      label: 'ซ่อมเสร็จ (Completed)',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    },
    RETURNED: {
      label: 'ส่งคืนแล้ว (Returned)',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
      icon: <CornerUpLeft className="w-3.5 h-3.5 text-teal-600" />
    },
    CANCELLED: {
      label: 'ยกเลิก (Cancelled)',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <XCircle className="w-3.5 h-3.5 text-slate-500" />
    }
  };

  const current = configMap[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: null
  };

  const sizeClass =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-medium'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClass} whitespace-nowrap shadow-xs`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};

export const ComputerStatusBadge: React.FC<{ status: ComputerStatus }> = ({ status }) => {
  const map: Record<ComputerStatus, { label: string; bg: string; text: string; dot: string }> = {
    NORMAL: {
      label: 'พร้อมใช้งาน (Normal)',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500'
    },
    REPAIR: {
      label: 'อยู่ระหว่างซ่อม (Repair)',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500 animate-ping'
    },
    DAMAGED: {
      label: 'ชำรุดเสียหาย (Damaged)',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500'
    },
    RETIRED: {
      label: 'ปลดประจำการ (Retired)',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      text: 'text-slate-600',
      dot: 'bg-slate-400'
    },
    LOST: {
      label: 'สูญหาย (Lost)',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500'
    }
  };

  const item = map[status] || map.NORMAL;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const map: Record<Priority, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    LOW: {
      label: 'ต่ำ (Low)',
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-600',
      icon: <ShieldCheck className="w-3 h-3 text-slate-500" />
    },
    MEDIUM: {
      label: 'ปานกลาง (Medium)',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: <AlertCircle className="w-3 h-3 text-blue-500" />
    },
    HIGH: {
      label: 'สูง (High)',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      icon: <AlertTriangle className="w-3 h-3 text-amber-500" />
    },
    CRITICAL: {
      label: 'วิกฤต (Critical)',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700 font-semibold',
      icon: <AlertOctagon className="w-3 h-3 text-rose-600 animate-bounce" />
    }
  };

  const p = map[priority] || map.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border ${p.bg} ${p.text}`}>
      {p.icon}
      {p.label}
    </span>
  );
};
