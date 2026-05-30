import React, { useEffect, useState } from "react";
import { Users, User, Search, RefreshCw, Layers, ShieldCheck, LayoutGrid, List, CheckCircle } from "lucide-react";
import { supabase } from "../supabaseClient";

interface UserManagementProps {
  showAlert?: (title: string, message: string) => void;
}

export default function UserManagement({ showAlert }: UserManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "diagram">("diagram"); // Default to the beautiful visual diagram board!

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

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      (u.display_name && u.display_name.toLowerCase().includes(query)) ||
      (u.id && u.id.toLowerCase().includes(query)) ||
      (u.role && u.role.toLowerCase().includes(query)) ||
      (u.province && u.province.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query))
    );
  });

  // Group users by their province / department
  const groupsMap: { [key: string]: any[] } = {};
  filteredUsers.forEach((u) => {
    const grp = u.province && u.province.trim() ? u.province.trim() : "ยังไม่จัดกลุ่มงาน";
    if (!groupsMap[grp]) {
      groupsMap[grp] = [];
    }
    groupsMap[grp].push(u);
  });

  // Sort members within each group so that Superadmins/Admins/HeadUsers are at the top (Hierarchical Tree)
  const sortMembers = (members: any[]) => {
    return [...members].sort((a, b) => {
      const getRoleWeight = (role: string) => {
        if (role === "superadmin") return 4;
        if (role === "admin") return 3;
        if (role === "head_user") return 2;
        return 1;
      };
      return getRoleWeight(b.role || "") - getRoleWeight(a.role || "");
    });
  };

  return (
    <div className="space-y-4 font-sans select-none">
      {/* Subheader info card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-4.5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              ทำเนียบบัญชีผู้ใช้งานระบบ (User Directory & Teams)
            </h4>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-none">
              ตรวจสอบสิทธิ์การเข้าถึง และส่องดูแผนผังการจัดกลุ่มจังหวัดช่าง/เซลส์แบบพรีเมียม (อ่านอย่างเดียว)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchUsersList}
          disabled={loading}
          className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-gray-900" : ""}`} />
          <span>ดึงข้อมูลล่าสุด</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-center gap-2">
          <Layers className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Input Filter & Mode Toggler */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="ค้นหาตามรายชื่อ อีเมล ระดับสิทธิ์ หรือกลุ่มงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/8 bg-white rounded-lg text-xs font-semibold text-gray-900 transition-all outline-none"
          />
        </div>

        {/* View Mode Tabs */}
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-250 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setViewMode("diagram")}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "diagram"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>แผนผังกลุ่มงาน (Visual Board)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>ตารางรายชื่อทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO VIEW MODE */}
      {viewMode === "diagram" ? (
        /* ==================== 👥 VIEW 1: HIERARCHICAL DIAGRAM ==================== */
        <div className="space-y-4">
          {Object.keys(groupsMap).length === 0 ? (
            <div className="p-12 text-center text-gray-400 border border-dashed rounded-2xl border-gray-250 text-xs">
              ไม่พบข้อมูลกลุ่มงานตามเงื่อนไขที่ค้นหาค่ะ
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(groupsMap).map(([groupName, members]) => {
                const sorted = sortMembers(members);
                const leaders = sorted.filter(m => ["superadmin", "admin", "head_user"].includes(m.role));
                const staff = sorted.filter(m => !["superadmin", "admin", "head_user"].includes(m.role));
                
                return (
                  <div key={groupName} className="bg-white border border-gray-200/80 shadow-xs rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-sm">
                    {/* Decorative side accent bar depending on group name */}
                    <div 
                      className="absolute top-0 left-0 bottom-0 w-1.5 bg-gray-900 rounded-l-2xl" 
                      style={{
                        backgroundColor: groupName === "ยังไม่จัดกลุ่มงาน" ? "#cbd5e1" : 
                                         groupName.includes("อน") ? "#8b5cf6" : 
                                         groupName.includes("ภดจ") ? "#3b82f6" : 
                                         groupName.includes("วบน") ? "#f59e0b" : "#10b981"
                      }} 
                    />
                    
                    {/* Group Title Header */}
                    <div className="flex justify-between items-center pl-2">
                      <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                        📁 กลุ่มงาน: <span className="underline decoration-2 decoration-gray-300 font-mono text-xs">{groupName}</span>
                      </span>
                      <span className="bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {members.length} รายการ
                      </span>
                    </div>
                    
                    {/* 1. Leader (Head of Group) Section */}
                    {leaders.length > 0 && (
                      <div className="flex flex-col gap-1.5 pl-2 mt-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">👑 หัวหน้ากลุ่มงาน / แอดมิน</span>
                        <div className="space-y-1.5">
                          {leaders.map(m => {
                            let roleLabel = "ADMIN";
                            let roleClass = "bg-blue-50 border-blue-200 text-blue-700";
                            if (m.role === "superadmin") {
                              roleLabel = "SUPER ADMIN";
                              roleClass = "bg-purple-50 border-purple-200 text-purple-700";
                            } else if (m.role === "head_user") {
                              roleLabel = "HEAD USER";
                              roleClass = "bg-amber-50 border-amber-200 text-amber-700";
                            }
                            
                            return (
                              <div key={m.id} className="p-2.5 bg-gray-50/50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-white border border-gray-250 flex items-center justify-center font-bold text-xs shrink-0 text-gray-700 uppercase">
                                    {(m.display_name || m.email || "U").substring(0, 1)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-gray-900 text-xs block truncate leading-tight">{m.display_name || "ไม่ระบุชื่อ"}</span>
                                    <span className="text-[9px] text-gray-400 font-mono block truncate leading-none mt-0.5">{m.email}</span>
                                  </div>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border whitespace-nowrap shrink-0 tracking-wide ${roleClass}`}>
                                  {roleLabel}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Connector line (Visual Org Tree Line) */}
                    {leaders.length > 0 && staff.length > 0 && (
                      <div className="flex justify-center my-0.5">
                        <div className="h-3 border-l-2 border-dotted border-gray-300" />
                      </div>
                    )}
                    
                    {/* 2. Staff / Surveyor Section */}
                    {staff.length > 0 && (
                      <div className="flex flex-col gap-1.5 pl-2">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">👥 ทีมปฏิบัติงาน / ผู้สำรวจ</span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {staff.map(m => (
                            <div key={m.id} className="p-2 bg-white border border-gray-150 rounded-xl flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-xs shrink-0 text-gray-500 uppercase">
                                {(m.display_name || m.email || "U").substring(0, 1)}
                              </div>
                              <div className="min-w-0 grow">
                                <span className="font-semibold text-gray-800 text-[11px] block truncate leading-tight">{m.display_name || "ไม่ระบุชื่อ"}</span>
                                <span className="text-[9px] text-gray-400 font-mono block truncate leading-none mt-0.5">{m.email}</span>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border bg-gray-50 border-gray-200 text-gray-500 whitespace-nowrap tracking-wider scale-95 origin-right">
                                USER
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ==================== 📋 VIEW 2: ALL USERS TABLE (READ-ONLY) ==================== */
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-550 uppercase tracking-wide">
                  <th className="px-4 py-3">รายละเอียดผู้ใช้งาน</th>
                  <th className="px-4 py-3">UUID บัญชี</th>
                  <th className="px-4 py-3">กลุ่ม / ส่วนงาน</th>
                  <th className="px-4 py-3 text-right">ระดับสิทธิ์ (Role)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    let roleBadgeStyle = "bg-gray-100 text-gray-700 border border-gray-200";
                    let roleLabel = "USER";
                    if (u.role === "superadmin") {
                      roleBadgeStyle = "bg-purple-50 border border-purple-200 text-purple-700";
                      roleLabel = "SUPER ADMIN";
                    } else if (u.role === "admin") {
                      roleBadgeStyle = "bg-blue-50 border border-blue-200 text-blue-700";
                      roleLabel = "ADMIN";
                    } else if (u.role === "head_user") {
                      roleBadgeStyle = "bg-amber-50 border border-amber-200 text-amber-700";
                      roleLabel = "HEAD USER";
                    }

                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-250 text-gray-600 font-bold uppercase">
                              {(u.display_name || u.email || "U").substring(0, 1)}
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
                          <span className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 font-mono">
                            {u.province || "ไม่ระบุกลุ่ม"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${roleBadgeStyle}`}>
                            {roleLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-xs font-medium">
                      {loading ? "กำลังค้นหาข้อมูลผู้ใช้ในระบบ..." : "ไม่พบรายชื่อผู้ใช้งานใดๆ ตามเงื่อนไขค้นหาค่ะ"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
