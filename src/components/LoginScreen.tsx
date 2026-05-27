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
      setErrorMsg("กรุณากรอกอีเมลและรหัสผ่านของคุณด้วยค่ะ");
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
        setErrorMsg("❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งค่ะ");
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
    <div className="min-h-screen bg-gradient-to-br from-[#0c1033] via-[#0d1647] to-zinc-950 flex items-center justify-center p-4 font-sans select-none overflow-hidden relative">
      
      {/* Dynamic Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-650/20 blur-[90px] animate-pulse animate-duration-[4000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-650/15 blur-[100px] animate-pulse animate-duration-[6000ms]"></div>

      <div className="mx-auto w-full max-w-sm z-10 space-y-6">
        {/* Brand Header (blocks-07 style) */}
        <div className="space-y-3 text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10 overflow-hidden p-2 transition-transform hover:scale-105">
            <img src="/cyfence_logo.png" alt="Cyfence Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-balance text-2xl font-black text-white tracking-wide uppercase font-mono">
            NT CYFENCE CCTV
          </h1>
          <p className="text-pretty text-xs text-zinc-400 leading-normal max-w-[280px] mx-auto">
            ระบบจัดทำใบเสนอราคาและรายงานสำรวจแพ็คเกจกล้องวงจรปิด NT
          </p>
        </div>

        {/* Premium Form Card styled like blocks-07 but keeping customized frame */}
        <div className="bg-white rounded-3xl p-6.5 border border-zinc-200/50 shadow-2xl space-y-5">
          <div className="text-center">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
              เข้าสู่ระบบเพื่อเริ่มใช้งาน
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Username Input (blocks-07 design) */}
            <div className="space-y-1">
              <label htmlFor="username" className="block text-[10px] font-bold text-zinc-550 uppercase">
                ชื่อผู้ใช้งาน (USERNAME)
              </label>
              <div className="relative mt-2">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-xs font-mono font-medium text-zinc-800 transition-all peer"
                />
                <div className="text-zinc-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <User size={16} aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Password Input (blocks-07 design with Eye Toggle) */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-[10px] font-bold text-zinc-550 uppercase">
                รหัสผ่าน (PASSWORD)
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-9 pe-9 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-[#0071e3] text-xs font-mono font-medium text-zinc-800 transition-all peer"
                />
                <div className="text-zinc-400 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <Lock size={16} aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-650 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-colors outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Notifications */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-[10.5px] leading-relaxed flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-[10.5px] leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Submit Button (blocks-07 style with dynamic states) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0071e3] hover:bg-blue-600 active:bg-blue-700 disabled:bg-zinc-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <span>ล็อกอินเข้าสู่ระบบ</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Support/Admin Contact Notice */}
          <div className="pt-3 border-t border-zinc-100 text-center text-[10.5px] text-zinc-500 leading-relaxed">
            🔑 หากลืมรหัสผ่าน หรือต้องการสิทธิ์เข้าใช้งาน <br />
            กรุณาติดต่อแอดมิน (คุณบีม) โทร. <a href="tel:095-662-5871" className="font-bold text-[#0071e3] hover:underline">095-662-5871</a>
          </div>
        </div>

        {/* Footer Credit info */}
        <div className="text-center mt-6 text-[9.5px] text-zinc-400 font-mono">
          Powered by Warapon Wichitpan &copy; 2026 &middot; NT Cyfence
        </div>
      </div>
    </div>
  );
}
