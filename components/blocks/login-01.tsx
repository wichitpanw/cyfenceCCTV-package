"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

interface Login01Props {
  onSubmit: (e: React.FormEvent) => void;
  username: string;
  setUsername: (username: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  errorMsg: string;
}

export function Login01({
  onSubmit,
  username,
  setUsername,
  password,
  setPassword,
  loading,
  errorMsg,
}: Login01Props) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 max-w-sm w-full">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-md space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-xs flex items-center justify-center overflow-hidden p-1 mx-auto transition-transform hover:scale-105">
              <img 
                src="/cyfence_logo.png" 
                alt="NT Cyfence Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-balance text-center text-sm font-bold text-gray-900 leading-tight pt-2">
              เข้าสู่ระบบ CCTV Package
            </h2>
            <p className="text-center text-[10px] text-gray-500">
              กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มต้นใช้งานระบบสำรวจ
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold text-gray-700">
                ชื่อผู้ใช้งาน
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="กรอกชื่อผู้ใช้งานของคุณ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 text-xs border-gray-300 focus:border-gray-900 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700">
                รหัสผ่าน
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 text-xs border-gray-300 focus:border-gray-900 rounded-lg"
                required
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5">
                ⚠️ {errorMsg}
              </p>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-9 text-xs font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 mt-2"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>

          <p className="text-center text-[10px] text-gray-400">
            Powered by Warapon Wichitpan & NT Cyfence · © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
