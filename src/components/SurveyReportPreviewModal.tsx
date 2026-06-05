import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { ProjectSurvey } from "../types";
import { exportSurveyReportToPPTX } from "../utils/pptxExporter";
import html2canvas from "html2canvas-pro";
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
  const [isCapturingMap, setIsCapturingMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const totalSlides = 1 + (project.cameraPoints?.length || 0);

  // Sync state reset on modal open
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setMapSnapshot(null);
      setIsCapturingMap(true);
    }
  }, [isOpen, project]);

  // Capture Leaflet Map as base64 static image
  useEffect(() => {
    if (isOpen && isCapturingMap && !mapSnapshot) {
      // Small timeout to allow Leaflet tiles and markers to load properly
      const timer = setTimeout(() => {
        if (mapContainerRef.current) {
          html2canvas(mapContainerRef.current, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: "#fafafa"
          }).then(canvas => {
            const dataUrl = canvas.toDataURL("image/png");
            setMapSnapshot(dataUrl);
            setIsCapturingMap(false);
          }).catch(err => {
            console.error("Error capturing Leaflet map: ", err);
            setIsCapturingMap(false);
          });
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isCapturingMap, mapSnapshot]);

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

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1));
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevSlide();
      if (e.key === "ArrowRight") handleNextSlide();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  const defaultLat = project.customerInfo?.latitude ? parseFloat(project.customerInfo.latitude) : 13.7563;
  const defaultLng = project.customerInfo?.longitude ? parseFloat(project.customerInfo.longitude) : 100.5018;
  const centerLat = isNaN(defaultLat) ? 13.7563 : defaultLat;
  const centerLng = isNaN(defaultLng) ? 100.5018 : defaultLng;

  // Custom marker icon for static capture
  const createCaptureIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: #30d158;
          border: 2px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        "></div>
      `,
      className: "",
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 select-none animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[90vh] max-h-[640px] border border-slate-100">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-[13px] md:text-sm text-slate-800 flex items-center gap-1.5">
              📊 รายงานผลการสำรวจ (PowerPoint 16:9 Widescreen)
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[300px] md:max-w-md">
              โครงการ: {project.customerInfo?.projectName || "โครงการทั่วไป"} | ลูกค้า: {project.customerInfo?.customerName || "-"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102 active:scale-98"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังดาวน์โหลด...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PPTX</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden Leaflet Map for Snapshot Generation */}
        {isOpen && !mapSnapshot && (
          <div className="absolute top-[-9999px] left-[-9999px]">
            <div
              ref={mapContainerRef}
              style={{ width: "800px", height: "500px" }}
              className="relative rounded-lg overflow-hidden border border-slate-200"
            >
              <MapContainer
                center={[centerLat, centerLng]}
                zoom={17}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Project Control Center Pin */}
                <Marker
                  position={[centerLat, centerLng]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        background-color: #111827;
                        border: 2px solid white;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
                      "></div>
                    `,
                    className: "",
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                  })}
                />

                {/* Camera Markers */}
                {project.cameraPoints?.map((pt) => {
                  const ptLat = pt.lat !== undefined ? pt.lat : centerLat;
                  const ptLng = pt.lng !== undefined ? pt.lng : centerLng;
                  return (
                    <Marker
                      key={pt.id}
                      position={[ptLat, ptLng]}
                      icon={createCaptureIcon()}
                    />
                  );
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Slide Preview Viewport (Calculated 16:9 aspect ratio container) */}
        <div className="flex-1 bg-slate-100/40 p-4 md:p-6 flex items-center justify-center overflow-auto min-h-0">
          <div className="w-full max-w-[760px] aspect-[16/9] bg-white shadow-xl border border-slate-250 rounded-xl p-5 md:p-6 relative overflow-hidden flex flex-col justify-between transition-all select-text select-none">
            
            {currentSlide === 0 ? (
              // ==========================================
              // Slide 1 View: Cover & Map Layout
              // ==========================================
              <div 
                className="grid grid-cols-12 gap-5 h-full items-center relative p-5 md:p-6"
                style={{
                  backgroundImage: "url('/template/image10.jpeg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {/* Backdrop overlay to keep text highly legible */}
                <div className="absolute inset-0 bg-white/85 z-0"></div>

                {/* Left Metadata Column */}
                <div className="col-span-5 flex flex-col justify-between h-full py-2 z-10">
                  <div>
                    <img src="/template/image3.png" alt="NT Logo" className="h-10 md:h-12 object-contain self-start" />
                    <h2 className="text-[15px] md:text-[18px] font-extrabold text-slate-900 mt-4 leading-snug">
                      รายงานผลการสำรวจจุดติดตั้งกล้อง (Survey Report)
                    </h2>
                  </div>
                  <div className="text-[9.5px] md:text-[10.5px] text-slate-700 space-y-1.5 bg-white/90 p-3 rounded-xl border border-slate-200/50 shadow-xs">
                    <p><span className="font-bold text-slate-900">โครงการ:</span> {project.customerInfo?.projectName || "โครงการทั่วไป"}</p>
                    <p><span className="font-bold text-slate-900">ลูกค้า:</span> {project.customerInfo?.customerName || "-"}</p>
                    <p><span className="font-bold text-slate-900">ผู้สำรวจ:</span> {project.customerInfo?.surveyorName || "-"}</p>
                    <p><span className="font-bold text-slate-900">จุดติดตั้งรวม:</span> {project.cameraPoints?.length || 0} จุด</p>
                  </div>
                </div>
                {/* Right Map Snapshot Column */}
                <div className="col-span-7 h-full flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-md z-10">
                  {mapSnapshot ? (
                    <img src={mapSnapshot} alt="Map snapshot" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[10px] text-slate-400 flex flex-col items-center gap-2 text-center px-4">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>กำลังสร้างแผนผังจุดติดตั้งและปักหมุดโครงการ...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // ==========================================
              // Slide 2+ View: Camera Point Layout
              // ==========================================
              (() => {
                const pt = project.cameraPoints?.[currentSlide - 1];
                if (!pt) return null;
                const camsCount = pt.selectedSet === "Set 2" ? 2 : pt.selectedSet === "Set 3" ? 3 : pt.selectedSet === "Set 4" ? 4 : 1;
                const viewUrls = pt.viewPhotoUrls || (pt.viewPhotoUrl ? [pt.viewPhotoUrl] : []);

                const hasPoe = pt.hasPoeSwitch ? "มี" : "ไม่มี";
                const hasGround = pt.hasGroundRod ? "มี" : "ไม่มี";
                const hasCabinet = pt.hasOutdoorCabinet ? "มี" : "ไม่มี";
                const hasUps = pt.hasCabinetUps ? "มี" : "ไม่มี";
                const hasSd = pt.hasSdCard ? "มี" : "ไม่มี";
                const hasPower = pt.hasPowerMeter ? "มี" : "ไม่มี";

                return (
                  <div className="flex flex-col h-full justify-between">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                      <img src="/template/image3.png" alt="NT Logo" className="h-7 md:h-8 object-contain" />
                      <span className="font-extrabold text-[12px] md:text-[13.5px] text-indigo-700 flex items-center gap-1">
                        จุดที่ {currentSlide}: {pt.name}
                      </span>
                    </div>

                    {/* Content Body Grid */}
                    <div className="grid grid-cols-12 gap-4 flex-1 min-h-0 mt-3.5 mb-2">
                      {/* Left specs table (Reduced from col-span-5 to col-span-4 to give photos more room) */}
                      <div className="col-span-4 flex flex-col justify-between h-full min-h-0">
                        <div className="overflow-auto max-h-full">
                          <table className="w-full text-[8px] md:text-[9.2px] text-slate-700 border-collapse">
                            <tbody>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">ประเภทกล้อง:</td><td className="py-0.5 text-slate-850 font-bold">{pt.type}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">การติดตั้งเสา:</td><td className="py-0.5 text-slate-800 font-medium">{pt.poleType !== "None" ? pt.poleType : "ยึดผนัง"}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">ความยาวสาย LAN:</td><td className="py-0.5 text-slate-800 font-medium">{pt.lanCableLength || 25} เมตร</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">ตู้เหล็กกันฝน:</td><td className="py-0.5 text-slate-800 font-medium">{hasCabinet}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">เครื่องสำรองไฟ:</td><td className="py-0.5 text-slate-800 font-medium">{hasUps}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">สวิตช์ PoE:</td><td className="py-0.5 text-slate-800 font-medium">{hasPoe}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">มิเตอร์ไฟ/สายดิน:</td><td className="py-0.5 text-slate-800 font-medium">{hasPower} / {hasGround}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">SD Card:</td><td className="py-0.5 text-slate-800 font-medium">{hasSd}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">กลุ่มสเปก (Set):</td><td className="py-0.5 text-indigo-600 font-bold">{pt.selectedSet || "Set 1"}</td></tr>
                              <tr className="border-b border-slate-100"><td className="py-0.5 font-bold text-slate-400">พิกัด GPS:</td><td className="py-0.5 text-slate-800 font-mono text-[7.5px]">{pt.lat?.toFixed(6) || "-"}, {pt.lng?.toFixed(6) || "-"}</td></tr>
                            </tbody>
                          </table>
                        </div>
                        {pt.notes && (
                          <div className="bg-blue-50/50 border border-blue-100 p-1.5 rounded-lg mt-1 overflow-auto text-[7.5px] text-slate-600 max-h-[45px] leading-relaxed">
                            <span className="font-bold text-blue-800">บันทึก:</span> {pt.notes}
                          </div>
                        )}
                      </div>

                      {/* Right photos col (Expanded from col-span-7 to col-span-8 to make photos much larger) */}
                      <div className="col-span-8 flex flex-col gap-2.5 h-full min-h-0">
                        {/* Main site photo */}
                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center min-h-0 relative shadow-inner">
                          {pt.photoUrl ? (
                            <img src={pt.photoUrl} alt="Main" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[9px] text-slate-400">ไม่มีภาพจุดติดตั้งหน้างาน</span>
                          )}
                        </div>

                        {/* View Grid (Single-row layout with dynamic columns matching the PPTX export to display camera example images larger) */}
                        <div 
                          className="grid gap-2 h-[120px] shrink-0"
                          style={{ gridTemplateColumns: `repeat(${camsCount}, minmax(0, 1fr))` }}
                        >
                          {Array.from({ length: camsCount }).map((_, camIdx) => {
                            const url = viewUrls[camIdx];
                            return (
                              <div key={camIdx} className="bg-slate-50 border border-slate-200 rounded-md overflow-hidden flex items-center justify-center relative shadow-sm">
                                {url ? (
                                  <img src={url} alt="View" className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-[7.5px] text-slate-400 font-medium text-center px-1">ภาพมุมกล้องตัวที่ {camIdx + 1}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-150">
                      <span>NT Cyfence CCTV Survey System</span>
                      <span>หน้า {currentSlide} จาก {totalSlides - 1}</span>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11.5px] font-bold text-slate-700">
            สไลด์ที่ {currentSlide + 1} / {totalSlides}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-102"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>
            <button
              type="button"
              onClick={handleNextSlide}
              disabled={currentSlide === totalSlides - 1}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-102"
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
