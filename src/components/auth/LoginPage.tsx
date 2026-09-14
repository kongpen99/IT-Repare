import React, { useState } from 'react';
import { Eye, EyeOff, Plus, HelpCircle, ShieldCheck, Wrench, AlertCircle, Laptop, WrenchIcon } from 'lucide-react';
import { User } from '../../types';

interface LoginPageProps {
  onLogin: (identifier: string, pass: string) => { success: boolean; message?: string; user?: User };
  demoUsers: User[];
  onQuickLogin: (userId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, demoUsers, onQuickLogin }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = onLogin(identifier, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'อีเมลหรือหมายเลขโทรศัพท์ที่คุณป้อนไม่ตรงกับบัญชีใดๆ');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans text-[#1c1e21]">
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
        <div className="w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero / Brand Column (Facebook Style) */}
          <div className="lg:col-span-7 text-center lg:text-left pt-2 lg:pt-0 lg:pr-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-[#1877f2] font-bold text-4xl sm:text-5xl lg:text-[56px] tracking-tight font-sans">
                crm.service
              </span>
              <span className="bg-[#1877f2]/10 text-[#1877f2] font-bold text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
                IT Enterprise
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-normal text-[#1c1e21] leading-relaxed sm:leading-snug max-w-[500px] mx-auto lg:mx-0">
              ระบบศูนย์บริการและบันทึกประวัติการซ่อมคอมพิวเตอร์องค์กร ช่วยจัดการเครื่องและงานซ่อมอย่างรวดเร็ว
            </h1>

            {/* Recent login cards (Facebook-style account picker) */}
            <div className="mt-8 hidden sm:block">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                เข้าสู่ระบบล่าสุด / บัญชีแนะนำ (คลิกเพื่อเข้าใช้งานด่วน)
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-[480px]">
                {demoUsers.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onQuickLogin(u.id)}
                    className="group bg-white rounded-lg border border-slate-200 hover:border-[#1877f2] hover:shadow-md transition-all duration-200 overflow-hidden text-center flex flex-col items-center"
                  >
                    <div className="w-full h-24 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center font-bold text-lg">
                          {u.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                        {u.role}
                      </div>
                    </div>
                    <div className="p-2.5 w-full">
                      <p className="text-xs font-semibold text-slate-800 truncate">{u.name.split(' ')[0]}</p>
                      <p className="text-[11px] text-[#1877f2] truncate">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card Column (Facebook Form Card Style) */}
          <div className="lg:col-span-5 w-full max-w-[396px] mx-auto">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-slate-100">
              {errorMsg && (
                <div className="mb-4 p-3 rounded-md bg-[#ffebe8] border border-[#dd3c10] text-[#1c1e21] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#e41e3f] shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="อีเมลหรือชื่อผู้ใช้งาน (Username/Email)"
                    className="w-full px-4 py-3.5 bg-white text-sm text-[#1c1e21] border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 transition-all outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน (Password)"
                    className="w-full px-4 py-3.5 pr-11 bg-white text-sm text-[#1c1e21] border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 transition-all outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-lg rounded-md transition-colors shadow-xs disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>
              </form>

              {/* Forgotten password style link */}
              <div className="text-center py-3">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="text-xs text-[#1877f2] hover:underline font-medium"
                >
                  ลืมรหัสผ่านใช่หรือไม่? หรือดูรายชื่อบัญชีทดสอบ
                </button>
              </div>

              <div className="border-b border-slate-200 my-2" />

              {/* Create new account green button (Facebook style) */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="inline-block px-4 py-3 bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-sm sm:text-base rounded-md transition-colors shadow-xs"
                >
                  ดูบัญชีผู้ใช้ระบบ (Demo Accounts)
                </button>
              </div>
            </div>

            {/* Subtext under form card */}
            <div className="mt-7 text-center text-xs text-slate-600">
              <span className="font-semibold text-[#1c1e21] hover:underline cursor-pointer">
                สร้างเพจ
              </span>{' '}
              สำหรับแผนก IT และศูนย์ซ่อมคอมพิวเตอร์ประจำสำนักงาน
            </div>
          </div>

        </div>
      </div>

      {/* Facebook-style Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 pb-2 border-b border-slate-200/80 text-[11px] text-slate-500">
            <span className="text-slate-800 font-medium">ภาษาไทย</span>
            <span className="hover:underline cursor-pointer">English (US)</span>
            <span className="hover:underline cursor-pointer">日本語</span>
            <span className="hover:underline cursor-pointer">中文(简体)</span>
            <span className="hover:underline cursor-pointer">Tiếng Việt</span>
            <span className="hover:underline cursor-pointer">Bahasa Indonesia</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-500">
            <span className="hover:underline cursor-pointer">สมัครใช้งาน</span>
            <span className="hover:underline cursor-pointer">เข้าสู่ระบบ</span>
            <span className="hover:underline cursor-pointer">ระบบงานแจ้งซ่อม</span>
            <span className="hover:underline cursor-pointer">คลังอะไหล่ IT</span>
            <span className="hover:underline cursor-pointer">ฐานข้อมูล Neon PostgreSQL</span>
            <span className="hover:underline cursor-pointer">ความปลอดภัย</span>
            <span className="hover:underline cursor-pointer">ศูนย์ช่วยเหลือ</span>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            Computer Repair Management © 2026 Enterprise Edition • Neon PostgreSQL Cloud Backend
          </div>
        </div>
      </footer>

      {/* Demo Accounts Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1877f2]" />
                <span>เลือกบัญชีผู้ใช้เพื่อเข้าสู่ระบบ (Demo Accounts)</span>
              </h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2.5 max-h-[65vh] overflow-y-auto">
              <p className="text-xs text-slate-500 mb-2">
                รหัสผ่านเริ่มต้นสำหรับทุกบัญชี: <span className="font-mono font-bold text-slate-700">password123</span>
              </p>
              {demoUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    onQuickLogin(u.id);
                    setShowDemoModal(false);
                  }}
                  className="p-3 rounded-lg border border-slate-200 hover:border-[#1877f2] hover:bg-[#1877f2]/5 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        u.role === 'ADMIN' ? 'bg-[#1877f2] text-white' : 'bg-[#42b72a] text-white'
                      }`}
                    >
                      {u.role === 'ADMIN' ? <ShieldCheck className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Username: <span className="font-mono text-[#1877f2] font-semibold">{u.username}</span> • {u.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ช่างเทคนิค (Technician)'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-[#1877f2] text-white text-xs font-semibold rounded hover:bg-[#166fe5]"
                  >
                    เลือก
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
