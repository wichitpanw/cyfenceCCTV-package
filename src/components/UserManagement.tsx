import React, { useEffect, useState } from "react";
import { Users, Shield, User, UserCheck, AlertCircle, Search, RefreshCw, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";

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

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      {/* Search Input Filter */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="ค้นหาตามรายชื่อ อีเมล ระดับสิทธิ์ หรือจังหวัด..."
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
                <th className="px-4 py-3">จังหวัดกลุ่มงาน</th>
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
                            <span className="text-[9.5px] text-zinc-400 block font-mono">อัปเดตเมื่อ: {new Date(u.updated_at).toLocaleString("th-TH")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[9px] text-zinc-400 select-all">
                        {u.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={u.province || ""}
                          onChange={(e) => handleProvinceChange(u.id, e.target.value)}
                          className="px-2 py-1 bg-white border border-zinc-250 rounded-lg text-[10.5px] font-bold text-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#0071e3] hover:border-zinc-350 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- เลือกจังหวัด --</option>
                          {THAI_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
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
