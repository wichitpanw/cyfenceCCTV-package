# PowerPoint (PPTX) Survey Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export the project survey report as a PowerPoint presentation (`.pptx`) with a standard landscape 16:9 aspect ratio and provide an interactive HTML/CSS slide preview modal on the web application.

**Architecture:** We will implement an interactive `SurveyReportPreviewModal` React component that simulates the slides in 16:9 aspect ratio. The PowerPoint export will be built using `pptxgenjs` on the client side, utilizing `html2canvas` to capture the interactive Leaflet map from the preview and convert it to a static image for Slide 1.

**Tech Stack:** React, TypeScript, TailwindCSS, `pptxgenjs`, `html2canvas`, Leaflet.

---

### Task 1: Dependency Installation

**Files:**
- Modify: `c:/Users/M4u_b/Gemini Project/CCTV package app/package.json`

- [ ] **Step 1: Install `pptxgenjs` and `html2canvas` packages**
  Run: `npm install pptxgenjs html2canvas`
  Expected: Installation finishes successfully and package.json dependency lists are updated.

- [ ] **Step 2: Verify TypeScript builds**
  Run: `npm run build`
  Expected: Build finishes with no compile errors related to new imports.

- [ ] **Step 3: Commit dependency changes**
  Run: `git add package.json package-lock.json && git commit -m "chore: add pptxgenjs and html2canvas dependencies"`

---

### Task 2: Create PowerPoint Exporter Utility

**Files:**
- Create: `c:/Users/M4u_b/Gemini Project/CCTV package app/src/utils/pptxExporter.ts`

- [ ] **Step 1: Create the file structure with imports and base exporter function**
  Create `src/utils/pptxExporter.ts` and define the data structures and main function signature.

