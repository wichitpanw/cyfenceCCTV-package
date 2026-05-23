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
  if (count <= 4) return 4;
  if (count <= 8) return 8;
  if (count <= 16) return 16;
  if (count <= 32) return 32;
  return 64;
};

export default function Step2CameraRequirements({ data, onChange, onNext, onPrev, cameraCount, cameraPoints }: Step2Props) {
  
  const handleStorageSelect = (storage: string) => {
    onChange({ ...data, storagePackage: storage });
  };

  const handleNvrChannels = (channels: number) => {
    const pkg = channels <= 4 ? "HDD 4TB (มาตรฐานราชการ 4CH)" 
              : channels <= 8 ? "HDD 8TB (มาตรฐานราชการ 8CH)" 
              : channels <= 16 ? "HDD 16TB (8TB x 2 ลูก มาตรฐานราชการ)" 
              : channels <= 32 ? "HDD 32TB (8TB x 4 ลูก มาตรฐานราชการ)" 
              : "HDD 64TB (8TB x 8 ลูก มาตรฐานราชการ)";
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
          <h3 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-zinc-250 flex items-center justify-center text-[10px] text-zinc-700 font-bold text-center">1</span>
            ขนาดช่องสัญญาณ NVR
          </h3>
          <p className="text-[11px] text-zinc-500 mb-1 leading-normal">
            ช่องเชื่อมต่อแชนแนลหลัก (แนะนำ: <strong className="text-[#0071e3] font-mono">{suggestedChannels(cameraCount)}CH</strong> สำหรับกล้อง {cameraCount} ตัว)
          </p>
          <div className="grid grid-cols-5 gap-1.5 font-mono">
            {[4, 8, 16, 32, 64].map((ch) => {
              const isSelected = data.nvrChannels === ch;
              const isRecommended = ch === suggestedChannels(cameraCount);
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleNvrChannels(ch)}
                  className={`py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer relative ${
                    isSelected
                      ? "bg-[#0071e3] border-transparent text-white"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  } ${isRecommended && !isSelected ? "ring-1 ring-[#0071e3]/45 border-[#0071e3]/45" : ""}`}
                  title={isRecommended ? "แนะนำสำหรับจำนวนกล้องนี้" : ""}
                >
                  {ch}CH
                  {isRecommended && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#0071e3] border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand NVR — fixed to same brand */}
        <div className="space-y-3 md:col-span-2">
          <label className="block text-xs font-semibold text-zinc-800 uppercase tracking-wide">
            ยี่ห้อเครื่องบันทึก NVR ที่ระบุร่วมกัน
          </label>
          <p className="text-xs text-zinc-500">ใช้ยี่ห้อเดียวกับกล้องเพื่อความเข้ากันได้สูงสุด</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold shadow-2xs">
            <Check className="w-3.5 h-3.5" />
            ยี่ห้อเดียวกับกล้อง ({data.cameraBrand})
          </div>
        </div>
      </div>

      {/* Package storage options */}
      <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-5" id="step2-storage-spec-card">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
            2
          </span>
          <div className="space-y-1 grow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-800">
                💾 สเปกขนาดความจุฮาร์ดดิสก์สะสมภาพ
              </h3>
            </div>
          </div>
        </div>

        {/* Informative Grid showing targeted standard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-zinc-200">
          <div className="bg-white p-3.5 rounded-xl border border-zinc-150">
            <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">เครื่องบันทึก NVR ที่เลือก</span>
            <span className="text-sm font-bold text-zinc-850 mt-1 block">{data.nvrChannels} ช่องสัญญาณ (Channels)</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-zinc-150">
            <span className="block text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">โควตาความจุบังคับตามเกณฑ์มาตรฐานราชการ</span>
            <span className="text-sm font-bold text-[#0071e3] mt-1 block">
              {data.nvrChannels <= 4 ? "4TB" : data.nvrChannels <= 8 ? "8TB" : data.nvrChannels <= 16 ? "16TB (8TB x 2 ลูก)" : data.nvrChannels <= 32 ? "32TB (8TB x 4 ลูก)" : "64TB (8TB x 8 ลูก)"}
            </span>
          </div>
        </div>
      </div>

      {/* selectable control room equipment section */}
      <div className="space-y-4 bg-zinc-50 border border-zinc-200 rounded-2xl p-5" id="step2-control-room-spec-card">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-white font-bold shrink-0 mt-0.5">
            3
          </span>
          <div className="space-y-1 grow">
            <h3 className="text-sm font-semibold text-zinc-800">
              🖥️ ปรับเลือกขนาดและประเภทอุปกรณ์ห้องควบคุม (Control Room Setup)
            </h3>
            <p className="text-xs text-zinc-500">เลือกปรับเปลี่ยนขนาดตู้ Rack ขนาดจอภาพ และกำลังวัตต์เครื่องสำรองไฟได้ตามต้องการ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-200 text-xs font-sans">
          {/* Rack selection */}
          <div className="space-y-2">
            <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[10px]">ตู้ Server Rack 19 นิ้ว</label>
            <select
              value={data.rackType || "rack 19 นิ้ว 6U"}
              onChange={(e) => onChange({ ...data, rackType: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
            >
              <option value="rack 19 นิ้ว 6U">ตู้ Rack 19 นิ้ว 6U (ขนาดมาตรฐานเล็ก)</option>
              <option value="rack 19 นิ้ว 16U">ตู้ Rack 19 นิ้ว 16U (ขนาดกลางออฟฟิศ)</option>
              <option value="rack 19 นิ้ว 42U">ตู้ Rack 19 นิ้ว 42U (ขนาดตู้ใหญ่โยธา)</option>
            </select>
          </div>

          {/* Monitor selection */}
          <div className="space-y-2">
            <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[10px]">จอแสดงผลระบบภาพ</label>
            <select
              value={data.monitorType || "จอ 27 นิ้ว"}
              onChange={(e) => onChange({ ...data, monitorType: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
            >
              <option value="จอ 27 นิ้ว">จอ IPS ขนาด 27 นิ้ว (ความคมชัดสูง)</option>
              <option value="TV 55 นิ้ว">Smart TV ขนาด 55 นิ้ว (สำหรับติดผนังห้องควบคุม)</option>
            </select>
          </div>

          {/* UPS selection */}
          <div className="space-y-2">
            <label className="block text-zinc-550 font-bold uppercase tracking-wider text-[10px]">เครื่องสำรองไฟฟ้า UPS</label>
            <select
              value={data.upsType || "UPS 1Kva"}
              onChange={(e) => onChange({ ...data, upsType: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 bg-white rounded-lg font-medium focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
            >
              <option value="UPS 1Kva">UPS ขนาด 1000VA (1Kva) (สเปกมาตรฐาน)</option>
              <option value="UPS 2Kva">UPS ขนาด 2000VA (2Kva) (สำรองไฟระยะเวลานานพิเศษ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom notes */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-zinc-605 uppercase tracking-wide">
          ความต้องการเพิ่มเติม / หมายเหตุทางเทคนิค
        </label>
        <textarea
          id="other-requirements-input"
          rows={3}
          placeholder="ระบุความต้องการเฉพาะตัว เช่น 'ใช้สาย Fiber Optic ระหว่างตู้เซิร์ฟเวอร์', 'ต้องการเซนเซอร์จับการเคลื่อนไหวพิเศษ'"
          value={data.otherRequirements}
          onChange={(e) => onChange({ ...data, otherRequirements: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border text-sm bg-zinc-50 border-zinc-200 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0071e3] focus:border-[#0071e3] transition-all"
        />
      </div>

      {/* NT Carrier Ethernet Lite (Leased Line Calculator Widget) */}
      <div className="bg-white rounded-2xl p-4.5 border border-zinc-200 shadow-3xs space-y-3 mt-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-150">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
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
          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-455 block font-mono">จำนวนกล้องทั้งหมดในโครงการ</span>
            <div className="text-base font-black text-zinc-800 font-mono">
              {(() => {
                const totalCams = (cameraPoints || []).reduce((sum, pt) => {
                  if (pt.selectedSet === "Set 1") return sum + 1;
                  if (pt.selectedSet === "Set 2") return sum + 2;
                  if (pt.selectedSet === "Set 3") return sum + 3;
                  if (pt.selectedSet === "Set 4") return sum + 4;
                  return sum + 1;
                }, 0);
                return totalCams > 0 ? totalCams : cameraCount;
              })()} <span className="text-xs font-normal text-zinc-500">ตัว</span>
            </div>
          </div>

          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-455 block font-mono">แบนด์วิดท์รวมเข้าห้องควบคุม</span>
            <div className="text-base font-black text-zinc-800 font-mono">
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
              })()} <span className="text-xs font-semibold text-[#0071e3] font-mono">Mbps</span>
            </div>
          </div>

          <div className="bg-[#0071e3]/5 p-3 rounded-xl border border-[#0071e3]/15 space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#0071e3] block font-mono">ลิงก์ต้นทางห้องควบคุม (NT)</span>
            <div className="text-base font-black text-[#0071e3] font-mono">
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
                return `${tier.speed} Mbps (฿${tier.price}/ด.)`;
              })()}
            </div>
          </div>
        </div>

        {/* Link details summary details */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-[11px] text-zinc-650 flex justify-between items-center font-sans">
          <span className="font-semibold text-zinc-700">ประมาณการค่าบริการวงจรเช่าห้องควบคุมต้นทาง:</span>
          <span className="font-mono font-bold text-[#0071e3] text-xs">
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

      <div className="border-t border-zinc-100 pt-6"></div>

      {/* Actions */}
      <div className="flex justify-between" id="step2-actions-bar">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xl border border-zinc-250 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          ก้าวถัดไป: ไปหน้าสรุปรายการอุปกรณ์ BOM 📋
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
