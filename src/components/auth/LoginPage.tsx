import React, { useState } from 'react';
import { Eye, EyeOff, Plus, ShieldCheck, Wrench, AlertCircle, CheckCircle2, User as UserIcon, Lock, ArrowLeft, Search, Building2, HelpCircle } from 'lucide-react';
import { User, Role, Department } from '../../types';

interface LoginPageProps {
  onLogin: (identifier: string, pass: string) => { success: boolean; message?: string; user?: User };
  onRegister?: (data: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: Role;
    departmentId?: string;
  }) => { success: boolean; message?: string; user?: User };
  onResetPassword?: (identifier: string, newPass: string) => { success: boolean; message?: string; user?: User };
  demoUsers: User[];
  departments?: Department[];
  onQuickLogin: (userId: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onRegister,
  onResetPassword,
  demoUsers,
  departments = [],
  onQuickLogin
}) => {
  // Main Login Form States
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // Register Form States
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regRole, setRegRole] = useState<Role>('TECHNICIAN');
  const [regDepartmentId, setRegDepartmentId] = useState(departments[0]?.id || 'dept-1');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Forgot / Reset Password States
  const [forgotStep, setForgotStep] = useState<'SEARCH' | 'RESET' | 'DONE'>('SEARCH');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = onLogin(identifier, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.message || 'อีเมลหรือชื่อผู้ใช้ที่คุณป้อนไม่ตรงกับบัญชีใดๆ');
      }
    }, 350);
  };

  // Open Register Modal
  const handleOpenRegister = () => {
    setRegFirstName('');
    setRegLastName('');
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setRegRole('TECHNICIAN');
    setRegDepartmentId(departments[0]?.id || 'dept-1');
    setRegError('');
    setRegSuccess('');
    setIsRegisterOpen(true);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const fullName = `${regFirstName.trim()} ${regLastName.trim()}`.trim();
    if (!regFirstName.trim()) {
      setRegError('กรุณาระบุชื่อของคุณ');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('กรุณาระบุชื่อผู้ใช้ (Username)');
      return;
    }
    if (regUsername.trim().length < 3) {
      setRegError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsSubmittingReg(true);

    setTimeout(() => {
      if (onRegister) {
        const res = onRegister({
          name: fullName,
          username: regUsername.trim().toLowerCase(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          departmentId: regDepartmentId
        });

        setIsSubmittingReg(false);
        if (!res.success) {
          setRegError(res.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } else {
          setRegSuccess(res.message || 'สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...');
          setTimeout(() => {
            setIsRegisterOpen(false);
          }, 800);
        }
      } else {
        setIsSubmittingReg(false);
        setRegSuccess('สมัครสมาชิกสำเร็จ');
        setTimeout(() => setIsRegisterOpen(false), 800);
      }
    }, 400);
  };

  // Open Forgot Password Modal
  const handleOpenForgot = () => {
    setForgotStep('SEARCH');
    setForgotIdentifier(identifier && identifier !== 'admin' ? identifier : '');
    setMatchedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setIsForgotOpen(true);
  };

  // Handle Forgot Step 1: Search Account
  const handleSearchAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const searchKey = forgotIdentifier.trim().toLowerCase();
    if (!searchKey) {
      setForgotError('กรุณาป้อนชื่อผู้ใช้ (Username) หรืออีเมล');
      return;
    }

    const found = demoUsers.find(
      (u) =>
        u.username.toLowerCase() === searchKey ||
        u.email.toLowerCase() === searchKey
    );

    if (found) {
      setMatchedUser(found);
      setForgotStep('RESET');
    } else {
      setForgotError('ไม่พบผลการค้นหา กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมลอีกครั้ง');
    }
  };

  // Handle Forgot Step 2: Reset Password
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!newPassword || newPassword.length < 4) {
      setForgotError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!matchedUser) {
      setForgotError('เกิดข้อผิดพลาด ไม่พบบัญชีผู้ใช้');
      return;
    }

    setIsResetting(true);

    setTimeout(() => {
      if (onResetPassword) {
        const res = onResetPassword(matchedUser.username, newPassword);
        setIsResetting(false);
        if (!res.success) {
          setForgotError(res.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้');
        } else {
          setForgotSuccess(res.message || 'รีเซ็ตรหัสผ่านสำเร็จ');
          setForgotStep('DONE');
          setIdentifier(matchedUser.username);
          setPassword(newPassword);
        }
      } else {
        setIsResetting(false);
        setForgotSuccess('รีเซ็ตรหัสผ่านสำเร็จ');
        setForgotStep('DONE');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans text-[#1c1e21]" id="facebook-login-root">
      
      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16 md:py-24">
        <div className="w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero / Brand Column (Iconic Facebook Style) */}
          <div className="lg:col-span-7 text-center lg:text-left pt-2 lg:pt-0 lg:pr-6">
            
            {/* Facebook / Service Logo */}
            <div className="inline-flex items-center gap-2 mb-1 justify-center lg:justify-start">
              <span className="text-[#1877f2] font-bold text-5xl sm:text-6xl tracking-tighter lowercase select-none">
                facebook
              </span>
              <span className="bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/20 font-bold text-xs px-2 py-0.5 rounded-full uppercase tracking-wide">
                IT CRM
              </span>
            </div>

            {/* Slogan */}
            <h2 className="text-xl sm:text-2xl lg:text-[28px] font-normal text-[#1c1e21] leading-snug sm:leading-normal max-w-[500px] mx-auto lg:mx-0">
              Facebook ช่วยคุณเชื่อมต่อและจัดการงานแจ้งซ่อม คอมพิวเตอร์ และอุปกรณ์ไอทีในองค์กรได้อย่างสะดวกและรวดเร็ว
            </h2>

            {/* Recent Logins (Iconic Facebook Account Picker) */}
            <div className="mt-8 hidden sm:block">
              <div className="flex items-center justify-between max-w-[480px] mb-2.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  การเข้าสู่ระบบล่าสุด (คลิกเพื่อเข้าสู่ระบบทันที)
                </span>
                <span className="text-[11px] text-[#1877f2] hover:underline cursor-pointer font-medium">
                  {demoUsers.length} บัญชีในระบบ
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 max-w-[480px]">
                {demoUsers.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onQuickLogin(u.id)}
                    className="group bg-white rounded-lg border border-slate-200 hover:border-[#1877f2] hover:shadow-lg transition-all duration-200 overflow-hidden text-center flex flex-col items-center relative"
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
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-bold backdrop-blur-xs uppercase">
                        {u.role}
                      </div>
                    </div>
                    <div className="p-2.5 w-full bg-white">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.name.split(' ')[0]}</p>
                      <p className="text-[11px] text-[#1877f2] truncate font-mono font-medium">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Facebook Login Card */}
          <div className="lg:col-span-5 w-full max-w-[396px] mx-auto">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-slate-200/80">
              
              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-md bg-[#ffebe8] border border-[#dd3c10] text-[#1c1e21] text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-[#e41e3f] shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="อีเมลหรือหมายเลขโทรศัพท์มือถือ / ชื่อผู้ใช้"
                    className="w-full px-4 py-3.5 bg-white text-base text-[#1c1e21] border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 transition-all outline-none placeholder:text-slate-400 placeholder:text-sm"
                  />
                </div>

                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน"
                    className="w-full px-4 py-3.5 pr-11 bg-white text-base text-[#1c1e21] border border-slate-300 rounded-md focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20 transition-all outline-none placeholder:text-slate-400 placeholder:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                    title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Big Blue Login Button */}
                <button
                  id="btn-login-submit"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1465d2] text-white font-bold text-lg sm:text-xl rounded-md transition-colors shadow-xs disabled:opacity-75 flex items-center justify-center cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'เข้าสู่ระบบ'
                  )}
                </button>
              </form>

              {/* Forgotten password? Link */}
              <div className="text-center py-3">
                <button
                  id="btn-forgot-password"
                  type="button"
                  onClick={handleOpenForgot}
                  className="text-xs sm:text-sm text-[#1877f2] hover:underline font-medium cursor-pointer"
                >
                  ลืมรหัสผ่านใช่หรือไม่?
                </button>
              </div>

              {/* Facebook Divider */}
              <div className="border-b border-slate-200 my-2" />

              {/* Create New Account Button (Iconic Green) */}
              <div className="pt-3 pb-1 text-center">
                <button
                  id="btn-create-account"
                  type="button"
                  onClick={handleOpenRegister}
                  className="inline-block px-4 py-3 bg-[#42b72a] hover:bg-[#36a420] active:bg-[#2b9217] text-white font-bold text-sm sm:text-base rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  สร้างบัญชีใหม่ (Create new account)
                </button>
              </div>

            </div>

            {/* Sub-text under form card */}
            <div className="mt-7 text-center text-xs text-slate-600">
              <span className="font-bold text-[#1c1e21] hover:underline cursor-pointer">
                สร้างเพจ
              </span>{' '}
              สำหรับคนดัง แบรนด์ หรือธุรกิจศูนย์บริการไอที
            </div>

          </div>

        </div>
      </main>

      {/* Facebook-style Full Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-[980px] mx-auto px-4">
          
          {/* Languages Selector */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pb-2 border-b border-slate-200/80 text-[11px] text-slate-500">
            <span className="text-slate-800 font-bold">ภาษาไทย</span>
            <span className="hover:underline cursor-pointer">English (US)</span>
            <span className="hover:underline cursor-pointer">日本語</span>
            <span className="hover:underline cursor-pointer">中文(简体)</span>
            <span className="hover:underline cursor-pointer">Tiếng Việt</span>
            <span className="hover:underline cursor-pointer">Bahasa Indonesia</span>
            <span className="hover:underline cursor-pointer">Español</span>
            <span className="hover:underline cursor-pointer">Português (Brasil)</span>
            <span className="hover:underline cursor-pointer">Français (France)</span>
            <span className="hover:underline cursor-pointer">Deutsch</span>
            <button
              type="button"
              className="w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center rounded-xs border border-slate-300"
              title="ภาษาเพิ่มเติม"
            >
              +
            </button>
          </div>

          {/* Facebook Links Grid */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-[11px] text-slate-500">
            <span onClick={handleOpenRegister} className="hover:underline cursor-pointer">สมัครใช้งาน</span>
            <span className="hover:underline cursor-pointer">เข้าสู่ระบบ</span>
            <span className="hover:underline cursor-pointer">Messenger</span>
            <span className="hover:underline cursor-pointer">Facebook Lite</span>
            <span className="hover:underline cursor-pointer">วิดีโอ</span>
            <span className="hover:underline cursor-pointer">สถานที่</span>
            <span className="hover:underline cursor-pointer">เกม</span>
            <span className="hover:underline cursor-pointer">Marketplace</span>
            <span className="hover:underline cursor-pointer">Meta Pay</span>
            <span className="hover:underline cursor-pointer">Meta Store</span>
            <span className="hover:underline cursor-pointer">Meta Quest</span>
            <span className="hover:underline cursor-pointer">Ray-Ban Meta</span>
            <span className="hover:underline cursor-pointer">Meta AI</span>
            <span className="hover:underline cursor-pointer">Instagram</span>
            <span className="hover:underline cursor-pointer">Threads</span>
            <span className="hover:underline cursor-pointer">ระบบงานแจ้งซ่อม IT</span>
            <span className="hover:underline cursor-pointer">คลังอะไหล่คอมพิวเตอร์</span>
            <span className="hover:underline cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span className="hover:underline cursor-pointer">ศูนย์ความเป็นส่วนตัว</span>
            <span className="hover:underline cursor-pointer">กลุ่ม</span>
            <span className="hover:underline cursor-pointer">เกี่ยวกับ</span>
            <span className="hover:underline cursor-pointer">สร้างโฆษณา</span>
            <span className="hover:underline cursor-pointer">สร้างเพจ</span>
            <span className="hover:underline cursor-pointer">ผู้พัฒนา</span>
            <span className="hover:underline cursor-pointer">ร่วมงานกับเรา</span>
            <span className="hover:underline cursor-pointer">คุกกี้</span>
            <span className="hover:underline cursor-pointer">ตัวเลือกโฆษณา</span>
            <span className="hover:underline cursor-pointer">ข้อกำหนด</span>
            <span className="hover:underline cursor-pointer">วิธีใช้</span>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Meta © 2026 • CRM Service Computer Repair Management Enterprise</span>
            <span className="hidden sm:inline font-mono">Build v2.4.0</span>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: Facebook-Style Sign Up Modal (สร้างบัญชีผู้ใช้ใหม่) */}
      {/* ========================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-[432px] w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 flex items-start justify-between">
              <div>
                <h3 className="text-2xl sm:text-[32px] font-bold text-[#1c1e21] leading-tight">
                  สมัครใช้งาน
                </h3>
                <p className="text-sm text-[#606770] mt-0.5">
                  สะดวกรวดเร็ว
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="border-b border-slate-200" />

            {/* Modal Form */}
            <form onSubmit={handleRegisterSubmit} className="p-4 space-y-3">
              
              {/* Errors or Success Alert */}
              {regError && (
                <div className="p-2.5 rounded-md bg-[#ffebe8] border border-[#dd3c10] text-[#1c1e21] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#e41e3f] shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {/* Name row: First name & Last name */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อจริง"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="นามสกุล"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="ชื่อผู้ใช้ (Username สำหรับเข้าสู่ระบบ)"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full px-3 py-2.5 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white font-mono transition-all"
                />
              </div>

              {/* Email or Phone */}
              <div>
                <input
                  type="email"
                  placeholder="หมายเลขโทรศัพท์มือถือหรืออีเมล"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={regShowPassword ? 'text' : 'password'}
                  required
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setRegShowPassword(!regShowPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {regShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[11px] font-semibold text-[#606770] mb-1">
                  แผนก / ฝ่ายสังกัด
                </label>
                <select
                  value={regDepartmentId}
                  onChange={(e) => setRegDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f5f6f7] border border-[#ccd0d5] rounded-md text-xs text-[#1c1e21] outline-none focus:border-[#1877f2] focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection (Facebook Gender Boxes style) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#606770] mb-1">
                  บทบาทหน้าที่ในระบบ
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <label
                    className={`flex items-center justify-between p-2.5 border rounded-md cursor-pointer text-xs font-medium ${
                      regRole === 'TECHNICIAN'
                        ? 'border-[#1877f2] bg-blue-50/50 text-[#1877f2]'
                        : 'border-[#ccd0d5] bg-white text-[#1c1e21]'
                    }`}
                  >
                    <span>ช่างซ่อม (Tech)</span>
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === 'TECHNICIAN'}
                      onChange={() => setRegRole('TECHNICIAN')}
                      className="text-[#1877f2] focus:ring-[#1877f2]"
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between p-2.5 border rounded-md cursor-pointer text-xs font-medium ${
                      regRole === 'ADMIN'
                        ? 'border-[#1877f2] bg-blue-50/50 text-[#1877f2]'
                        : 'border-[#ccd0d5] bg-white text-[#1c1e21]'
                    }`}
                  >
                    <span>ผู้ดูแลระบบ (Admin)</span>
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === 'ADMIN'}
                      onChange={() => setRegRole('ADMIN')}
                      className="text-[#1877f2] focus:ring-[#1877f2]"
                    />
                  </label>
                </div>
              </div>

              {/* Terms disclaimer */}
              <div className="text-[11px] text-[#777] leading-relaxed pt-1">
                เมื่อคลิก สมัครใช้งาน แสดงว่าคุณยินยอมตามข้อกำหนด นโยบายความเป็นส่วนตัว และนโยบายคุกกี้ของเรา คุณอาจได้รับการแจ้งเตือนทางระบบและสามารถปรับเปลี่ยนได้ในภายหลัง
              </div>

              {/* Green Submit Button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="px-12 py-2.5 bg-[#00a400] hover:bg-[#009200] active:bg-[#007f00] text-white font-bold text-base sm:text-lg rounded-md shadow-xs transition-colors cursor-pointer min-w-[194px]"
                >
                  {isSubmittingReg ? 'กำลังสมัคร...' : 'สมัครใช้งาน'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Facebook-Style Reset Password (รีเซ็ตรหัสผ่าน) */}
      {/* ========================================================================= */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl max-w-[480px] w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1c1e21]">
                {forgotStep === 'SEARCH' && 'ค้นหาบัญชีของคุณ'}
                {forgotStep === 'RESET' && 'รีเซ็ตรหัสผ่านของคุณ'}
                {forgotStep === 'DONE' && 'เปลี่ยนรหัสผ่านเรียบร้อย'}
              </h3>
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Error or Success alert */}
            {forgotError && (
              <div className="m-4 mb-0 p-3 rounded-md bg-[#ffebe8] border border-[#dd3c10] text-[#1c1e21] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#e41e3f] shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Search Account */}
            {forgotStep === 'SEARCH' && (
              <form onSubmit={handleSearchAccount}>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-[#1c1e21] leading-normal">
                    โปรดป้อนชื่อผู้ใช้ (Username) หรืออีเมล เพื่อค้นหาบัญชีของคุณในระบบ
                  </p>

                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="ชื่อผู้ใช้หรืออีเมล เช่น admin หรือ wichai.s@company.co.th"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-md text-sm text-[#1c1e21] outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
                  />

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">ตัวอย่างบัญชีในระบบ:</span> admin, tech.wichai, tech.narin, tech.anucha
                  </div>
                </div>

                <div className="p-3.5 bg-[#f0f2f5] border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#4b4f56] text-sm font-bold rounded-md transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>ค้นหา</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Found Account & Enter New Password */}
            {forgotStep === 'RESET' && matchedUser && (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="p-4 space-y-4">
                  {/* Account Found Box */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center gap-3">
                    <img
                      src={matchedUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={matchedUser.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">
                        พบบัญชีผู้ใช้ของคุณ
                      </div>
                      <div className="font-bold text-slate-900 text-sm truncate">{matchedUser.name}</div>
                      <div className="text-xs text-slate-600 truncate">
                        Username: <span className="font-mono font-bold text-[#1877f2]">@{matchedUser.username}</span> • {matchedUser.role}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        autoFocus
                        placeholder="ป้อนรหัสผ่านใหม่"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-[#1877f2]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ยืนยันรหัสผ่านใหม่อีกครั้ง
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="ป้อนรหัสผ่านใหม่อีกครั้ง"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm outline-none focus:border-[#1877f2]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#f0f2f5] border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setForgotStep('SEARCH')}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>ค้นหาบัญชีอื่น</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotOpen(false)}
                      className="px-4 py-2 bg-[#e4e6eb] hover:bg-[#d8dadf] text-[#4b4f56] text-sm font-bold rounded-md"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-md flex items-center gap-1.5"
                    >
                      {isResetting ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 3: Done */}
            {forgotStep === 'DONE' && (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">รีเซ็ตรหัสผ่านสำเร็จเรียบร้อย!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    ระบบได้ตั้งรหัสผ่านใหม่สำหรับบัญชี <span className="font-semibold text-slate-900">{matchedUser?.name}</span> แล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotOpen(false);
                      if (matchedUser) {
                        onLogin(matchedUser.username, newPassword);
                      }
                    }}
                    className="w-full py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-sm rounded-md shadow-xs"
                  >
                    เข้าสู่ระบบทันที
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