```typescript
import pptxgen from "pptxgenjs";
import { ProjectSurvey, CameraPoint } from "../types";

export async function exportSurveyReportToPPTX(
  project: ProjectSurvey,
  mapImageBase64: string | null
): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_16x9";
  
  // Set theme colors
  const NT_BLUE = "002D62";
  const NT_ORANGE = "FF6F00";
  const TEXT_DARK = "111827";
  const BG_LIGHT = "F3F4F6";

  // Create Slide 1: Cover & Map
  const slide1 = pptx.addSlide();
  
  // Left Column elements (Cover)
  slide1.addText(project.customerInfo?.projectName || "โครงการทั่วไป", {
    x: 0.5, y: 1.2, w: 3.5, h: 0.8,
    fontSize: 22, bold: true, color: NT_BLUE,
    fontFace: "Noto Sans Thai"
  });

  slide1.addText("รายงานผลการสำรวจจุดติดตั้งกล้อง\n(Survey Report)", {
    x: 0.5, y: 2.0, w: 3.5, h: 1.0,
    fontSize: 16, color: TEXT_DARK,
    fontFace: "Noto Sans Thai"
  });

  const metadataText = `ลูกค้า: ${project.customerInfo?.customerName || "-"}\nวันที่สำรวจ: ${new Date().toLocaleDateString("th-TH")}\nผู้สำรวจ: ${project.customerInfo?.surveyorName || "-"}\nจำนวนจุดติดตั้ง: ${project.cameraPoints?.length || 0} จุด`;
  slide1.addText(metadataText, {
    x: 0.5, y: 3.2, w: 3.5, h: 1.5,
    fontSize: 11, color: "555555",
    lineSpacing: 18,
    fontFace: "Noto Sans Thai"
  });

  // Right Column (Map image)
  if (mapImageBase64) {
    slide1.addImage({
      data: mapImageBase64,
      x: 4.2, y: 0.8, w: 5.3, h: 4.0
    });
  } else {
    slide1.addText("[ไม่มีภาพแผนผังโครงการ]", {
      x: 4.2, y: 0.8, w: 5.3, h: 4.0,
      fill: { color: BG_LIGHT },
      align: "center",
      valign: "middle",
      color: "888888",
      fontSize: 14,
      fontFace: "Noto Sans Thai"
    });
  }

  // Create Slide 2+: Point details
  const points = project.cameraPoints || [];
  points.forEach((pt, idx) => {
    const slide = pptx.addSlide();
    
    // Header
    slide.addText(`จุดที่ ${idx + 1}: ${pt.name}`, {
      x: 0.5, y: 0.3, w: 9.0, h: 0.4,
      fontSize: 16, bold: true, color: NT_BLUE,
      fontFace: "Noto Sans Thai"
    });

    // Left Column: Specs Table
    const tableData = [
      [
        { text: "คุณสมบัติอุปกรณ์", options: { bold: true, fill: { color: NT_BLUE }, color: "FFFFFF" } },
        { text: "รายละเอียดการติดตั้ง", options: { bold: true, fill: { color: NT_BLUE }, color: "FFFFFF" } }
      ],
      [{ text: "ประเภทกล้อง" }, { text: pt.type || "Bullet" }],
      [{ text: "เสาติดตั้ง" }, { text: pt.poleType !== "None" ? pt.poleType : "ยึดติดผนัง/โครงสร้าง" }],
      [{ text: "สาย LAN" }, { text: `${pt.lanCableLength || 25} เมตร` }],
      [{ text: "กล่องกันน้ำ/ตู้ฝน" }, { text: pt.hasOutdoorCabinet ? "มี (Outdoor Cabinet)" : "ไม่มี" }],
      [{ text: "เครื่องสำรองไฟ" }, { text: pt.hasCabinetUps ? "มี (UPS 800VA)" : "ไม่มี" }],
      [{ text: "สวิตช์ PoE" }, { text: pt.hasPoeSwitch ? "มี (PoE Switch)" : "ไม่มี" }],
      [{ text: "พิกัดดาวเทียม" }, { text: `${pt.lat?.toFixed(6) || "-"}, ${pt.lng?.toFixed(6) || "-"}` }]
    ];
    
    slide.addTable(tableData, {
      x: 0.5, y: 0.9, w: 4.0, h: 3.2,
      fontSize: 9,
      fontFace: "Noto Sans Thai",
      border: { pt: 0.5, color: "CCCCCC" }
    });

    // Note block if notes present
    if (pt.notes) {
      slide.addText(`บันทึกเพิ่มเติม:\n${pt.notes}`, {
        x: 0.5, y: 4.3, w: 4.0, h: 1.0,
        fontSize: 9,
        color: TEXT_DARK,
        fill: { color: "E8F2FC" },
        inset: 0.1,
        fontFace: "Noto Sans Thai"
      });
    }

    // Right Column: Main photo & View photos
    // Upper Half: Main Photo
    if (pt.photoUrl) {
      slide.addImage({
        path: pt.photoUrl,
        x: 4.8, y: 0.9, w: 4.7, h: 2.2,
        sizing: { type: "contain" }
      });
    } else {
      slide.addText("[ไม่มีภาพประกอบจุดสำรวจ]", {
        x: 4.8, y: 0.9, w: 4.7, h: 2.2,
        fill: { color: BG_LIGHT },
        align: "center",
        valign: "middle",
        color: "888888",
        fontSize: 11,
        fontFace: "Noto Sans Thai"
      });
    }

    // Lower Half: View Grid (1x2 or 2x2)
    const camsCount = pt.selectedSet === "Set 2" ? 2 : pt.selectedSet === "Set 3" ? 3 : pt.selectedSet === "Set 4" ? 4 : 1;
    const viewUrls = pt.viewPhotoUrls || (pt.viewPhotoUrl ? [pt.viewPhotoUrl] : []);
    
    // Position parameters for views grid
    const startY = 3.3;
    const totalW = 4.7;
    const totalH = 1.9;
    
    if (camsCount <= 2) {
      // 1x2 grid (Side-by-side)
      const w = (totalW - 0.2) / 2;
      for (let i = 0; i < camsCount; i++) {
        const x = 4.8 + i * (w + 0.2);
        const url = viewUrls[i];
        if (url) {
          slide.addImage({
            path: url,
            x, y: startY, w, h: totalH,
            sizing: { type: "contain" }
          });
        } else {
          slide.addText(`[ไม่มีภาพมุมกล้อง #${i+1}]`, {
            x, y: startY, w, h: totalH,
            fill: { color: BG_LIGHT },
            align: "center",
            valign: "middle",
            color: "888888",
            fontSize: 9,
            fontFace: "Noto Sans Thai"
          });
        }
      }
    } else {
      // 2x2 grid
      const w = (totalW - 0.2) / 2;
      const h = (totalH - 0.15) / 2;
      for (let i = 0; i < camsCount; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = 4.8 + col * (w + 0.2);
        const y = startY + row * (h + 0.15);
        const url = viewUrls[i];
        if (url) {
          slide.addImage({
            path: url,
            x, y, w, h,
            sizing: { type: "contain" }
          });
        } else {
          slide.addText(`[ไม่มีภาพ #${i+1}]`, {
            x, y, w, h,
            fill: { color: BG_LIGHT },
            align: "center",
            valign: "middle",
            color: "888888",
            fontSize: 8,
            fontFace: "Noto Sans Thai"
          });
        }
      }
    }
  });

  // Save the presentation
  await pptx.writeFile({ fileName: `Survey_Report_${project.customerInfo?.projectName || "Project"}.pptx` });
}
```

- [ ] **Step 2: Verify code compilation**
  Run: `npm run build`
  Expected: Pass without compilation issues.

- [ ] **Step 3: Commit helper utility**
  Run: `git add src/utils/pptxExporter.ts && git commit -m "feat: create pptx exporter utility function"`

---

### Task 3: Create Preview Modal Component

**Files:**
- Create: `c:/Users/M4u_b/Gemini Project/CCTV package app/src/components/SurveyReportPreviewModal.tsx`

- [ ] **Step 1: Write interactive modal preview layout with slide simulations**
  Create `src/components/SurveyReportPreviewModal.tsx`. It needs to render standard Leaflet map elements dynamically inside a hidden viewport when loading, then convert it using `html2canvas` and display the resulting slider mockups.

```typescript
import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { ProjectSurvey } from "../types";
import { exportSurveyReportToPPTX } from "../utils/pptxExporter";
import html2canvas from "html2canvas";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectSurvey;
}

