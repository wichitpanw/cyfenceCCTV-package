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
    <div className="bg-white p-4 rounded-2xl border border-zinc-200/75 h-auto flex flex-col justify-between" id="project-history-panel">
      <div className="space-y-4">
        {/* Header and Add button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-zinc-100 gap-2">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-[#0071e3] shrink-0" />
            <h3 className="font-semibold text-[11px] text-zinc-800 uppercase tracking-wide font-sans leading-none">
              ประวัติงานสำรวจและแบบบันทึก
            </h3>
          </div>
          <button
            type="button"
            onClick={onNewProject}
            className="p-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-medium transition-all flex flex-col items-center gap-0.5 cursor-pointer leading-tight shrink-0 whitespace-nowrap self-start sm:self-center shadow-xs"
            title={costLastUpdated ? `ราคาต้นทุนล่าสุด: ${costLastUpdated}` : undefined}
          >
            <div className="inline-flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>เปิดไฟล์งานใหม่</span>
            </div>
            {canSeeCost && costLastUpdated && (
              <span className="text-[7px] text-zinc-400 font-normal">
                ราคา ณ {costLastUpdated}
              </span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            id="history-search-input"
            type="text"
            placeholder="ค้นหาชื่อลูกค้า / ชื่อโครงการ / จังหวัด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-[11px] bg-zinc-50 border-zinc-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] transition-all"
          />
        </div>

        {/* Province Filter Dropdown */}
        {uniqueProvinces.length > 1 && (
          <div className="flex items-center justify-between gap-2 bg-zinc-50/50 p-2 rounded-xl border border-zinc-150 text-[10px] select-none">
            <span className="text-zinc-500 font-semibold shrink-0">📍 จังหวัด:</span>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="grow bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
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
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isActive
                      ? "bg-zinc-50 border-zinc-900 shadow-xs border-l-[3px] border-l-[#0071e3]"
                      : "bg-white border-zinc-200 hover:bg-zinc-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="grow text-[10px] text-[#0071e3] font-sans font-semibold whitespace-normal break-words leading-tight">
                      {proj.customerInfo.projectName || "โครงการเว้นว่าง"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded cursor-pointer transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <strong className="block text-xs text-zinc-800 font-semibold mt-1 whitespace-normal break-words leading-snug">
                    {proj.customerInfo.customerName || "ไม่ระบุชื่อบริษัท"}
                  </strong>

                  {/* Surveyor info */}
                  {proj.customerInfo.surveyorName && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-zinc-500">
                      <div className="w-4 h-4 rounded-full bg-[#0071e3]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#0071e3] font-bold text-[7px] uppercase">
                          {proj.customerInfo.surveyorName.substring(0, 2)}
                        </span>
                      </div>
                      <span className="truncate font-medium text-zinc-600">
                        {proj.customerInfo.surveyorName}
                      </span>
                      {proj.customerInfo.surveyorPhone && (
                        <span className="shrink-0 text-zinc-400">
                          · {proj.customerInfo.surveyorPhone}
                        </span>
                      )}
                    </div>
                  )}
                  {proj.customerInfo.surveyorDepartment && (
                    <div className="mt-0.5 text-[9px] text-zinc-400 pl-5.5">
                      {proj.customerInfo.surveyorDepartment}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2.5 pt-2.5 border-t border-zinc-100/50">
                    <span className="flex flex-wrap items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{proj.createdAt.split("T")[0]}</span>
                      {proj.customerInfo.province && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-650 text-[8px] font-semibold tracking-wide font-sans shrink-0">
                          {proj.customerInfo.province}
                        </span>
                      )}
                    </span>
                    {/* แสดงราคาต้นทุนเฉพาะ superadmin และ admin เท่านั้น */}
                    {canSeeCost && (
                      <strong className="text-zinc-900 text-xs font-semibold">
                        ฿{subtotal.toLocaleString("th-TH")}
                      </strong>
                    )}
                  </div>

                  {/* ราคารายเดือนที่ลูกค้าต้องจ่าย — แสดงให้ทุก role เห็น */}
                  {monthlyTotal > 0 && (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-[#0071e3]/5 border border-[#0071e3]/15 px-2.5 py-1.5">
                      <span className="text-[9px] text-[#0071e3]/70 font-medium">
                        💳 ลูกค้าจ่ายต่อเดือน
                      </span>
                      <strong className="text-[#0071e3] text-[11px] font-bold font-mono">
                        ฿{monthlyTotal.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        <span className="text-[8px] font-normal text-[#0071e3]/60">/ด.</span>
                      </strong>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-zinc-400 border border-dashed rounded-xl border-zinc-200 text-[11px]">
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
