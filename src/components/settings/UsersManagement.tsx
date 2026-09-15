import React, { useState, useMemo } from 'react';
import { Users, Plus, Edit2, Trash2, ShieldCheck, Wrench, Key, Check, X, Search, AlertCircle, Building2, Lock, CheckCircle2 } from 'lucide-react';
import { User, Role, Department } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface UsersManagementProps {
  users: User[];
  departments?: Department[];
  currentUser: User | null;
  onSaveUser: (userData: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  departments = [],
  currentUser,
  onSaveUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    departmentId: '',
    role: 'TECHNICIAN' as Role,
    password: '',
    isActive: true
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormError('');
    setFormData({
      username: '',
      name: '',
      email: '',
      departmentId: departments[0]?.id || 'dept-1',
      role: 'TECHNICIAN',
      password: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormError('');
    setFormData({
      username: u.username,
      name: u.name,
      email: u.email,
      departmentId: u.departmentId || (departments[0]?.id || 'dept-1'),
      role: u.role,
      password: '',
      isActive: u.isActive !== undefined ? u.isActive : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = formData.name.trim();
    const trimmedUsername = formData.username.trim().toLowerCase();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      setFormError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    if (!trimmedUsername) {
      setFormError('กรุณากรอกชื่อผู้ใช้ (Username)');
      return;
    }
    if (trimmedUsername.length < 3) {
      setFormError('ชื่อผู้ใช้ (Username) ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }

    // Check duplicate username locally
    const duplicate = users.find(
      (u) => u.username.toLowerCase() === trimmedUsername && (!editingUser || u.id !== editingUser.id)
    );
    if (duplicate) {
      setFormError(`ชื่อผู้ใช้ "${trimmedUsername}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      return;
    }

    if (!editingUser && formData.password && formData.password.length < 4) {
      setFormError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    try {
      onSaveUser({
        ...(editingUser ? { id: editingUser.id } : {}),
        username: trimmedUsername,
        name: trimmedName,
        email: trimmedEmail || `${trimmedUsername}@company.co.th`,
        departmentId: formData.departmentId,
        role: formData.role,
        isActive: formData.isActive,
        ...(formData.password.trim() ? { password: formData.password.trim() } : {})
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.departmentName && u.departmentName.toLowerCase().includes(term));
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, searchTerm]);

  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const techCount = users.filter((u) => u.role === 'TECHNICIAN').length;

  return (
    <div className="space-y-5" id="users-management-container">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1877f2]" />
            <span>จัดการผู้ใช้งานระบบ (User & Role Management)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เพิ่ม แก้ไข และกำหนดสิทธิ์การเข้าใช้งานระบบซ่อมบำรุง (Admin และ ช่างเทคนิค)
          </p>
        </div>

        <button
          id="btn-add-new-user"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้ใหม่ (Add User)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 font-medium">ผู้ใช้ทั้งหมดในระบบ</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{users.length} คน</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-blue-100 bg-blue-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-blue-600 font-medium">ผู้ดูแลระบบ (Admin IT)</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{adminCount} คน</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-600 font-medium">ช่างเทคนิค (Technician)</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{techCount} คน</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, username, แผนก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1877f2] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'ADMIN', 'TECHNICIAN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r === 'ALL' ? 'ทั้งหมด' : r === 'ADMIN' ? 'ผู้ดูแล (Admin)' : 'ช่างซ่อม (Tech)'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ผู้ใช้งาน</th>
                <th className="px-4 py-3.5">Username</th>
                <th className="px-4 py-3.5">ฝ่าย / แผนก</th>
                <th className="px-4 py-3.5">อีเมล</th>
                <th className="px-4 py-3.5">บทบาท (Role)</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-4 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                คุณ
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">ID: {u.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">@{u.username}</td>
                      <td className="px-4 py-3 text-slate-700">{u.departmentName || 'แผนกไอที'}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>ผู้ดูแลระบบ (Admin)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ช่างเทคนิค (Technician)</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300" />
                            ระงับการใช้งาน
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-600 hover:text-[#1877f2] hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลผู้ใช้งาน"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isSelf ? (
                            <button
                              disabled
                              className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg"
                              title="ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onDeleteUser(u.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="ลบผู้ใช้งานออกจากระบบ"
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
      </div>

      {/* User Add/Edit Modal */}
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 p-5 sm:p-6"
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1877f2] flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold font-heading text-slate-900 text-base">
                      {editingUser ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {editingUser ? `กำลังแก้ไขข้อมูลของ ${editingUser.name}` : 'สร้างบัญชีสำหรับผู้ดูแลระบบหรือช่างเทคนิค'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs text-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">ชื่อ-นามสกุล *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมศักดิ์ สุขสำราญ"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white transition-all text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">Username (ชื่อเข้าระบบ) *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น admin, tech.new"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white font-mono text-xs transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">อีเมล (Email)</label>
                    <input
                      type="email"
                      placeholder="เช่น user@company.co.th"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white transition-all text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">แผนก / ฝ่าย</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white text-xs"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">บทบาทในระบบ (Role) *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white font-semibold text-xs"
                    >
                      <option value="TECHNICIAN">ช่างเทคนิค (Technician - ซ่อมบำรุงและเบิกอะไหล่)</option>
                      <option value="ADMIN">ผู้ดูแลระบบ (Admin - จัดการทุกส่วนของระบบ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">
                      {editingUser ? 'รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)' : 'รหัสผ่านเริ่มต้น'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : 'ค่าเริ่มต้น: password123'}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1877f2] focus:bg-white text-xs transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="user-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2]"
                  />
                  <label htmlFor="user-isActive" className="text-xs text-slate-700 cursor-pointer select-none">
                    เปิดใช้งานบัญชีนี้ในระบบ (Active)
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-white bg-[#1877f2] hover:bg-[#166fe5] rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>บันทึกข้อมูล</span>
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