export default function SurveyReportPreviewModal({ isOpen, onClose, project }: PreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mapSnapshot, setMapSnapshot] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const totalSlides = 1 + (project.cameraPoints?.length || 0);

  // Capture Leaflet Map as base64 static image
  useEffect(() => {
    if (isOpen && !mapSnapshot) {
      setTimeout(() => {
        if (mapContainerRef.current) {
          html2canvas(mapContainerRef.current, {
            useCORS: true,
            allowTaint: true,
            logging: false
          }).then(canvas => {
            const dataUrl = canvas.toDataURL("image/png");
            setMapSnapshot(dataUrl);
          }).catch(err => {
            console.error("Error capturing Leaflet map: ", err);
          });
        }
      }, 1000); // Wait 1s for Leaflet tile animations
    }
  }, [isOpen, mapSnapshot, project]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportSurveyReportToPPTX(project, mapSnapshot);
    } catch (err) {
      console.error("Export PPTX failed: ", err);
      alert("ไม่สามารถสร้างไฟล์ PowerPoint ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[99999] p-4 select-none">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[620px] border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-bold text-sm text-gray-900">
              ตัวอย่างรายงานผลการสำรวจ (PowerPoint 16:9)
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              โครงการ: {project.customerInfo?.projectName || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังเจเนอเรต...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PowerPoint (.pptx)</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden Leaflet Map for Capturing */}
        {!mapSnapshot && (
          <div className="absolute top-[-9999px] left-[-9999px]">
            <div
              ref={mapContainerRef}
              style={{ width: "800px", height: "450px" }}
            >
              <MapContainer
                center={[
                  parseFloat(project.customerInfo?.latitude || "13.7563"),
                  parseFloat(project.customerInfo?.longitude || "100.5018")
                ]}
                zoom={17}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {project.cameraPoints?.map((pt, idx) => (
                  <Marker
                    key={pt.id}
                    position={[pt.lat || 13.7563, pt.lng || 100.5018]}
                    icon={L.divIcon({
                      html: `<div style="width:12px;height:12px;border-radius:50%;background-color:#0071e3;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
                      className: ""
                    })}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Body (Interactive Slide Container) */}
        <div className="flex-1 bg-gray-100/50 p-6 flex items-center justify-center overflow-auto min-h-0">
          <div className="w-full max-w-[800px] aspect-video bg-white shadow-lg border border-gray-200/80 rounded-lg p-6 relative overflow-hidden flex flex-col justify-between">
            {currentSlide === 0 ? (
              // Slide 1 Layout (Cover)
              <div className="grid grid-cols-12 gap-6 h-full items-center">
                <div className="col-span-5 flex flex-col justify-between h-full py-4">
                  <div>
                    <img src="/cyfence_logo.png" alt="Logo" className="h-6 object-contain self-start" />
                    <h2 className="text-lg font-bold text-gray-900 mt-6 leading-tight">
                      รายงานผลการสำรวจจุดติดตั้งกล้อง (Survey Report)
                    </h2>
                  </div>
                  <div className="text-[10px] text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-150">
                    <p><span className="font-semibold">โครงการ:</span> {project.customerInfo?.projectName || "-"}</p>
                    <p><span className="font-semibold">ลูกค้า:</span> {project.customerInfo?.customerName || "-"}</p>
                    <p><span className="font-semibold">ผู้สำรวจ:</span> {project.customerInfo?.surveyorName || "-"}</p>
                    <p><span className="font-semibold">จุดติดตั้งรวม:</span> {project.cameraPoints?.length || 0} จุด</p>
                  </div>
                </div>
                <div className="col-span-7 h-full flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl overflow-hidden relative">
                  {mapSnapshot ? (
                    <img src={mapSnapshot} alt="Map snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>กำลังโหลดแผนผังโครงการ...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Slide 2+ Layout (Points)
              (() => {
                const pt = project.cameraPoints?.[currentSlide - 1];
                if (!pt) return null;
                const camsCount = pt.selectedSet === "Set 2" ? 2 : pt.selectedSet === "Set 3" ? 3 : pt.selectedSet === "Set 4" ? 4 : 1;
                const viewUrls = pt.viewPhotoUrls || (pt.viewPhotoUrl ? [pt.viewPhotoUrl] : []);
                
                return (
                  <div className="flex flex-col h-full justify-between">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-150 pb-2">
                      <img src="/cyfence_logo.png" alt="Logo" className="h-5 object-contain" />
                      <span className="font-bold text-xs text-indigo-600">
                        จุดที่ {currentSlide}: {pt.name}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-12 gap-5 flex-1 min-h-0 mt-3.5 mb-2">
                      {/* Left: Specs */}
                      <div className="col-span-5 flex flex-col justify-between h-full min-h-0">
                        <table className="w-full text-[9px] text-gray-700 border-collapse">
                          <tbody>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">ประเภทกล้อง:</td><td className="py-1 text-gray-900 font-medium">{pt.type}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">การติดตั้งเสา:</td><td className="py-1 text-gray-900 font-medium">{pt.poleType !== "None" ? pt.poleType : "ยึดติดผนัง"}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">ความยาวสาย LAN:</td><td className="py-1 text-gray-900 font-medium">{pt.lanCableLength || 25} เมตร</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">กล่องเหล็ก/ตู้กันฝน:</td><td className="py-1 text-gray-900 font-medium">{pt.hasOutdoorCabinet ? "มี" : "ไม่มี"}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">เครื่องสำรองไฟ:</td><td className="py-1 text-gray-900 font-medium">{pt.hasCabinetUps ? "มี" : "ไม่มี"}</td></tr>
                            <tr className="border-b border-gray-100"><td className="py-1 font-semibold text-gray-500">สวิตช์ PoE:</td><td className="py-1 text-gray-900 font-medium">{pt.hasPoeSwitch ? "มี" : "ไม่มี"}</td></tr>
                          </tbody>
                        </table>
                        {pt.notes && (
                          <div className="bg-indigo-50/50 border border-indigo-100 p-2 rounded-lg mt-2 overflow-auto text-[8px] text-gray-600 max-h-[60px]">
                            <span className="font-bold text-indigo-800">บันทึกเพิ่มเติม:</span> {pt.notes}
                          </div>
                        )}
                      </div>

                      {/* Right: Photos */}
                      <div className="col-span-7 flex flex-col gap-2.5 h-full min-h-0">
                        {/* Main photo */}
                        <div className="flex-1 bg-gray-50 border border-gray-150 rounded-lg overflow-hidden flex items-center justify-center min-h-0 relative">
                          {pt.photoUrl ? (
                            <img src={pt.photoUrl} alt="Main" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-gray-400">ไม่มีภาพจุดติดตั้งหน้างาน</span>
                          )}
                        </div>

                        {/* View Grid */}
                        <div className="grid grid-cols-2 gap-2 h-[80px] shrink-0">
                          {Array.from({ length: Math.min(4, camsCount) }).map((_, camIdx) => {
                            const url = viewUrls[camIdx];
                            return (
                              <div key={camIdx} className="bg-gray-50 border border-gray-150 rounded-md overflow-hidden flex items-center justify-center relative">
                                {url ? (
                                  <img src={url} alt="View" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-[8px] text-gray-400">มุมกล้อง {camIdx + 1}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[8px] text-gray-400 pt-1 border-t border-gray-150">
                      <span>NT Cyfence CCTV Survey System</span>
                      <span>หน้า {currentSlide} จาก {totalSlides - 1}</span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700">
            หน้า {currentSlide + 1} / {totalSlides}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
              disabled={currentSlide === totalSlides - 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify code compilation**
  Run: `npm run build`
  Expected: Pass without compilation issues.

- [ ] **Step 3: Commit preview component**
  Run: `git add src/components/SurveyReportPreviewModal.tsx && git commit -m "feat: create SurveyReportPreviewModal component"`

---

### Task 4: Integrate Modal with App and History

**Files:**
- Modify: `c:/Users/M4u_b/Gemini Project/CCTV package app/src/App.tsx:2910-2920`
- Modify: `c:/Users/M4u_b/Gemini Project/CCTV package app/src/components/ProjectHistory.tsx:530-585`

- [ ] **Step 1: Modify ProjectHistory.tsx to remove PDF options and trigger preview modal**
  In `ProjectHistory.tsx`, replace the portrait/landscape dialog buttons with a single PowerPoint survey report option.

- [ ] **Step 2: Add Preview Modal state and render it in `App.tsx`**
  Import `SurveyReportPreviewModal` into `App.tsx`, maintain an `isReportPreviewOpen` state, and map the `onPrintSurveyReport` props.

- [ ] **Step 3: Test and Verify build compile**
  Run: `npm run build`
  Expected: Builds correctly.

- [ ] **Step 4: Commit integration changes**
  Run: `git add src/App.tsx src/components/ProjectHistory.tsx && git commit -m "feat: integrate SurveyReportPreviewModal in main App and ProjectHistory"`
