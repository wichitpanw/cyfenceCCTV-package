import React, { useEffect, useState } from "react";
import { Users, User, UserCheck, AlertCircle, Search, RefreshCw, Eye, EyeOff } from "lucide-react";
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
        className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-semibold text-gray-800 outline-none transition-all ${
          isEditing 
            ? "border-gray-900 ring-2 ring-gray-900/8" 
            : "border-gray-300 hover:border-gray-400 cursor-text"
        }`}
        disabled={loading}
      />
      {loading && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">
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
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"superadmin" | "admin" | "head_user" | "user">("user");
  const [newProvince, setNewProvince] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName || !newPassword) {
      setErrorMsg("กรุณากรอกอีเมล ชื่อ และรหัสผ่านให้ครบถ้วนค่ะ");
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
          password: newPassword,
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
        setNewPassword("");
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
      <div className="flex justify-between items-center bg-gray-50 p-4.5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
            <Users className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              แผงควบคุมสิทธิ์บัญชีผู้ใช้ระบบ (User Authentication Management)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-none">
              จัดการสิทธิ์การเข้าถึง ดูข้อมูลต้นทุน และจัดกลุ่มจังหวัดให้กับทีมช่าง/ทีมเซลส์ NT
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchUsersList}
          className="blocks-btn-secondary py-1.5 px-3 inline-flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gray-900" : ""}`} />
          <span>ดึงข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ฟอร์มเพิ่มผู้ใช้ใหม่ */}
      <form onSubmit={handleCreateUser} className="bg-white border border-gray-200 p-4 rounded-xl space-y-4 shadow-sm">
        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
          ➕ เพิ่มบัญชีผู้ใช้งานระบบรายใหม่
        </h5>
        
        {/* แถวที่ 1: Username, Password, ชื่อ-นามสกุล */}
        <div className="grid grid-cols-3 gap-3">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              required
              placeholder="username"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="blocks-input font-mono"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">รหัสผ่าน</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                placeholder="ตั้งรหัสผ่าน"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="blocks-input pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">ชื่อ-นามสกุลจริง</label>
            <input
              type="text"
              required
              placeholder="เช่น สมชาย ใจดี"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="blocks-input"
            />
          </div>
        </div>

        {/* แถวที่ 2: Role, กลุ่มงาน, ปุ่มเพิ่ม */}
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* Role Select */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">ระดับสิทธิ์</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="blocks-input font-semibold cursor-pointer"
            >
              <option value="user">👤 USER</option>
              <option value="head_user">👥 HEAD USER</option>
              <option value="admin">🛡️ ADMIN</option>
              <option value="superadmin">👑 SUPER ADMIN</option>
            </select>
          </div>

          {/* Group/Province */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">กลุ่ม / ส่วนงาน</label>
            <input
              type="text"
              placeholder="เช่น อุดรธานี"
              value={newProvince}
              onChange={(e) => setNewProvince(e.target.value)}
              className="blocks-input"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCreating}
              className="blocks-btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              {isCreating ? "กำลังเพิ่ม..." : "➕ เพิ่มบัญชีผู้ใช้"}
            </button>
          </div>
        </div>

      </form>

      {/* Search Input Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="ค้นหาตามรายชื่อ อีเมล ระดับสิทธิ์ หรือกลุ่มงาน..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/8 bg-white rounded-lg text-xs font-medium text-gray-900 transition-all outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-550 uppercase tracking-wide">
                <th className="px-4 py-3">รายละเอียดผู้ใช้งาน</th>
                <th className="px-4 py-3">UUID บัญชี</th>
                <th className="px-4 py-3">กลุ่ม / ส่วนงาน</th>
                <th className="px-4 py-3">ระดับสิทธิ์ (Role)</th>
                <th className="px-4 py-3 text-right">ปรับระดับสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  let roleBadgeStyle = "bg-gray-100 text-gray-700 border border-gray-200";
                  if (u.role === "superadmin") roleBadgeStyle = "bg-purple-50 border border-purple-200 text-purple-700";
                  else if (u.role === "admin") roleBadgeStyle = "bg-blue-50 border border-blue-200 text-blue-700";
                  else if (u.role === "head_user") roleBadgeStyle = "bg-amber-50 border border-amber-200 text-amber-700";

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-250">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{u.display_name || "ไม่ระบุชื่อ"}</span>
                            {u.email && <span className="text-[10px] text-gray-500 font-mono block leading-none my-0.5">{u.email}</span>}
                            <span className="text-[9px] text-gray-400 block font-sans">อัปเดตเมื่อ: {new Date(u.updated_at).toLocaleString("th-TH")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-gray-450 select-all">
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${roleBadgeStyle}`}>
                          {u.role === "head_user" ? "HEAD USER" : u.role || "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                          className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:border-gray-900 hover:border-gray-400 cursor-pointer shadow-sm"
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
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs font-medium">
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
