import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Camera, 
  Globe, 
  Boxes, 
  ArrowLeft,
  Briefcase,
  Layers,
  MapPin
} from "lucide-react";
import { ProjectSurvey } from "../types";

interface DashboardViewProps {
  projects: ProjectSurvey[];
  onBack: () => void;
  onLoadProject: (id: string) => void;
}

export default function DashboardView({ projects, onBack, onLoadProject }: DashboardViewProps) {
  // 1. Calculate General Stats
  const totalProjects = projects.length;
  
  // Total proposed cameras
  const totalCameras = projects.reduce((acc, proj) => {
    const pointsList = proj.cameraPoints || [];
    if (pointsList.length > 0) {
      const cams = pointsList.reduce((sum, pt) => {
        if (pt.selectedSet === "Set 2") return sum + 2;
        if (pt.selectedSet === "Set 3") return sum + 3;
        if (pt.selectedSet === "Set 4") return sum + 4;
        return sum + 1;
      }, 0);
      return acc + cams;
    }
    return acc + (proj.requirements?.cameraCount || 0);
  }, 0);

  // Total BOM value
  const totalValue = projects.reduce((acc, proj) => {
    const subtotal = proj.pricingItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return acc + Math.max(0, subtotal - proj.discount);
  }, 0);

  // Average Project Value
  const avgValue = totalProjects > 0 ? totalValue / totalProjects : 0;

  // 2. Province distribution
  const provinceCounts: Record<string, number> = {};
  const provinceValues: Record<string, number> = {};
  
  projects.forEach(proj => {
    const prov = proj.customerInfo.province || "ไม่ระบุจังหวัด";
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
    
    const subtotal = proj.pricingItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const value = Math.max(0, subtotal - proj.discount);
    provinceValues[prov] = (provinceValues[prov] || 0) + value;
  });

  const sortedProvinces = Object.entries(provinceCounts)
    .map(([name, count]) => ({
      name,
      count,
      value: provinceValues[name] || 0
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Brand distribution
  const brandCounts: Record<string, number> = {};
  projects.forEach(proj => {
    const brand = proj.requirements?.cameraBrand || "Hikvision";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  // 4. Pole Types distribution
  const poleCounts: Record<string, number> = {
    "เสาเหล็ก 4 เมตร": 0,
    "เสาปูน 8 เมตร": 0,
    "ไม่ติดตั้งเสา": 0
  };
  projects.forEach(proj => {
    const pointsList = proj.cameraPoints || [];
    pointsList.forEach(pt => {
      if (pt.poleType === "เสาเหล็กกัลวาไนซ์ 4 เมตร") {
        poleCounts["เสาเหล็ก 4 เมตร"]++;
      } else if (pt.poleType === "เสาปูน 8 เมตร") {
        poleCounts["เสาปูน 8 เมตร"]++;
      } else {
        poleCounts["ไม่ติดตั้งเสา"]++;
      }
    });
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
              title="ย้อนกลับไปหน้าสำรวจ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              📊 แผงควบคุมวิเคราะห์ภาพรวม (Project Dashboard)
            </h2>
          </div>
          <p className="text-xs text-gray-400 pl-8">วิเคราะห์ข้อมูลการขอโครงการสำรวจติดตั้งระบบ CCTV ทั้งหมดในระบบคลาวด์</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปหน้าออกแบบโครงการ</span>
        </button>
      </div>

      {/* 4 Stats Cards Row - Blocks.so premium cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">โครงการทั้งหมด</span>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight block font-mono">
                {totalProjects}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
            📊 จำนวนความต้องการเสนอราคาในระบบ
          </div>
        </div>

        {/* Total proposed Cameras */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">กล้องสะสมทั้งหมด</span>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight block font-mono">
                {totalCameras}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
            📹 รวมทุกจุดติดตั้งกล้องย่อยปลายทาง
          </div>
        </div>

        {/* Total proposed Value */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">มูลค่าเสนอราคารวม</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block font-mono">
                ฿{totalValue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
            💰 มูลค่าฮาร์ดแวร์และค่าติดตั้งรวมทั้งหมด
          </div>
        </div>

        {/* Average Project Value */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ค่าเฉลี่ยโครงการ</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block font-mono">
                ฿{avgValue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500">
            📏 ขนาดงบประมาณเฉลี่ยต่อหนึ่งโครงการ
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Provinces Stats & Brand Distribution */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Province table list */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-1.5 pb-1">
              <MapPin className="w-4 h-4 text-gray-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">📍 สัดส่วนความต้องการรายจังหวัด</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-2.5">จังหวัด</th>
                    <th className="py-2.5 text-center">จำนวนโครงการ</th>
                    <th className="py-2.5 text-right">งบประมาณรวมเสนอราคา</th>
                    <th className="py-2.5 text-right w-36">สัดส่วนเปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {sortedProvinces.map((prov, index) => {
                    const percent = totalProjects > 0 ? (prov.count / totalProjects) * 100 : 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 font-semibold text-gray-900">{prov.name}</td>
                        <td className="py-3 text-center font-mono font-bold text-gray-800">{prov.count}</td>
                        <td className="py-3 text-right font-mono text-gray-800">฿{prov.value.toLocaleString("th-TH", { maximumFractionDigits: 0 })}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center gap-2">
                            <div className="grow bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                              <div 
                                className="bg-gray-900 h-full rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold font-mono text-gray-500 w-8 shrink-0">{percent.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedProvinces.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">ยังไม่มีข้อมูลโครงการบันทึกในระบบคลาวด์</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick analysis components distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Brand Distribution */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 pb-1">
                <Boxes className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">🏷️ แบรนด์กล้องยอดนิยม</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(brandCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count], index) => {
                    const percent = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-900">{name}</span>
                          <span className="font-bold text-gray-500 font-mono">{count} โครงการ ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                          <div 
                            className="bg-gray-900 h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {Object.keys(brandCounts).length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">ไม่มีข้อมูลแบรนด์กล้อง</p>
                )}
              </div>
            </div>

            {/* Pole Installation Distribution */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 pb-1">
                <Globe className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">🗼 การปักเสาอุปกรณ์ปลายทาง</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(poleCounts).map(([name, count], index) => {
                  const totalPoles = Object.values(poleCounts).reduce((a, b) => a + b, 0);
                  const percent = totalPoles > 0 ? (count / totalPoles) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-900">{name}</span>
                        <span className="font-bold text-gray-500 font-mono">{count} ต้น ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden border border-gray-200">
                        <div 
                          className="bg-gray-900 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Column: Recent Projects requests */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 min-h-[460px]">
            <div className="flex items-center gap-1.5 pb-1">
              <BarChart3 className="w-4 h-4 text-gray-700" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">📅 โครงการที่ขอเข้ามาล่าสุด</h3>
            </div>
            
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
              {projects.slice(0, 5).map((proj) => {
                const subtotal = proj.pricingItems.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
                const beforeVat = Math.max(0, subtotal - proj.discount);
                return (
                  <div
                    key={proj.id}
                    onClick={() => onLoadProject(proj.id)}
                    className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl text-left hover:bg-gray-50 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-bold text-gray-900 line-clamp-1">
                        {proj.customerInfo.projectName || "โครงการทั่วไป"}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-gray-900 text-white text-[8px] font-mono font-bold shrink-0">
                        {proj.customerInfo.province || "ทั่วไป"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>👤 {proj.customerInfo.customerName || "ไม่ระบุบริษัท"}</span>
                      <span>{proj.createdAt.split("T")[0]}</span>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-mono">BOM Subtotal:</span>
                      <strong className="text-xs font-extrabold text-gray-800 font-mono">
                        ฿{beforeVat.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
                      </strong>
                    </div>
                  </div>
                );
              })}
              {projects.length === 0 && (
                <div className="p-10 text-center text-xs text-gray-400 border border-dashed rounded-xl border-gray-200">
                  ไม่มีโครงการในระบบ
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
