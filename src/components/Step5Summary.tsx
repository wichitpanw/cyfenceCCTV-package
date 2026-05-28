import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Building, 
  MapPin, 
  Cpu, 
  ClipboardList, 
  Layers, 
  ShieldAlert,
  HardDrive,
  Maximize2,
  Minimize2,
  Image as ImageIcon
} from "lucide-react";
import { CustomerInfo, TechRequirements, CameraPoint, PricingItem } from "../types";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Step5Props {
  customerInfo: CustomerInfo;
  requirements: TechRequirements;
  hasSurveyReport: boolean;
  cameraPoints: CameraPoint[];
  pricingItems: PricingItem[];
  onNext: () => void;
  onPrev: () => void;
  isEditMode?: boolean;
}

// Map center panning controller sub-component for Step 5 Summary
function MapCenterController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), {
        animate: true,
        duration: 0.5
      });
    }
  }, [lat, lng, map]);
  return null;
}

export default function Step5Summary({
  customerInfo,
  requirements,
  hasSurveyReport,
  cameraPoints,
  pricingItems,
  onNext,
  onPrev,
  isEditMode = true
}: Step5Props) {
  
  // Group surveyed CCTV specs if they exist, otherwise use requirements
  const totalCamerasCount = hasSurveyReport ? cameraPoints.length : requirements.cameraCount;
  
  // Count how many poles are scheduled
  const poleCount = cameraPoints.filter(p => p.poleType !== "None").length;
  // Count support arms
  const supportArmCount = cameraPoints.filter(p => p.hasSupportArm).length;

  // Selected camera point for interactive map navigation
  const [selectedSummaryPointId, setSelectedSummaryPointId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Compute map center from customer info
  const defaultLat = customerInfo.latitude ? parseFloat(customerInfo.latitude) : 13.7563;
  const defaultLng = customerInfo.longitude ? parseFloat(customerInfo.longitude) : 100.5018;
  const centerLat = isNaN(defaultLat) ? 13.7563 : defaultLat;
  const centerLng = isNaN(defaultLng) ? 100.5018 : defaultLng;

  // Get current active point to pan the map
  const activeSummaryPoint = cameraPoints.find(p => p.id === selectedSummaryPointId);
  const panLat = selectedSummaryPointId === "control-center" ? centerLat : (activeSummaryPoint?.lat !== undefined ? activeSummaryPoint.lat : centerLat);
  const panLng = selectedSummaryPointId === "control-center" ? centerLng : (activeSummaryPoint?.lng !== undefined ? activeSummaryPoint.lng : centerLng);

  // Create mini camera icon for read-only map (className: "" is CRITICAL to fix offset issues)
  const createMiniCameraIcon = (type: string, index: number, isSelected: boolean, camCount: number) => {
    const colorHex = type === "Dome" ? "#0071e3" : type === "PTZ" ? "#bf5af2" : "#30d158";
    const shadowColor = isSelected ? "rgba(0, 113, 227, 0.3)" : "rgba(0, 0, 0, 0.08)";
    const scaleStyle = isSelected ? "scale(1.2)" : "scale(1)";
    const ringStyle = isSelected ? "box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.2);" : "";

    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          border: 2px solid ${colorHex};
          box-shadow: 0 3px 8px ${shadowColor};
          transform: ${scaleStyle};
          ${ringStyle}
          transition: transform 0.25s ease;
          box-sizing: border-box;
        ">
          <!-- Sleek Minimalist CCTV Security Camera SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <path d="M2 8h15" />
            <path d="M3 10h14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H3z" />
            <path d="M19 11l3-1.5v5l-3-1.5" />
            <path d="M7 16v3a1 1 0 0 0 1 1h4" />
          </svg>
          
          <!-- Numeric Badge label (top right index) -->
          <span style="
            position: absolute;
            top: -6px;
            right: -6px;
            background-color: #1c1c1e;
            color: white;
            font-size: 7.5px;
            font-weight: 700;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0.5px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
          ">
            ${index}
          </span>

          <!-- Camera count indicator (bottom) -->
          <span style="
            position: absolute;
            bottom: -7px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${colorHex};
            color: white;
            font-size: 7px;
            font-weight: 850;
            padding: 0.5px 3.5px;
            border-radius: 3.5px;
            border: 0.5px solid white;
            white-space: nowrap;
            box-shadow: 0 1.5px 3px rgba(0,0,0,0.1);
            box-sizing: border-box;
          ">
            ${camCount} ตัว
          </span>
        </div>
      `,
      className: "", // VERY IMPORTANT: keep empty to avoid Leaflet default style margins offsetting the pin!
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createControlCenterIcon = (isSelected?: boolean) => {
    const ringStyle = isSelected ? "box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.4), 0 4px 12px rgba(0, 113, 227, 0.55);" : "box-shadow: 0 4px 12px rgba(0, 113, 227, 0.35);";
    const scaleStyle = isSelected ? "transform: scale(1.15);" : "transform: scale(1);";
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #111827;
          border: 2px solid white;
          ${ringStyle}
          ${scaleStyle}
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-sizing: border-box;
        ">
          <!-- Sleek white Monitor SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          
          <span style="
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            color: #111827;
            font-size: 7px;
            font-weight: 850;
            padding: 1.5px 5px;
            border-radius: 4.5px;
            white-space: nowrap;
            border: 1px solid #111827;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          ">
            ห้องควบคุม (ต้นทาง)
          </span>
        </div>
      `,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="space-y-6" id="summary-step-container">
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer Basic Info summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <Building className="w-4 h-4 text-gray-700" />
            <h4 className="font-semibold text-xs text-gray-550 uppercase tracking-wide font-sans">รายละเอียดลูกค้า / สถานที่</h4>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-gray-400 block">ลูกค้า/บริษัท:</span>
              <strong className="text-zinc-900 text-sm">{customerInfo.customerName || "-"}</strong>
            </div>
            <div>
              <span className="text-gray-400 block">โครงการ:</span>
              <span className="text-gray-900 font-semibold">{customerInfo.projectName || "-"}</span>
            </div>
            {customerInfo.address && (
              <div>
                <span className="text-gray-400 block">สถานที่ติดตั้ง:</span>
                <p className="text-zinc-600 leading-normal line-clamp-2">{customerInfo.address}</p>
              </div>
            )}
            {(customerInfo.latitude || customerInfo.longitude) && (
              <div className="flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg w-fit border border-gray-200">
                <MapPin className="w-3 h-3 text-zinc-600" />
                <span className="font-mono text-[10px] text-gray-700">{customerInfo.latitude}, {customerInfo.longitude}</span>
              </div>
            )}
          </div>
        </div>

        {/* Requirements Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <Cpu className="w-4 h-4 text-gray-700" />
            <h4 className="font-semibold text-xs text-gray-550 uppercase tracking-wide font-sans">สเปกความต้องการหลัก</h4>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between items-center text-xs py-1.5 bg-gray-100 px-2.5 rounded-lg border border-gray-200">
              <span className="text-gray-700 font-medium">การติดตั้งกล้องทั้งหมด:</span>
              <strong className="text-[#0071e3] font-mono text-base">{totalCamerasCount} ตัว</strong>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-gray-400 block">แบรนด์กล้อง:</span>
                <span className="font-semibold text-zinc-850">{requirements.cameraBrand || "ไม่ระบุ"}</span>
              </div>
              <div>
                <span className="text-gray-500 block">เครื่องบันทึก NVR:</span>
                <span className="font-semibold text-zinc-850">{requirements.nvrBrand} | {requirements.nvrChannels}CH</span>
              </div>
            </div>
            <div>
              <span className="text-gray-400 block flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-gray-500" /> แพคเกจเก็บข้อมูล:
              </span>
              <span className="font-medium text-gray-900">{requirements.storagePackage || "-"}</span>
            </div>
          </div>
        </div>

        {/* Technical Survey Summary */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
            <ClipboardList className="w-4 h-4 text-gray-700" />
            <h4 className="font-semibold text-xs text-gray-550 uppercase tracking-wide font-sans">รายงานการสำรวจ (Survey)</h4>
          </div>
          <div className="text-xs space-y-2">
            {hasSurveyReport ? (
              <>
                <div className="p-2.5 bg-gray-50 border border-zinc-300 rounded-xl">
                  <span className="text-gray-900 font-bold flex items-center gap-1">
                    ✓ สำรวจและระบุพิกัดแผนที่แล้ว
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1">
                    ระบุรายจุดพร้อมพิกัดภูมิศาสตร์และรูปถ่ายหน้างานจริงครบถ้วน
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 mt-1">
                  <div>• เสาเหล็กเสริม: <strong className="text-gray-900">{poleCount} ต้น</strong></div>
                  <div>• แขน Support ยึด: <strong className="text-gray-900">{supportArmCount} ชุด</strong></div>
                </div>
              </>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                <span className="text-gray-900 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
                  ประเมินด่วน (ไม่มี Survey Report)
                </span>
                <p className="text-[10px] text-gray-400 leading-normal">
                  รายการสเปกอุปกรณ์เสริมและสายติดตั้งเสริมจะคำนวณจากอัตรามาตรฐานโครงการเฉลี่ย
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bill of Materials (BOM) Table preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider font-sans">
            📋 รายการวัสดุและอุปกรณ์วิศวกรรม (Bill of Materials - BOM)
          </h3>
          <p className="text-[11px] text-zinc-400">รายการอุปกรณ์ที่วิเคราะห์ประเมินขึ้นตามสถิติตามการเลือกใช้หน้างานจริง</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead>
              <tr className="bg-white text-gray-400 uppercase font-mono text-[9px] border-b border-gray-200">
                <th className="py-2 px-3">ลำดับ</th>
                <th className="py-2 px-3">รายการวัสดุอุปกรณ์</th>
                <th className="py-2 px-3 text-center">ประเภท</th>
                <th className="py-2 px-3 text-right">จำนวนประมาณการ</th>
                <th className="py-2 px-3 text-center">หน่วย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {pricingItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-white/50">
                  <td className="py-2.5 px-3 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-normal break-words">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase whitespace-nowrap ${
                      item.category === "hardware" ? "bg-gray-50 text-gray-900 border border-gray-200" :
                      item.category === "accessory" ? "bg-gray-50 text-zinc-600 border border-gray-200" :
                      item.category === "labor" ? "bg-zinc-200 text-gray-900 font-semibold" :
                      "bg-white text-gray-500 border border-gray-200"
                    }`}>
                      {item.category === "hardware" ? "ฮาร์ดแวร์" :
                       item.category === "accessory" ? "อุปกรณ์เสริม" :
                       item.category === "labor" ? "ติดตั้ง" : "เบ็ดเตล็ด"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-center text-gray-550">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surveyed Pin placements blueprint layout miniature mapping preview */}
      {hasSurveyReport && cameraPoints.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Layers className="w-3.5 h-3.5 text-zinc-555" />
                ผังจำลองจัดชุดตำแหน่งพิกัดกล้องวงจรปิดบนแผนที่จริง
              </h4>
              <p className="text-[11px] text-zinc-400">ตำแหน่งปักจุดระวางเสาจริงตามพิกัดแผนที่ละติจูด/ลองจิจูด</p>
            </div>
            {!isMapExpanded && (
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 blocks-btn-primary py-1.5 text-xs rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>ขยายแผนที่</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Visual list showing point specs - Upgraded to clickable button list to fly map to camera */}
            <div className="md:col-span-1 border border-gray-200 rounded-xl divide-y max-h-[300px] overflow-y-auto divide-zinc-200 text-xs bg-white">
              {/* #0 Control Center starting point */}
              <button
                type="button"
                onClick={() => setSelectedSummaryPointId(selectedSummaryPointId === "control-center" ? null : "control-center")}
                className={`w-full p-2.5 text-left border-l-4 transition-all block cursor-pointer outline-none ${
                  selectedSummaryPointId === "control-center"
                    ? "bg-white border-l-gray-900 font-semibold shadow-xs" 
                    : "bg-white border-l-transparent hover:bg-gray-50/50"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-[#0071e3] font-mono text-[10px]">#0 CONTROL</span>
                </div>
                <strong className="block text-gray-900 truncate text-xs">ห้องควบคุม (ต้นทาง)</strong>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate font-normal">
                  พิกัด: {centerLat.toFixed(5)}, {centerLng.toFixed(5)}
                </p>
              </button>

              {cameraPoints.map((pt, ind) => {
                const isSelected = pt.id === selectedSummaryPointId;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setSelectedSummaryPointId(pt.id)}
                    className={`w-full p-2.5 text-left border-l-4 transition-all block cursor-pointer outline-none ${
                      isSelected 
                        ? "bg-white border-l-gray-900 font-semibold shadow-xs" 
                        : "bg-white border-l-transparent hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#0071e3] font-mono text-[10px]">#{ind + 1} {pt.type}</span>
                    </div>
                    <strong className="block text-gray-900 truncate text-xs">{pt.name}</strong>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate font-normal">
                      ฐานติดตั้ง: {pt.poleType !== "None" ? pt.poleType.replace("(+ติดตั้ง)", "") : "ยึดกำแพง/อาคาร"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Map preview - dragging and doubleClickZoom enabled for rich interactive exploration */}
            <div 
              className={isMapExpanded 
                ? "fixed inset-4 z-[9999] bg-white p-4 rounded-xl border border-gray-200 shadow-2xl flex flex-col gap-4 select-none" 
                : "md:col-span-3 aspect-video rounded-xl border border-gray-200 relative overflow-hidden z-10 flex flex-col"
              }
              style={isMapExpanded ? undefined : { minHeight: "300px" }}
            >
              {isMapExpanded && (
                <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <Layers className="w-3.5 h-3.5 text-zinc-555" />
                      ผังจำลองจัดชุดตำแหน่งพิกัดกล้องวงจรปิดบนแผนที่จริง (โหมดขยายใหญ่)
                    </h4>
                    <p className="text-[11px] text-gray-400">ตำแหน่งปักจุดระวางเสาจริงตามพิกัดแผนที่ละติจูด/ลองจิจูด</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 blocks-btn-primary py-1.5 text-xs rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>ย่อขนาด</span>
                  </button>
                </div>
              )}

              <div className="flex-1 w-full relative min-h-0 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer 
                  key={isMapExpanded ? 'summary-expanded' : 'summary-normal'}
                  center={[centerLat, centerLng]} 
                  zoom={17} 
                  dragging={true}
                  zoomControl={false}
                  scrollWheelZoom={true}
                  doubleClickZoom={true}
                  touchZoom={true}
                  style={{ width: "100%", height: "100%" }}
                  className="z-10"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Center controller pans automatically to selected camera */}
                  <MapCenterController lat={panLat} lng={panLng} />

                  {/* Control Center (Monitor Site) */}
                  <Marker
                    position={[centerLat, centerLng]}
                    icon={createControlCenterIcon(selectedSummaryPointId === "control-center")}
                    eventHandlers={{
                      click: () => {
                        setSelectedSummaryPointId(selectedSummaryPointId === "control-center" ? null : "control-center");
                      }
                    }}
                  />

                  {/* Markers */}
                  {cameraPoints.map((pt, idx) => {
                    const ptLat = pt.lat !== undefined ? pt.lat : centerLat;
                    const ptLng = pt.lng !== undefined ? pt.lng : centerLng;
                    const isSelected = pt.id === selectedSummaryPointId;
                    const camCount = pt.selectedSet === "Set 1" ? 1
                                   : pt.selectedSet === "Set 2" ? 2
                                   : pt.selectedSet === "Set 3" ? 3
                                   : pt.selectedSet === "Set 4" ? 4
                                   : 1;
                    
                    return (
                      <Marker
                        key={pt.id}
                        position={[ptLat, ptLng]}
                        icon={createMiniCameraIcon(pt.type, idx + 1, isSelected, camCount)}
                        eventHandlers={{
                          click: () => {
                            setSelectedSummaryPointId(pt.id);
                          }
                        }}
                      />
                    );
                  })}
                </MapContainer>

                <div className="absolute top-2 right-2 bg-zinc-900/90 backdrop-blur-md rounded-lg border border-zinc-800 text-[9px] font-mono px-2 py-1 text-white uppercase tracking-wider z-[400] shadow-sm">
                  🗺️ ผังพิกัดแผนที่ (คลิกเลือกกล้องเพื่อเคลื่อนย้ายดูพิกัดได้)
                </div>

                {/* Floating Camera Detail & Photo Preview Card (Bottom Left) */}
                {activeSummaryPoint && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 text-xs shadow-md z-[400] w-64 select-none flex flex-col gap-2 transition-all">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-1.5">
                      <span className="font-bold text-[#0071e3] font-mono">
                        #{cameraPoints.findIndex(p => p.id === activeSummaryPoint.id) + 1} {activeSummaryPoint.type}
                      </span>
                      <span className="text-[9px] px-1.5 bg-gray-50 text-gray-500 rounded font-semibold uppercase tracking-wider">
                        {activeSummaryPoint.poleType !== "None" ? "มีเสาเสริม" : "ยึดติดอาคาร"}
                      </span>
                    </div>
                    
                    <strong className="text-gray-900 truncate text-[11px] block">{activeSummaryPoint.name}</strong>
                    
                    {activeSummaryPoint.photoUrl ? (
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 bg-white  group">
                        <img 
                          src={activeSummaryPoint.photoUrl} 
                          alt={activeSummaryPoint.name} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-lg border border-gray-200 border-dashed bg-white flex flex-col items-center justify-center text-zinc-400 gap-1 py-4">
                        <ImageIcon className="w-5 h-5 text-zinc-350 animate-pulse" />
                        <span className="text-[9px]">ไม่มีภาพประกอบหน้างานจริง</span>
                      </div>
                    )}

                    {activeSummaryPoint.notes && (
                      <p className="text-[9.5px] text-gray-400 leading-relaxed bg-white px-2 py-1.5 rounded-lg border border-gray-150 max-h-16 overflow-y-auto">
                        {activeSummaryPoint.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Floating Control Center Info Card (Bottom Left) */}
                {selectedSummaryPointId === "control-center" && (
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-gray-200 text-xs shadow-md z-[400] w-64 select-none flex flex-col gap-1.5 transition-all">
                    <div className="flex items-center justify-between border-b border-gray-150 pb-1.5">
                      <span className="font-bold text-[#0071e3] font-mono">#0 CONTROL</span>
                      <span className="text-[9px] px-1.5 bg-[#0071e3]/10 text-[#0071e3] rounded font-semibold uppercase tracking-wider">
                        ต้นทาง
                      </span>
                    </div>
                    <strong className="text-gray-900 text-[11px] block">ห้องควบคุม (ต้นทาง)</strong>
                    <p className="text-[10px] text-gray-500 leading-relaxed bg-white px-2 py-1.5 rounded-lg border border-gray-150">
                      📍 พิกัดหลักโครงการ: {centerLat.toFixed(6)}, {centerLng.toFixed(6)}<br/>
                      🖥️ อุปกรณ์หลัก: เครื่องบันทึกภาพ NVR และตู้ควบคุมกลางระบบกล้องวงจรปิด
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditMode && (
        <>
          <div className="border-t border-gray-150 pt-6"></div>

          {/* Navigation action bars */}
          <div className="flex justify-between" id="step5-actions-bar">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1 px-4 py-2 bg-gray-55/50 hover:bg-zinc-200 text-gray-900 text-xs font-medium rounded-xl border border-gray-200 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              ย้อนกลับ
            </button>

            <button
              type="button"
              onClick={onNext}
              className="blocks-btn-primary"
            >
              ก้าวถัดไป: ไปหน้าสรุปราคาสินค้า 💰
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
