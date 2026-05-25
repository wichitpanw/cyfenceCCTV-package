import React, { useState } from "react";
import { FolderKanban, Search, Trash2, Calendar, FileType2, FileText, ArrowUpRight, PlusCircle, CheckCircle } from "lucide-react";
import { ProjectSurvey } from "../types";

interface ProjectHistoryProps {
  projects: ProjectSurvey[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onNewProject: () => void;
  currentProjectId: string | null;
  isCloudSyncActive?: boolean;
  costLastUpdated?: string;
}

export default function ProjectHistory({
  projects,
  onLoadProject,
  onDeleteProject,
  onNewProject,
  currentProjectId,
  isCloudSyncActive = false,
  costLastUpdated
}: ProjectHistoryProps) {
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");

  // Extract unique provinces present in history list
  const uniqueProvinces = [
    "all",
    ...Array.from(new Set(projects.map(p => p.customerInfo.province).filter(Boolean)))
  ];

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.customerInfo.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerInfo.projectName.toLowerCase().includes(search.toLowerCase()) ||
      (p.customerInfo.province && p.customerInfo.province.toLowerCase().includes(search.toLowerCase()));

    const matchesProvince = selectedProvince === "all" || p.customerInfo.province === selectedProvince;

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
            {costLastUpdated && (
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
              <option value="all">ทั้งหมด ({projects.length})</option>
              {uniqueProvinces.filter(p => p !== "all").map((prov) => {
                const count = projects.filter(p => p.customerInfo.province === prov).length;
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
              const subtotal = proj.pricingItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
              
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
                      <span className="truncate font-medium text-zinc-600">{proj.customerInfo.surveyorName}</span>
                      {proj.customerInfo.surveyorPhone && (
                        <span className="shrink-0 text-zinc-400">· {proj.customerInfo.surveyorPhone}</span>
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
                    <strong className="text-zinc-900 text-xs font-semibold">
                      ฿{subtotal.toLocaleString("th-TH")}
                    </strong>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-zinc-400 border border-dashed rounded-xl border-zinc-200 text-[11px]">
              ยังไม่มีใบงานใดบันทึกไว้ในเบราว์เซอร์นี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
