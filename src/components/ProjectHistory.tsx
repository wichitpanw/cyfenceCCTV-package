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
}

export default function ProjectHistory({
  projects,
  onLoadProject,
  onDeleteProject,
  onNewProject,
  currentProjectId,
  isCloudSyncActive = false
}: ProjectHistoryProps) {
  const [search, setSearch] = useState("");

  const filtered = projects.filter(
    (p) =>
      p.customerInfo.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerInfo.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-zinc-200/75 h-auto flex flex-col justify-between" id="project-history-panel">
      <div className="space-y-4">
        {/* Header and Add button */}
        <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-1.5">
            <FolderKanban className="w-4 h-4 text-[#0071e3]" />
            <h3 className="font-semibold text-[11px] text-zinc-800 uppercase tracking-wide font-sans flex items-center gap-1.5">
              ประวัติงานสำรวจและแบบบันทึก
              <span 
                title={isCloudSyncActive ? "เชื่อมต่อ Supabase Cloud สำเร็จ" : "โหมดออฟไลน์ LocalStorage"} 
                className={`w-1.5 h-1.5 rounded-full inline-block ${isCloudSyncActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`}
              ></span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onNewProject}
            className="p-1 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-medium transition-all inline-flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            เปิดไฟล์งานใหม่
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
            placeholder="ค้นหาชื่อลูกค้า / ชื่อโครงการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-[11px] bg-zinc-50 border-zinc-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] transition-all"
          />
        </div>

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
                    <span className="text-[10px] text-[#0071e3] font-sans font-semibold truncate">
                      {proj.customerInfo.projectName || "โครงการเว้นว่าง"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(proj.id);
                      }}
                      className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <strong className="block text-xs text-zinc-800 font-semibold mt-1 truncate">
                    {proj.customerInfo.customerName || "ไม่ระบุชื่อบริษัท"}
                  </strong>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {proj.createdAt.split("T")[0]}
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

      <div className="mt-4 p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-[10px] text-zinc-500 leading-normal flex items-start gap-2">
        <span className="text-sm select-none shrink-0">{isCloudSyncActive ? "☁️" : "💾"}</span>
        <div>
          {isCloudSyncActive ? (
            <span>เชื่อมต่อคลาวด์ <strong>Supabase</strong> สำเร็จ! ข้อมูลโครงการของคุณถูกสำรองและซิงก์ออนไลน์เรียลไทม์แล้วค่ะ</span>
          ) : (
            <span>ข้อมูลโครงการและแบบร่างทั้งหมดจัดเก็บอย่างปลอดภัยบนอุปกรณ์นี้ผ่าน LocalStorage</span>
          )}
        </div>
      </div>
    </div>
  );
}
