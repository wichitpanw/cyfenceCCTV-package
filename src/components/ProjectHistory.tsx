import React, { useState } from "react";
import { FolderKanban, Search, Trash2, Calendar, ArrowUpRight, PlusCircle } from "lucide-react";
import { ProjectSurvey, CameraPoint } from "../types";

// ฟังก์ชันคำนวณค่าใช้จ่ายรายเดือนที่ลูกค้าต้องจ่าย (เหมือนกับ Step6Pricing)
function calcMonthlyTotal(proj: ProjectSurvey): number {
  const subtotal = proj.pricingItems.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
  const beforeVat = Math.max(0, subtotal - proj.discount);

  // ค่าผ่อนอุปกรณ์ 3 ปี (กำไร 40% + ดอกเบี้ยแฟลต 8%/ปี)
  const leasePrincipal = beforeVat * 1.4;
  const leaseInterest = leasePrincipal * 0.08 * 3;
  const leaseMonthlyPayment = (leasePrincipal + leaseInterest) / 36;

  // ค่าเช่าวงจร NT Links รายเดือน
  const pointsList: CameraPoint[] = proj.cameraPoints || [];
  const totalFieldLinksPrice = pointsList.reduce((sum, pt) => {
    let cams = 1;
    if (pt.selectedSet === "Set 2") cams = 2;
    else if (pt.selectedSet === "Set 3") cams = 3;
    else if (pt.selectedSet === "Set 4") cams = 4;
    const speed = cams * 5;
    const tier = [
      { speed: 10, price: 640 }, { speed: 20, price: 720 },
      { speed: 30, price: 770 }, { speed: 50, price: 860 },
      { speed: 100, price: 1150 },
    ].find(t => t.speed >= speed) || { price: 640 };
    return sum + tier.price;
  }, 0);

  const totalCams = pointsList.reduce((sum, pt) => {
    if (pt.selectedSet === "Set 2") return sum + 2;
    if (pt.selectedSet === "Set 3") return sum + 3;
    if (pt.selectedSet === "Set 4") return sum + 4;
    return sum + 1;
  }, 0);
  const speed = (totalCams > 0 ? totalCams : 1) * 5;
  const centerTier = [
    { speed: 10, price: 640 }, { speed: 20, price: 720 },
    { speed: 30, price: 770 }, { speed: 50, price: 860 },
    { speed: 100, price: 1150 }, { speed: 150, price: 1440 },
    { speed: 200, price: 1730 }, { speed: 300, price: 2310 },
    { speed: 400, price: 2750 }, { speed: 500, price: 3180 },
  ].find(t => t.speed >= speed) || { price: 3180 };

  const totalMonthlyPrice = totalFieldLinksPrice + centerTier.price;
  const grandMonthlyBeforeVat = leaseMonthlyPayment + totalMonthlyPrice;
  const vatAmount = proj.vatRate > 0 ? grandMonthlyBeforeVat * (proj.vatRate / 100) : 0;
  return grandMonthlyBeforeVat + vatAmount;
}


