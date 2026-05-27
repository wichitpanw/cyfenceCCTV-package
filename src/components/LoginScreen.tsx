import React, { useState } from "react";
import { Lock, User, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "../supabaseClient";

interface LoginScreenProps {
  onLoginSuccess: (user: any, profile: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);

  // Status & Loaders
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านของคุณด้วยค่ะ");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // ค้นหา user จาก profiles table โดยตรงด้วย username + password
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.trim())
        .eq("password", password)
        .maybeSingle();

      if (profileError) {
        setErrorMsg("❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล กรุณาลองใหม่อีกครั้งค่ะ");
        setLoading(false);
        return;
      }

      if (!profile) {
        setErrorMsg("❌ ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งค่ะ");
        setLoading(false);
        return;
      }

      setSuccessMsg("🎉 เข้าสู่ระบบสำเร็จเรียบร้อยค่ะ!");

      const mockUser = {
        id: profile.id,
        email: email.trim().toLowerCase(),
        role: profile.role
      };

      const sessionPayload = {
        user: mockUser,
        profile: {
          id: profile.id,
          role: profile.role,
          displayName: profile.display_name,
          email: email.trim().toLowerCase(),
          province: profile.province,
          updatedAt: profile.updated_at
        }
      };

      // ตั้งเวลาหมดอายุของเซสชันไว้ที่ 2 ชั่วโมง (7200000 ms)
      const expiryTime = Date.now() + 2 * 60 * 60 * 1000;

      // เซฟลง localStorage เพื่อให้ผู้ใช้งานล็อกอินค้างไว้ได้เมื่อรีเฟรชหน้าเบราว์เซอร์
      localStorage.setItem("CCTV_USER_SESSION", JSON.stringify(sessionPayload));
      localStorage.setItem("CCTV_SESSION_EXPIRY", expiryTime.toString());

      setTimeout(() => {
        onLoginSuccess(mockUser, sessionPayload.profile);
      }, 800);

    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งค่ะ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans select-none overflow-hidden relative">

      {/* Subtle background texture — very light blue-gray tint on top corners */}
      <div className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full bg-blue-100/50 blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-indigo-100/40 blur-[100px] translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      {/* Main Card Container */}
      <div className="mx-auto w-full max-w-[400px] z-10">

        {/* White Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 border border-gray-200/80 px-8 pt-8 pb-7 space-y-6">

          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-md shadow-gray-200 border border-gray-100 overflow-hidden p-1.5 transition-all hover:scale-105">
              <img src="/cyfence_logo.png" alt="Cyfence Logo" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-black text-gray-900 tracking-widest uppercase font-mono leading-tight">
                NT CYFENCE CCTV
              </h1>
              <p className="text-[11px] text-gray-500 font-medium leading-snug max-w-[260px] mx-auto">
                ระบบจัดทำใบเสนอราคาและรายงานสำรวจ<br />แพ็คเกจกล้องวงจรปิด NT
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">เข้าสู่ระบบเพื่อเริ่มใช้งาน</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-[11px] font-bold text-gray-600 tracking-wide uppercase">
                ชื่อผู้ใช้งาน (USERNAME)
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="กรอกชื่อผู้ใช้งาน"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-9 pe-4 py-2.5 bg-gray-50 border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-sans text-gray-800 placeholder-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500/15 peer"
                />
                <div className="text-gray-400 absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-focus:text-blue-500 transition-colors pointer-events-none">
                  <User size={15} aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[11px] font-bold text-gray-600 tracking-wide uppercase">
                รหัสผ่าน (PASSWORD)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-9 pe-10 py-2.5 bg-gray-50 border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:bg-white rounded-xl text-sm font-sans text-gray-800 placeholder-gray-400 transition-all outline-none focus:ring-2 focus:ring-blue-500/15 peer"
                />
                <div className="text-gray-400 absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-focus:text-blue-500 transition-colors pointer-events-none">
                  <Lock size={15} aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center transition-colors outline-none cursor-pointer rounded-e-xl"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <span>ล็อกอินเข้าสู่ระบบ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Support/Admin Contact Notice */}
          <div className="pt-4 border-t border-gray-100 text-center space-y-0.5">
            <p className="text-[11px] text-gray-500 leading-snug">
              🔑 หากลืมรหัสผ่าน หรือต้องการสิทธิ์เข้าใช้งาน
            </p>
            <p className="text-[11px] text-gray-600 leading-snug">
              กรุณาติดต่อแอดมิน (คุณบีม) โทร.{" "}
              <a href="tel:095-662-5871" className="font-bold text-blue-600 hover:text-blue-700 hover:underline">
                095-662-5871
              </a>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="text-center mt-5 text-[10px] text-gray-400 font-mono tracking-wider">
          Powered by Warapon Wichitpan &copy; 2026 &middot; NT Cyfence
        </div>
      </div>
    </div>
  );
}
