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
  MapPin,
  PieChart
} from "lucide-react";
import { ProjectSurvey, CameraPoint } from "../types";

// Helper function to calculate monthly payments (matching ProjectHistory.tsx)
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
  ].find(t => t.speed >= speed) || { speed: 500, price: 3180 };

  const totalMonthlyPrice = totalFieldLinksPrice + centerTier.price;
  const grandMonthlyBeforeVat = leaseMonthlyPayment + totalMonthlyPrice;
  const vatAmount = proj.vatRate > 0 ? grandMonthlyBeforeVat * (proj.vatRate / 100) : 0;
  return grandMonthlyBeforeVat + vatAmount;
}

interface DashboardViewProps {
  projects: ProjectSurvey[];
  onBack: () => void;
  onLoadProject: (id: string) => void;
}

export default function DashboardView({ projects, onBack, onLoadProject }: DashboardViewProps) {
  // Independent toggles for each component window on the dashboard (default is "delivered")
  const [totalProjFilter, setTotalProjFilter] = React.useState<"delivered" | "presented">("delivered");
  const [avgCamFilter, setAvgCamFilter] = React.useState<"delivered" | "presented">("delivered");
  const [totalMonthlyFilter, setTotalMonthlyFilter] = React.useState<"delivered" | "presented">("delivered");
  const [avgMonthlyFilter, setAvgMonthlyFilter] = React.useState<"delivered" | "presented">("delivered");
  
  const [provinceFilter, setProvinceFilter] = React.useState<"delivered" | "presented">("delivered");
  const [brandFilter, setBrandFilter] = React.useState<"delivered" | "presented">("delivered");
  const [recentFilter, setRecentFilter] = React.useState<"delivered" | "presented">("delivered");

  // Helper helper to filter list by status
  const filterByStatus = (list: ProjectSurvey[], status: "delivered" | "presented") => {
    return list.filter(p => status === "delivered" ? p.status === "delivered" : p.status !== "delivered");
  };

  // 1. Calculate General Stats independently
  const totalProjList = filterByStatus(projects, totalProjFilter);
  const totalProjCount = totalProjList.length;

  const avgCamList = filterByStatus(projects, avgCamFilter);
  const avgCamCount = avgCamList.reduce((acc, proj) => {
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
  const avgCameras = avgCamList.length > 0 ? avgCamCount / avgCamList.length : 0;

  const totalMonthlyList = filterByStatus(projects, totalMonthlyFilter);
  const totalMonthlyValue = totalMonthlyList.reduce((acc, proj) => acc + calcMonthlyTotal(proj), 0);

  const avgMonthlyList = filterByStatus(projects, avgMonthlyFilter);
  const avgMonthlyValue = avgMonthlyList.length > 0 
    ? avgMonthlyList.reduce((acc, proj) => acc + calcMonthlyTotal(proj), 0) / avgMonthlyList.length 
    : 0;

  // 2. Province distribution
  const provinceList = filterByStatus(projects, provinceFilter);
  const provinceCounts: Record<string, number> = {};
  const provinceValues: Record<string, number> = {};
  provinceList.forEach(proj => {
    const prov = proj.customerInfo.province || "ไม่ระบุจังหวัด";
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
    provinceValues[prov] = (provinceValues[prov] || 0) + calcMonthlyTotal(proj);
  });
  const sortedProvinces = Object.entries(provinceCounts)
    .map(([name, count]) => ({
      name,
      count,
      value: provinceValues[name] || 0
    }))
    .sort((a, b) => b.count - a.count);

  // 3. Brand distribution
  const brandList = filterByStatus(projects, brandFilter);
  const brandCounts: Record<string, number> = {};
  brandList.forEach(proj => {
    const brand = proj.requirements?.cameraBrand || "Hikvision";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  // Recent Projects requests
  const recentList = filterByStatus(projects, recentFilter);

  // Mini Switcher component for premium micro-interactions inside windows
  const WindowSwitcher = ({ 
    value, 
    onChange 
  }: { 
    value: "delivered" | "presented", 
    onChange: (val: "delivered" | "presented") => void 
  }) => (
    <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-200 flex items-center gap-0.5 text-[9px] font-bold font-mono ml-2 shrink-0">
      <button
        type="button"
        onClick={() => onChange("delivered")}
        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          value === "delivered" 
            ? "bg-white text-emerald-600 shadow-2xs border border-gray-200" 
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        ส่งมอบแล้ว
      </button>
      <button
        type="button"
        onClick={() => onChange("presented")}
        className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
          value === "presented" 
            ? "bg-white text-gray-800 shadow-2xs border border-gray-200" 
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        นำเสนอ
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
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
          <p className="text-xs text-gray-400 pl-8">วิเคราะห์ข้อมูลความต้องการและการส่งมอบระบบ CCTV ในระบบคลาวด์แยกตามแต่ละหน้าต่างย่อย</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {/* Quick sync all switcher */}
          <div className="bg-gray-150 p-1 rounded-xl flex items-center gap-1.5 border border-gray-250 text-[10px] font-bold">
            <span className="text-gray-500 pl-1">⚡ สลับทั้งหมด:</span>
            <button
              type="button"
              onClick={() => {
                setTotalProjFilter("delivered");
                setAvgCamFilter("delivered");
                setTotalMonthlyFilter("delivered");
                setAvgMonthlyFilter("delivered");
                setProvinceFilter("delivered");
                setBrandFilter("delivered");
                setRecentFilter("delivered");
              }}
              className="px-2 py-1 bg-white text-emerald-600 hover:text-emerald-700 rounded-lg shadow-2xs border border-gray-200 cursor-pointer"
            >
              📦 ส่งมอบ
            </button>
            <button
              type="button"
              onClick={() => {
                setTotalProjFilter("presented");
                setAvgCamFilter("presented");
                setTotalMonthlyFilter("presented");
                setAvgMonthlyFilter("presented");
                setProvinceFilter("presented");
                setBrandFilter("presented");
                setRecentFilter("presented");
              }}
              className="px-2 py-1 bg-white text-gray-700 hover:text-gray-900 rounded-lg shadow-2xs border border-gray-200 cursor-pointer"
            >
              📢 นำเสนอ
            </button>
          </div>

          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าออกแบบ</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">โครงการทั้งหมด</span>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight block font-mono">
                {totalProjCount}
              </span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>📊 รวมใบงานในระบบ</span>
            <WindowSwitcher value={totalProjFilter} onChange={setTotalProjFilter} />
          </div>
        </div>

        {/* Avg proposed Cameras */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">เฉลี่ยกล้องต่อโครงการ</span>
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight block font-mono">
                {avgCameras.toFixed(1)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <Camera className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>📹 เฉลี่ยจำนวนกล้อง</span>
            <WindowSwitcher value={avgCamFilter} onChange={setAvgCamFilter} />
          </div>
        </div>

        {/* Total proposed Monthly lease */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ยอดเช่าต่อเดือนรวมทั้งหมด</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block font-mono">
                ฿{totalMonthlyValue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>💳 ยอดเช่ารายเดือนรวม</span>
            <WindowSwitcher value={totalMonthlyFilter} onChange={setTotalMonthlyFilter} />
          </div>
        </div>

        {/* Average proposed Monthly lease per project */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-sm">
          <div className="flex justify-between items-start">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ค่าเฉลี่ยยอดเช่าต่อเดือน</span>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight block font-mono">
                ฿{avgMonthlyValue.toLocaleString("th-TH", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-700">
              <Layers className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
            <span>📏 ยอดเช่าเฉลี่ยรายโครงการ</span>
            <WindowSwitcher value={avgMonthlyFilter} onChange={setAvgMonthlyFilter} />
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Columns: Provinces Stats & Brand Distribution */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Province table list */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">📍 สัดส่วนความต้องการรายจังหวัด</h3>
              </div>
              <WindowSwitcher value={provinceFilter} onChange={setProvinceFilter} />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-gray-700">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-2.5">จังหวัด</th>
                    <th className="py-2.5 text-center">จำนวนโครงการ</th>
                    <th className="py-2.5 text-right">ยอดเช่าต่อเดือนรวม</th>
                    <th className="py-2.5 text-right w-36">สัดส่วนเปอร์เซ็นต์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {sortedProvinces.map((prov, index) => {
                    const totalProjs = provinceList.length;
                    const percent = totalProjs > 0 ? (prov.count / totalProjs) * 100 : 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 font-semibold text-gray-900">{prov.name}</td>
                        <td className="py-3 text-center font-mono font-bold text-gray-800">{prov.count}</td>
                        <td className="py-3 text-right font-mono text-gray-800">฿{prov.value.toLocaleString("th-TH", { maximumFractionDigits: 0 })}/เดือน</td>
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
                      <td colSpan={4} className="py-6 text-center text-gray-400">ไม่มีข้อมูลโครงการติดตั้งในระบบคลาวด์สำหรับสถานะนี้</td>
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
              <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">🏷️ แบรนด์กล้องยอดนิยม</h3>
                </div>
                <WindowSwitcher value={brandFilter} onChange={setBrandFilter} />
              </div>
              <div className="space-y-3 pt-2">
                {Object.entries(brandCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count], index) => {
                    const totalBrands = brandList.length;
                    const percent = totalBrands > 0 ? (count / totalBrands) * 100 : 0;
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
                  <p className="text-xs text-gray-400 text-center py-4">ไม่มีข้อมูลแบรนด์กล้องสำหรับสถานะนี้</p>
                )}
              </div>
            </div>

            {/* Project Status Ratio - Overall */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 pb-1 border-b border-gray-100">
                <PieChart className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">📊 สัดส่วนสถานะโครงการรวม</h3>
              </div>
              
              {(() => {
                const presentedCount = projects.filter(p => p.status !== "delivered").length;
                const deliveredCount = projects.filter(p => p.status === "delivered").length;
                const total = presentedCount + deliveredCount;
                const presentedPercent = total > 0 ? (presentedCount / total) * 100 : 0;
                const deliveredPercent = total > 0 ? (deliveredCount / total) * 100 : 0;

                const presentedColor = "#3f3f46"; // zinc-700
                const deliveredColor = "#10b981"; // emerald-500

                return (
                  <div className="flex flex-col items-center justify-center gap-4 py-1 pt-2">
                    {total > 0 ? (
                      <>
                        <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-inner border border-gray-200/50"
                             style={{
                                background: `conic-gradient(${deliveredColor} 0% ${deliveredPercent}%, ${presentedColor} ${deliveredPercent}% 100%)`
                             }}
                        >
                          <div className="w-18 h-18 rounded-full bg-white flex flex-col items-center justify-center shadow-xs">
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">ทั้งหมด</span>
                            <span className="text-lg font-extrabold text-gray-900 font-mono leading-none">{total}</span>
                          </div>
                        </div>

                        <div className="w-full space-y-1.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: presentedColor }} />
                              📢 นำเสนอ (Presented)
                            </span>
                            <span className="font-bold text-gray-900 font-mono">{presentedCount} ({presentedPercent.toFixed(0)}%)</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: deliveredColor }} />
                              📦 ส่งมอบแล้ว (Delivered)
                            </span>
                            <span className="font-bold text-gray-900 font-mono">{deliveredCount} ({deliveredPercent.toFixed(0)}%)</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 text-center py-10 w-full">ยังไม่มีโครงการในระบบ</p>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>

        </div>

        {/* Right 1 Column: Recent Projects requests */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 min-h-[460px]">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-gray-700" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider font-mono">📅 โครงการล่าสุด</h3>
              </div>
              <WindowSwitcher value={recentFilter} onChange={setRecentFilter} />
            </div>
            
            <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1 pt-2">
              {recentList.slice(0, 5).map((proj) => {
                const monthlyTotal = calcMonthlyTotal(proj);
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
                      <span className="text-[9px] text-gray-400 font-mono">ลูกค้าจ่ายต่อเดือน:</span>
                      <strong className="text-xs font-extrabold text-gray-800 font-mono">
                        ฿{monthlyTotal.toLocaleString("th-TH", { maximumFractionDigits: 0 })}/เดือน
                      </strong>
                    </div>
                  </div>
                );
              })}
              {recentList.length === 0 && (
                <div className="p-10 text-center text-xs text-gray-400 border border-dashed rounded-xl border-gray-200">
                  ไม่มีโครงการติดตั้งในระบบคลาวด์สำหรับสถานะนี้
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
