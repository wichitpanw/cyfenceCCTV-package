import React, { useState } from "react";
import { 
  ArrowLeft, 
  Coins, 
  Trash2, 
  Plus, 
  Calculator, 
  Download, 
  FileText, 
  Save, 
  RotateCcw,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { PricingItem, ProjectSurvey } from "../types";

interface Step6Props {
  pricingItems: PricingItem[];
  discount: number;
  vatRate: number;
  onUpdateDiscount: (discount: number) => void;
  onUpdateVatRate: (vat: number) => void;
  onUpdateItems: (items: PricingItem[]) => void;
  onSaveProject: () => void;
  onPrev: () => void;
  customerName: string;
  showConfirm?: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => void;
  onGoToStep1?: () => void;
  cameraPoints?: any[];
}

export default function Step6Pricing({
  pricingItems,
  discount,
  vatRate,
  onUpdateDiscount,
  onUpdateVatRate,
  onUpdateItems,
  onSaveProject,
  onPrev,
  customerName,
  showConfirm,
  onGoToStep1,
  cameraPoints
}: Step6Props) {
  const [successSaved, setSuccessSaved] = useState(false);
  const [isVatEnabled, setIsVatEnabled] = useState(vatRate > 0);

  // Calculate sum totals
  const calSubtotal = pricingItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const calDiscountAmount = discount;
  const calBeforeVat = Math.max(0, calSubtotal - calDiscountAmount);
  const calVatAmount = isVatEnabled ? parseFloat((calBeforeVat * (vatRate / 100)).toFixed(2)) : 0;
  const calGrandTotal = calBeforeVat + calVatAmount;

  // Calculate Monthly Recurring Costs (OPEX)
  const pointsList = cameraPoints || [];
  const totalFieldLinksPrice = pointsList.reduce((sum, pt) => {
    let ptCamsCount = 1;
    if (pt.selectedSet === "Set 1") ptCamsCount = 1;
    else if (pt.selectedSet === "Set 2") ptCamsCount = 2;
    else if (pt.selectedSet === "Set 3") ptCamsCount = 3;
    else if (pt.selectedSet === "Set 4") ptCamsCount = 4;
    
    const ptSpeed = ptCamsCount * 5;
    const ptTier = [
      { speed: 10, price: 640 },
      { speed: 20, price: 720 },
      { speed: 30, price: 770 },
      { speed: 50, price: 860 },
      { speed: 100, price: 1150 },
    ].find(t => t.speed >= ptSpeed) || { price: 640 };
    return sum + ptTier.price;
  }, 0);

  const totalCams = pointsList.reduce((sum, pt) => {
    if (pt.selectedSet === "Set 1") return sum + 1;
    if (pt.selectedSet === "Set 2") return sum + 2;
    if (pt.selectedSet === "Set 3") return sum + 3;
    if (pt.selectedSet === "Set 4") return sum + 4;
    return sum + 1;
  }, 0);
  const totalCamsCount = totalCams > 0 ? totalCams : 1;
  const speed = totalCamsCount * 5;
  const centerTier = [
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

  const totalMonthlyPrice = totalFieldLinksPrice + centerTier.price;

  // Edit Unit Price or Quantity
  const handleItemValueChange = (id: string, field: "unitPrice" | "quantity", valStr: string) => {
    const val = parseFloat(valStr) || 0;
    const updated = pricingItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleAddNewItem = (category: "hardware" | "accessory" | "labor" | "other") => {
    const newItem: PricingItem = {
      id: `pricing-item-custom-${Date.now()}`,
      name: "ระบุรายการใหม่...",
      quantity: 1,
      unit: "ชุด",
      unitPrice: 0,
      category
    };
    onUpdateItems([...pricingItems, newItem]);
  };

  const handleDeleteItem = (id: string) => {
    const item = pricingItems.find(it => it.id === id);
    const itemName = item ? item.name : "รายการนี้";
    
    const performDelete = () => {
      const updated = pricingItems.filter((it) => it.id !== id);
      onUpdateItems(updated);
    };

    if (showConfirm) {
      showConfirm(
        "🗑️ ยืนยันการลบรายการประเมิน",
        `คุณแน่ใจหรือไม่ว่าต้องการลบรายการประเมิน "${itemName}" นี้ออกจากตารางราคา?`,
        performDelete
      );
    } else if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการประเมิน "${itemName}" นี้ออกจากตารางราคา?`)) {
      performDelete();
    }
  };

  const handleUpdateItemName = (id: string, name: string) => {
    const updated = pricingItems.map((item) => {
      if (item.id === id) {
        return { ...item, name };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleUpdateItemUnit = (id: string, unit: string) => {
    const updated = pricingItems.map((item) => {
      if (item.id === id) {
        return { ...item, unit };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleSave = () => {
    const saveAndRedirect = () => {
      onSaveProject();
      setSuccessSaved(true);
      setTimeout(() => {
        setSuccessSaved(false);
        onGoToStep1?.();
      }, 1000);
    };

    if (showConfirm) {
      showConfirm(
        "💾 ยืนยันการบันทึกโครงการ",
        "คุณต้องการบันทึกข้อมูลรายงานการสำรวจและประเมินราคานี้เข้าสู่ระบบคลาวด์ พร้อมทั้งกลับไปหน้าแรกเพื่อเริ่มต้นงานใหม่ใช่หรือไม่?",
        saveAndRedirect,
        {
          confirmText: "บันทึกและกลับหน้าแรก",
          cancelText: "ยกเลิก"
        }
      );
    } else {
      saveAndRedirect();
    }
  };

  return (
    <div className="space-y-6" id="pricing-step-container">
      {/* Informative alert explaining customizable pricing */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
          <Coins className="w-4 h-4 text-zinc-700" />
        </div>
        <div>
          <h4 className="font-semibold text-xs text-zinc-800 font-sans">
            💰 ปรับปรุงราคาขายและส่วนลด (Editable Price Sheet)
          </h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
            สเปกปริมาณอุปกรณ์เสริมถูกคำนวณตามแผนผังสำรวจ ท่านสามารถปรับแก้ไขตัวเลขราคาต่อหน่วย (Unit Price) หรือเพิ่ม/ลดรายการอุปกรณ์ได้โดยตรง 
            ระบบจะอัปเดตราคาพรีวิวแบบเรียลไทม์พร้อมสรุปภาษีมูลค่าเพิ่ม 7% ให้คุณกุมข้อมูลส่งผู้จัดการโครงการต่อได้ทันทีค่ะ
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* MAIN PANEL (Full Width): Main pricing items list grid */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150">
            <div>
              <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider font-mono">SPECIFICATION ITEMS / รายละเอียดผลิตภัณฑ์และค่าแรง</span>
              <p className="text-[11px] text-zinc-400">แก้ไขจำนวน ราคาหน่วย หรือลบ/เพิ่มตัวเลือกในใบประเมิน</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddNewItem("other")}
                className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer"
              >
                + เพิ่มรายการส่งมอบอื่นๆ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 uppercase font-mono text-[9px] border-b border-zinc-200">
                  <th className="py-2.5 px-3">รายการอุปกรณ์และงานบริการ</th>
                  <th className="py-2.5 px-3 w-16 text-center">ประเภท</th>
                  <th className="py-2.5 px-3 w-20 text-center">จำนวน</th>
                  <th className="py-2.5 px-3 w-20 text-center">หน่วย</th>
                  <th className="py-2.5 px-3 w-28 text-right">ราคาหน่วย (฿)</th>
                  <th className="py-2.5 px-3 w-28 text-right">ราคารวม (฿)</th>
                  <th className="py-2.5 px-3 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pricingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50">
                    <td className="py-3 px-3">
                      <textarea
                        value={item.name}
                        onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                        rows={2}
                        className="w-full bg-transparent font-semibold text-zinc-800 border-none focus:outline-none focus:ring-1 focus:ring-zinc-400 rounded px-1 -mx-1 resize-none leading-normal text-xs transition-all whitespace-normal break-words py-1"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                        item.category === "hardware" ? "bg-zinc-150 text-zinc-800 border border-zinc-250" :
                        item.category === "accessory" ? "bg-zinc-100 text-zinc-650 border border-zinc-200" :
                        item.category === "labor" ? "bg-zinc-200 text-zinc-800 font-semibold" :
                        "bg-zinc-50 text-zinc-500 border border-zinc-200"
                      }`}>
                        {item.category === "hardware" ? "HW" :
                         item.category === "accessory" ? "ACC" :
                         item.category === "labor" ? "LAB" : "ETC"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min={0.1}
                        step="any"
                        value={item.quantity}
                        onChange={(e) => handleItemValueChange(item.id, "quantity", e.target.value)}
                        className="w-14 px-1 py-1 rounded-lg border text-center font-bold bg-zinc-50 font-mono text-zinc-800 border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItemUnit(item.id, e.target.value)}
                        className="w-12 px-1.5 py-1 border border-zinc-300 text-xs text-center rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => handleItemValueChange(item.id, "unitPrice", e.target.value)}
                        className="w-24 px-1.5 py-1 rounded-lg border text-right font-bold bg-zinc-50 font-mono text-zinc-800 border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                      {(item.quantity * item.unitPrice).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="ลบแถวสินค้า"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick buttons to inject standard components */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-150">
            <span className="text-[10px] text-zinc-455 w-full mb-1 uppercase tracking-wider font-mono">ทางเลือกเพิ่มประเภทรายการด่วน:</span>
            <button
              onClick={() => handleAddNewItem("hardware")}
              className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[10px] font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer"
            >
              + สิ้นค้าแท่นหลักกล้องและฮาร์ดแวร์
            </button>
            <button
              onClick={() => handleAddNewItem("accessory")}
              className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[10px] font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer"
            >
              + ท่อร้อยสาย/สายสัญญาณ/ข้อต่อ
            </button>
            <button
              onClick={() => handleAddNewItem("labor")}
              className="px-2.5 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-[10px] font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer"
            >
              + ค่าบริการเซ็ตอัพระบบ/ติดตั้งเสา
            </button>
          </div>
        </div>

      {/* NT Carrier Ethernet Lite (Leased Line Calculator Widget) */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-150">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-805 flex items-center gap-1.5 font-sans">
              🌐 วงจรเชื่อมโยงเครือข่าย NT Carrier Ethernet Lite (ประมาณการรายเดือน)
            </h4>
            <p className="text-[10px] text-zinc-400">คำนวณแบนด์วิดท์รายจุด 5Mbps/กล้อง และประมาณการค่าวงจรเช่าเครือข่าย NT รายเดือนสำหรับทั้งโครงการ</p>
          </div>
        </div>

        {/* Calculations metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">จำนวนกล้องรวมทั้งสิ้น</span>
            <div className="text-base font-black text-zinc-800 font-mono">
              {totalCamsCount} <span className="text-xs font-normal text-zinc-500 font-sans">ตัว</span>
            </div>
          </div>

          <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/60 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">แบนด์วิดท์รวมที่ศูนย์ควบคุม</span>
            <div className="text-base font-black text-zinc-800 font-mono">
              {speed} <span className="text-xs font-semibold text-[#0071e3] font-mono">Mbps</span>
            </div>
          </div>

          <div className="bg-[#0071e3]/5 p-3.5 rounded-xl border border-[#0071e3]/15 space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#0071e3] block font-mono">ลิงก์ต้นทางห้องควบคุม (NT)</span>
            <div className="text-base font-black text-[#0071e3] font-mono">
              {centerTier.speed} Mbps (฿{centerTier.price}/ด.)
            </div>
          </div>
        </div>

        {/* Link details summary details */}
        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200/70 text-xs text-zinc-650 space-y-2.5">
          <div className="flex justify-between items-center">
            <span>ค่าบริการลิงก์ปลายทางรายจุด (Field Sites Link):</span>
            <span className="font-mono font-bold text-zinc-800">
              ฿{totalFieldLinksPrice.toLocaleString("th-TH")}/เดือน ({pointsList.length} จุด)
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-200/50">
            <span>ค่าบริการลิงก์ต้นทางห้องควบคุม (Monitor Site Link):</span>
            <span className="font-mono font-bold text-zinc-800">
              ฿{centerTier.price.toLocaleString("th-TH")}/เดือน
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-zinc-250 text-xs font-bold text-zinc-800">
            <span className="text-[#0071e3]">รวมประมาณการค่าบริการ NT Leased Line ทั้งโครงการ:</span>
            <span className="font-mono text-[#0071e3] text-sm">
              ฿{totalMonthlyPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}/เดือน
            </span>
          </div>
        </div>
      </div>

        {/* BOTTOM PANEL (Aligned to Right): Recoded values + Tax Invoice Summary Card */}
        <div className="flex justify-end">
          <div className="w-full md:max-w-md shrink-0 space-y-4">
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-2xs space-y-5 select-none">
            <h4 className="text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider">
              PRICING PREVIEW / สรุปงบระบบ
            </h4>

            {/* Price values summary stack */}
            <div className="space-y-4 text-xs text-zinc-700 font-sans border-b border-zinc-200 pb-5">
              <div className="flex justify-between items-center text-zinc-650 font-medium">
                <span>ราคารวมผลิตภัณฑ์ (Subtotal):</span>
                <span className="font-mono font-bold text-sm text-zinc-900">
                  ฿{calSubtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Discount inputs */}
              <div className="space-y-1 bg-zinc-100 p-3 rounded-2xl border border-zinc-250">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-650 font-medium">ส่วนลดพิเศษโครงการ (฿):</span>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right px-2 py-1 rounded-lg font-mono font-bold bg-white text-zinc-800 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-zinc-550">
                <span>ยอดเงินหลังหักส่วนลด:</span>
                <span className="font-mono font-bold text-zinc-800">
                  ฿{calBeforeVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* VAT toggler and selection */}
              <div className="space-y-2 bg-zinc-100 p-3 rounded-2xl border border-zinc-250">
                <div className="flex justify-between items-center">
                  <label htmlFor="vat-toggle" className="text-zinc-650 font-medium flex items-center gap-1 cursor-pointer">
                    คำนวณภาษีมูลค่าเพิ่ม (VAT 7%):
                  </label>
                  <input
                    id="vat-toggle"
                    type="checkbox"
                    checked={isVatEnabled}
                    onChange={(e) => {
                      setIsVatEnabled(e.target.checked);
                      onUpdateVatRate(e.target.checked ? 7 : 0);
                    }}
                    className="w-4 h-4 rounded text-[#0071e3] cursor-pointer"
                  />
                </div>
                {isVatEnabled && (
                  <div className="flex justify-between items-center border-t border-zinc-200/50 pt-1.5 mt-1.5">
                    <span className="text-[10px] text-zinc-500">มูลค่าภาษี VAT:</span>
                    <span className="font-mono text-zinc-700 font-semibold">
                      ฿{calVatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grand Total output showcase */}
            <div className="space-y-3 border-t border-zinc-200/60 pt-3">
              <div className="space-y-1">
                <span className="text-zinc-550 text-[9px] uppercase font-bold font-mono tracking-wider block">
                  งบลงทุนอุปกรณ์ & ติดตั้งครั้งเดียว (CAPEX GRAND TOTAL)
                </span>
                <div className="text-2xl font-black font-mono text-zinc-900 flex items-baseline justify-between">
                  <span>฿</span>
                  <span className="text-[#0071e3]">{calGrandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="space-y-1 pt-3 border-t border-zinc-200/40">
                <span className="text-zinc-550 text-[9px] uppercase font-bold font-mono tracking-wider block">
                  ประมาณการค่าวงจรเช่ารายเดือน (OPEX NT LEASED LINE)
                </span>
                <div className="text-xl font-bold font-mono text-zinc-900 flex items-baseline justify-between">
                  <span>฿</span>
                  <span className="text-[#0071e3]">{totalMonthlyPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}<span className="text-xs text-zinc-500 font-sans font-normal">/ด.</span></span>
                </div>
              </div>
            </div>

            {/* Action Buttons to save or print */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 font-bold text-xs bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {successSaved ? "✓ บันทึกสำเร็จแล้ว!" : "บันทึกโครงการเข้าระบบคลาวด์"}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 bg-zinc-105 border border-zinc-300 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                พิมพ์เอกสารใบเสนอราคา (Print/PDF)
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="border-t border-zinc-150 pt-6"></div>

      {/* Navigation action bars */}
      <div className="flex justify-between" id="step6-actions-bar">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xl border border-zinc-250 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ย้อนกลับปรับสเปค
        </button>

        <div className="hidden sm:block p-2 px-4 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-500">
          ✓ คุณสามารถพิมพ์สเปกหรือกดจัดเก็บบันทึกประวัติโครงงานเรียบร้อยแล้วค่ะ 👓
        </div>
      </div>
    </div>
  );
}
