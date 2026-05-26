import React, { useState } from "react";
import { Lock, Mail, User, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2, Landmark, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";

interface LoginScreenProps {
  onLoginSuccess: (user: any, profile: any) => void;
}

const THAI_PROVINCES = [
  "อุดรธานี",
  "ขอนแก่น",
  "หนองคาย",
  "เลย",
  "สกลนคร",
  "หนองบัวลำภู",
  "บึงกาฬ",
  "นครพนม",
  "กาฬสินธุ์",
  "มหาสารคาม",
  "ร้อยเอ็ด",
  "มุกดาหาร",
  "ยโสธร",
  "อำนาจเจริญ",
  "อุบลราชธานี",
  "ศรีสะเกษ",
  "สุรินทร์",
  "บุรีรัมย์",
  "นครราชสีมา",
  "ชัยภูมิ"
];

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [province, setProvince] = useState("อุดรธานี");
  
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
      // 1. ลงชื่อเข้าใช้งานด้วย Email และ Password จริงผ่าน Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (authError) {
        setErrorMsg("❌ " + translateAuthError(authError.message));
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMsg("❌ ไม่สามารถลงชื่อเข้าใช้งานได้ กรุณาลองใหม่อีกครั้งค่ะ");
        setLoading(false);
        return;
      }

      // 2. ดึงข้อมูลโปรไฟล์ (Profile) เพิ่มเติมเพื่อดูสิทธิ์และจังหวัดกลุ่มงาน
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        setErrorMsg("เกิดข้อผิดพลาดในการดึงข้อมูลสิทธิ์ผู้ใช้งาน: " + profileError.message);
      } else if (!profile) {
        setErrorMsg("❌ ไม่พบข้อมูลโปรไฟล์ในระบบความปลอดภัยค่ะ กรุณาติดต่อผู้ดูแลระบบเพื่อสร้างข้อมูลสิทธิ์");
      } else {
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
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งค่ะ");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName || !province) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่องค่ะ");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรค่ะ");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Sign up user via Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          }
        }
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        setLoading(false);
        return;
      }

      if (data.user) {
        // 2. Insert profile record explicitly to profiles table (with selected province!)
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            display_name: displayName.trim(),
            role: "user", // defaults to standard surveyor/user
            province: province, // Bind to group province
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Failed to create profile row:", profileError.message);
        }

        setSuccessMsg("🎉 สมัครสมาชิกสำเร็จแล้ว! ระบบได้ส่งอีเมลยืนยันไปยังกล่องจดหมายของคุณแล้วค่ะ (หรือคุณสามารถทดลองเข้าสู่ระบบได้เลยขึ้นอยู่กับการตั้งค่าระบบ)");
        setIsSignUp(false);
        setPassword("");
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดขึ้นระหว่างสมัครสมาชิก กรุณาลองใหม่อีกครั้งค่ะ");
    } finally {
      setLoading(false);
    }
  };

  // Human-friendly Thai translation for Supabase errors
  const translateAuthError = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("invalid login credentials")) {
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งค่ะ";
    }
    if (lower.includes("user already exists") || lower.includes("email already in use")) {
      return "อีเมลนี้ได้รับการลงทะเบียนในระบบเรียบร้อยแล้วค่ะ";
    }
    if (lower.includes("email address is invalid") || lower.includes("invalid email")) {
      return "รูปแบบที่อยู่อีเมลไม่ถูกต้องค่ะ";
    }
    if (lower.includes("weak password")) {
      return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรค่ะ";
    }
    return msg;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1033] via-[#0d1647] to-zinc-950 flex items-center justify-center p-4 font-sans select-none overflow-hidden relative">
      
      {/* Dynamic Background Circles */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-650/20 blur-[90px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-650/15 blur-[100px] animate-pulse"></div>

      <div className="max-w-md w-full z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10 mb-4 overflow-hidden p-2">
            <img src="/cyfence_logo.png" alt="Cyfence Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide uppercase font-mono leading-none">
            NT Cyfence CCTV
          </h1>
          <p className="text-[10px] text-zinc-400 mt-1.5 font-sans leading-none">
            ระบบจัดทำใบเสนอราคาและรายงานสำรวจแพ็คเกจกล้องวงจรปิด NT
          </p>
        </div>

        {/* Premium Glassmorphic Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6.5 border border-zinc-200/50 shadow-2xl space-y-5">
          <div className="text-center">
            <h2 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wide">
              {isSignUp ? "สมัครสมาชิกผู้ใช้งานใหม่" : "เข้าสู่ระบบเพื่อเริ่มใช้งาน"}
            </h2>
            <p className="text-[10.5px] text-zinc-500 mt-1 leading-snug">
              {isSignUp 
                ? "กรุณากรอกข้อมูลของคุณเพื่อขอรับสิทธิ์เข้าถึงระบบในบทบาททีมช่างสำรวจ/เซลส์" 
                : "สิทธิ์การเข้าถึงความลับราคากลางและข้อมูลโครงการของ NT Cyfence"}
            </p>
          </div>

          {/* Form Actions */}
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            
            {/* Display Name Input (For Sign Up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-zinc-650 uppercase">ชื่อ-นามสกุลจริง</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สมชาย ใจดี"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-medium text-zinc-800 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Province Group Selection (For Sign Up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold text-zinc-650 uppercase">จังหวัดปฏิบัติการหลัก</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-medium text-zinc-800 transition-all cursor-pointer"
                  >
                    {THAI_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-semibold text-zinc-650 uppercase">ที่อยู่อีเมลบริษัท (Email)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="username@ntplc.co.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-medium text-zinc-800 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-semibold text-zinc-650 uppercase">รหัสผ่าน (Password)</label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:ring-1 focus:ring-[#0071e3] focus:bg-white text-xs font-mono font-medium text-zinc-800 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

            {/* Form Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0071e3] hover:bg-blue-650 active:bg-blue-700 disabled:bg-zinc-400 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <span>{isSignUp ? "สมัครสมาชิกใหม่" : "ล็อกอินเข้าสู่ระบบ"}</span>
              )}
            </button>
          </form>

          {/* Toggle Screen Actions */}
          <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-[10.5px]">
            <span className="text-zinc-400 font-medium">
              🔑 ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์ใช้งาน
            </span>
            
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  setErrorMsg("กรุณากรอกที่อยู่อีเมลของคุณด้านบนก่อนค่ะ เพื่อรับลิงก์รีเซ็ตรหัสผ่าน");
                  return;
                }
                try {
                  setLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: window.location.origin
                  });
                  if (error) {
                    setErrorMsg(error.message);
                  } else {
                    setSuccessMsg("ส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้วค่ะ!");
                  }
                } catch (e) {
                  setErrorMsg("เกิดข้อผิดพลาดในการดำเนินการ");
                } finally {
                  setLoading(false);
                }
              }}
              className="text-zinc-500 hover:text-zinc-800 cursor-pointer font-semibold"
            >
              ลืมรหัสผ่าน?
            </button>
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
