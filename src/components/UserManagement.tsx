import React, { useEffect, useState } from "react";
import { Users, Shield, User, UserCheck, AlertCircle, Search, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";

interface EditableGroupCellProps {
  userId: string;
  initialValue: string;
  onSave: (userId: string, newValue: string) => Promise<void>;
}

function EditableGroupCell({ userId, initialValue, onSave }: EditableGroupCellProps) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = async () => {
    setIsEditing(false);
    if (value.trim() !== initialValue.trim()) {
      setLoading(true);
      try {
        await onSave(userId, value.trim());
      } catch (e) {
        console.error("Save failed:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    } else if (e.key === "Escape") {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-[140px]">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="ระบุกลุ่ม/ส่วนงาน..."
        className={`w-full px-2.5 py-1 bg-white border border-zinc-250 rounded-lg text-[10.5px] font-semibold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#0071e3] transition-all shadow-2xs ${
          isEditing ? "border-[#0071e3] ring-1 ring-[#0071e3]/30" : "hover:border-zinc-350 cursor-text"
        }`}
        disabled={loading}
      />
      {loading && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[10px] animate-pulse">
          ⏳
        </span>
      )}
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // States สำหรับสร้างผู้ใช้ใหม่
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"superadmin" | "admin" | "head_user" | "user">("user");
  const [newProvince, setNewProvince] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      setErrorMsg("กรุณากรอกอีเมลและชื่อผู้ใช้งานใหม่ให้ครบถ้วนค่ะ");
      return;
    }
    
    setIsCreating(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const generatedId = crypto.randomUUID();
      const { error } = await supabase
        .from("profiles")
        .insert({
          id: generatedId,
          email: newEmail.trim().toLowerCase(),
          display_name: newName.trim(),
          role: newRole,
          province: newProvince,
          updated_at: new Date().toISOString()
        });

      if (error) {
        setErrorMsg("ไม่สามารถสร้างบัญชีได้: " + error.message);
      } else {
        setSuccessMsg(`💾 สร้างบัญชีผู้ใช้ [${newEmail}] สำเร็จเรียบร้อยแล้วค่ะ!`);
        setNewEmail("");
        setNewName("");
        setNewRole("user");
        setNewProvince("");
        fetchUsersList();
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการสร้างผู้ใช้งานใหม่");
    } finally {
      setIsCreating(false);
    }
  };

  const fetchUsersList = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        setErrorMsg("ไม่สามารถดึงรายชื่อผู้ใช้ได้: " + error.message);
      } else if (data) {
        setUsers(data);
      }
    } catch (err: any) {
      setErrorMsg("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้ค่ะ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
  }, []);

  const handleRoleChange = async (userId: string, newRole: "superadmin" | "admin" | "head_user" | "user") => {
    if (confirm(`🔄 คุณต้องการเปลี่ยนสิทธิ์การเข้าถึงของผู้ใช้รายนี้เป็น [${newRole.toUpperCase()}] ใช่หรือไม่?`)) {
      setErrorMsg("");
      setSuccessMsg("");
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) {
          setErrorMsg("ไม่สามารถอัปเดตสิทธิ์ได้: " + error.message);
        } else {
          setSuccessMsg("💾 ปรับเปลี่ยนระดับสิทธิ์และอัปเดตระบบเสร็จสิ้นเรียบร้อยแล้วค่ะ!");
          fetchUsersList();
          setTimeout(() => setSuccessMsg(""), 3000);
        }
      } catch (err: any) {
        setErrorMsg("ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้");
      }
    }
  };

  const handleProvinceChange = async (userId: string, newProvince: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ province: newProvince, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) {
        setErrorMsg("ไม่สามารถอัปเดตจังหวัดได้: " + error.message);
      } else {
        setSuccessMsg("💾 อัปเดตจังหวัดกลุ่มงานของผู้ใช้งานเสร็จสิ้นเรียบร้อยแล้วค่ะ!");
        fetchUsersList();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setErrorMsg("ไม่สามารถอัปเดตจังหวัดกลุ่มงานได้");
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.display_name && u.display_name.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query)) ||
      (u.role && u.role.toLowerCase().includes(query)) ||
      (u.province && u.province.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Subheader info */}
      <div className="flex justify-between items-center bg-zinc-50 p-4.5 rounded-2xl border border-zinc-200/60">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
            <Users className="w-5 h-5 text-indigo-650" />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-zinc-900 uppercase tracking-wider font-mono">
              แผงควบคุมสิทธิ์บัญชีผู้ใช้ระบบ (User Authentication Management)
            </h4>
            <p className="text-[9.5px] text-zinc-400 mt-0.5 leading-none">
              จัดการสิทธิ์การเข้าถึง ดูข้อมูลต้นทุน และจัดกลุ่มจังหวัดให้กับทีมช่าง/ทีมเซลส์ NT
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchUsersList}
          className="p-1.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-250 rounded-xl text-[10px] font-bold text-zinc-650 flex items-center gap-1 shadow-2xs hover:shadow-xs cursor-pointer transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-650" : ""}`} />
          <span>ดึงข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-[10.5px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl text-[10.5px] flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ฟอร์มเพิ่มผู้ใช้ใหม่ (Password-less Account Creation) */}
      <form onSubmit={handleCreateUser} className="bg-zinc-50 border border-zinc-200/60 p-4 rounded-2xl space-y-3 shadow-2xs">
        <h5 className="text-[10px] font-black text-indigo-950 uppercase tracking-wider font-mono flex items-center gap-1.5 leading-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse"></span>
          ➕ เพิ่มบัญชีผู้ใช้งานระบบรายใหม่ (Password-less Account)
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Email Input */}
          <div className="space-y-1 md:col-span-3">
            <label className="block text-[9px] font-bold text-zinc-550 uppercase">อีเมลผู้ใช้ (Email)</label>
            <input
              type="email"
              required
              placeholder="username@ntplc.co.th"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-250 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-xs font-mono text-zinc-800 shadow-2xs"
            />
          </div>

          {/* Name Input */}
          <div className="space-y-1 md:col-span-3">
            <label className="block text-[9px] font-bold text-zinc-550 uppercase">ชื่อ-นามสกุลจริง</label>
            <input
              type="text"
              required
              placeholder="เช่น สมชาย ใจดี"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-250 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-xs font-medium text-zinc-800 shadow-2xs"
            />
          </div>

          {/* Role Select */}
          <div className="space-y-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-550 uppercase">ระดับสิทธิ์ (Role)</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full px-2.5 py-1.5 border border-zinc-250 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-xs font-bold text-zinc-700 shadow-2xs cursor-pointer"
            >
              <option value="user">👤 USER (ช่างทั่วไป)</option>
              <option value="head_user">👥 HEAD USER (หัวหน้าภาค)</option>
              <option value="admin">🛡️ ADMIN (ผู้ดูแลต้นทุน)</option>
              <option value="superadmin">👑 SUPER ADMIN (สูงสุด)</option>
            </select>
          </div>

          {/* Group/Department Input */}
          <div className="space-y-1 md:col-span-4">
            <label className="block text-[9px] font-bold text-zinc-550 uppercase">กลุ่ม / ส่วนงานประจำการ</label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="เช่น อุดรธานี, ฝ่ายเทคนิค, superadmin"
                value={newProvince}
                onChange={(e) => setNewProvince(e.target.value)}
                className="grow px-2.5 py-1.5 border border-zinc-250 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-[#0071e3] text-xs font-semibold text-zinc-800 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-1.5 bg-[#0071e3] hover:bg-blue-650 active:bg-blue-700 disabled:bg-zinc-400 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                {isCreating ? "กำลังเพิ่ม..." : "เพิ่มบัญชี"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Search Input Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="ค้นหาตามรายชื่อ อีเมล ระดับสิทธิ์ หรือกลุ่มงาน..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-zinc-250 rounded-xl bg-zinc-50/50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] text-xs font-medium text-zinc-800 transition-all shadow-2xs"
        />
      </div>

      {/* Users Table */}
      <div className="border border-zinc-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                <th className="px-4 py-3">รายละเอียดผู้ใช้งาน</th>
                <th className="px-4 py-3">UUID บัญชี</th>
                <th className="px-4 py-3">กลุ่ม / ส่วนงาน</th>
                <th className="px-4 py-3">ระดับสิทธิ์ (Role)</th>
                <th className="px-4 py-3 text-right">ปรับระดับสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  let roleBadgeStyle = "bg-zinc-100 text-zinc-650";
                  if (u.role === "superadmin") roleBadgeStyle = "bg-red-50 border border-red-200 text-red-600";
                  else if (u.role === "admin") roleBadgeStyle = "bg-amber-50 border border-amber-200 text-amber-600";
                  else if (u.role === "head_user") roleBadgeStyle = "bg-teal-50 border border-teal-200 text-teal-600";

                  return (
                    <tr key={u.id} className="hover:bg-zinc-50/45 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-zinc-500" />
                          </div>
                          <div>
                            <span className="font-bold text-zinc-800 block">{u.display_name || "ไม่ระบุชื่อ"}</span>
                            {u.email && <span className="text-[9.5px] text-indigo-650 font-mono block leading-none my-0.5">{u.email}</span>}
                            <span className="text-[9px] text-zinc-400 block font-sans">อัปเดตเมื่อ: {new Date(u.updated_at).toLocaleString("th-TH")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[9px] text-zinc-400 select-all">
                        {u.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <EditableGroupCell
                          userId={u.id}
                          initialValue={u.province || ""}
                          onSave={handleProvinceChange}
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-0.8 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wide ${roleBadgeStyle}`}>
                          {u.role === "head_user" ? "HEAD USER" : u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-zinc-250 rounded-lg text-[10.5px] font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#0071e3] hover:border-zinc-350 cursor-pointer shadow-2xs"
                        >
                          <option value="user">👤 USER (ผู้สำรวจทั่วไป)</option>
                          <option value="head_user">👥 HEAD USER (หัวหน้าภาค)</option>
                          <option value="admin">🛡️ ADMIN (ผู้ดูแลต้นทุน)</option>
                          <option value="superadmin">👑 SUPER ADMIN (ผู้บริหารสูงสุด)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-400 text-xs font-medium">
                    {loading ? "กำลังค้นหาข้อมูลผู้ใช้ในระบบ..." : "ไม่พบรายชื่อผู้ใช้งานใดๆ ตามเงื่อนไขค้นหาค่ะ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
