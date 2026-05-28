import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Login01 } from "../../components/blocks/login-01";

interface LoginScreenProps {
  onLoginSuccess: (user: any, profile: any) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านของคุณด้วยค่ะ");
      return;
    }

    setLoading(true);
    setErrorMsg("");

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

      const expiryTime = Date.now() + 6 * 60 * 60 * 1000;

      localStorage.setItem("CCTV_USER_SESSION", JSON.stringify(sessionPayload));
      localStorage.setItem("CCTV_SESSION_EXPIRY", expiryTime.toString());

      onLoginSuccess(mockUser, sessionPayload.profile);

    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้งค่ะ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Login01
      onSubmit={handleSignIn}
      username={email}
      setUsername={setEmail}
      password={password}
      setPassword={setPassword}
      loading={loading}
      errorMsg={errorMsg}
    />
  );
}
