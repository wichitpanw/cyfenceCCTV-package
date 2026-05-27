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
    <div className="min-h-screen bg-gradient-to-br from-[#070a24] via-[#0b113a] to-zinc-950 flex items-center justify-center p-4 font-sans select-none overflow-hidden relative">
      
      {/* Premium Dynamic Ambient Lights */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[130px] animate-pulse animate-duration-[8000ms]"></div>
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse animate-duration-[10000ms]"></div>

      {/* Main Container styled in a clean, minimalist blocks.so/login-07 fashion */}
      <div className="mx-auto w-full max-w-[340px] z-10 space-y-8">
        
        {/* Brand Header */}
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/10 overflow-hidden p-2 transition-all hover:scale-105 hover:shadow-blue-500/20">
            <img src="/cyfence_logo.png" alt="Cyfence Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-balance text-2.5xl font-black text-white tracking-wide uppercase font-mono">
              NT CYFENCE CCTV
            </h1>
            <p className="text-pretty text-xs text-zinc-300 font-medium leading-normal max-w-[280px] mx-auto">
              ระบบจัดทำใบเสนอราคาและรายงานสำรวจแพ็คเกจกล้องวงจรปิด NT
            </p>
          </div>
        </div>

        {/* Sleek Minimalist Form (Directly on Background, no white card, pure premium styling) */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-[11px] font-bold text-zinc-200 uppercase tracking-widest">
              เข้าสู่ระบบเพื่อเริ่มใช้งาน
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-5">

            {/* Username Input */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-[10px] font-bold text-zinc-300 tracking-wider uppercase">
                ชื่อผู้ใช้งาน (USERNAME)
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 bg-white/[0.04] border border-white/[0.12] hover:border-white/[0.22] focus:border-blue-500 focus:bg-white/[0.06] rounded-xl text-sm font-mono text-white placeholder-zinc-500 transition-all outline-none focus:ring-1 focus:ring-blue-500/30 peer"
                />
                <div className="text-zinc-400 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-focus:text-blue-400 transition-colors pointer-events-none">
                  <User size={16} aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-zinc-300 tracking-wider uppercase">
                รหัสผ่าน (PASSWORD)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-10 pe-10 py-2.5 bg-white/[0.04] border border-white/[0.12] hover:border-white/[0.22] focus:border-blue-500 focus:bg-white/[0.06] rounded-xl text-sm font-mono text-white placeholder-zinc-500 transition-all outline-none focus:ring-1 focus:ring-blue-500/30 peer"
                />
                <div className="text-zinc-400 absolute inset-y-0 start-0 flex items-center justify-center ps-3.5 peer-focus:text-blue-400 transition-colors pointer-events-none">
                  <Lock size={16} aria-hidden="true" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-400 hover:text-zinc-200 absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center rounded-e-xl transition-colors outline-none cursor-pointer"
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
              <div className="bg-red-500/15 border border-red-500/35 text-red-100 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/15 border border-emerald-500/35 text-emerald-100 p-3.5 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-zinc-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
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
          <div className="pt-5 border-t border-white/[0.08] text-center text-xs text-zinc-400 leading-relaxed space-y-1">
            <span className="block text-[11px] text-zinc-450">🔑 หากลืมรหัสผ่าน หรือต้องการสิทธิ์เข้าใช้งาน</span>
            <span className="block text-zinc-350">
              กรุณาติดต่อแอดมิน (คุณบีม) โทร. <a href="tel:095-662-5871" className="font-bold text-blue-400 hover:underline">095-662-5871</a>
            </span>
          </div>
        </div>

        {/* Footer Credit info */}
        <div className="text-center pt-4 text-[10px] text-zinc-500 font-mono tracking-wider">
          Powered by Warapon Wichitpan &copy; 2026 &middot; NT Cyfence
        </div>
      </div>
    </div>
  );
}
