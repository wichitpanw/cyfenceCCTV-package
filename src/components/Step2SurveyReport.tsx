import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Trash2, 
  Plus, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Image as ImageIcon, 
  Info,
  Layers,
  Maximize2,
  Minimize2
} from "lucide-react";
import { CameraPoint, CustomerInfo } from "../types";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Step2Props {
  cameraPoints: CameraPoint[];
  cameraCount: number;
  onChange: (points: CameraPoint[]) => void;
  onNext: () => void;
  onPrev: () => void;
  customerInfo: CustomerInfo;
  requirements?: any;
  onUpdateCameraBrand?: (brand: string) => void;
  showConfirm?: (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: { confirmText?: string; cancelText?: string; onCancel?: () => void }
  ) => void;
  onUpdateCustomerInfo?: (info: CustomerInfo) => void;
}

// Map center panning controller sub-component
function MapCenterController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), {
        animate: true,
        duration: 0.6
      });
    }
  }, [lat, lng, map]);
  return null;
}

export default function Step2SurveyReport({ 
  cameraPoints, 
  cameraCount, 
  onChange, 
  onNext, 
  onPrev,
  customerInfo,
  requirements,
  onUpdateCameraBrand,
  showConfirm,
  onUpdateCustomerInfo
}: Step2Props) {
  const stdLimit = requirements?.standardCableLimit ?? 25;
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "options" | "location">("main");
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Local state for manual coordinate inputs to prevent React cursor state bugs on floats
  const [localLat, setLocalLat] = useState<string>("");
  const [localLng, setLocalLng] = useState<string>("");
  const [coordsInput, setCoordsInput] = useState<string>("");

  // Compute map center from customer info
  const defaultLat = customerInfo.latitude ? parseFloat(customerInfo.latitude) : 13.7563;
  const defaultLng = customerInfo.longitude ? parseFloat(customerInfo.longitude) : 100.5018;
  const centerLat = isNaN(defaultLat) ? 13.7563 : defaultLat;
  const centerLng = isNaN(defaultLng) ? 100.5018 : defaultLng;

  const isControlCenterSelected = selectedPointId === "control-center";

  // Selected camera point object
  const selectedPoint = cameraPoints.find(p => p.id === selectedPointId);

  // Sync manual coordinate inputs when selected camera changes or updates
  useEffect(() => {
    if (isControlCenterSelected) {
      const latStr = centerLat.toString();
      const lngStr = centerLng.toString();
      setLocalLat(latStr);
      setLocalLng(lngStr);
      setCoordsInput(`${latStr}, ${lngStr}`);
    } else if (selectedPoint) {
      const latStr = selectedPoint.lat !== undefined ? selectedPoint.lat.toString() : "";
      const lngStr = selectedPoint.lng !== undefined ? selectedPoint.lng.toString() : "";
      setLocalLat(latStr);
      setLocalLng(lngStr);
      if (latStr && lngStr) {
        setCoordsInput(`${latStr}, ${lngStr}`);
      } else {
        setCoordsInput("");
      }
    } else {
      setLocalLat("");
      setLocalLng("");
      setCoordsInput("");
    }
  }, [selectedPointId, selectedPoint?.lat, selectedPoint?.lng, centerLat, centerLng, isControlCenterSelected]);

  // Sync selectedPointId if cameraPoints is populated but nothing is selected
  useEffect(() => {
    if (cameraPoints.length > 0 && !selectedPointId) {
      setSelectedPointId(cameraPoints[0].id);
    }
  }, [cameraPoints, selectedPointId]);

  const getCctvDefaultLocationName = (index: number) => {
    const names = [
      "หน้าประตูทางเข้า-ออกหลัก",
      "ลานจอดรถส่วนกลาง",
      "คลังสินค้าแถวกลาง",
      "แนวกำแพงท้ายโครงการ",
      "เคาน์เตอร์ประชาสัมพันธ์ชั้น 1",
      "หน้าตู้เซิร์ฟเวอร์สำนักงาน",
      "ทางขึ้นบันไดหนีไฟด้านหลัง",
      "โรงอาหาร",
    ];
    return names[index % names.length];
  };

  const handleUpdateCameraPointsCount = (newCount: number) => {
    const targetCount = Math.max(0, Math.min(64, newCount));
    if (targetCount === cameraPoints.length) return;

    if (targetCount < cameraPoints.length) {
      const diff = cameraPoints.length - targetCount;
      const performDecrease = () => {
        const updated = cameraPoints.slice(0, targetCount);
        onChange(updated);
        if (selectedPointId && !updated.some(p => p.id === selectedPointId)) {
          setSelectedPointId(updated.length > 0 ? updated[0].id : null);
        }
      };

      if (showConfirm) {
        showConfirm(
          "⚠️ ยืนยันการลดจุดติดตั้ง",
          `คุณแน่ใจหรือไม่ว่าต้องการลดจำนวนจุดติดตั้งลง ${diff} จุด? (การลบจะลบข้อมูลจุดที่เพิ่มล่าสุดและกู้คืนไม่ได้)`,
          performDecrease
        );
      } else if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลดจำนวนจุดติดตั้งลง ${diff} จุด? (การลบจะลบข้อมูลจุดที่เพิ่มล่าสุดและกู้คืนไม่ได้)`)) {
        performDecrease();
      }
    } else {
      const diff = targetCount - cameraPoints.length;
      const newPoints = [...cameraPoints];
      for (let i = 0; i < diff; i++) {
        const idx = newPoints.length;
        const offset = (Math.random() - 0.5) * 0.0004;
        newPoints.push({
          id: `pt-${Date.now()}-${idx}`,
          name: `จุดติดตั้งเสริมที่ ${idx + 1}`,
          type: "Bullet",
          poleType: "None",
          hasSupportArm: true,
          notes: "",
          photoUrl: "",
          x: 50,
          y: 50,
          focalAngle: 90,
          rotation: 0,
          lat: centerLat + offset,
          lng: centerLng + offset,
          lanCableLength: stdLimit,
          hasOutdoorCabinet: true,
          hasGroundRod: true,
          hasPowerMeter: true,
          hasSdCard: true,
          hasCabinetUps: true,
          hasPoeSwitch: true,
          selectedSet: "Set 1"
        });
      }
      onChange(newPoints);
      setSelectedPointId(newPoints[newPoints.length - 1].id);
    }
  };

  const handleAddFieldPoint = () => {
    const offset = (Math.random() - 0.5) * 0.0004;
    const newPoint: CameraPoint = {
      id: `pt-${Date.now()}-${cameraPoints.length}`,
      name: `จุดติดตั้งเสริมที่ ${cameraPoints.length + 1}`,
      type: "Bullet",
      poleType: "None",
      hasSupportArm: true,
      notes: "",
      photoUrl: "", // Start empty
      x: 50,
      y: 50,
      focalAngle: 90,
      rotation: 0,
      lat: centerLat + offset,
      lng: centerLng + offset,
      lanCableLength: stdLimit,
      hasOutdoorCabinet: true,
      hasGroundRod: true,
      hasPowerMeter: true,
      hasSdCard: true,
      hasCabinetUps: true,
      hasPoeSwitch: true,
      selectedSet: "Set 1"
    };
    const updated = [...cameraPoints, newPoint];
    onChange(updated);
    setSelectedPointId(newPoint.id);
  };

  const handleDeletePoint = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const pt = cameraPoints.find(p => p.id === id);
    const ptName = pt ? pt.name : "จุดนี้";
    
    const performDelete = () => {
      const updated = cameraPoints.filter(p => p.id !== id);
      onChange(updated);
      if (selectedPointId === id) {
        setSelectedPointId(updated.length > 0 ? updated[0].id : null);
      }
    };

    if (showConfirm) {
      showConfirm(
        "🗑️ ยืนยันการลบจุดติดตั้ง",
        `คุณแน่ใจหรือไม่ว่าต้องการลบจุดติดตั้ง "${ptName}" นี้ออกจากแผนที่?`,
        performDelete
      );
    } else if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบจุดติดตั้ง "${ptName}" นี้ออกจากแผนที่?`)) {
      performDelete();
    }
  };

  // Upgraded: Atomic field updates helper to change multiple fields at once (avoiding React race conditions)
  const handleUpdatePointFields = (id: string, updates: Partial<CameraPoint>) => {
    const updated = cameraPoints.map(p => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    onChange(updated);
  };

  const handleUpdatePointField = (id: string, field: keyof CameraPoint, value: any) => {
    handleUpdatePointFields(id, { [field]: value });
  };

  // Map Click events sub-component to handle map click in react-leaflet
  function MapEventsHandler() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (selectedPointId) {
          // Reposition selected camera point atomically (lat/lng updated together)
          handleUpdatePointFields(selectedPointId, { lat, lng });
        } else {
          // Create new camera point on click if none selected
          const newPoint: CameraPoint = {
            id: `pt-${Date.now()}`,
            name: `จุดติดตั้งเสริมที่ ${cameraPoints.length + 1}`,
            type: "Bullet",
            poleType: "None",
            hasSupportArm: true,
            notes: "",
            photoUrl: "", // Start empty
            x: 50,
            y: 50,
            focalAngle: 90,
            rotation: 0,
            lat: lat,
            lng: lng,
            lanCableLength: 25,
            hasOutdoorCabinet: true,
            hasGroundRod: true,
            hasPowerMeter: true,
            hasSdCard: true,
            hasCabinetUps: true,
            hasPoeSwitch: true,
            selectedSet: "Set 1"
          };
          onChange([...cameraPoints, newPoint]);
          setSelectedPointId(newPoint.id);
        }
      }
    });
    return null;
  }

  // Create custom DivIcon for Leaflet markers (className: "" is CRITICAL to fix offset issues)
  const createCameraIcon = (type: string, index: number, isSelected: boolean, camCount: number) => {
    const colorHex = type === "Dome" ? "#111827" : type === "PTZ" ? "#bf5af2" : "#30d158";
    const shadowColor = isSelected ? "rgba(0, 113, 227, 0.3)" : "rgba(0, 0, 0, 0.08)";
    const scaleStyle = isSelected ? "scale(1.15)" : "scale(1)";
    const ringStyle = isSelected ? "box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.25);" : "";
    
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
          background-color: white;
          border: 2px solid ${colorHex};
          box-shadow: 0 4px 12px ${shadowColor};
          transform: ${scaleStyle};
          ${ringStyle}
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        ">
          <!-- Sleek Minimalist CCTV Security Camera SVG -->
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
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
            font-size: 8px;
            font-weight: 700;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
          ">
            ${index}
          </span>

          <!-- Camera count indicator (bottom) -->
          <span style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            background-color: ${colorHex};
            color: white;
            font-size: 7.5px;
            font-weight: 850;
            padding: 1px 4.5px;
            border-radius: 4px;
            border: 0.5px solid white;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            box-sizing: border-box;
          ">
            ${camCount} ตัว
          </span>
        </div>
      `,
      className: "", // VERY IMPORTANT: keep empty to avoid Leaflet default style margins offsetting the pin!
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  const createControlCenterIcon = (isSelected?: boolean) => {
    const ringStyle = isSelected ? "box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.4), 0 4px 14px rgba(0, 113, 227, 0.55);" : "box-shadow: 0 4px 14px rgba(0, 113, 227, 0.35);";
    const scaleStyle = isSelected ? "transform: scale(1.2);" : "transform: scale(1);";
    return L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
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
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
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
            padding: 1.5px 5.5px;
            border-radius: 5px;
            white-space: nowrap;
            border: 1px solid #111827;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          ">
            ห้องควบคุม (ต้นทาง)
          </span>
        </div>
      `,
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  };

  // Handle Lat Manual text typing
  const handleLatManualChange = (val: string) => {
    setLocalLat(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      if (!val.endsWith(".")) {
        if (isControlCenterSelected) {
          onUpdateCustomerInfo?.({
            ...customerInfo,
            latitude: val
          });
        } else if (selectedPoint) {
          handleUpdatePointFields(selectedPoint.id, { lat: parsed });
        }
      }
    }
  };

  // Handle Lng Manual text typing
  const handleLngManualChange = (val: string) => {
    setLocalLng(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      if (!val.endsWith(".")) {
        if (isControlCenterSelected) {
          onUpdateCustomerInfo?.({
            ...customerInfo,
            longitude: val
          });
        } else if (selectedPoint) {
          handleUpdatePointFields(selectedPoint.id, { lng: parsed });
        }
      }
    }
  };

  // Handle Single-box coordinates input (supporting Google Maps "lat, lng" copy-paste)
  const handleCoordsChange = (val: string) => {
    setCoordsInput(val);
    
    // Split by comma, spaces, or tabs
    const parts = val.split(/[,\s]+/).map(p => p.trim()).filter(Boolean);
    
    if (parts.length >= 2) {
      const latVal = parts[0];
      const lngVal = parts[1];
      const latParsed = parseFloat(latVal);
      const lngParsed = parseFloat(lngVal);
      
      if (!isNaN(latParsed) && !isNaN(lngParsed)) {
        if (!latVal.endsWith(".") && !lngVal.endsWith(".")) {
          if (isControlCenterSelected) {
            onUpdateCustomerInfo?.({
              ...customerInfo,
              latitude: latVal,
              longitude: lngVal
            });
          } else if (selectedPoint) {
            handleUpdatePointFields(selectedPoint.id, { lat: latParsed, lng: lngParsed });
          }
        }
      }
    } else if (parts.length === 1) {
      // If a single number is typed, update the latitude as partial input
      const latVal = parts[0];
      const latParsed = parseFloat(latVal);
      if (!isNaN(latParsed) && !latVal.endsWith(".")) {
        if (isControlCenterSelected) {
          onUpdateCustomerInfo?.({
            ...customerInfo,
            latitude: latVal
          });
        } else if (selectedPoint) {
          handleUpdatePointFields(selectedPoint.id, { lat: latParsed });
        }
      }
    }
  };

  // Get current GPS location from browser Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัดตำแหน่ง (Geolocation)");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const latStr = lat.toString();
        const lngStr = lng.toString();
        
        setLocalLat(latStr);
        setLocalLng(lngStr);
        setCoordsInput(`${latStr}, ${lngStr}`);
        
        if (isControlCenterSelected) {
          onUpdateCustomerInfo?.({
            ...customerInfo,
            latitude: latStr,
            longitude: lngStr
          });
        } else if (selectedPoint) {
          handleUpdatePointFields(selectedPoint.id, { lat, lng });
        }
      },
      (error) => {
        console.error("Error getting location: ", error);
        alert("ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงพิกัดของเบราว์เซอร์");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Determine active target coordinates for the center controller
  const panLat = isControlCenterSelected ? centerLat : (selectedPoint?.lat !== undefined ? selectedPoint.lat : centerLat);
  const panLng = isControlCenterSelected ? centerLng : (selectedPoint?.lng !== undefined ? selectedPoint.lng : centerLng);

  return (
    <div className="space-y-6" id="survey-step-container">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="space-y-2.5">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              โครงการ: {customerInfo.projectName || "โครงการทั่วไป"}
            </h3>
            <p className="text-[11px] text-gray-500">
              พิกัด GIS โครงการ: {customerInfo.latitude || "-"}, {customerInfo.longitude || "-"} | ผู้นำทีมสำรวจ: {customerInfo.surveyorName}
            </p>
          </div>
          
          {/* Elegant Camera Brand Selector */}
          <div className="flex items-center gap-3 pt-2.5 border-t border-gray-200/60">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
              🛡️ เลือกแบรนด์กล้องของโครงการ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {["Hikvision", "Tiandy", "Uniview", "Holowits"].map((br) => {
                const isSelected = requirements?.cameraBrand === br;
                return (
                  <button
                    key={br}
                    type="button"
                    onClick={() => onUpdateCameraBrand?.(br)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-gray-900 border-zinc-900 text-white shadow-sm scale-102" 
                        : "bg-white border-gray-200 text-gray-600 hover:border-zinc-400 hover:bg-white"
                    }`}
                  >
                    {br}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200/60 font-sans select-none">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
              จำนวนจุดติดตั้ง:
            </span>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleUpdateCameraPointsCount(cameraPoints.length - 1)}
                disabled={cameraPoints.length <= 1}
                className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center transition-colors cursor-pointer text-xs ${
                  cameraPoints.length <= 1 
                    ? "bg-white text-zinc-300 border border-gray-200/50 cursor-not-allowed" 
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                -
              </button>

              <input
                type="number"
                min={1}
                max={64}
                value={cameraPoints.length}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    handleUpdateCameraPointsCount(val);
                  }
                }}
                className="w-10 text-center font-mono font-bold bg-transparent border-none p-0 focus:ring-0 text-zinc-900 text-xs focus:outline-none"
              />

              <button
                type="button"
                onClick={() => handleUpdateCameraPointsCount(cameraPoints.length + 1)}
                disabled={cameraPoints.length >= 64}
                className="w-6 h-6 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COMPONENT (COL 8): OpenStreetMap Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-zinc-555 block uppercase font-mono tracking-wider">MAP PLACEMENT / พิกัดแผนที่จริง</span>
                <span className="text-[11px] text-gray-400">คลิกลงบนแผนที่เพื่อระบุหรือขยับหมุดจุดติดตั้งกล้องวงจรปิด</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                  <MapPin className="w-3 h-3 text-[#111827]" />
                  <span>ศูนย์กลาง: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}</span>
                </div>
                {!isMapExpanded && (
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>ขยายแผนที่</span>
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div 
              className={isMapExpanded 
                ? "fixed inset-4 z-[9999] bg-white p-4 rounded-xl border border-gray-200 shadow-2xl flex flex-col gap-4 select-none" 
                : "relative w-full h-[550px] md:h-[750px] rounded-xl overflow-hidden border border-gray-200 shadow-inner group select-none z-10 flex flex-col"
              }
            >
              {isMapExpanded && (
                <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-555 block uppercase font-mono tracking-wider">MAP PLACEMENT / พิกัดแผนที่จริง (โหมดขยายใหญ่)</span>
                    <span className="text-[11px] text-gray-500">คลิกลงบนแผนที่เพื่อระบุหรือขยับหมุดจุดติดตั้งกล้องวงจรปิด</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapExpanded(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>ย่อขนาด</span>
                  </button>
                </div>
              )}

              <div className="flex-1 w-full relative min-h-0 rounded-xl overflow-hidden border border-gray-200">
                <MapContainer 
                  key={isMapExpanded ? 'expanded' : 'normal'}
                  center={[centerLat, centerLng]} 
                  zoom={18} 
                  style={{ width: "100%", height: "100%" }}
                  className="z-10"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Event Listener for Clicks */}
                  <MapEventsHandler />

                  {/* Map Center Panning Controller */}
                  <MapCenterController lat={panLat} lng={panLng} />

                  {/* Control Center Reference Point */}
                   <Marker
                    position={[centerLat, centerLng]}
                    icon={createControlCenterIcon(selectedPointId === "control-center")}
                    draggable={true}
                    eventHandlers={{
                      click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        setSelectedPointId(selectedPointId === "control-center" ? null : "control-center");
                      },
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        onUpdateCustomerInfo?.({
                          ...customerInfo,
                          latitude: position.lat.toString(),
                          longitude: position.lng.toString()
                        });
                        setSelectedPointId("control-center");
                      }
                    }}
                  />

                  {/* Camera Markers on Map */}
                  {cameraPoints.map((pt, idx) => {
                    const ptLat = pt.lat !== undefined ? pt.lat : centerLat;
                    const ptLng = pt.lng !== undefined ? pt.lng : centerLng;
                    const isSelected = pt.id === selectedPointId;
                    const camCount = pt.selectedSet === "Set 1" ? 1
                                   : pt.selectedSet === "Set 2" ? 2
                                   : pt.selectedSet === "Set 3" ? 3
                                   : pt.selectedSet === "Set 4" ? 4
                                   : 1;

                    return (
                      <Marker
                        key={pt.id}
                        position={[ptLat, ptLng]}
                        icon={createCameraIcon(pt.type, idx + 1, isSelected, camCount)}
                        draggable={true}
                        eventHandlers={{
                          click: (e) => {
                            L.DomEvent.stopPropagation(e);
                            setSelectedPointId(isSelected ? null : pt.id);
                          },
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            // Atomic Update: saves both Lat & Lng in a single state change to avoid layout jumps
                            handleUpdatePointFields(pt.id, {
                              lat: position.lat,
                              lng: position.lng
                            });
                            setSelectedPointId(pt.id);
                          }
                        }}
                      />
                    );
                  })}
                </MapContainer>

                {/* Map Legend Overlay (Top Right) */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-gray-200 text-[10px] text-gray-700 shadow-sm flex flex-col gap-1.5 z-[400] select-none pointer-events-none w-48">
                  <span className="font-bold text-gray-900 text-[9px] uppercase tracking-wider font-mono">ประเภทกล้องตามสีสัญลักษณ์</span>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#30d158] border border-white shadow-xs"></span>
                      <span className="font-semibold text-gray-600">Bullet (🟢 กล้องทรงกระบอก)</span>
                    </div>
                  </div>
                </div>

                {/* Instructions Help Tag overlay */}
                <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[10px] text-zinc-300 pointer-events-none flex items-center gap-1 z-[400]">
                  <Info className="w-3.5 h-3.5 text-[#111827]" />
                  <span>คลิกแผนที่เพื่อวาง/ย้ายหมุด หรือคลิกลากหมุดโดยตรงเพื่อปรับแต่งพิกัด</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick List of Points Grid for selecting */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Control Center Point as #0 */}
            <button
              type="button"
              onClick={() => setSelectedPointId(selectedPointId === "control-center" ? null : "control-center")}
              className={`p-2 rounded-xl text-left border flex flex-col justify-between h-16 text-xs select-none transition-all cursor-pointer ${
                selectedPointId === "control-center"
                  ? "bg-white border-zinc-900 font-semibold"
                  : "bg-white border-gray-200 hover:border-zinc-350 hover:bg-white/50"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] font-bold text-[#111827] font-mono">#0</span>
                <span className="text-[8px] px-1 bg-gray-100 text-zinc-650 rounded font-semibold uppercase tracking-wider">
                  CONTROL
                </span>
              </div>
              <span className="truncate text-gray-900 text-[11px] block mt-1 font-semibold">
                ห้องควบคุม (ต้นทาง)
              </span>
            </button>

            {cameraPoints.map((pt, index) => {
              const isSelected = pt.id === selectedPointId;
              return (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setSelectedPointId(isSelected ? null : pt.id)}
                  className={`p-2 rounded-xl text-left border flex flex-col justify-between h-16 text-xs select-none transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-zinc-900 font-semibold"
                      : "bg-white border-gray-200 hover:border-zinc-350 hover:bg-white/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] font-bold text-[#111827] font-mono">#{index + 1}</span>
                    <span className="text-[8px] px-1 bg-gray-50 text-gray-500 rounded font-semibold uppercase tracking-wider">
                      {pt.type}
                    </span>
                  </div>
                  <span className="truncate text-gray-900 text-[11px] block mt-1">
                    {pt.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COMPONENT (COL 4): Edit selected Pin details & Pole features */}
        <div className="lg:col-span-4">
          {isControlCenterSelected ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#111827]/10 flex items-center justify-center text-[#111827] font-bold text-xs uppercase font-mono">
                    #0
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">ห้องควบคุม (ต้นทาง)</h4>
                    <p className="text-[10px] text-gray-400">แก้ไขพิกัดจุดศูนย์กลาง/ห้องควบคุมระบบ</p>
                  </div>
                </div>
              </div>

              {/* Coordinates Editor */}
              <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-bold text-zinc-650 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    📍 ป้อนพิกัดภูมิศาสตร์
                  </span>
                  <button
                    onClick={handleGetCurrentLocation}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-[#111827] hover:bg-[#1f2937] active:scale-95 transition-all rounded-lg shadow-sm shrink-0"
                  >
                    📍 ดึงพิกัดปัจจุบัน
                  </button>
                </div>
                
                <div className="text-xs">
                  <label className="block text-[10px] text-gray-500 font-semibold mb-1">พิกัด (LATITUDE, LONGITUDE)</label>
                  <input
                    type="text"
                    value={coordsInput}
                    onChange={(e) => handleCoordsChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                    placeholder="เช่น 13.903868633485667, 100.57982817437522"
                  />
                </div>
                <span className="block text-[9px] text-gray-400 leading-relaxed">
                  *พิมพ์หรือวางพิกัดจาก Google Maps ได้ทันที หรือคลิกลากหมุดสีน้ำเงินหลักบนแผนที่เพื่ออัปเดตพิกัดแบบ Interactive
                </span>
              </div>

              {/* Info alert */}
              <div className="p-3 bg-white border border-gray-200 rounded-xl flex items-start gap-2 text-[10px] text-gray-600 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-[#111827] shrink-0 mt-0.5" />
                <span>พิกัดนี้คือจุดติดตั้ง "เครื่องบันทึก NVR" และ "ห้องควบคุม (ต้นทาง)" ซึ่งจะใช้คำนวณระยะทางสายติดตั้งและอุปกรณ์หลักของโครงการทั้งหมด</span>
              </div>
            </div>
          ) : selectedPoint ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#111827]/10 flex items-center justify-center text-[#111827]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">รายละเอียดจุดติดตั้ง</h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeletePoint(selectedPoint.id, e)}
                  className="p-1 px-2 hover:bg-white hover:text-red-600 text-gray-400 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="ลบจุดนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  ลบจุด
                </button>
              </div>

              {/* Segmented Tabs (Apple Style) */}
              <div className="flex bg-gray-50 p-0.5 rounded-xl border border-gray-200/50 select-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("main")}
                  className={`flex-1 py-1.5 text-center text-[9px] sm:text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-1 ${
                    activeTab === "main"
                      ? "bg-white text-zinc-900 shadow-sm border border-gray-200/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  📦 อุปกรณ์หลัก
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("options")}
                  className={`flex-1 py-1.5 text-center text-[9px] sm:text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-1 ${
                    activeTab === "options"
                      ? "bg-white text-zinc-900 shadow-sm border border-gray-200/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  🔌 อุปกรณ์เสริม
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("location")}
                  className={`flex-1 py-1.5 text-center text-[9px] sm:text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap px-1 ${
                    activeTab === "location"
                      ? "bg-white text-zinc-900 shadow-sm border border-gray-200/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  📍 รูป & พิกัด
                </button>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 text-xs">
                {activeTab === "main" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-zinc-550 font-semibold mb-1 uppercase tracking-wide">
                        ชื่อเรียกจุดสำรวจนี้
                      </label>
                      <input
                        type="text"
                        value={selectedPoint.name}
                        onChange={(e) => handleUpdatePointField(selectedPoint.id, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#111827] text-gray-900"
                        placeholder="เช่น ทางเข้าตู้คอนเทนเนอร์, เสาไฟสปอร์ตไลท์หลัก"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-555 font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5 text-xs text-[#111827]">
                        📦 ชุดอุปกรณ์ติดตั้งปลายทาง (Installation Set)
                      </label>
                      <select
                        value={selectedPoint.selectedSet || "Set 1"}
                        onChange={(e) => {
                          const val = e.target.value as "Set 1" | "Set 2" | "Set 3" | "Set 4";
                          
                          let updates: Partial<CameraPoint> = {
                            selectedSet: val
                          };

                          if (val === "Set 1") {
                            updates = {
                              ...updates,
                              hasOutdoorCabinet: true,
                              hasGroundRod: true,
                              hasPowerMeter: true,
                              hasSdCard: true,
                              hasCabinetUps: true,
                              hasPoeSwitch: true,
                              hasSupportArm: true,
                              lanCableLength: 25,
                              poleType: selectedPoint.poleType === "None" ? "เสาไฟฟ้า (ยึดสายรัดสแตนเลส)" : selectedPoint.poleType
                            };
                          } else if (val === "Set 2") {
                            updates = {
                              ...updates,
                              hasOutdoorCabinet: true,
                              hasGroundRod: true,
                              hasPowerMeter: true,
                              hasSdCard: true,
                              hasCabinetUps: true,
                              hasPoeSwitch: true,
                              hasSupportArm: true,
                              lanCableLength: 50,
                              poleType: selectedPoint.poleType === "None" ? "เสาไฟฟ้า (ยึดสายรัดสแตนเลส)" : selectedPoint.poleType
                            };
                          } else if (val === "Set 3") {
                            updates = {
                              ...updates,
                              hasOutdoorCabinet: true,
                              hasGroundRod: true,
                              hasPowerMeter: true,
                              hasSdCard: true,
                              hasCabinetUps: true,
                              hasPoeSwitch: true,
                              hasSupportArm: true,
                              lanCableLength: 75,
                              poleType: selectedPoint.poleType === "None" ? "เสาไฟฟ้า (ยึดสายรัดสแตนเลส)" : selectedPoint.poleType
                            };
                          } else if (val === "Set 4") {
                            updates = {
                              ...updates,
                              hasOutdoorCabinet: true,
                              hasGroundRod: true,
                              hasPowerMeter: true,
                              hasSdCard: true,
                              hasCabinetUps: true,
                              hasPoeSwitch: true,
                              hasSupportArm: true,
                              lanCableLength: 100,
                              poleType: selectedPoint.poleType === "None" ? "เสาไฟฟ้า (ยึดสายรัดสแตนเลส)" : selectedPoint.poleType
                            };
                          } else {
                            // None
                            updates = {
                              ...updates,
                              hasOutdoorCabinet: false,
                              hasGroundRod: false,
                              hasPowerMeter: false,
                              hasSdCard: false,
                              hasCabinetUps: false,
                              hasPoeSwitch: false,
                              hasSupportArm: false,
                              lanCableLength: 25,
                              poleType: "None"
                            };
                          }
                          
                          handleUpdatePointFields(selectedPoint.id, updates);
                        }}
                        className="blocks-input appearance-none pr-8 cursor-pointer font-semibold"
                      >
                        <option value="Set 1">📦 Set 1 (กล้อง 1 ตัว)</option>
                        <option value="Set 2">📦 Set 2 (กล้อง 2 ตัว)</option>
                        <option value="Set 3">📦 Set 3 (กล้อง 3 ตัว)</option>
                        <option value="Set 4">📦 Set 4 (กล้อง 4 ตัว)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-555 font-semibold mb-1 uppercase tracking-wide">
                        ประเภทกล้อง (Housing)
                      </label>
                      <select
                        value={selectedPoint.type}
                        disabled
                        className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-xs font-medium focus:outline-none text-gray-500 cursor-not-allowed"
                      >
                        <option value="Bullet">Bullet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-555 font-semibold mb-1 uppercase tracking-wide">
                        การติดตั้งเสาเหล็กกล้อง
                      </label>
                      <select
                        value={selectedPoint.poleType}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Help auto-tick outdoor options on pole selections for engineering safety
                          if (val === "เสาปูน 8 เมตร" || val === "เสาเหล็กกัลวาไนซ์ 4 เมตร" || val === "เสาไฟฟ้า (ยึดสายรัดสแตนเลส)") {
                            handleUpdatePointFields(selectedPoint.id, { 
                              poleType: val,
                              hasOutdoorCabinet: true,
                              hasGroundRod: true,
                              hasCabinetUps: true,
                              hasPoeSwitch: true,
                              hasSdCard: true
                            });
                          } else {
                            handleUpdatePointFields(selectedPoint.id, { poleType: val });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-medium focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#111827]"
                      >
                        <option value="None">ไม่มี (ติดตั้งยึดเข้ากับกำแพงหรือผนังอาคารโดยตรง)</option>
                        <option value="เสาไฟฟ้า (ยึดสายรัดสแตนเลส)">เสาไฟฟ้าของการไฟฟ้า (ยึดติดโดยสายรัดสแตนเลส & ค้ำจุน)</option>
                        <option value="เสาเหล็กกัลวาไนซ์ 4 เมตร">เสาเหล็กกัลวาไนซ์ สูง 4 เมตร (+ฐานรากและการปักเสา)</option>
                        <option value="เสาปูน 8 เมตร">เสาปูนมาตรฐาน สูง 8 เมตร (+ฐานรากและการปักเสาโยธา)</option>
                      </select>
                    </div>

                    {/* Support arm checkbox */}
                    <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200">
                      <input
                        id="support-arm-check"
                        type="checkbox"
                        checked={selectedPoint.hasSupportArm}
                        onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasSupportArm", e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer shrink-0"
                      />
                      <div className="text-left select-none">
                        <label htmlFor="support-arm-check" className="block text-xs font-bold text-gray-700 cursor-pointer">
                          ต้องการแขนจับยึดกล้องยื่นออก (Wall Support Bracket)
                        </label>
                        <span className="text-[10px] text-gray-400 block mt-1 leading-relaxed">
                          เหมาะสำหรับติดตั้งห้อยหัวกล้องยื่นจากแนวเสาหรือกำแพง (ความยาวไม่น้อยกว่า 1 เมตร)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "options" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* ADVANCED INSTALLATION SPECS (Apple Widget style for professional layout) */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                      <span className="text-[10px] font-bold text-zinc-550 block uppercase font-mono tracking-wider">
                        ⚙️ ข้อมูลการเดินสายและฐานอุปกรณ์ปลายทาง
                      </span>
                      
                      {/* LAN Cable length input with standard 25m cap */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-zinc-550 block text-[9px] uppercase font-bold">ระยะสาย LAN เดินท่อเฟล็กซ์ (เมตร)</label>
                          {selectedPoint.lanCableLength !== undefined && selectedPoint.lanCableLength > 25 && (
                            <span className="text-[8px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded font-mono shadow-sm">
                              เกินมาตรฐาน +{selectedPoint.lanCableLength - 25} เมตร
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={1}
                            value={selectedPoint.lanCableLength !== undefined ? selectedPoint.lanCableLength : 25}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              handleUpdatePointField(selectedPoint.id, "lanCableLength", isNaN(val) ? 25 : val);
                            }}
                            className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                            placeholder="ดีฟอลต์ 25 เมตร"
                          />
                          <span className="text-gray-400 text-xs flex items-center justify-center font-semibold bg-zinc-200/55 px-2.5 rounded-lg border border-gray-200/40 select-none">ม.</span>
                        </div>
                        <span className="block text-[8px] text-gray-400 leading-normal">
                          *ระยะเดินสายสัญญาณ LAN ในท่อเฟล็กซ์อ่อนภายนอก ฟรีมาตรฐาน 25 เมตรแรก/ตัว หากเกินจะมีการคำนวณราคาเพิ่มต่อเมตรตามจริง
                        </span>
                      </div>

                      {/* Advanced checkboxes list */}
                      <div className="space-y-2.5 pt-2.5 border-t border-gray-200/50">
                        {/* Outdoor cabinet */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="outdoor-cabinet-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasOutdoorCabinet}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasOutdoorCabinet", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="outdoor-cabinet-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ติดตั้งตู้ Outdoor Cabinet ปลายทาง
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              ตู้พักอุปกรณ์ภายนอกอาคาร พร้อมพัดลมระบายอากาศ 2 ตัว, รางปลั๊กไฟ และ Circuit Breaker
                            </span>
                          </div>
                        </div>

                        {/* Ground rod */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="ground-rod-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasGroundRod}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasGroundRod", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="ground-rod-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ติดตั้งชุด Ground Rod (ขุดเจาะบ่อกราวด์)
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              ติดตั้งแท่งทองแดง Ground Rod ป้องกันกระแสไฟฟ้ารั่วและฟ้าผ่าสำหรับจุดติดตั้งเสานอกอาคาร
                            </span>
                          </div>
                        </div>

                        {/* Power meter & THW */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="power-meter-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasPowerMeter}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasPowerMeter", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="power-meter-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ขอติดตั้งมิเตอร์ไฟฟ้า & ลากสาย THW 16 sq.mm. 50 เมตร
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              ลากสายไฟฟ้าเมน THW IEC 16 sq.mm. ระยะสาย 50 เมตร ปลายทาง พร้อมยื่นคำขอติดตั้งมิเตอร์ไฟหน้างาน
                            </span>
                          </div>
                        </div>

                        {/* Switch POE Ruijie */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="poe-switch-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasPoeSwitch}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasPoeSwitch", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="poe-switch-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ติดตั้ง Switch POE 4 Port Industrial Grade
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              สวิตช์จ่ายไฟผ่านสายแลนเกรดอุตสาหกรรมในตู้ปลายทาง เพื่อกระจายเน็ตเวิร์ก
                            </span>
                          </div>
                        </div>

                        {/* UPS 800 VA (Outdoor) */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="cabinet-ups-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasCabinetUps}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasCabinetUps", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="cabinet-ups-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ติดตั้งเครื่องสำรองไฟ UPS 800 VA ปลายทาง
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              เครื่องสำรองไฟขนาด 800 VA ป้องกันกล้องดับและอุปกรณ์พังเมื่อไฟตก/ดับภายนอกอาคาร
                            </span>
                          </div>
                        </div>

                        {/* SD Card 128G */}
                        <div className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            id="sdcard-check"
                            type="checkbox"
                            checked={!!selectedPoint.hasSdCard}
                            onChange={(e) => handleUpdatePointField(selectedPoint.id, "hasSdCard", e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded text-[#111827] border-zinc-300 focus:ring-[#111827] cursor-pointer"
                          />
                          <div className="text-left select-none">
                            <label htmlFor="sdcard-check" className="block text-[11px] font-bold text-gray-700 cursor-pointer">
                              ติดตั้ง Micro SD Card 128GB ในตัวกล้อง
                            </label>
                            <span className="text-[9px] text-gray-400 block mt-0.5 leading-normal">
                              เมมโมรี่การ์ด 128GB เพื่อบันทึกภาพสำรองในตัวกล้องโดยตรง (Edge Recording)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Coordinate Info Box (Interactive Text-inputs with map panning) */}
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-555 block uppercase font-mono tracking-wider">
                          📍 ป้อนพิกัดภูมิศาสตร์เฉพาะจุด
                        </span>
                        <button
                          onClick={handleGetCurrentLocation}
                          type="button"
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-white bg-[#111827] hover:bg-[#1f2937] active:scale-95 transition-all rounded-lg shadow-sm shrink-0"
                        >
                          📍 ดึงพิกัดปัจจุบัน
                        </button>
                      </div>
                      
                      <div className="text-[10px] space-y-1">
                        <label className="text-zinc-550 block text-[9px] uppercase font-semibold">พิกัด (Latitude, Longitude)</label>
                        <input
                          type="text"
                          value={coordsInput}
                          onChange={(e) => handleCoordsChange(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg font-mono text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#111827]"
                          placeholder="เช่น 13.903868633485667, 100.57982817437522"
                        />
                      </div>
                      <span className="block text-[9px] text-gray-400 leading-relaxed">
                        *พิมพ์หรือวางพิกัดจาก Google Maps ได้โดยตรง แผนที่จะร่อนหน้าจอ (Pan) ไปหาพิกัดใหม่ให้ทันที
                      </span>
                    </div>

                    {/* Detailed comments */}
                    <div>
                      <label className="block text-zinc-555 font-semibold mb-1 uppercase tracking-wide">
                        หมายเหตุเพิ่มเติมทัศนอุปสรรค
                      </label>
                      <textarea
                        rows={4}
                        value={selectedPoint.notes}
                        onChange={(e) => handleUpdatePointField(selectedPoint.id, "notes", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs min-h-[90px]"
                        placeholder="เช่น ต้องเจาะรูกำแพงคอนกรีตหนา 15 ซม., แสงสะท้อนจ้าช่วงเช้า"
                      />
                    </div>

                    {/* Photo Attachments - Direct Image Upload Dropzone only */}
                    <div className="space-y-2">
                      <label className="block text-zinc-555 font-semibold mb-1 uppercase tracking-wide">
                        ภาพประกอบจุดสำรวจหน้างานจริง
                      </label>
                      
                      {/* Apple Style Direct Upload Container */}
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-white border border-gray-200 border-dashed hover:border-zinc-350 transition-colors flex flex-col items-center justify-center group">
                        {selectedPoint.photoUrl ? (
                          <>
                            <img 
                              src={selectedPoint.photoUrl} 
                              alt="Survey reference" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {/* Overlay with change button */}
                            <div className="absolute inset-x-0 bottom-0 bg-gray-900/70 p-2 flex items-center justify-center z-20">
                              <label className="px-3 py-1.5 bg-white hover:bg-gray-50 text-zinc-900 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors">
                                อัปโหลดเปลี่ยนรูปถ่ายจุดนี้
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        if (typeof reader.result === "string") {
                                          handleUpdatePointField(selectedPoint.id, "photoUrl", reader.result);
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors group/label">
                            <ImageIcon className="w-8 h-8 text-gray-400 group-hover/label:text-[#111827] transition-colors mb-2" />
                            <span className="block text-xs font-semibold text-gray-700">อัปโหลดภาพประกอบหน้างานจริง</span>
                            <span className="block text-[10px] text-gray-400 mt-1 leading-relaxed">
                              คลิกตรงนี้เพื่อเลือกไฟล์รูปภาพจริงเฉพาะจุดติดตั้งนี้
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === "string") {
                                      handleUpdatePointField(selectedPoint.id, "photoUrl", reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 space-y-3">
              <Camera className="w-10 h-10 mx-auto text-zinc-300" />
              <div>
                <h4 className="text-xs font-semibold text-gray-600">ยังไม่มีจุดสำรวจที่เลือก</h4>
                <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
                  กรุณากดปุ่มเพิ่มจุดติดตั้งเสริม หรือคลิกลงบนแผนที่เพื่อระบุตำแหน่งปักหมุดกล้องและจำลองระบบเสายึดจับ
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NT Carrier Ethernet Lite (Field Sites Links Widget) */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-150">
          <div className="w-8 h-8 rounded-lg bg-[#111827]/10 flex items-center justify-center text-[#111827]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-805 flex items-center gap-1.5 font-sans">
              🌐 รายละเอียดวงจรปลายทางรายจุด NT Carrier Ethernet Lite (ประมาณการรายเดือน)
            </h4>
            <p className="text-[10px] text-gray-400">คำนวณแบนด์วิดท์รายจุด 5Mbps ต่อจำนวนกล้องในจุดติดตั้ง และราคาเช่าวงจรเครือข่ายปลายทางรายเดือน</p>
          </div>
        </div>

        {/* Calculations metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">จำนวนจุดเชื่อมต่อปลายทาง (Field Sites)</span>
            <div className="text-base font-black text-gray-900 font-mono">
              {cameraPoints.length} <span className="text-xs font-normal text-gray-500 font-sans">จุด</span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-gray-200/60 space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">แบนด์วิดท์รวมปลายทางทั้งหมด</span>
            <div className="text-base font-black text-gray-900 font-mono">
              {cameraPoints.reduce((sum, pt) => {
                let ptCams = 1;
                if (pt.selectedSet === "Set 1") ptCams = 1;
                else if (pt.selectedSet === "Set 2") ptCams = 2;
                else if (pt.selectedSet === "Set 3") ptCams = 3;
                else if (pt.selectedSet === "Set 4") ptCams = 4;
                return sum + (ptCams * 5);
              }, 0)} <span className="text-xs font-semibold text-[#111827] font-mono">Mbps</span>
            </div>
          </div>

          <div className="bg-[#111827]/5 p-3.5 rounded-xl border border-[#111827]/15 space-y-1">
            <span className="text-[9px] uppercase font-bold text-[#111827] block font-mono">รวมค่าลิงก์ปลายทางทุกจุด</span>
            <div className="text-base font-black text-[#111827] font-mono">
              ฿{cameraPoints.reduce((sum, pt) => {
                let ptCams = 1;
                if (pt.selectedSet === "Set 1") ptCams = 1;
                else if (pt.selectedSet === "Set 2") ptCams = 2;
                else if (pt.selectedSet === "Set 3") ptCams = 3;
                else if (pt.selectedSet === "Set 4") ptCams = 4;
                const speed = ptCams * 5;
                const tier = [
                  { speed: 10, price: 640 },
                  { speed: 20, price: 720 },
                  { speed: 30, price: 770 },
                  { speed: 50, price: 860 },
                  { speed: 100, price: 1150 },
                ].find(t => t.speed >= speed) || { price: 640 };
                return sum + tier.price;
              }, 0).toLocaleString("th-TH")}/เดือน
            </div>
          </div>
        </div>

        {/* Detailed Points Links table list */}
        {cameraPoints.length > 0 && (
          <div className="border border-gray-200/80 rounded-xl overflow-hidden text-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-700">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase font-mono text-[9px] border-b border-gray-200">
                    <th className="py-2 px-3.5">จุดที่</th>
                    <th className="py-2 px-3.5">ชื่อจุดสำรวจติดตั้ง</th>
                    <th className="py-2 px-3.5 text-center">ชุดอุปกรณ์ (Set)</th>
                    <th className="py-2 px-3.5 text-center">ความเร็ววงจร (Speed)</th>
                    <th className="py-2 px-3.5 text-right">ค่าบริการรายเดือน (฿/เดือน)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 bg-white">
                  {cameraPoints.map((pt, ind) => {
                    let ptCams = 1;
                    if (pt.selectedSet === "Set 1") ptCams = 1;
                    else if (pt.selectedSet === "Set 2") ptCams = 2;
                    else if (pt.selectedSet === "Set 3") ptCams = 3;
                    else if (pt.selectedSet === "Set 4") ptCams = 4;
                    const speed = ptCams * 5;
                    const tier = [
                      { speed: 10, price: 640 },
                      { speed: 20, price: 720 },
                      { speed: 30, price: 770 },
                      { speed: 50, price: 860 },
                      { speed: 100, price: 1150 },
                    ].find(t => t.speed >= speed) || { price: 640 };

                    return (
                      <tr key={pt.id} className="hover:bg-white/50">
                        <td className="py-2 px-3.5 font-mono text-gray-400 text-center">#{ind + 1}</td>
                        <td className="py-2 px-3.5 font-semibold text-gray-900">{pt.name}</td>
                        <td className="py-2 px-3.5 text-center text-zinc-650 font-mono">
                          {pt.selectedSet || "Set 1"}
                        </td>
                        <td className="py-2 px-3.5 text-center font-semibold text-[#111827] font-mono">
                          {speed} Mbps
                        </td>
                        <td className="py-2 px-3.5 text-right font-mono font-bold text-zinc-900">
                          ฿{tier.price.toLocaleString("th-TH")}/เดือน
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-150 pt-6"></div>

      {/* Action control bar */}
      <div className="flex justify-between" id="step4-actions-bar">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 text-xs font-medium rounded-xl border border-gray-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          ย้อนกลับ
        </button>

        <button
          type="button"
          onClick={onNext}
          className="blocks-btn-primary"
        >
          ถัดไป: รายละเอียดงานติดตั้งต้นทาง 🖥️
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
