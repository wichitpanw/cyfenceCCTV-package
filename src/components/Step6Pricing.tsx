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
import { PricingItem, CustomerInfo, TechRequirements } from "../types";

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
  customerInfo?: CustomerInfo;
  requirements?: TechRequirements;
  showConfirm?: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => void;
  onGoToStep1?: () => void;
  cameraPoints?: any[];
  isAdminVerified?: boolean;
  onVerifyAdmin?: () => void;
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
  customerInfo,
  requirements,
  showConfirm,
  onGoToStep1,
  cameraPoints,
  isAdminVerified = false,
  onVerifyAdmin
}: Step6Props) {
  const [successSaved, setSuccessSaved] = useState(false);
  const [isVatEnabled, setIsVatEnabled] = useState(vatRate > 0);
  const [showCostsAdmin, setShowCostsAdmin] = useState(false);

  // Calculate sum totals
  const calSubtotal = pricingItems.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const calDiscountAmount = discount;
  const calBeforeVat = Math.max(0, calSubtotal - calDiscountAmount);

  // 3-Year Leased/Rental System calculations (กำไร +40%, ดอกเบี้ย 8% ต่อปี แฟลตเรต 3 ปี)
  const leasePrincipal = calBeforeVat * 1.40;
  const leaseInterest = leasePrincipal * 0.08 * 3;
  const leaseTotalAmount = leasePrincipal + leaseInterest;
  const leaseMonthlyPayment = leaseTotalAmount / 36;

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

  // Grand Monthly calculations
  const grandMonthlyBeforeVat = leaseMonthlyPayment + totalMonthlyPrice;
  const calVatAmount = isVatEnabled ? parseFloat((grandMonthlyBeforeVat * (vatRate / 100)).toFixed(2)) : 0;
  const grandMonthlyTotal = grandMonthlyBeforeVat + calVatAmount;

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

  // ---- PDF PRINT ----
  const handlePrintPDF = () => {
    const printWin = window.open("", "_blank", "width=860,height=1100");
    if (printWin) {
      const today = new Date().toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric"
      });
      const quotationNo = `SR-${Date.now().toString().slice(-8)}`;
      const defaultLat = customerInfo?.latitude ? parseFloat(customerInfo.latitude) : 13.7563;
      const defaultLng = customerInfo?.longitude ? parseFloat(customerInfo.longitude) : 100.5018;
      const centerLat = isNaN(defaultLat) ? 13.7563 : defaultLat;
      const centerLng = isNaN(defaultLng) ? 100.5018 : defaultLng;

      const catLabel = (cat: string) =>
        cat === "hardware" ? "ฮาร์ดแวร์" :
        cat === "accessory" ? "อุปกรณ์เสริม" :
        cat === "labor" ? "ค่าแรง" : "อื่นๆ";

      const rowsHtml = pricingItems.map((item, idx) => `
        <tr class="${idx % 2 === 0 ? "row-even" : "row-odd"}">
          <td class="num">${idx + 1}</td>
          <td class="name">${item.name}</td>
          <td class="center">${catLabel(item.category)}</td>
          <td class="center bold">${item.quantity.toLocaleString("th-TH")}</td>
          <td class="center">${item.unit}</td>
        </tr>
      `).join("");

      const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>เอกสารสำรวจกล้อง - ${customerInfo?.customerName || customerName}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 16mm 14mm; }
    body { font-family: 'Noto Sans Thai', 'TH Sarabun New', sans-serif; font-size: 11pt; color: #111; background: #fff; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #0071e3; margin-bottom: 14px; }
    .company-name { font-size: 17pt; font-weight: 800; color: #0071e3; }
    .company-sub { font-size: 8.5pt; color: #555; margin-top: 2px; }
    .doc-info { text-align: right; }
    .doc-title { font-size: 14pt; font-weight: 700; color: #111; }
    .doc-no { font-size: 8.5pt; color: #666; margin-top: 2px; }
    .doc-date { font-size: 8.5pt; color: #666; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    .info-box { border: 1px solid #ddd; border-radius: 6px; padding: 9px 12px; background: #fafafa; }
    .info-box-title { font-size: 7.5pt; font-weight: 700; color: #0071e3; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px; }
    .info-row { font-size: 9.5pt; color: #333; margin-bottom: 2px; }
    .info-row span { font-weight: 600; color: #111; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt; }
    thead tr { background: #0071e3; color: #fff; }
    thead th { padding: 7px 9px; text-align: left; font-weight: 700; font-size: 8.5pt; }
    thead th.center { text-align: center; }
    thead th.right { text-align: right; }
    .row-even { background: #fff; }
    .row-odd { background: #f8f9fc; }
    tbody td { padding: 6px 9px; border-bottom: 1px solid #eee; vertical-align: top; line-height: 1.45; }
    td.num { text-align: center; color: #888; font-size: 8pt; width: 24px; }
    td.center { text-align: center; width: 110px; }
    td.name { text-align: left; }
    td.bold { font-weight: 600; }

    .summary-wrap { display: flex; justify-content: flex-end; margin-bottom: 16px; page-break-inside: avoid; break-inside: avoid; }
    .summary { width: 380px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .summary-row { display: flex; justify-content: space-between; padding: 7px 12px; font-size: 10pt; }
    .summary-row:nth-child(odd) { background: #f8f9fc; }
    .summary-row.total { background: #0071e3; color: #fff; font-size: 12pt; font-weight: 800; }

    .remark-box { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px 14px; margin-top: 8px; }
    .remark-title { font-size: 8pt; font-weight: 700; color: #92400e; margin-bottom: 4px; }
    .remark-text { font-size: 8.5pt; color: #78350f; line-height: 1.6; }
    .footer { margin-top: 14px; font-size: 7.5pt; color: #999; border-top: 1px solid #eee; padding-top: 8px; text-align: center; }

    .custom-print-icon {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <img src="/cyfence_logo.png" alt="NT Cyfence" style="height: 52px; display: block; margin-bottom: 4px;" />
    </div>
    <div class="doc-info">
      <div class="doc-title">เอกสารสำรวจระบบกล้องวงจรปิด</div>
      <div class="doc-no">เลขที่: <strong>${quotationNo}</strong></div>
      <div class="doc-date">วันที่สำรวจ: ${today}</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <div class="info-box-title">ข้อมูลหน่วยงาน / ลูกค้า</div>
      <div class="info-row">ชื่อหน่วยงาน: <span>${customerInfo?.customerName || customerName || "-"}</span></div>
      <div class="info-row">ชื่อโครงการ: <span>${customerInfo?.projectName || "-"}</span></div>
      <div class="info-row">ผู้ติดต่อ: <span>${customerInfo?.contactPerson || "-"}</span></div>
      <div class="info-row">เบอร์โทร: <span>${customerInfo?.contactPhone || "-"}</span></div>
      <div class="info-row">จังหวัด: <span>${customerInfo?.province || "-"}</span></div>
      <div class="info-row">ที่อยู่: <span style="font-size:8.5pt">${customerInfo?.address || "-"}</span></div>
    </div>
    <div class="info-box">
      <div class="info-box-title">สเปกระบบและผู้สำรวจ</div>
      <div class="info-row">วันที่สำรวจ: <span>${customerInfo?.surveyDate || "-"}</span></div>
      <div class="info-row">ผู้สำรวจ: <span>${customerInfo?.surveyorName || "-"}</span></div>
      ${customerInfo?.surveyorDepartment ? `<div class="info-row">ส่วนงาน: <span>${customerInfo.surveyorDepartment}</span></div>` : ""}
      ${customerInfo?.surveyorPhone ? `<div class="info-row">เบอร์โทรผู้สำรวจ: <span>${customerInfo.surveyorPhone}</span></div>` : ""}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:30px">#</th>
        <th>รายการอุปกรณ์และงานบริการ</th>
        <th class="center" style="width:110px">ประเภทส่งมอบ</th>
        <th class="center" style="width:80px">จำนวน</th>
        <th class="center" style="width:80px">หน่วย</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <div class="summary-wrap">
    <div class="summary" style="width: 380px;">
      <div class="summary-row" style="font-weight: 700; color: #111;"><span>ค่าเช่าระบบรายเดือน (ก่อนภาษีมูลค่าเพิ่ม)</span><span>฿${grandMonthlyBeforeVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}/ด.</span></div>
      ${isVatEnabled ? `<div class="summary-row"><span>ภาษีมูลค่าเพิ่ม ${vatRate}%</span><span>฿${calVatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}/ด.</span></div>` : ""}
      <div class="summary-row total"><span>ค่าเช่าระบบรวมรายเดือนทั้งสิ้น (หลังภาษี)</span><span>฿${grandMonthlyTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}/ด.</span></div>
    </div>
  </div>

  ${cameraPoints.length > 0 ? `
  <div style="page-break-inside: avoid; break-inside: avoid; margin-top: 14px; margin-bottom: 14px;">
    <div style="font-size: 10pt; font-weight: 700; color: #0071e3; margin-bottom: 6px;">🗺️ แผนผังพิกัดและจุดติดตั้งกล้องจริงโครงการ</div>
    <div id="print-map" style="width: 100%; height: 320px; border-radius: 8px; border: 1px solid #ddd; background: #fafafa;"></div>
  </div>
  ` : ""}

  <div class="remark-box" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="remark-title">⚠️ หมายเหตุ / ข้อตกลงเบื้องต้น</div>
    <div class="remark-text">
      • เอกสารฉบับนี้เป็นการประมาณการเบื้องต้น ราคาอาจเปลี่ยนแปลงได้ตามสภาพหน้างานจริงและไม่รวมค่าเดินทางและค่าดำเนินการอื่นๆ<br/>
      • สเปกอุปกรณ์สามารถปรับเปลี่ยนได้ตามความเหมาะสมเมื่อชำระเงินจริง<br/>
      ${customerInfo?.address ? `• สถานที่ติดตั้ง: ${customerInfo.address}` : ""}
    </div>
  </div>

  <div class="footer">สร้างโดย: NT Cyfence CCTV Survey System | ${today}</div>

<script>
  window.onload = () => {
    try {
      const mapEl = document.getElementById('print-map');
      if (mapEl) {
        const map = L.map('print-map', { zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        const centerLat = ${centerLat};
        const centerLng = ${centerLng};
        
        // Control Center icon
        const controlIcon = L.divIcon({
          html: \`
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #0071e3;
              border: 2.5px solid white;
              box-shadow: 0 2px 6px rgba(0, 113, 227, 0.4);
              box-sizing: border-box;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
          \`,
          className: "custom-print-icon",
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([centerLat, centerLng], { icon: controlIcon }).addTo(map);
        
        const points = ${JSON.stringify(cameraPoints.map(p => ({ lat: p.lat ?? centerLat, lng: p.lng ?? centerLng, type: p.type, name: p.name, count: p.selectedSet === "Set 1" ? 1 : p.selectedSet === "Set 2" ? 2 : p.selectedSet === "Set 3" ? 3 : p.selectedSet === "Set 4" ? 4 : 1 })))};
        const bounds = L.latLngBounds([centerLat, centerLng]);
        
        points.forEach((pt, idx) => {
          const colorHex = pt.type === "Dome" ? "#0071e3" : pt.type === "PTZ" ? "#bf5af2" : "#30d158";
          const camIcon = L.divIcon({
            html: \`
              <div style="
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: white;
                border: 2px solid \${colorHex};
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                box-sizing: border-box;
                position: relative;
              ">
                <span style="
                  position: absolute;
                  top: -5px;
                  right: -5px;
                  background-color: #1c1c1e;
                  color: white;
                  font-size: 6px;
                  font-weight: 700;
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 0.5px solid white;
                ">\${idx + 1}</span>
                <span style="font-size: 8px; font-weight: 850; color: \${colorHex}">\${pt.count}</span>
              </div>
            \`,
            className: "custom-print-icon",
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          L.marker([pt.lat, pt.lng], { icon: camIcon }).addTo(map);
          bounds.extend([pt.lat, pt.lng]);
        });
        
        map.fitBounds(bounds, { padding: [30, 30] });
      }
      
      // Delay printing slightly to let the tiles load!
      setTimeout(() => {
        window.print();
      }, 1000);
    } catch(err) {
      console.error(err);
      window.print();
    }
  };
</script>
</body></html>`;

      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
    }
  };

  return (
    <div className="space-y-6" id="pricing-step-container">
      <div className="space-y-6">
        {/* MAIN PANEL (Full Width): Main pricing items list grid */}
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-150">
            <div>
              <span className="text-[10px] font-bold text-zinc-455 uppercase tracking-wider font-mono">SPECIFICATION ITEMS / รายละเอียดผลิตภัณฑ์และค่าแรง</span>
              <p className="text-[11px] text-zinc-400">แก้ไขจำนวน ราคาหน่วย หรือลบ/เพิ่มตัวเลือกในใบประเมิน</p>
            </div>
            <div className="flex gap-2">
              {/* If verified as admin/superadmin, show toggle costs button */}
              {isAdminVerified && (
                <button
                  type="button"
                  onClick={() => setShowCostsAdmin(!showCostsAdmin)}
                  className={`px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                    showCostsAdmin
                      ? "bg-amber-50 border-amber-300 text-amber-800"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
                  }`}
                >
                  <span>{showCostsAdmin ? "👁️" : "🙈"}</span> {showCostsAdmin ? "ซ่อนต้นทุนอุปกรณ์" : "แสดงต้นทุนอุปกรณ์ (Admin)"}
                </button>
              )}
              {/* If not verified, but unlock callback is provided, show unlock button */}
              {!isAdminVerified && onVerifyAdmin && (
                <button
                  type="button"
                  onClick={onVerifyAdmin}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-semibold rounded-lg border border-zinc-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🔐</span> แสดงต้นทุนอุปกรณ์
                </button>
              )}
              <button
                type="button"
                onClick={() => handleAddNewItem("other")}
                className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                + เพิ่มรายการส่งมอบอื่นๆ
              </button>
            </div>
          </div>

          {/* === MOBILE CARD LIST (portrait) — block on mobile, hidden on md+ === */}
          <div className="block md:hidden space-y-2">
            {pricingItems.map((item) => (
              <div key={item.id} className="bg-zinc-50/60 border border-zinc-200 rounded-xl p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase shrink-0 ${
                    item.category === "hardware" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    item.category === "accessory" ? "bg-green-50 text-green-700 border border-green-200" :
                    item.category === "labor" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                    "bg-zinc-100 text-zinc-500 border border-zinc-200"
                  }`}>
                    {item.category === "hardware" ? "HW" : item.category === "accessory" ? "ACC" : item.category === "labor" ? "LAB" : "ETC"}
                  </span>
                  <textarea
                    value={item.name}
                    onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                    rows={2}
                    className="flex-1 bg-transparent font-semibold text-zinc-800 border-none focus:outline-none focus:ring-1 focus:ring-zinc-300 rounded px-1 -mx-1 resize-none leading-snug text-xs"
                  />
                  <button type="button" onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-zinc-350 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className={`grid gap-1.5 ${showCostsAdmin && isAdminVerified ? "grid-cols-4" : "grid-cols-2"}`}>
                  <div className="space-y-0.5">
                    <div className="font-mono text-[8px] text-zinc-400 tracking-wide uppercase">จำนวน</div>
                    <input type="number" min={0.1} step="any" value={item.quantity}
                      onChange={(e) => handleItemValueChange(item.id, "quantity", e.target.value)}
                      className="w-full px-1.5 py-1.5 rounded-lg border text-center text-xs font-bold bg-white font-mono border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-mono text-[8px] text-zinc-400 tracking-wide uppercase">หน่วย</div>
                    <input type="text" value={item.unit}
                      onChange={(e) => handleUpdateItemUnit(item.id, e.target.value)}
                      className="w-full px-1.5 py-1.5 border border-zinc-300 text-xs text-center rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" />
                  </div>
                  {showCostsAdmin && isAdminVerified && (
                    <>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[8px] text-zinc-400 tracking-wide uppercase">ราคา/หน่วย</div>
                        <input type="number" min={0} value={item.unitPrice}
                          onChange={(e) => handleItemValueChange(item.id, "unitPrice", e.target.value)}
                          className="w-full px-1.5 py-1.5 rounded-lg border text-right text-xs font-bold bg-white font-mono border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20" />
                      </div>
                      <div className="space-y-0.5 text-right">
                        <div className="font-mono text-[8px] text-zinc-400 tracking-wide uppercase">รวม (฿)</div>
                        <div className="font-mono font-bold text-zinc-900 text-xs py-1.5 pr-0.5">
                          {(item.quantity * item.unitPrice).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* === DESKTOP TABLE — hidden on mobile, shown on md+ === */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 uppercase font-mono text-[9px] border-b border-zinc-200">
                  <th className="py-2.5 px-3">รายการอุปกรณ์และงานบริการ</th>
                  <th className="py-2.5 px-3 w-16 text-center">ประเภท</th>
                  <th className="py-2.5 px-3 w-16 text-center">จำนวน</th>
                  <th className="py-2.5 px-3 w-16 text-center">หน่วย</th>
                  {showCostsAdmin && isAdminVerified && (
                    <>
                      <th className="py-2.5 px-3 w-24 text-right hidden md:table-cell">ราคาหน่วย (฿)</th>
                      <th className="py-2.5 px-3 w-24 text-right">ราคารวม (฿)</th>
                    </>
                  )}
                  <th className="py-2.5 px-2 w-8 text-center"></th>
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
                    {showCostsAdmin && isAdminVerified && (
                      <>
                        <td className="py-3 px-3 text-right hidden md:table-cell">
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
                      </>
                    )}
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
              PRICING PREVIEW / สรุปงบระบบ (เช่า 3 ปี)
            </h4>

            {/* Price values summary stack */}
            <div className="space-y-4 text-xs text-zinc-700 font-sans border-b border-zinc-200 pb-5">
              <div className="flex justify-between items-center text-zinc-650 font-medium">
                <span>มูลค่าอุปกรณ์และบริการ (Subtotal):</span>
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
                <span>ยอดจัดเช่าอุปกรณ์ต้นทุนสุทธิ์:</span>
                <span className="font-mono font-bold text-zinc-800">
                  ฿{calBeforeVat.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-500 border-t border-zinc-200/50 pt-2">
                <span>บวก กำไรโครงการ (+40%):</span>
                <span className="font-mono font-semibold text-zinc-750">
                  ฿{(calBeforeVat * 0.4).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-500">
                <span>บวก ดอกเบี้ยจัดเช่า 8%/ปี (3 ปี = 24%):</span>
                <span className="font-mono font-semibold text-zinc-750">
                  ฿{leaseInterest.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center text-zinc-800 font-bold border-t border-zinc-200/50 pt-2">
                <span>รวมมูลค่าระบบจัดเช่าอุปกรณ์:</span>
                <span className="font-mono text-zinc-900">
                  ฿{leaseTotalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
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
                    <span className="text-[10px] text-zinc-500">มูลค่าภาษี VAT รายเดือน:</span>
                    <span className="font-mono text-zinc-700 font-semibold">
                      ฿{calVatAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}/ด.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grand Total output showcase */}
            <div className="space-y-3 border-t border-zinc-200/60 pt-3">
              <div className="space-y-1">
                <span className="text-zinc-550 text-[9px] uppercase font-bold font-mono tracking-wider block">
                  ค่าเช่าระบบอุปกรณ์ต่อเดือน (36 งวด)
                </span>
                <div className="text-xl font-bold font-mono text-zinc-900 flex items-baseline justify-between">
                  <span>฿</span>
                  <span className="text-[#0071e3]">{leaseMonthlyPayment.toLocaleString("th-TH", { minimumFractionDigits: 2 })}<span className="text-xs text-zinc-500 font-sans font-normal">/ด.</span></span>
                </div>
              </div>

              <div className="space-y-1 pt-3 border-t border-zinc-200/40">
                <span className="text-zinc-550 text-[9px] uppercase font-bold font-mono tracking-wider block">
                  ค่าเช่าวงจรเครือข่ายรายเดือน (NT LINKS OPEX)
                </span>
                <div className="text-xl font-bold font-mono text-zinc-900 flex items-baseline justify-between">
                  <span>฿</span>
                  <span className="text-[#0071e3]">{totalMonthlyPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}<span className="text-xs text-zinc-500 font-sans font-normal">/ด.</span></span>
                </div>
              </div>

              <div className="space-y-1 pt-3 border-t-2 border-dashed border-zinc-250">
                <span className="text-[#0071e3] text-[9.5px] uppercase font-bold font-mono tracking-wider block">
                  ค่าเช่ารวมรายเดือนทั้งสิ้น (GRAND TOTAL MONTHLY)
                </span>
                <div className="text-2xl font-black font-mono text-zinc-900 flex items-baseline justify-between">
                  <span>฿</span>
                  <span className="text-[#0071e3]">{grandMonthlyTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}<span className="text-xs text-zinc-500 font-sans font-normal">/ด.</span></span>
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
                onClick={handlePrintPDF}
                className="w-full py-2 bg-zinc-105 border border-zinc-300 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                📄 พิมพ์ / ส่งออก PDF ใบเสนอราคา
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
