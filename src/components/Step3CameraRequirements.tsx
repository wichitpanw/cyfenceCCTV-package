import React from "react";
import { ArrowLeft, ArrowRight, Check, Layers } from "lucide-react";
import { TechRequirements, CameraPoint } from "../types";

interface Step2Props {
  data: TechRequirements;
  onChange: (data: TechRequirements) => void;
  onNext: () => void;
  onPrev: () => void;
  cameraCount: number;
  cameraPoints?: CameraPoint[];
}

const suggestedChannels = (count: number) => {
  if (count <= 8) return 8;
  if (count <= 16) return 16;
  return 32;
};

export default function Step3CameraRequirements({ data, onChange, onNext, onPrev, cameraCount, cameraPoints }: Step2Props) {
  
  const handleStorageSelect = (storage: string) => {
    onChange({ ...data, storagePackage: storage });
  };

  const handleNvrChannels = (channels: number) => {
    const pkg = channels <= 8 ? "HDD 8TB (มาตรฐานราชการ 8CH)" 
              : channels <= 16 ? "HDD 16TB (8TB x 2 ลูก มาตรฐานราชการ)" 
              : "HDD 32TB (8TB x 4 ลูก มาตรฐานราชการ)";
    onChange({ 
      ...data, 
      nvrChannels: channels,
      storagePackage: pkg
    });
  };



  return (
    <div className="space-y-6" id="step2-container">

      {/* NVR channels selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3 md:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-zinc-250 flex items-center justify-center text-[10px] text-gray-700 font-bold text-center">1</span>
            ขนาดช่องสัญญาณ NVR
          </h3>
          <p className="text-[11px] text-gray-400 mb-1 leading-normal">
            ช่องเชื่อมต่อแชนแนลหลัก (แนะนำ: <strong className="text-gray-900 font-mono">{suggestedChannels(cameraCount)}CH</strong> สำหรับกล้อง {cameraCount} ตัว)
          </p>
          <div className="grid grid-cols-3 gap-1.5 font-mono">
            {[8, 16, 32].map((ch) => {
              const isSelected = data.nvrChannels === ch;
              const isRecommended = ch === suggestedChannels(cameraCount);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleNvrChannels(ch)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-gray-900 border-transparent text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-white"
                  } ${isRecommended && !isSelected ? "ring-1 ring-gray-900/40 border-gray-900/40" : ""}`}
                  title={isRecommended ? "แนะนำสำหรับจำนวนกล้องนี้" : ""}
                >
                  {ch}CH
                  {isRecommended && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-gray-900 border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand NVR — fixed to same brand */}
        <div className="space-y-3 md:col-span-2">
          <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wide">
            ยี่ห้อเครื่องบันทึก NVR ที่ระบุร่วมกัน
          </label>
          <p className="text-xs text-gray-400">ใช้ยี่ห้อเดียวกับกล้องเพื่อความเข้ากันได้สูงสุด</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-xs">
            <Check className="w-3.5 h-3.5" />
            ยี่ห้อเดียวกับกล้อง ({data.cameraBrand})
          </div>
        </div>
      </div>

      {/* Package storage options */}
      <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-5" id="step2-storage-spec-card">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
            2
          </span>
          <div className="space-y-1 grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-gray-900">
                💾 ขนาดความจุฮาร์ดดิสก์
              </h3>
            </div>
          </div>
        </div>

        {/* Informative Grid showing targeted standard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="bg-white p-3.5 rounded-xl border border-gray-150">
            <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">เครื่องบันทึก NVR ที่เลือก</span>
            <span className="text-sm font-bold text-zinc-850 mt-1 block">{data.nvrChannels} ช่องสัญญาณ (Channels)</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-150">
            <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">รวมขนาดความจุที่ต้องใช้</span>
            <span className="text-sm font-bold text-gray-900 mt-1 block">
              {data.nvrChannels <= 8 ? "8TB" : data.nvrChannels <= 16 ? "16TB (8TB x 2 ลูก)" : "32TB (8TB x 4 ลูก)"}
            </span>
          </div>
        </div>
      </div>

      {/* selectable control room equipment section */}
      <div className="space-y-4 bg-white border border-gray-200 rounded-xl p-5" id="step2-control-room-spec-card">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
            3
          </span>
          <div className="space-y-1 grow">
            <h3 className="text-sm font-semibold text-gray-900">
              🖥️ ปรับเลือกขนาดและประเภทอุปกรณ์ห้องควบคุม (Control Room Setup)
            </h3>
            <p className="text-xs text-gray-400">เลือกปรับเปลี่ยนขนาดตู้ Rack ขนาดจอภาพ และกำลังวัตต์เครื่องสำรองไฟได้ตามต้องการ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 text-xs font-sans">
          {/* Rack selection */}
          <div className="space-y-2 relative">
            <label className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">ตู้ Server Rack 19 นิ้ว</label>
            <select
              value={data.rackType || "Rack 19 นิ้ว 6U"}
              onChange={(e) => onChange({ ...data, rackType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="Rack 19 นิ้ว 6U">ตู้ Rack 19 นิ้ว 6U</option>
              <option value="Rack 19 นิ้ว 16U">ตู้ Rack 19 นิ้ว 16U</option>
              <option value="Rack 19 นิ้ว 42U">ตู้ Rack 19 นิ้ว 42U</option>
            </select>
          </div>

          {/* Monitor selection */}
          <div className="space-y-2 relative">
            <label className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">จอแสดงผลระบบภาพ</label>
            <select
              value={data.monitorType || "จอ 27 นิ้ว"}
              onChange={(e) => onChange({ ...data, monitorType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="จอ 27 นิ้ว">จอ IPS ขนาด 27 นิ้ว</option>
              <option value="TV 55 นิ้ว">Smart TV ขนาด 55 นิ้ว</option>
            </select>
          </div>

          {/* UPS selection */}
          <div className="space-y-2 relative">
            <label className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">เครื่องสำรองไฟฟ้า UPS</label>
            <select
              value={data.upsType || "UPS 1Kva"}
              onChange={(e) => onChange({ ...data, upsType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer"
            >
              <option value="UPS 1Kva">UPS ขนาด 1000VA (1Kva)</option>
              <option value="UPS 2Kva">UPS ขนาด 2000VA (2Kva)</option>
            </select>
          </div>

          {/* Router selection checkbox */}
          <div className="space-y-2 relative flex flex-col justify-end">
            <label className="block text-gray-500 font-bold uppercase tracking-wider text-[10px]">อุปกรณ์ความปลอดภัย</label>
            <label className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg font-medium cursor-pointer transition-all grow select-none ${
              data.hasRouter !== false 
                ? "border-gray-950 bg-gray-50/50" 
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}>
              <input
                type="checkbox"
                checked={data.hasRouter !== false}
                onChange={(e) => onChange({ ...data, hasRouter: e.target.checked })}
                className="w-3.5 h-3.5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
              />
              <span className={`text-gray-700 leading-tight ${data.hasRouter !== false ? "font-semibold text-gray-900" : ""}`}>
                Router VPN
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Custom notes */}
      <div className="space-y-2 relative">
        <label className="block text-xs font-semibold text-zinc-605 uppercase tracking-wide">
          ความต้องการเพิ่มเติม / หมายเหตุทางเทคนิค
        </label>
        <textarea
          id="other-requirements-input"
          rows={3}
          placeholder="ระบุความต้องการเฉพาะตัว เช่น 'ใช้สาย Fiber Optic ระหว่างตู้เซิร์ฟเวอร์', 'ต้องการเซนเซอร์จับการเคลื่อนไหวพิเศษ'"
          value={data.otherRequirements}
          onChange={(e) => onChange({ ...data, otherRequirements: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white border-gray-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
        />
      </div>

      {/* NT Carrier Ethernet Lite (Leased Line Calculator Widget) */}
      <div className="bg-white rounded-xl p-4.5 border border-gray-200 shadow-3xs space-y-3 mt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-150">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-900">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-805 flex items-center gap-1.5 font-sans">
              🌐 วงจรเชื่อมโยงเครือข่ายต้นทางห้องควบคุม NT Carrier Ethernet Lite (ประมาณการรายเดือน)
            </h4>
            <p className="text-[10px] text-zinc-400">คำนวณความต้องการแบนด์วิดท์เข้าสู่ห้องควบคุม (5Mbps ต่อกล้อง) และราคาเช่าวงจรเครือข่ายส่วนกลางรายเดือน</p>
          </div>
        </div>

        {/* Calculations metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-gray-150 space-y-1">
            <span className="text-[9px] uppercase font-bold text-gray-550 block font-mono">จำนวนกล้องทั้งหมดในโครงการ</span>
            <div className="text-base font-black text-gray-900 font-mono">
              {(() => {
                const totalCams = (cameraPoints || []).reduce((sum, pt) => {
                  if (pt.selectedSet === "Set 1") return sum + 1;
                  if (pt.selectedSet === "Set 2") return sum + 2;
                  if (pt.selectedSet === "Set 3") return sum + 3;
                  if (pt.selectedSet === "Set 4") return sum + 4;
                  return sum + 1;
                }, 0);
                return totalCams > 0 ? totalCams : cameraCount;
              })()} <span className="text-xs font-normal text-gray-400">ตัว</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-150 space-y-1">
            <span className="text-[9px] uppercase font-bold text-gray-550 block font-mono">แบนด์วิดท์รวมเข้าห้องควบคุม</span>
            <div className="text-base font-black text-gray-900 font-mono">
              {(() => {
                const totalCams = (cameraPoints || []).reduce((sum, pt) => {
                  if (pt.selectedSet === "Set 1") return sum + 1;
                  if (pt.selectedSet === "Set 2") return sum + 2;
                  if (pt.selectedSet === "Set 3") return sum + 3;
                  if (pt.selectedSet === "Set 4") return sum + 4;
                  return sum + 1;
                }, 0);
                const count = totalCams > 0 ? totalCams : cameraCount;
                return count * 5;
              })()} <span className="text-xs font-semibold text-gray-900 font-mono">Mbps</span>
            </div>
          </div>

          <div className="bg-gray-900 p-3 rounded-xl border border-gray-900 space-y-1 text-white">
            <span className="text-[9px] uppercase font-bold text-gray-300 block font-mono">ลิงก์ต้นทางห้องควบคุม (NT)</span>
            <div className="text-base font-black text-white font-mono">
              {(() => {
                const totalCams = (cameraPoints || []).reduce((sum, pt) => {
                  if (pt.selectedSet === "Set 1") return sum + 1;
                  if (pt.selectedSet === "Set 2") return sum + 2;
                  if (pt.selectedSet === "Set 3") return sum + 3;
                  if (pt.selectedSet === "Set 4") return sum + 4;
                  return sum + 1;
                }, 0);
                const count = totalCams > 0 ? totalCams : cameraCount;
                const speed = count * 5;
                const tier = [
                  { speed: 10, price: 640 },
                  { speed: 20, price: 720 },
                  { speed: 30, price: 770 },
                  { speed: 50, price: 860 },
                  { speed: 100, price: 1150 },
                  { speed: 150, price: 1440 },
                  { speed: 200, price: 1730 },
                  { speed: 300, price: 2310 },
                  { speed: 400, price: 2750 },
                  { speed: 500, price: 3180 },
                ].find(t => t.speed >= speed) || { speed: 500, price: 3180 };
                return `${tier.speed} Mbps (฿${tier.price}/เดือน)`;
              })()}
            </div>
          </div>
        </div>

        {/* Link details summary details */}
        <div className="p-3 bg-white rounded-xl border border-gray-150 text-[11px] text-gray-550 flex justify-between items-center font-sans">
          <span className="font-semibold text-gray-700">ประมาณการค่าบริการวงจรเช่าห้องควบคุมต้นทาง:</span>
          <span className="font-mono font-bold text-gray-900 text-xs">
            {(() => {
              const totalCams = (cameraPoints || []).reduce((sum, pt) => {
                if (pt.selectedSet === "Set 1") return sum + 1;
                if (pt.selectedSet === "Set 2") return sum + 2;
                if (pt.selectedSet === "Set 3") return sum + 3;
                if (pt.selectedSet === "Set 4") return sum + 4;
                return sum + 1;
              }, 0);
              const count = totalCams > 0 ? totalCams : cameraCount;
              const speed = count * 5;
              const tier = [
                { speed: 10, price: 640 },
                { speed: 20, price: 720 },
                { speed: 30, price: 770 },
                { speed: 50, price: 860 },
                { speed: 100, price: 1150 },
                { speed: 150, price: 1440 },
                { speed: 200, price: 1730 },
                { speed: 300, price: 2310 },
                { speed: 400, price: 2750 },
                { speed: 500, price: 3180 },
              ].find(t => t.speed >= speed) || { speed: 500, price: 3180 };
              return `฿${tier.price.toLocaleString("th-TH")}/เดือน`;
            })()}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-150 pt-6"></div>

      {/* Actions */}
      <div className="flex justify-between" id="step2-actions-bar">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-zinc-200 text-gray-900 text-xs font-medium rounded-xl border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="blocks-btn-primary"
        >
          ก้าวถัดไป: ไปหน้าสรุปรายการอุปกรณ์ BOM 📋
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