interface ProjectHistoryProps {
  projects: ProjectSurvey[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  currentProjectId: string | null;
  isCloudSyncActive?: boolean;
  costLastUpdated?: string;
  userRole?: string;
  currentUserId?: string | null;
}

export default function ProjectHistory({
  projects,
  onLoadProject,
  onDeleteProject,
  onNewProject,
  currentProjectId,
  isCloudSyncActive = false,
  costLastUpdated,
  userRole = "user",
  currentUserId = null,
}: ProjectHistoryProps) {
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");

  // สิทธิ์ที่แสดงได้ทั้งหมด
  const canSeeAllProjects = userRole === "superadmin" || userRole === "admin";
  // สิทธิ์ที่มองเห็นราคาต้นทุนได้
  const canSeeCost = userRole === "superadmin" || userRole === "admin";

  // กรองโปรเจคตามสิทธิ์ผู้ใช้ (Frontend filter เพิ่มเติม ป้องกันกรณี RLS ถูก disable)
  const roleFilteredProjects = canSeeAllProjects
    ? projects
    : userRole === "head_user"
    ? projects // head_user: Backend กรองด้วย province แล้ว แสดงทั้งหมดที่ได้รับมา
    : projects.filter((p) => {
        // user: เห็นเฉพาะงานที่ตัวเองสร้างเท่านั้น (ตรวจจาก createdBy field)
        if (!currentUserId) return false;
        const proj = p as any;
        if (proj.createdBy) return proj.createdBy === currentUserId;
        if (proj.created_by) return proj.created_by === currentUserId;
        // ถ้าไม่มีข้อมูล createdBy เลย (งานเก่า) ให้ซ่อนไปก่อนเพื่อความปลอดภัย
        return false;
      });

  // Extract unique provinces present in history list
  const uniqueProvinces = [
    "all",
    ...Array.from(new Set(roleFilteredProjects.map((p) => p.customerInfo.province).filter(Boolean))),
  ];

  const filtered = roleFilteredProjects.filter((p) => {
    const matchesSearch =
      p.customerInfo.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerInfo.projectName.toLowerCase().includes(search.toLowerCase()) ||
      (p.customerInfo.province &&
        p.customerInfo.province.toLowerCase().includes(search.toLowerCase()));

    const matchesProvince =
      selectedProvince === "all" || p.customerInfo.province === selectedProvince;

    return matchesSearch && matchesProvince;
  });

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 h-auto flex flex-col justify-between" id="project-history-panel">
      <div className="space-y-4">
        {/* Header and Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-150 gap-2">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-gray-700 shrink-0" />
            <h3 className="font-semibold text-xs text-gray-900 uppercase tracking-wider leading-none">
              ประวัติงานสำรวจ
            </h3>
          </div>
          <button
            type="button"
            onClick={onNewProject}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 cursor-pointer leading-tight shrink-0 whitespace-nowrap self-start sm:self-center"
            title={costLastUpdated ? `ราคาต้นทุนล่าสุด: ${costLastUpdated}` : undefined}
          >
            <div className="inline-flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>เปิดไฟล์งานใหม่</span>
            </div>
            {canSeeCost && costLastUpdated && (
              <span className="text-[8px] text-gray-400 font-normal">
                ราคา ณ {costLastUpdated}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            id="history-search-input"
            type="text"
            placeholder="ค้นหาชื่อลูกค้า / ชื่อโครงการ / จังหวัด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/8 rounded-lg text-xs text-gray-900 placeholder-gray-400 outline-none transition-all"
          />
        </div>

        {/* Province Filter Dropdown */}
        {uniqueProvinces.length > 1 && (
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs select-none">
            <span className="text-gray-600 font-semibold shrink-0">📍 จังหวัด:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="grow bg-white border border-gray-300 hover:border-gray-400 focus:border-gray-900 rounded px-1.5 py-0.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">ทั้งหมด ({roleFilteredProjects.length})</option>
              {uniqueProvinces
                .filter((p) => p !== "all")
                .map((prov) => {
                  const count = roleFilteredProjects.filter(
                    (p) => p.customerInfo.province === prov
                  ).length;
                  return (
                    <option key={prov} value={prov}>
                      {prov} ({count})
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        {/* List of projects */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
          {filtered.length > 0 ? (
            filtered.map((proj) => {
              const isActive = proj.id === currentProjectId;
              const subtotal = proj.pricingItems.reduce(
                (acc, curr) => acc + curr.quantity * curr.unitPrice,
                0
              );
              const monthlyTotal = calcMonthlyTotal(proj);

              return (
                <div
                  key={proj.id}
                  onClick={() => onLoadProject(proj.id)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isActive
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`grow text-xs font-semibold whitespace-normal break-words leading-tight ${
                      isActive ? "text-white" : "text-gray-900"
                    }`}>
                      {proj.customerInfo.projectName || "โครงการเว้นว่าง"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className={`p-1 rounded transition-colors shrink-0 cursor-pointer ${
                        isActive 
                          ? "text-gray-400 hover:bg-white/10 hover:text-red-400" 
                          : "text-gray-400 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <strong className={`block text-xs font-semibold mt-1 whitespace-normal break-words leading-snug ${
                    isActive ? "text-gray-200" : "text-gray-800"
                  }`}>
                    {proj.customerInfo.customerName || "ไม่ระบุชื่อบริษัท"}
                  </strong>

                  {/* Surveyor info */}
                  {proj.customerInfo.surveyorName && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 text-[8px] font-bold uppercase ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}>
                        <span>
                          {proj.customerInfo.surveyorName.substring(0, 2)}
                        </span>
                      </div>
                      <span className={`truncate font-medium ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                        {proj.customerInfo.surveyorName}
                      </span>
                      {proj.customerInfo.surveyorPhone && (
                        <span className={`shrink-0 ${isActive ? "text-gray-400" : "text-gray-400"}`}>
                          · {proj.customerInfo.surveyorPhone}
                        </span>
                      )}
                    </div>
                  )}
                  {proj.customerInfo.surveyorDepartment && (
                    <div className={`text-[10px] pl-6 ${isActive ? "text-gray-400" : "text-gray-400"}`}>
                      {proj.customerInfo.surveyorDepartment}
                    </div>
                  )}

                  <div className={`flex items-center justify-between text-xs mt-2.5 pt-2.5 border-t ${
                    isActive ? "border-white/10 text-gray-400" : "border-gray-100 text-gray-400"
                  }`}>
                    <span className="flex flex-wrap items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{proj.createdAt.split("T")[0]}</span>
                      {proj.customerInfo.province && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide font-sans shrink-0 ${
                          isActive ? "bg-white/15 text-gray-200" : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                          {proj.customerInfo.province}
                        </span>
                      )}
                      {canSeeAllProjects && proj.creatorName && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide font-sans shrink-0 uppercase ${
                          isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`} title={`สร้างโดย ID: ${proj.createdBy || "Unknown"}`}>
                          👤 {proj.creatorName}
                        </span>
                      )}
                    </span>
                    {/* แสดงราคาต้นทุนเฉพาะ superadmin และ admin เท่านั้น */}
                    {canSeeCost && (
                      <strong className={`text-xs font-semibold ${isActive ? "text-white" : "text-gray-900"}`}>
                        ฿{subtotal.toLocaleString("th-TH")}
                      </strong>
                    )}
                  </div>

                  {/* ราคารายเดือนที่ลูกค้าต้องจ่าย — แสดงให้ทุก role เห็น */}
                  {monthlyTotal > 0 && (
                    <div className={`mt-2.5 flex items-center justify-between rounded-lg px-2.5 py-1.5 border ${
                      isActive 
                        ? "bg-white/10 border-white/20" 
                        : "bg-gray-50 border-gray-200"
                    }`}>
                      <span className={`text-[10px] font-medium ${isActive ? "text-gray-300" : "text-gray-600"}`}>
                        💳 ลูกค้าจ่ายต่อเดือน
                      </span>
                      <strong className={`text-xs font-bold font-mono ${isActive ? "text-white" : "text-gray-900"}`}>
                        ฿{monthlyTotal.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        <span className={`text-[9px] font-normal ${isActive ? "text-gray-400" : "text-gray-500"}`}>/เดือน</span>
                      </strong>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-400 border border-dashed rounded-lg border-gray-200 text-xs">
              {userRole === "user"
                ? "ยังไม่มีใบงานที่คุณสร้างไว้ค่ะ กดปุ่ม 'เปิดไฟล์งานใหม่' เพื่อเริ่มต้น"
                : "ยังไม่มีใบงานใดบันทึกไว้ในเบราว์เซอร์นี้"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
